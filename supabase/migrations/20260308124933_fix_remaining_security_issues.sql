/*
  # Fix Remaining Security Issues

  1. Performance Optimizations
    - Add index on `saved_events.event_id` for foreign key lookups
    - Remove unused indexes on `forum_comments.author_id` and `forum_posts.author_id`
  
  2. Notes
    - The Auth DB connection strategy and leaked password protection are Supabase project settings
      that need to be configured in the Supabase dashboard, not via migrations
*/

-- Add missing index on saved_events.event_id foreign key
CREATE INDEX IF NOT EXISTS idx_saved_events_event_id ON saved_events(event_id);

-- Drop unused indexes (these were added but queries are using the composite primary key instead)
DROP INDEX IF EXISTS idx_forum_comments_author_id;
DROP INDEX IF EXISTS idx_forum_posts_author_id;
