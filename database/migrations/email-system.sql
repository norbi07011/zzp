-- =====================================================
-- EMAIL SYSTEM DATABASE MIGRATION
-- Complete schema for email functionality
-- =====================================================

-- Email Jobs Table (tracks all sent emails)
CREATE TABLE IF NOT EXISTS email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  
  -- Email data (stored as JSONB for flexibility)
  email_data JSONB NOT NULL,
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'scheduled', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed')),
  
  -- Provider info
  provider VARCHAR(20) NOT NULL DEFAULT 'resend'
    CHECK (provider IN ('resend', 'sendgrid', 'ses', 'smtp')),
  provider_id VARCHAR(255), -- ID from email provider (Resend email ID, etc.)
  
  -- Retry logic
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  -- Tracking timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,
  
  -- Error handling
  error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  language VARCHAR(2) NOT NULL DEFAULT 'nl'
    CHECK (language IN ('nl', 'en', 'pl')),
  
  -- Template content
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  
  -- Variables used in template
  variables TEXT[] NOT NULL DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one active template per type+language
  UNIQUE(type, language)
);

-- Email Events Table (tracks opens, clicks, bounces, etc.)
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_job_id UUID NOT NULL REFERENCES email_jobs(id) ON DELETE CASCADE,
  
  -- Event type
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  
  -- Event metadata
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  location VARCHAR(255),
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Preferences Table (user email settings)
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email type preferences
  marketing BOOLEAN NOT NULL DEFAULT true,
  transactional BOOLEAN NOT NULL DEFAULT true, -- Cannot be disabled
  product_updates BOOLEAN NOT NULL DEFAULT true,
  newsletter BOOLEAN NOT NULL DEFAULT false,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  appointment_reminders BOOLEAN NOT NULL DEFAULT true,
  message_notifications BOOLEAN NOT NULL DEFAULT true,
  
  -- Language preference
  preferred_language VARCHAR(2) NOT NULL DEFAULT 'nl'
    CHECK (preferred_language IN ('nl', 'en', 'pl')),
  
  -- Unsubscribe tracking
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch Email Jobs Table (for mass email campaigns)
CREATE TABLE IF NOT EXISTS batch_email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  
  -- Recipients (stored as JSONB array)
  recipients JSONB NOT NULL,
  total_recipients INTEGER NOT NULL,
  
  -- Progress tracking
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Email Jobs indexes
CREATE INDEX IF NOT EXISTS idx_email_jobs_user_id ON email_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_jobs_company_id ON email_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_email_jobs_worker_id ON email_jobs(worker_id);
CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON email_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_jobs_provider_id ON email_jobs(provider_id);
CREATE INDEX IF NOT EXISTS idx_email_jobs_created_at ON email_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_jobs_scheduled_for ON email_jobs(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_jobs_pending ON email_jobs(status, scheduled_for) WHERE status IN ('pending', 'scheduled');

-- Email Templates indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_type_language ON email_templates(type, language);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

-- Email Events indexes
CREATE INDEX IF NOT EXISTS idx_email_events_job_id ON email_events(email_job_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp DESC);

-- Email Preferences indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- Batch Email Jobs indexes
CREATE INDEX IF NOT EXISTS idx_batch_email_jobs_status ON batch_email_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_email_jobs_created_at ON batch_email_jobs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_email_jobs ENABLE ROW LEVEL SECURITY;

-- Email Jobs Policies
CREATE POLICY "Users can view their own email jobs"
  ON email_jobs FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id) OR
    auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id)
  );

CREATE POLICY "System can insert email jobs"
  ON email_jobs FOR INSERT
  WITH CHECK (true); -- Backend service inserts

CREATE POLICY "System can update email jobs"
  ON email_jobs FOR UPDATE
  USING (true); -- Backend service updates

-- Email Templates Policies (Admin only)
CREATE POLICY "Anyone can view active templates"
  ON email_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON email_templates FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM companies WHERE role = 'admin'
    )
  );

-- Email Events Policies
CREATE POLICY "Users can view events for their emails"
  ON email_events FOR SELECT
  USING (
    email_job_id IN (
      SELECT id FROM email_jobs
      WHERE user_id = auth.uid()
         OR company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
         OR worker_id IN (SELECT id FROM workers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "System can insert email events"
  ON email_events FOR INSERT
  WITH CHECK (true); -- Webhook inserts

-- Email Preferences Policies
CREATE POLICY "Users can view their own preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Batch Email Jobs Policies (Admin only)
CREATE POLICY "Admins can view batch jobs"
  ON batch_email_jobs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM companies WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can manage batch jobs"
  ON batch_email_jobs FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM companies WHERE role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER email_jobs_updated_at
  BEFORE UPDATE ON email_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER batch_email_jobs_updated_at
  BEFORE UPDATE ON batch_email_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

-- Function to create default email preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id, preferred_language)
  VALUES (NEW.id, 'nl')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create email preferences on user creation
CREATE TRIGGER create_user_email_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- =====================================================
-- STATISTICS VIEWS
-- =====================================================

-- Email statistics by status
CREATE OR REPLACE VIEW email_stats_by_status AS
SELECT
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d
FROM email_jobs
GROUP BY status;

-- Email statistics by template type
CREATE OR REPLACE VIEW email_stats_by_template AS
SELECT
  email_data->>'templateType' as template_type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
  ROUND(
    (COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0)) * 100,
    2
  ) as open_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0)) * 100,
    2
  ) as click_rate
FROM email_jobs
WHERE email_data->>'templateType' IS NOT NULL
GROUP BY email_data->>'templateType';

-- =====================================================
-- SAMPLE DATA (Default Email Templates)
-- =====================================================

-- Welcome email templates (all languages)
INSERT INTO email_templates (type, language, subject, html_content, text_content, variables) VALUES
('welcome', 'nl', 'Welkom bij ZZP Werkplaats! 🎉', '<html>Welcome HTML content in Dutch</html>', 'Welcome text content in Dutch', ARRAY['userName', 'verificationLink', 'supportEmail']),
('welcome', 'en', 'Welcome to ZZP Werkplaats! 🎉', '<html>Welcome HTML content in English</html>', 'Welcome text content in English', ARRAY['userName', 'verificationLink', 'supportEmail']),
('welcome', 'pl', 'Witamy w ZZP Werkplaats! 🎉', '<html>Welcome HTML content in Polish</html>', 'Welcome text content in Polish', ARRAY['userName', 'verificationLink', 'supportEmail'])
ON CONFLICT (type, language) DO NOTHING;

-- Password reset templates
INSERT INTO email_templates (type, language, subject, html_content, text_content, variables) VALUES
('password_reset', 'nl', 'Wachtwoord resetten - ZZP Werkplaats', '<html>Reset password HTML in Dutch</html>', 'Reset password text in Dutch', ARRAY['userName', 'resetLink', 'expiresIn']),
('password_reset', 'en', 'Reset Password - ZZP Werkplaats', '<html>Reset password HTML in English</html>', 'Reset password text in English', ARRAY['userName', 'resetLink', 'expiresIn']),
('password_reset', 'pl', 'Resetowanie hasła - ZZP Werkplaats', '<html>Reset password HTML in Polish</html>', 'Reset password text in Polish', ARRAY['userName', 'resetLink', 'expiresIn'])
ON CONFLICT (type, language) DO NOTHING;

-- Invoice templates
INSERT INTO email_templates (type, language, subject, html_content, text_content, variables) VALUES
('invoice', 'nl', 'Nieuwe factuur {{ invoiceNumber }} - ZZP Werkplaats', '<html>Invoice HTML in Dutch</html>', 'Invoice text in Dutch', ARRAY['companyName', 'invoiceNumber', 'amount', 'dueDate', 'downloadLink', 'paymentLink']),
('invoice', 'en', 'New invoice {{ invoiceNumber }} - ZZP Werkplaats', '<html>Invoice HTML in English</html>', 'Invoice text in English', ARRAY['companyName', 'invoiceNumber', 'amount', 'dueDate', 'downloadLink', 'paymentLink']),
('invoice', 'pl', 'Nowa faktura {{ invoiceNumber }} - ZZP Werkplaats', '<html>Invoice HTML in Polish</html>', 'Invoice text in Polish', ARRAY['companyName', 'invoiceNumber', 'amount', 'dueDate', 'downloadLink', 'paymentLink'])
ON CONFLICT (type, language) DO NOTHING;

COMMENT ON TABLE email_jobs IS 'Tracks all email jobs with delivery status and analytics';
COMMENT ON TABLE email_templates IS 'Stores email templates with multi-language support';
COMMENT ON TABLE email_events IS 'Tracks email engagement events (opens, clicks, etc.)';
COMMENT ON TABLE email_preferences IS 'User email notification preferences';
COMMENT ON TABLE batch_email_jobs IS 'Batch email campaigns for mass sending';
