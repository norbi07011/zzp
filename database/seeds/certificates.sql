-- =================================================================
-- HOLENDERSKIE CERTYFIKATY I KWALIFIKACJE - SEED DATA
-- System certyfikatów dla różnych branż i specjalizacji
-- =================================================================

-- Sprawdzenie czy tabela certificates istnieje, jeśli nie - tworzymy
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Certificate Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'professional', 'safety', 'technical', 'language', 'education'
    subcategory VARCHAR(100),
    industry VARCHAR(100) NOT NULL,
    
    -- Issuing Organization
    issuing_organization VARCHAR(255) NOT NULL,
    organization_type VARCHAR(50) NOT NULL, -- 'government', 'industry', 'education', 'international'
    organization_website VARCHAR(255),
    organization_country VARCHAR(50) DEFAULT 'Netherlands',
    
    -- Certificate Details
    certificate_type VARCHAR(50) NOT NULL, -- 'license', 'certification', 'diploma', 'course'
    difficulty_level VARCHAR(50) NOT NULL, -- 'basic', 'intermediate', 'advanced', 'expert'
    duration_validity_years INTEGER, -- How long the certificate is valid (NULL = lifetime)
    renewal_required BOOLEAN DEFAULT false,
    
    -- Requirements
    prerequisites TEXT,
    minimum_experience_years INTEGER DEFAULT 0,
    education_requirement VARCHAR(100),
    age_requirement_min INTEGER,
    age_requirement_max INTEGER,
    
    -- Examination/Assessment
    has_written_exam BOOLEAN DEFAULT false,
    has_practical_exam BOOLEAN DEFAULT false,
    has_continuous_assessment BOOLEAN DEFAULT false,
    exam_language VARCHAR(50) DEFAULT 'Dutch',
    
    -- Cost Information
    cost_exam_euros DECIMAL(8,2),
    cost_renewal_euros DECIMAL(8,2),
    cost_training_euros DECIMAL(8,2),
    
    -- Training Information
    training_duration_hours INTEGER,
    training_locations TEXT[],
    online_training_available BOOLEAN DEFAULT false,
    
    -- Recognition and Value
    recognition_level VARCHAR(50), -- 'national', 'eu', 'international', 'industry'
    mandatory_for_jobs BOOLEAN DEFAULT false,
    salary_impact_percentage DECIMAL(5,2), -- Average salary increase
    
    -- Keywords and Search
    keywords TEXT[],
    related_skills TEXT[],
    job_titles TEXT[], -- Job titles that typically require this certificate
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =================================================================
-- INSERT CERTIFICATES DATA
-- =================================================================

INSERT INTO certificates (
    name, description, category, subcategory, industry, issuing_organization, organization_type,
    organization_website, certificate_type, difficulty_level, duration_validity_years, renewal_required,
    prerequisites, minimum_experience_years, education_requirement, has_written_exam, has_practical_exam,
    cost_exam_euros, cost_renewal_euros, training_duration_hours, training_locations, online_training_available,
    recognition_level, mandatory_for_jobs, salary_impact_percentage, keywords, related_skills, job_titles,
    is_popular
) VALUES

-- SAFETY & CONSTRUCTION CERTIFICATES

('VCA Basis Veiligheidscertificaat', 
'Basis veiligheidscertificaat voor werknemers in de bouw, industrie en petrochemie. Verplicht voor veel bouwprojecten.',
'safety', 'construction-safety', 'Construction', 'SSVV (Stichting Samenwerken Voor Veiligheid)', 'industry',
'https://www.ssvv.nl', 'certification', 'basic', 10, true,
'Geen specifieke vooropleiding vereist. Basiskennis Nederlandse taal.', 0, 'any',
true, false, 89.00, 75.00, 8, 
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'Groningen', 'Online'], true,
'national', true, 5.00,
ARRAY['vca', 'veiligheid', 'bouw', 'industrie', 'certificaat'],
ARRAY['Veiligheid', 'Bouwplaats', 'Risicobewustzijn', 'ARBO'],
ARRAY['Bouwvakker', 'Installateur', 'Lasser', 'Monteur', 'Projectleider'],
true),

('VCA-VOL Veiligheid voor Operationeel Leidinggevenden',
'Uitgebreid veiligheidscertificaat voor leidinggevenden in de bouw en industrie. Verplicht voor projectleiders en uitvoerders.',
'safety', 'construction-leadership', 'Construction', 'SSVV (Stichting Samenwerken Voor Veiligheid)', 'industry',
'https://www.ssvv.nl', 'certification', 'advanced', 10, true,
'VCA Basis certificaat en leidinggevende ervaring in bouw/industrie.', 2, 'mbo',
true, true, 245.00, 195.00, 16,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven'], false,
'national', true, 12.00,
ARRAY['vca-vol', 'leidinggevend', 'veiligheid', 'projectmanagement'],
ARRAY['Leidinggevend', 'Veiligheidsmanagement', 'Projectcoördinatie'],
ARRAY['Projectleider', 'Uitvoerder', 'Werkvoorbereider', 'Veiligheidscoördinator'],
true),

('NEN 3140 Elektrotechnische Veiligheid',
'Certificaat voor veilig werken aan elektrische installaties. Verplicht voor elektrotechnici.',
'safety', 'electrical-safety', 'Construction', 'Nederlands Elektrotechnisch Comité', 'industry',
'https://www.nen.nl', 'certification', 'intermediate', 5, true,
'MBO Elektrotechniek of gelijkwaardige ervaring. Kennis van elektrische installaties.', 1, 'mbo',
true, true, 165.00, 125.00, 16,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'Den Haag'], false,
'national', true, 8.00,
ARRAY['nen-3140', 'elektrotechniek', 'veiligheid', 'installaties'],
ARRAY['Elektrotechniek', 'Veiligheid', 'Installaties', 'Onderhoudswerk'],
ARRAY['Elektricien', 'Installateur', 'Onderhoudsmonteur', 'Elektrotechnicus'],
true),

-- HEALTHCARE CERTIFICATES

('BIG Registratie Verpleegkundige',
'Wettelijke registratie voor verpleegkundigen in Nederland. Verplicht voor uitoefening van het beroep.',
'professional', 'healthcare-license', 'Healthcare', 'BIG-register (Ministerie VWS)', 'government',
'https://www.bigregister.nl', 'license', 'advanced', 3, true,
'HBO Verpleegkunde diploma van erkende Nederlandse opleiding.', 0, 'hbo',
false, false, 0.00, 67.50, 0,
ARRAY['Online registratie'], true,
'national', true, 0.00,
ARRAY['big-registratie', 'verpleegkunde', 'zorgverlener', 'license'],
ARRAY['Verpleegkunde', 'Medische zorg', 'Patiëntenzorg'],
ARRAY['Verpleegkundige', 'Wijkverpleegkundige', 'Zorgcoördinator'],
true),

('Eerste Hulp bij Ongevallen (EHBO)',
'Certificaat voor het verlenen van eerste hulp bij ongevallen en acute medische situaties.',
'safety', 'first-aid', 'Healthcare', 'Oranje Kruis', 'industry',
'https://www.oranjekruis.nl', 'certification', 'basic', 2, true,
'Minimaal 16 jaar oud. Geen specifieke vooropleiding vereist.', 0, 'any',
true, true, 95.00, 65.00, 16,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen'], false,
'national', false, 3.00,
ARRAY['ehbo', 'eerste-hulp', 'medische-noodhulp', 'veiligheid'],
ARRAY['Eerste Hulp', 'Reanimatie', 'AED gebruik', 'Noodprocedures'],
ARRAY['Bedrijfshulpverlener', 'Sportinstructeur', 'Kinderbegeleider', 'Beveiliger'],
true),

-- TECHNICAL & IT CERTIFICATES

('AWS Certified Solutions Architect',
'Internationale certificering voor cloud architecten die werken met Amazon Web Services.',
'technical', 'cloud-computing', 'Technology', 'Amazon Web Services', 'international',
'https://aws.amazon.com/certification/', 'certification', 'advanced', 3, true,
'Ervaring met AWS services en cloud architectuur. Kennis van networking en security.', 1, 'hbo',
true, false, 150.00, 150.00, 40,
ARRAY['Online (worldwide)', 'Amsterdam', 'Utrecht'], true,
'international', false, 15.00,
ARRAY['aws', 'cloud', 'architect', 'amazon'],
ARRAY['Cloud Computing', 'AWS', 'DevOps', 'Infrastructure'],
ARRAY['Cloud Architect', 'DevOps Engineer', 'Infrastructure Engineer'],
true),

('Cisco Certified Network Associate (CCNA)',
'Fundamentele netwerk certificering van Cisco voor networking professionals.',
'technical', 'networking', 'Technology', 'Cisco Systems', 'international',
'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html', 'certification', 'intermediate', 3, true,
'Basiskennis van networking concepten en TCP/IP.', 0, 'mbo',
true, false, 195.00, 195.00, 60,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Online'], true,
'international', false, 12.00,
ARRAY['cisco', 'ccna', 'networking', 'routers', 'switches'],
ARRAY['Networking', 'Cisco', 'Routers', 'Switches', 'TCP/IP'],
ARRAY['Network Engineer', 'IT Support', 'Network Administrator'],
true),

('Certified Ethical Hacker (CEH)',
'Internationale certificering voor cybersecurity professionals en ethical hackers.',
'technical', 'cybersecurity', 'Technology', 'EC-Council', 'international',
'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/', 'certification', 'advanced', 3, true,
'2+ jaar ervaring in IT security of networking. Kennis van operating systems.', 2, 'hbo',
true, true, 450.00, 450.00, 40,
ARRAY['Amsterdam', 'Online'], true,
'international', false, 20.00,
ARRAY['ethical-hacker', 'cybersecurity', 'penetration-testing', 'security'],
ARRAY['Cybersecurity', 'Penetration Testing', 'Ethical Hacking', 'IT Security'],
ARRAY['Security Analyst', 'Penetration Tester', 'Security Consultant'],
true),

-- LANGUAGE CERTIFICATES

('NT2 Staatsexamen Programma II',
'Nederlands als Tweede Taal staatsexamen voor hoger onderwijs en gekwalificeerd werk.',
'language', 'dutch-proficiency', 'Education', 'DUO (Dienst Uitvoering Onderwijs)', 'government',
'https://duo.nl/particulier/nt2-staatsexamen/', 'certification', 'advanced', 0, false,
'Voltooide middelbare school in eigen land. B2 niveau Nederlands.', 0, 'any',
true, true, 235.00, 0.00, 120,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen'], false,
'national', true, 8.00,
ARRAY['nt2', 'staatsexamen', 'nederlands', 'taal'],
ARRAY['Nederlandse taal', 'Communicatie', 'Schrijfvaardigheid'],
ARRAY['Leraar', 'Consultant', 'Onderzoeker', 'Adviseur'],
true),

('IELTS Academic (Score 7.0+)',
'International English Language Testing System voor hoger onderwijs en professioneel werk.',
'language', 'english-proficiency', 'Education', 'British Council / IDP', 'international',
'https://www.ielts.org/', 'certification', 'advanced', 2, false,
'Goed Engels niveau (B2+). Geen specifieke vooropleiding vereist.', 0, 'any',
true, true, 215.00, 0.00, 40,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag'], false,
'international', false, 10.00,
ARRAY['ielts', 'english', 'academic', 'language'],
ARRAY['English language', 'Communication', 'Academic writing'],
ARRAY['International consultant', 'Researcher', 'Teacher', 'Translator'],
true),

-- FINANCIAL & BUSINESS CERTIFICATES

('Registeraccountant (RA)',
'Wettelijke titel voor accountants in Nederland. Hoogste niveau in accountancy.',
'professional', 'accounting', 'Finance', 'NBA (Nederlandse Beroepsorganisatie van Accountants)', 'industry',
'https://www.nba.nl/', 'license', 'expert', 0, true,
'MSc Accountancy + 3 jaar praktijkervaring + theoretische en praktische examens.', 3, 'university',
true, true, 2500.00, 450.00, 240,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag'], false,
'national', true, 25.00,
ARRAY['registeraccountant', 'ra', 'accountancy', 'controle'],
ARRAY['Accountancy', 'Financial auditing', 'Compliance', 'Risk management'],
ARRAY['Accountant', 'Financial Controller', 'Audit Manager'],
true),

('Belastingadviseur (Registerbelastingadviseur)',
'Wettelijke titel voor belastingadviseurs in Nederland.',
'professional', 'tax-advisory', 'Finance', 'NOB (Nederlandse Orde van Belastingadviseurs)', 'industry',
'https://www.nob.net/', 'license', 'expert', 0, true,
'MSc Fiscaal Recht of Economics + praktijkervaring + examens NOB.', 2, 'university',
true, true, 1800.00, 350.00, 180,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag'], false,
'national', true, 20.00,
ARRAY['belastingadviseur', 'fiscaal', 'tax', 'advisor'],
ARRAY['Tax advisory', 'Fiscal law', 'Business taxation', 'Compliance'],
ARRAY['Tax Advisor', 'Fiscal Consultant', 'Financial Advisor'],
true),

-- EDUCATION CERTIFICATES

('Onderwijsbevoegdheid Tweedegraads',
'Bevoegdheid voor lesgeven in voortgezet onderwijs (VMBO, HAVO, VWO).',
'professional', 'teaching-qualification', 'Education', 'Ministerie van Onderwijs', 'government',
'https://www.rijksoverheid.nl/onderwerpen/leraren/bevoegdheid-leraren', 'license', 'advanced', 0, false,
'HBO Bachelor + vakspecifieke kennis + pedagogisch-didactische scholing.', 0, 'hbo',
true, true, 0.00, 0.00, 60,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Groningen'], false,
'national', true, 0.00,
ARRAY['onderwijsbevoegdheid', 'leraar', 'tweedegraads', 'onderwijs'],
ARRAY['Onderwijs', 'Didactiek', 'Pedagogiek', 'Vakkennis'],
ARRAY['Docent', 'Leraar', 'Trainer', 'Instructeur'],
true),

('TESOL Certificate (Teaching English)',
'Internationale certificering voor het onderwijzen van Engels als vreemde taal.',
'professional', 'language-teaching', 'Education', 'Cambridge English / Trinity College', 'international',
'https://www.cambridgeenglish.org/teaching-english/', 'certification', 'intermediate', 0, false,
'Native/near-native English + HBO niveau. Geen teaching ervaring vereist.', 0, 'hbo',
true, true, 1200.00, 0.00, 120,
ARRAY['Amsterdam', 'Utrecht', 'Online'], true,
'international', false, 8.00,
ARRAY['tesol', 'english-teaching', 'efl', 'tefl'],
ARRAY['English teaching', 'Language instruction', 'Curriculum development'],
ARRAY['English Teacher', 'Language Instructor', 'ESL Tutor'],
true),

-- LOGISTICS & TRANSPORT CERTIFICATES

('Chauffeur CCV (Certificaat van Chauffeursvaardigheid)',
'Verplicht certificaat voor professionele chauffeurs van vrachtwagens en bussen.',
'professional', 'transport-license', 'Logistics', 'CBR (Centraal Bureau Rijvaardigheid)', 'government',
'https://www.cbr.nl/', 'license', 'intermediate', 5, true,
'Rijbewijs C/D + medische keuring + basis kwalificatie 35 uur.', 0, 'mbo',
true, true, 145.00, 35.00, 35,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'Groningen'], false,
'national', true, 5.00,
ARRAY['ccv', 'chauffeur', 'vrachtwagen', 'transport'],
ARRAY['Professional driving', 'Transport', 'Logistics', 'Vehicle operation'],
ARRAY['Vrachtwagenchauffeur', 'Buschauffeur', 'Transport coordinator'],
true),

('ADR Gevaarlijke Stoffen Vervoer',
'Certificaat voor het vervoer van gevaarlijke stoffen over de weg.',
'safety', 'hazardous-transport', 'Logistics', 'NIWO (Nationale en Internationale Wegvervoer Organisatie)', 'industry',
'https://www.niwo.nl/', 'certification', 'advanced', 5, true,
'Geldig rijbewijs + basis gevaarlijke stoffen kennis.', 1, 'mbo',
true, true, 285.00, 195.00, 24,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven'], false,
'national', true, 12.00,
ARRAY['adr', 'gevaarlijke-stoffen', 'transport', 'veiligheid'],
ARRAY['Hazardous materials', 'Transport safety', 'Logistics', 'Chemical transport'],
ARRAY['ADR Chauffeur', 'Transport specialist', 'Logistics coordinator'],
true),

-- SUSTAINABLE ENERGY CERTIFICATES

('Zonnepanelen Installateur Certificaat',
'Certificaat voor installatie van zonnepanelen en fotovoltaïsche systemen.',
'technical', 'solar-installation', 'Energy', 'NVDE (Nederlandse Vereniging Duurzame Energie)', 'industry',
'https://www.nvde.nl/', 'certification', 'intermediate', 3, true,
'Elektrotechnische basiskennis + NEN 3140 + veiligheid op hoogte.', 1, 'mbo',
true, true, 450.00, 150.00, 32,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven'], false,
'national', false, 10.00,
ARRAY['zonnepanelen', 'solar', 'installateur', 'duurzaam'],
ARRAY['Solar installation', 'Renewable energy', 'Electrical work', 'Sustainability'],
ARRAY['Zonnepanelen installateur', 'Duurzame energie technicus', 'Solar specialist'],
true),

('Warmtepomp Installateur Certificaat',
'Specialisatie certificaat voor installatie en onderhoud van warmtepompen.',
'technical', 'heat-pump', 'Energy', 'Techniek Nederland', 'industry',
'https://www.technieknederland.nl/', 'certification', 'advanced', 5, true,
'Installateur W + F-gassen certificaat + ervaring met koudetechniek.', 2, 'mbo',
true, true, 850.00, 250.00, 40,
ARRAY['Amsterdam', 'Rotterdam', 'Utrecht'], false,
'national', false, 15.00,
ARRAY['warmtepomp', 'heat-pump', 'koudetechniek', 'duurzaam'],
ARRAY['Heat pump installation', 'HVAC', 'Sustainable heating', 'Energy efficiency'],
ARRAY['Warmtepomp installateur', 'HVAC technicus', 'Energie specialist'],
true),

-- MARKETING & COMMUNICATION CERTIFICATES

('Google Ads Certified Professional',
'Officiële Google certificering voor Google Ads specialists en digital marketers.',
'technical', 'digital-marketing', 'Marketing', 'Google', 'international',
'https://skillshop.exceedlms.com/student/catalog', 'certification', 'intermediate', 1, true,
'Basiskennis digital marketing en Google Ads platform.', 0, 'hbo',
true, false, 0.00, 0.00, 20,
ARRAY['Online'], true,
'international', false, 8.00,
ARRAY['google-ads', 'digital-marketing', 'ppc', 'advertising'],
ARRAY['Digital marketing', 'Google Ads', 'PPC', 'Online advertising'],
ARRAY['Digital Marketer', 'PPC Specialist', 'Marketing consultant'],
true),

('Facebook Blueprint Certification',
'Officiële Meta/Facebook certificering voor social media marketing professionals.',
'technical', 'social-media', 'Marketing', 'Meta (Facebook)', 'international',
'https://www.facebook.com/business/learn', 'certification', 'intermediate', 1, true,
'Ervaring met Facebook en Instagram advertising platforms.', 0, 'hbo',
true, false, 150.00, 150.00, 25,
ARRAY['Online'], true,
'international', false, 6.00,
ARRAY['facebook', 'instagram', 'social-media', 'advertising'],
ARRAY['Social media marketing', 'Facebook Ads', 'Instagram marketing', 'Content strategy'],
ARRAY['Social Media Manager', 'Digital Marketing Specialist', 'Content Creator'],
true);

-- =================================================================
-- WORKER-CERTIFICATE RELATIONSHIP TABLE
-- =================================================================

CREATE TABLE IF NOT EXISTS worker_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES workers(id),
    certificate_id UUID REFERENCES certificates(id),
    
    -- Certificate Status
    status VARCHAR(20) DEFAULT 'earned', -- 'earned', 'in-progress', 'expired', 'suspended'
    earned_date DATE,
    expiry_date DATE,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(50), -- 'document', 'registry-check', 'employer-confirm'
    verification_date DATE,
    verified_by VARCHAR(255),
    
    -- Certificate Details
    certificate_number VARCHAR(100),
    issuing_institution VARCHAR(255),
    grade_score VARCHAR(50), -- Grade or score achieved
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(worker_id, certificate_id, earned_date)
);

-- =================================================================
-- JOB-CERTIFICATE REQUIREMENTS TABLE
-- =================================================================

CREATE TABLE IF NOT EXISTS job_certificate_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    certificate_id UUID REFERENCES certificates(id),
    
    -- Requirement Level
    requirement_level VARCHAR(20) NOT NULL, -- 'required', 'preferred', 'nice-to-have'
    alternative_experience_years INTEGER, -- Years of experience that can substitute
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(job_id, certificate_id)
);

-- =================================================================
-- SAMPLE WORKER CERTIFICATES
-- =================================================================

-- Assign certificates to some workers
INSERT INTO worker_certificates (worker_id, certificate_id, status, earned_date, expiry_date, is_verified, certificate_number, grade_score)
SELECT 
    w.id,
    c.id,
    'earned',
    CURRENT_DATE - INTERVAL '1 year',
    CASE WHEN c.duration_validity_years IS NOT NULL 
         THEN CURRENT_DATE - INTERVAL '1 year' + INTERVAL '1 year' * c.duration_validity_years
         ELSE NULL END,
    true,
    'CERT-' || substr(gen_random_uuid()::text, 1, 8),
    CASE 
        WHEN c.has_written_exam THEN (ARRAY['7.5', '8.0', '8.5', '9.0'])[floor(random() * 4 + 1)]
        ELSE 'Passed'
    END
FROM workers w, certificates c
WHERE 
    -- AWS Certification for cloud professionals
    (c.name = 'AWS Certified Solutions Architect' AND 
     (w.email LIKE '%devops%' OR w.email LIKE '%cloud%' OR w.professional_title ILIKE '%devops%' OR w.professional_title ILIKE '%cloud%'))
    OR
    -- VCA for construction workers
    (c.name = 'VCA Basis Veiligheidscertificaat' AND 
     w.email LIKE '%bouw%' OR w.email LIKE '%construction%' OR w.email LIKE '%installation%')
    OR
    -- BIG registration for healthcare workers
    (c.name = 'BIG Registratie Verpleegkundige' AND 
     w.email LIKE '%healthcare%' OR w.email LIKE '%zorg%' OR w.professional_title ILIKE '%verpleeg%')
    OR
    -- NT2 for international workers
    (c.name = 'NT2 Staatsexamen Programma II' AND 
     w.nationality != 'Dutch' AND w.languages->>'nl' = 'professional')
LIMIT 50;

-- =================================================================
-- SAMPLE JOB CERTIFICATE REQUIREMENTS
-- =================================================================

-- Add certificate requirements to jobs
INSERT INTO job_certificate_requirements (job_id, certificate_id, requirement_level, alternative_experience_years)
SELECT 
    j.id,
    c.id,
    CASE 
        WHEN c.mandatory_for_jobs THEN 'required'
        WHEN random() < 0.3 THEN 'preferred'
        ELSE 'nice-to-have'
    END,
    CASE 
        WHEN c.mandatory_for_jobs THEN NULL
        ELSE floor(random() * 3 + 2)::INTEGER
    END
FROM jobs j, certificates c
WHERE 
    -- VCA for construction jobs
    (j.category = 'construction' AND c.name LIKE '%VCA%')
    OR
    -- AWS for cloud/devops jobs
    (j.title ILIKE '%cloud%' OR j.title ILIKE '%devops%' OR j.title ILIKE '%aws%') AND c.name LIKE '%AWS%'
    OR
    -- Language certificates for international roles
    (j.languages_required->>'en' = 'fluent' AND c.category = 'language')
    OR
    -- Safety certificates for technical roles
    (j.category IN ('construction', 'manufacturing', 'energy') AND c.category = 'safety')
LIMIT 100;

-- =================================================================
-- INDEXES AND PERFORMANCE OPTIMIZATION
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_certificates_category ON certificates(category);
CREATE INDEX IF NOT EXISTS idx_certificates_industry ON certificates(industry);
CREATE INDEX IF NOT EXISTS idx_certificates_level ON certificates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_certificates_active ON certificates(is_active);
CREATE INDEX IF NOT EXISTS idx_certificates_popular ON certificates(is_popular);
CREATE INDEX IF NOT EXISTS idx_certificates_keywords ON certificates USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_certificates_skills ON certificates USING gin(related_skills);

CREATE INDEX IF NOT EXISTS idx_worker_certificates_worker ON worker_certificates(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_certificates_cert ON worker_certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_worker_certificates_status ON worker_certificates(status);
CREATE INDEX IF NOT EXISTS idx_worker_certificates_verified ON worker_certificates(is_verified);

CREATE INDEX IF NOT EXISTS idx_job_cert_req_job ON job_certificate_requirements(job_id);
CREATE INDEX IF NOT EXISTS idx_job_cert_req_cert ON job_certificate_requirements(certificate_id);
CREATE INDEX IF NOT EXISTS idx_job_cert_req_level ON job_certificate_requirements(requirement_level);

-- =================================================================
-- CERTIFICATE STATISTICS VIEW
-- =================================================================

CREATE OR REPLACE VIEW certificate_stats AS
SELECT 
    c.category,
    c.industry,
    COUNT(*) as total_certificates,
    COUNT(*) FILTER (WHERE c.is_popular = true) as popular_certificates,
    ROUND(AVG(c.cost_exam_euros), 2) as avg_exam_cost,
    COUNT(wc.worker_id) as workers_with_certificates,
    COUNT(jcr.job_id) as jobs_requiring_certificates
FROM certificates c
LEFT JOIN worker_certificates wc ON c.id = wc.certificate_id AND wc.status = 'earned'
LEFT JOIN job_certificate_requirements jcr ON c.id = jcr.certificate_id
WHERE c.is_active = true
GROUP BY c.category, c.industry
ORDER BY workers_with_certificates DESC;

-- =================================================================
-- CERTIFICATE SEARCH FUNCTION
-- =================================================================

CREATE OR REPLACE FUNCTION search_certificates(
    search_term TEXT DEFAULT NULL,
    category_filter VARCHAR DEFAULT NULL,
    industry_filter VARCHAR DEFAULT NULL,
    max_cost DECIMAL DEFAULT NULL,
    online_only BOOLEAN DEFAULT FALSE,
    popular_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    category VARCHAR,
    industry VARCHAR,
    issuing_organization VARCHAR,
    difficulty_level VARCHAR,
    cost_exam_euros DECIMAL,
    online_training_available BOOLEAN,
    is_popular BOOLEAN,
    recognition_level VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.category,
        c.industry,
        c.issuing_organization,
        c.difficulty_level,
        c.cost_exam_euros,
        c.online_training_available,
        c.is_popular,
        c.recognition_level
    FROM certificates c
    WHERE 
        c.is_active = true
        AND (search_term IS NULL OR 
             c.name ILIKE '%' || search_term || '%' OR 
             c.description ILIKE '%' || search_term || '%' OR
             c.keywords @> ARRAY[search_term])
        AND (category_filter IS NULL OR c.category = category_filter)
        AND (industry_filter IS NULL OR c.industry = industry_filter)
        AND (max_cost IS NULL OR c.cost_exam_euros <= max_cost)
        AND (online_only = false OR c.online_training_available = true)
        AND (popular_only = false OR c.is_popular = true)
    ORDER BY c.is_popular DESC, c.cost_exam_euros ASC;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- WORKER CERTIFICATION PROGRESS FUNCTION
-- =================================================================

CREATE OR REPLACE FUNCTION get_worker_certifications(worker_uuid UUID)
RETURNS TABLE (
    certificate_name VARCHAR,
    status VARCHAR,
    earned_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.name,
        wc.status,
        wc.earned_date,
        wc.expiry_date,
        wc.is_verified,
        CASE 
            WHEN wc.expiry_date IS NOT NULL 
            THEN (wc.expiry_date - CURRENT_DATE)::INTEGER
            ELSE NULL
        END as days_until_expiry
    FROM worker_certificates wc
    JOIN certificates c ON wc.certificate_id = c.id
    WHERE wc.worker_id = worker_uuid
    ORDER BY 
        CASE wc.status 
            WHEN 'earned' THEN 1 
            WHEN 'in-progress' THEN 2 
            ELSE 3 
        END,
        wc.earned_date DESC;
END;
$$ LANGUAGE plpgsql;

COMMIT;