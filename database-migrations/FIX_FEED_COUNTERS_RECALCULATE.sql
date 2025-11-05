-- =====================================================
-- FIX FEED COUNTERS - Recalculate existing post counts
-- =====================================================
-- This migration recalculates all counter fields (likes_count, 
-- comments_count, shares_count) for existing posts based on 
-- actual data in post_likes, post_comments, and post_shares tables.
-- =====================================================

-- 1. Recalculate likes_count for all posts
UPDATE posts
SET likes_count = (
  SELECT COUNT(*)
  FROM post_likes
  WHERE post_likes.post_id = posts.id
);

-- 2. Recalculate comments_count for all posts
UPDATE posts
SET comments_count = (
  SELECT COUNT(*)
  FROM post_comments
  WHERE post_comments.post_id = posts.id
);

-- 3. Recalculate shares_count for all posts
UPDATE posts
SET shares_count = (
  SELECT COUNT(*)
  FROM post_shares
  WHERE post_shares.post_id = posts.id
);

-- 4. Recalculate views_count for all posts (optional)
UPDATE posts
SET views_count = (
  SELECT COUNT(*)
  FROM post_views
  WHERE post_views.post_id = posts.id
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- You can verify the counts were updated correctly by running:
-- SELECT 
--   id, 
--   likes_count, 
--   comments_count, 
--   shares_count,
--   (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id) as actual_likes,
--   (SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id) as actual_comments,
--   (SELECT COUNT(*) FROM post_shares WHERE post_id = posts.id) as actual_shares
-- FROM posts
-- WHERE is_active = true;
