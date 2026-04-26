/*
  # Fix Foreign Key Index Issues

  1. Performance Optimizations
    - Add indexes on `forum_comments.author_id` and `forum_posts.author_id` for foreign key lookups
    - Remove unused index `idx_saved_events_event_id` (queries are using other access patterns)
  
  2. Notes
    - Auth DB connection strategy and leaked password protection require Supabase dashboard configuration
*/

-- Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_forum_comments_author_id ON forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);

-- Drop unused index on saved_events.event_id
DROP INDEX IF EXISTS idx_saved_events_event_id;
