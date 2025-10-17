-- ============================================================================
-- FILE MANAGEMENT SYSTEM - DATABASE MIGRATION
-- ============================================================================
-- Author: ZZP Werkplaats Development Team
-- Version: 1.0
-- Description: Complete database schema for file storage and management
-- Features: File metadata, storage tracking, access control, statistics

-- ============================================================================
-- TABLE: files
-- Purpose: Store file metadata and tracking information
-- ============================================================================

CREATE TABLE IF NOT EXISTS files (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,

  -- File Information
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL CHECK (size >= 0),
  
  -- Storage Information
  storage_path TEXT NOT NULL UNIQUE,
  storage_url TEXT NOT NULL,
  bucket TEXT NOT NULL,
  
  -- Classification
  category TEXT NOT NULL CHECK (
    category IN (
      'avatar',
      'certificate',
      'document',
      'portfolio',
      'contract',
      'invoice',
      'cv',
      'other'
    )
  ),
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  
  -- Access Control
  access_level TEXT NOT NULL DEFAULT 'private' CHECK (
    access_level IN ('public', 'private', 'company', 'worker')
  ),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ready' CHECK (
    status IN ('pending', 'processing', 'ready', 'failed', 'archived')
  ),
  
  -- Media Information (for images/videos)
  thumbnail_url TEXT,
  width INTEGER CHECK (width >= 0),
  height INTEGER CHECK (height >= 0),
  duration INTEGER CHECK (duration >= 0), -- seconds for videos
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookups
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_company_id ON files(company_id);
CREATE INDEX IF NOT EXISTS idx_files_worker_id ON files(worker_id);

-- Category and status filtering
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_access_level ON files(access_level);

-- Search and filtering
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_files_metadata ON files USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_files_original_filename ON files(original_filename);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files(expires_at) WHERE expires_at IS NOT NULL;

-- Storage management
CREATE INDEX IF NOT EXISTS idx_files_bucket ON files(bucket);
CREATE INDEX IF NOT EXISTS idx_files_storage_path ON files(storage_path);

-- Full-text search on filename and description
CREATE INDEX IF NOT EXISTS idx_files_search ON files USING gin(
  to_tsvector('dutch', coalesce(original_filename, '') || ' ' || coalesce(description, ''))
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_files_updated_at();

-- Update last_accessed_at when file is retrieved
CREATE OR REPLACE FUNCTION track_file_access()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called from application layer
  -- Placeholder for tracking file access
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own files
CREATE POLICY files_select_own ON files
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_public = TRUE
    OR auth.uid() = ANY(shared_with)
  );

-- Policy: Users can insert their own files
CREATE POLICY files_insert_own ON files
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own files
CREATE POLICY files_update_own ON files
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own files
CREATE POLICY files_delete_own ON files
  FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Company admins can see company files
CREATE POLICY files_select_company ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = files.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Policy: Worker can see their assigned files
CREATE POLICY files_select_worker ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE workers.id = files.worker_id
      AND workers.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE: file_access_logs
-- Purpose: Track file access for security and analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (
    action IN ('view', 'download', 'share', 'delete')
  ),
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for access logs
CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_id ON file_access_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_user_id ON file_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_accessed_at ON file_access_logs(accessed_at DESC);

-- Enable RLS on access logs
ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY file_access_logs_select ON file_access_logs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY file_access_logs_insert ON file_access_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TABLE: storage_quotas
-- Purpose: Track storage usage per user/company
-- ============================================================================

CREATE TABLE IF NOT EXISTS storage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Quota limits (bytes)
  max_storage BIGINT NOT NULL DEFAULT 10737418240, -- 10GB default
  used_storage BIGINT NOT NULL DEFAULT 0 CHECK (used_storage >= 0),
  
  -- File count limits
  max_files INTEGER NOT NULL DEFAULT 10000,
  file_count INTEGER NOT NULL DEFAULT 0 CHECK (file_count >= 0),
  
  -- Statistics
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_storage_quotas_user_id ON storage_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_quotas_company_id ON storage_quotas(company_id);

-- Enable RLS
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY storage_quotas_select_own ON storage_quotas
  FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Update storage quota when file is added/removed
CREATE OR REPLACE FUNCTION update_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment usage
    INSERT INTO storage_quotas (user_id, used_storage, file_count)
    VALUES (NEW.user_id, NEW.size, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET 
      used_storage = storage_quotas.used_storage + NEW.size,
      file_count = storage_quotas.file_count + 1,
      last_updated = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement usage
    UPDATE storage_quotas
    SET 
      used_storage = GREATEST(used_storage - OLD.size, 0),
      file_count = GREATEST(file_count - 1, 0),
      last_updated = NOW()
    WHERE user_id = OLD.user_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.size != NEW.size THEN
    -- Update size difference
    UPDATE storage_quotas
    SET 
      used_storage = used_storage + (NEW.size - OLD.size),
      last_updated = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_storage_quota
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_quota();

-- Function: Check storage quota before upload
CREATE OR REPLACE FUNCTION check_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_quota storage_quotas%ROWTYPE;
BEGIN
  -- Get user's quota
  SELECT * INTO v_quota
  FROM storage_quotas
  WHERE user_id = NEW.user_id;
  
  -- Check if quota exists
  IF v_quota IS NULL THEN
    -- Create default quota
    INSERT INTO storage_quotas (user_id)
    VALUES (NEW.user_id);
    RETURN NEW;
  END IF;
  
  -- Check storage limit
  IF (v_quota.used_storage + NEW.size) > v_quota.max_storage THEN
    RAISE EXCEPTION 'Storage quota exceeded. Limit: % bytes', v_quota.max_storage;
  END IF;
  
  -- Check file count limit
  IF v_quota.file_count >= v_quota.max_files THEN
    RAISE EXCEPTION 'File count limit exceeded. Limit: % files', v_quota.max_files;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_storage_quota
  BEFORE INSERT ON files
  FOR EACH ROW
  EXECUTE FUNCTION check_storage_quota();

-- Function: Clean up expired files
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Delete expired files
  DELETE FROM files
  WHERE expires_at IS NOT NULL
  AND expires_at < NOW()
  AND status != 'archived';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: File statistics by category
CREATE OR REPLACE VIEW file_stats_by_category AS
SELECT
  user_id,
  category,
  COUNT(*) as file_count,
  SUM(size) as total_size,
  AVG(size) as avg_size,
  MIN(uploaded_at) as first_upload,
  MAX(uploaded_at) as last_upload
FROM files
WHERE status = 'ready'
GROUP BY user_id, category;

-- View: File statistics by status
CREATE OR REPLACE VIEW file_stats_by_status AS
SELECT
  user_id,
  status,
  COUNT(*) as file_count,
  SUM(size) as total_size
FROM files
GROUP BY user_id, status;

-- View: Storage usage summary
CREATE OR REPLACE VIEW storage_usage_summary AS
SELECT
  sq.user_id,
  sq.max_storage,
  sq.used_storage,
  sq.max_files,
  sq.file_count,
  ROUND((sq.used_storage::NUMERIC / sq.max_storage::NUMERIC * 100), 2) as usage_percentage,
  sq.last_updated
FROM storage_quotas sq;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Note: This section can be removed in production
-- Uncomment to insert sample storage quotas

/*
-- Set default quota for existing users
INSERT INTO storage_quotas (user_id, max_storage, max_files)
SELECT 
  id,
  10737418240, -- 10GB
  10000
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
*/

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE files IS 'File metadata and tracking';
COMMENT ON TABLE file_access_logs IS 'File access audit trail';
COMMENT ON TABLE storage_quotas IS 'Storage quota management per user/company';

COMMENT ON COLUMN files.category IS 'File category: avatar, certificate, document, portfolio, contract, invoice, cv, other';
COMMENT ON COLUMN files.access_level IS 'Access level: public, private, company, worker';
COMMENT ON COLUMN files.status IS 'Processing status: pending, processing, ready, failed, archived';
COMMENT ON COLUMN files.bucket IS 'Supabase Storage bucket name';
COMMENT ON COLUMN files.storage_path IS 'Full path in storage bucket';

-- ============================================================================
-- GRANTS (Adjust based on your auth setup)
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON files TO authenticated;
GRANT SELECT, INSERT ON file_access_logs TO authenticated;
GRANT SELECT ON storage_quotas TO authenticated;

-- Grant access to service role
GRANT ALL ON files TO service_role;
GRANT ALL ON file_access_logs TO service_role;
GRANT ALL ON storage_quotas TO service_role;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
