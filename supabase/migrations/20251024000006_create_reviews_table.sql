-- ===================================================================
-- MIGRATION: Create REVIEWS table
-- Priority: P1 - HIGH
-- Description: Reviews and ratings system for workers and employers
-- ===================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Related entities
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  
  -- Reviewer and reviewee
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Rating and feedback
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  
  -- Detailed ratings
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
  
  -- Additional info
  photos TEXT[],
  would_recommend BOOLEAN DEFAULT true,
  
  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  verified_by_platform BOOLEAN DEFAULT false,
  reviewed_by_admin UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  
  -- Prevent duplicate reviews
  UNIQUE(job_id, reviewer_id, reviewee_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_reviews_worker ON reviews(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_employer ON reviews(employer_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reviews_timestamp ON reviews;
CREATE TRIGGER trigger_update_reviews_timestamp
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Create trigger to update worker/employer ratings
CREATE OR REPLACE FUNCTION update_entity_ratings()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating NUMERIC(3,2);
    review_count INTEGER;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update worker rating if reviewee is a worker
        IF EXISTS (SELECT 1 FROM workers WHERE profile_id = NEW.reviewee_id) THEN
            SELECT AVG(rating), COUNT(*)
            INTO avg_rating, review_count
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
            AND status = 'approved';
            
            UPDATE workers
            SET rating = COALESCE(avg_rating, 0),
                rating_count = review_count
            WHERE profile_id = NEW.reviewee_id;
        END IF;
        
        -- Update employer rating if reviewee is an employer
        IF EXISTS (SELECT 1 FROM employers WHERE profile_id = NEW.reviewee_id) THEN
            SELECT AVG(rating), COUNT(*)
            INTO avg_rating, review_count
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
            AND status = 'approved';
            
            UPDATE employers
            SET avg_rating = COALESCE(avg_rating, 0)
            WHERE profile_id = NEW.reviewee_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_entity_ratings ON reviews;
CREATE TRIGGER trigger_update_entity_ratings
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_entity_ratings();

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Everyone can view approved reviews
CREATE POLICY "Public can view approved reviews"
    ON reviews FOR SELECT
    USING (status = 'approved');

-- Users can view their own reviews (as reviewer or reviewee)
CREATE POLICY "Users can view their own reviews"
    ON reviews FOR SELECT
    USING (
        reviewer_id = auth.uid()
        OR reviewee_id = auth.uid()
    );

-- Users can create reviews
CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (reviewer_id = auth.uid());

-- Users can update their own pending reviews
CREATE POLICY "Users can update own pending reviews"
    ON reviews FOR UPDATE
    USING (
        reviewer_id = auth.uid()
        AND status = 'pending'
    );

-- Admins can do everything
CREATE POLICY "Admins can do everything with reviews"
    ON reviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE reviews IS 'Reviews and ratings for workers and employers';
COMMENT ON COLUMN reviews.status IS 'Review status: pending, approved, rejected, or hidden';
COMMENT ON COLUMN reviews.verified_by_platform IS 'Whether this review has been verified as genuine';
