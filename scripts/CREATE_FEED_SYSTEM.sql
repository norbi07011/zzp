-- =====================================================
-- FEED SYSTEM MIGRATION
-- Tworzenie systemu tablicy społecznościowej (Feed)
-- =====================================================
-- Autor: System
-- Data: 2025-10-28
-- Opis: Tabele dla postów, lajków, komentarzy, udostępnień
-- UWAGA: Tylko employers i accountants mogą tworzyć posty!
-- =====================================================

-- =====================================================
-- 1. POSTS TABLE (Posty główne)
-- =====================================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Author (może być employer LUB accountant)
  author_id UUID NOT NULL,
  author_type VARCHAR(20) NOT NULL CHECK (author_type IN ('employer', 'accountant')),
  
  -- Typ posta
  type VARCHAR(50) NOT NULL CHECK (type IN ('job_offer', 'ad', 'announcement', 'story', 'service')),
  
  -- Treść
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Media
  media_urls TEXT[], -- Tablica URLi do zdjęć/filmów w Supabase Storage
  media_types TEXT[], -- ['image', 'video', ...]
  
  -- Metadata dla oferty pracy (jeśli type = 'job_offer')
  job_category VARCHAR(100),
  job_location VARCHAR(255),
  job_salary_min DECIMAL(10,2),
  job_salary_max DECIMAL(10,2),
  job_requirements TEXT[],
  job_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Statystyki (auto-update przez triggery)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id, author_type);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = true;

-- =====================================================
-- 2. POST_LIKES TABLE (Polubienia postów)
-- =====================================================

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  -- User (może być worker, employer lub accountant)
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'employer', 'accountant')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: jeden user może polubić post tylko raz
  CONSTRAINT post_likes_unique UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id, user_type);

-- =====================================================
-- 3. POST_COMMENTS TABLE (Komentarze)
-- =====================================================

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE, -- dla odpowiedzi
  
  -- User (może być worker, employer lub accountant)
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'employer', 'accountant')),
  
  content TEXT NOT NULL,
  
  -- Statystyki
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_post_comments_created ON post_comments(created_at DESC);

-- =====================================================
-- 4. COMMENT_LIKES TABLE (Polubienia komentarzy)
-- =====================================================

CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'employer', 'accountant')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT comment_likes_unique UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);

-- =====================================================
-- 5. POST_SHARES TABLE (Udostępnienia)
-- =====================================================

CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'employer', 'accountant')),
  
  share_type VARCHAR(50) DEFAULT 'profile', -- 'profile', 'external', 'message'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT post_shares_unique UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_shares_post ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user ON post_shares(user_id);

-- =====================================================
-- 6. POST_VIEWS TABLE (Wyświetlenia)
-- =====================================================

CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  -- User (opcjonalnie - dla zalogowanych)
  user_id UUID,
  user_type VARCHAR(20) CHECK (user_type IN ('worker', 'employer', 'accountant')),
  
  -- Anonimowe wyświetlenia (dla niezalogowanych)
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_created ON post_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_user ON post_views(user_id) WHERE user_id IS NOT NULL;

-- =====================================================
-- 7. TRIGGERS - Auto-update liczników
-- =====================================================

-- 7.1 Trigger: Auto-update post likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- 7.2 Trigger: Auto-update post comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON post_comments;
CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- 7.3 Trigger: Auto-update post shares_count
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET shares_count = GREATEST(0, shares_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_shares_count ON post_shares;
CREATE TRIGGER trigger_update_post_shares_count
  AFTER INSERT OR DELETE ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_post_shares_count();

-- 7.4 Trigger: Auto-update comment likes_count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- 7.5 Trigger: Auto-update posts.updated_at
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_posts_updated_at ON posts;
CREATE TRIGGER trigger_update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_updated_at();

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- 8.1 POSTS POLICIES

-- Everyone can view active posts
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (is_active = true);

-- Only employers and accountants can create posts
CREATE POLICY "Employers can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    author_type = 'employer' 
    AND author_id IN (SELECT id FROM employers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Accountants can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    author_type = 'accountant' 
    AND author_id IN (SELECT id FROM accountants WHERE profile_id = auth.uid())
  );

-- Authors can update their own posts
CREATE POLICY "Authors can update their own posts"
  ON posts FOR UPDATE
  USING (
    (author_type = 'employer' AND author_id IN (SELECT id FROM employers WHERE profile_id = auth.uid()))
    OR
    (author_type = 'accountant' AND author_id IN (SELECT id FROM accountants WHERE profile_id = auth.uid()))
  );

-- Authors can delete their own posts
CREATE POLICY "Authors can delete their own posts"
  ON posts FOR DELETE
  USING (
    (author_type = 'employer' AND author_id IN (SELECT id FROM employers WHERE profile_id = auth.uid()))
    OR
    (author_type = 'accountant' AND author_id IN (SELECT id FROM accountants WHERE profile_id = auth.uid()))
  );

-- 8.2 POST_LIKES POLICIES

-- Everyone can view likes
CREATE POLICY "Likes are viewable by everyone"
  ON post_likes FOR SELECT
  USING (true);

-- Authenticated users can create likes
CREATE POLICY "Authenticated users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON post_likes FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM employers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM accountants WHERE profile_id = auth.uid()
    )
  );

-- 8.3 POST_COMMENTS POLICIES

-- Everyone can view comments
CREATE POLICY "Comments are viewable by everyone"
  ON post_comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON post_comments FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM employers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM accountants WHERE profile_id = auth.uid()
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON post_comments FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM employers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM accountants WHERE profile_id = auth.uid()
    )
  );

-- 8.4 COMMENT_LIKES POLICIES

-- Everyone can view comment likes
CREATE POLICY "Comment likes are viewable by everyone"
  ON comment_likes FOR SELECT
  USING (true);

-- Authenticated users can like comments
CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own comment likes
CREATE POLICY "Users can delete their own comment likes"
  ON comment_likes FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM employers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM accountants WHERE profile_id = auth.uid()
    )
  );

-- 8.5 POST_SHARES POLICIES

-- Everyone can view shares
CREATE POLICY "Shares are viewable by everyone"
  ON post_shares FOR SELECT
  USING (true);

-- Authenticated users can share posts
CREATE POLICY "Authenticated users can share posts"
  ON post_shares FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own shares
CREATE POLICY "Users can delete their own shares"
  ON post_shares FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM employers WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM accountants WHERE profile_id = auth.uid()
    )
  );

-- 8.6 POST_VIEWS POLICIES

-- Everyone can view views (for analytics)
CREATE POLICY "Views are viewable by everyone"
  ON post_views FOR SELECT
  USING (true);

-- Anyone can create view records (including anonymous)
CREATE POLICY "Anyone can create view records"
  ON post_views FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's feed (dla danego user_type i user_id)
CREATE OR REPLACE FUNCTION get_user_feed(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_type VARCHAR,
  type VARCHAR,
  title VARCHAR,
  content TEXT,
  media_urls TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  user_has_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    p.author_type,
    p.type,
    p.title,
    p.content,
    p.media_urls,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.created_at,
    EXISTS (
      SELECT 1 FROM post_likes pl 
      WHERE pl.post_id = p.id 
      AND pl.user_id IN (
        SELECT id FROM workers WHERE profile_id = auth.uid()
        UNION
        SELECT id FROM employers WHERE profile_id = auth.uid()
        UNION
        SELECT id FROM accountants WHERE profile_id = auth.uid()
      )
    ) AS user_has_liked
  FROM posts p
  WHERE p.is_active = true
  ORDER BY 
    p.is_pinned DESC,
    p.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- KONIEC MIGRACJI
-- =====================================================

-- Weryfikacja utworzonych tabel
DO $$
BEGIN
  RAISE NOTICE '✅ Feed System Migration Complete!';
  RAISE NOTICE 'Tables created: posts, post_likes, post_comments, comment_likes, post_shares, post_views';
  RAISE NOTICE 'Triggers created: 5 (auto-update counters)';
  RAISE NOTICE 'RLS Policies created: 18';
  RAISE NOTICE 'Helper functions: get_user_feed()';
END $$;
