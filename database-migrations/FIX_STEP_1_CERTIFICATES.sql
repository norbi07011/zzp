-- ================================
-- KROK 1: Utwórz tabelę certificates
-- ================================
-- Skopiuj i uruchom TYLKO TEN BLOK najpierw:

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type VARCHAR(50) NOT NULL,
  certificate_number VARCHAR(100),
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own certs" ON public.certificates
FOR SELECT USING (auth.uid() = worker_id);

-- Powinieneś zobaczyć: "Success. No rows returned"
