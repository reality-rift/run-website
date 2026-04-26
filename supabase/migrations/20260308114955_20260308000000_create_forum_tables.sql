/*
  # Create Forum Tables

  1. New Tables
    - `forum_posts`
      - `id` (uuid, primary key)
      - `author_id` (uuid, references profiles)
      - `content` (text, max 2000 chars)
      - `image_url` (text, optional)
      - `likes_count` (integer, default 0)
      - `comments_count` (integer, default 0)
      - `created_at` (timestamptz)
    
    - `forum_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references forum_posts)
      - `author_id` (uuid, references profiles)
      - `content` (text, max 1000 chars)
      - `created_at` (timestamptz)
    
    - `forum_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references forum_posts)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)
      - Unique constraint on (post_id, user_id)
  
  2. Security
    - Enable RLS on all forum tables
    - Posts and comments are publicly readable
    - Auth users can create posts and comments
    - Users can delete their own posts and comments
    - Admins can delete any post
    - Auth users can like/unlike posts
  
  3. Storage
    - Create public 'forum-images' bucket
    - Auth users can upload to their own folder
    - Users can delete their own images
  
  4. Triggers
    - Auto-update likes_count when likes are added/removed
    - Auto-update comments_count when comments are added/removed
  
  5. Important Notes
    - All tables use cascade delete for referential integrity
    - Content length is enforced at database level
    - Likes are unique per user per post
    - Storage uses folder-based organization by user ID
*/

-- Forum posts table
create table if not exists forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 2000),
  image_url text,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Forum comments table
create table if not exists forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

-- Forum likes table (unique per user per post)
create table if not exists forum_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

-- Indexes
create index if not exists idx_forum_posts_created_at on forum_posts(created_at desc);
create index if not exists idx_forum_comments_post_id on forum_comments(post_id, created_at asc);
create index if not exists idx_forum_likes_post_id on forum_likes(post_id);
create index if not exists idx_forum_likes_user_id on forum_likes(user_id);

-- Enable RLS
alter table forum_posts enable row level security;
alter table forum_comments enable row level security;
alter table forum_likes enable row level security;

-- Posts: anyone can read
create policy "Forum posts are publicly readable"
  on forum_posts for select using (true);

-- Posts: auth users can create
create policy "Auth users can create forum posts"
  on forum_posts for insert with check (auth.uid() = author_id);

-- Posts: authors can delete their own
create policy "Users can delete own forum posts"
  on forum_posts for delete using (auth.uid() = author_id);

-- Posts: admins can delete any post
create policy "Admins can delete any forum post"
  on forum_posts for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Comments: anyone can read
create policy "Forum comments are publicly readable"
  on forum_comments for select using (true);

-- Comments: auth users can create
create policy "Auth users can create forum comments"
  on forum_comments for insert with check (auth.uid() = author_id);

-- Comments: authors can delete their own
create policy "Users can delete own forum comments"
  on forum_comments for delete using (auth.uid() = author_id);

-- Likes: anyone can read
create policy "Forum likes are publicly readable"
  on forum_likes for select using (true);

-- Likes: auth users can insert their own
create policy "Auth users can like posts"
  on forum_likes for insert with check (auth.uid() = user_id);

-- Likes: users can unlike (delete their own)
create policy "Users can unlike posts"
  on forum_likes for delete using (auth.uid() = user_id);

-- Profiles: public read for display_name (if not already present)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'Profiles are publicly readable'
  ) then
    create policy "Profiles are publicly readable"
      on profiles for select using (true);
  end if;
end $$;

-- Trigger: auto-update likes_count on forum_posts
create or replace function update_forum_post_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update forum_posts set likes_count = likes_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update forum_posts set likes_count = likes_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_forum_likes_count on forum_likes;
create trigger trg_forum_likes_count
  after insert or delete on forum_likes
  for each row execute function update_forum_post_likes_count();

-- Trigger: auto-update comments_count on forum_posts
create or replace function update_forum_post_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update forum_posts set comments_count = comments_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update forum_posts set comments_count = comments_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_forum_comments_count on forum_comments;
create trigger trg_forum_comments_count
  after insert or delete on forum_comments
  for each row execute function update_forum_post_comments_count();

-- Storage bucket for forum images
insert into storage.buckets (id, name, public)
values ('forum-images', 'forum-images', true)
on conflict (id) do nothing;

-- Storage: anyone can read forum images
create policy "Forum images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'forum-images');

-- Storage: auth users can upload to their own folder
create policy "Auth users can upload forum images"
  on storage.objects for insert
  with check (
    bucket_id = 'forum-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage: users can delete their own uploads
create policy "Users can delete own forum images"
  on storage.objects for delete
  using (
    bucket_id = 'forum-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );