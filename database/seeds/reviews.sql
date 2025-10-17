-- =================================================================
-- HOLENDERSKIE RECENZJE I OCENY - SEED DATA
-- System ocen i opinii między firmami a pracownikami ZZP
-- =================================================================

-- Sprawdzenie czy tabela reviews istnieje, jeśli nie - tworzymy
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Review Parties
    reviewer_type VARCHAR(20) NOT NULL, -- 'company', 'worker'
    reviewer_id UUID NOT NULL, -- Can reference companies.id or workers.id
    reviewee_type VARCHAR(20) NOT NULL, -- 'company', 'worker'
    reviewee_id UUID NOT NULL, -- Can reference companies.id or workers.id
    
    -- Job Context
    job_id UUID REFERENCES jobs(id),
    job_title VARCHAR(255),
    project_duration_days INTEGER,
    project_completion_date DATE,
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT NOT NULL,
    
    -- Detailed Ratings (1-5 scale)
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5), -- Value for money
    
    -- Additional Information
    would_recommend BOOLEAN DEFAULT true,
    would_work_again BOOLEAN DEFAULT true,
    helpful_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    
    -- Review Categories/Tags
    tags TEXT[], -- ['professional', 'timely', 'quality-work', 'good-communication']
    
    -- Response and Follow-up
    has_response BOOLEAN DEFAULT false,
    response_text TEXT,
    response_date TIMESTAMP,
    response_by UUID, -- Who responded (company contact or worker)
    
    -- Verification and Authenticity
    is_verified BOOLEAN DEFAULT false, -- Verified as legitimate review
    verification_method VARCHAR(50), -- 'job-completion', 'payment-confirmed', 'manual-check'
    is_featured BOOLEAN DEFAULT false, -- Featured review (high quality)
    
    -- Language and Location
    review_language VARCHAR(10) DEFAULT 'nl',
    work_location VARCHAR(100), -- Where the work was performed
    
    -- Status and Moderation
    status VARCHAR(20) DEFAULT 'published', -- 'published', 'pending', 'hidden', 'disputed'
    moderation_notes TEXT,
    flagged_inappropriate BOOLEAN DEFAULT false,
    flag_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_reviewer_reviewee CHECK (
        (reviewer_type = 'company' AND reviewee_type = 'worker') OR
        (reviewer_type = 'worker' AND reviewee_type = 'company')
    ),
    CONSTRAINT no_self_review CHECK (
        NOT (reviewer_type = reviewee_type AND reviewer_id = reviewee_id)
    )
);

-- =================================================================
-- INSERT REVIEWS DATA
-- =================================================================

-- Reviews from companies about workers
INSERT INTO reviews (
    reviewer_type, reviewer_id, reviewee_type, reviewee_id, job_id, job_title,
    project_duration_days, project_completion_date, rating, title, review_text,
    communication_rating, quality_rating, timeliness_rating, professionalism_rating, value_rating,
    would_recommend, would_work_again, tags, is_verified, verification_method,
    work_location, review_language
) VALUES

-- TechNova Amsterdam reviews React Developer Lars
('company', 
 (SELECT id FROM companies WHERE kvk_number = '68750110'),
 'worker',
 (SELECT id FROM workers WHERE email = 'lars.vandeberg@email.nl'),
 (SELECT id FROM jobs WHERE title LIKE '%React Developer%' LIMIT 1),
 'Senior React Developer voor E-commerce Platform',
 45, '2024-12-15', 5,
 'Uitstekende React developer met oog voor detail',
 'Lars heeft fantastisch werk geleverd aan ons e-commerce platform. Zijn kennis van React en TypeScript is uitstekend, en hij heeft verschillende complexe features geïmplementeerd die perfect werkten. De code kwaliteit was hoog en goed gedocumenteerd. Hij communiceerde proactief over voortgang en mogelijke issues. Zeker een aanrader voor React projecten!',
 5, 5, 5, 5, 4,
 true, true,
 ARRAY['professional', 'expert-level', 'good-communication', 'clean-code', 'reliable'],
 true, 'job-completion',
 'Amsterdam', 'nl'),

-- CloudFirst Utrecht reviews DevOps Engineer Ahmed
('company',
 (SELECT id FROM companies WHERE kvk_number = '73892456'),
 'worker',
 (SELECT id FROM workers WHERE email = 'ahmed.hassan@devtech.nl'),
 (SELECT id FROM jobs WHERE title LIKE '%DevOps Engineer%' LIMIT 1),
 'DevOps Engineer - AWS Specialist',
 60, '2024-11-28', 5,
 'Zeer ervaren DevOps specialist',
 'Ahmed heeft onze AWS infrastructuur grondig geoptimaliseerd en geautomatiseerd. Hij heeft ons CI/CD pipeline opgezet met GitLab CI en Terraform, wat onze deployment tijd met 70% heeft verkort. Zijn kennis van Kubernetes en Docker is indrukwekkend. Hij werkt zelfstandig en denkt proactief mee over verbeteringen. Top professional!',
 5, 5, 4, 5, 5,
 true, true,
 ARRAY['aws-expert', 'automation', 'efficient', 'proactive', 'kubernetes'],
 true, 'payment-confirmed',
 'Utrecht', 'nl'),

-- DataDriven Solutions reviews Data Scientist Sophie
('company',
 (SELECT id FROM companies WHERE kvk_number = '82156789'),
 'worker',
 (SELECT id FROM workers WHERE email = 'sophie.vanbeek@datatech.nl'),
 (SELECT id FROM jobs WHERE title LIKE '%Data Scientist%' LIMIT 1),
 'Data Scientist - Machine Learning Focus',
 30, '2024-12-01', 4,
 'Goede data scientist met sterke analytische skills',
 'Sophie heeft een machine learning model ontwikkeld voor customer churn prediction dat 15% beter presteerde dan ons vorige model. Haar presentaties waren helder en ze kon complexe concepten goed uitleggen aan het management. Het enige minpuntje was dat sommige deadlines wat krap waren, maar de eindresultaten waren goed.',
 4, 5, 3, 4, 4,
 true, true,
 ARRAY['analytical', 'machine-learning', 'clear-communication', 'results-driven'],
 true, 'job-completion',
 'Amsterdam', 'nl'),

-- Rotterdam Bouw Groep reviews Project Manager Kees
('company',
 (SELECT id FROM companies WHERE kvk_number = '45123789'),
 'worker',
 (SELECT id FROM workers WHERE email = 'kees.vanhouten@engineer.nl'),
 (SELECT id FROM jobs WHERE title LIKE '%Projectmanager%' LIMIT 1),
 'Projectmanager Renovatie - Monumentale Panden',
 120, '2024-10-15', 5,
 'Ervaren projectmanager met oog voor monumentenzorg',
 'Kees heeft een complex renovatieproject van een 17e-eeuws pand in Rotterdam succesvol geleid. Hij heeft uitstekende kennis van monumentale bouw en wist alle gemeentelijke procedures vlot te doorlopen. Het project werd op tijd en binnen budget opgeleverd. Zijn communicatie met onderaannemers en gemeente was professioneel en effectief.',
 5, 5, 5, 5, 4,
 true, true,
 ARRAY['project-management', 'monument-expertise', 'on-time', 'budget-control', 'government-relations'],
 true, 'job-completion',
 'Rotterdam', 'nl'),

-- Haagse Installaties reviews Electrical Installer Frank
('company',
 (SELECT id FROM companies WHERE kvk_number = '56234890'),
 'worker',
 (SELECT id FROM workers WHERE email = 'frank.deboer@installation.nl'),
 (SELECT id FROM jobs WHERE title LIKE '%Elektrotechnisch%' LIMIT 1),
 'Elektrotechnisch Installateur - Domotica Specialist',
 21, '2024-11-20', 4,
 'Vakkundige installateur met modern inzicht',
 'Frank heeft een uitgebreide domotica installatie bij ons verzorgd. Zijn technische kennis is goed en hij werkt netjes. De KNX programmering was professioneel uitgevoerd. Communicatie met klanten was vriendelijk en geduldig. Enige punt was dat de planning iets overschreden werd door onvoorziene problemen.',
 4, 4, 3, 5, 4,
 true, true,
 ARRAY['technical-expertise', 'knx-specialist', 'customer-friendly', 'clean-work'],
 true, 'job-completion',
 'Den Haag', 'nl'),

-- Zorgplus Eindhoven reviews Nurse Anna
('company',
 (SELECT id FROM companies WHERE kvk_number = '78456012'),
 'worker',
 (SELECT id FROM workers WHERE email = 'anna.vermeulen@healthcare.nl'),
 (SELECT id FROM jobs WHERE title LIKE '%Wijkverpleegkundige%' LIMIT 1),
 'Wijkverpleegkundige Thuiszorg - ZZP/Freelance',
 90, '2024-12-10', 5,
 'Zeer deskundige en empathische zorgverlener',
 'Dr. Vermeulen heeft uitstekende zorg geleverd aan onze cliënten. Haar medische kennis is uitgebreid en ze heeft een natuurlijke empathie voor patiënten en familie. Ze werkt zelfstandig maar communiceert goed met het team. Cliënten geven consistently positieve feedback over haar zorg. Een echte aanwinst!',
 5, 5, 5, 5, 5,
 true, true,
 ARRAY['medical-expertise', 'empathetic', 'independent', 'patient-care', 'team-player'],
 true, 'job-completion',
 'Eindhoven', 'nl'),

-- Creative Minds Agency reviews UX Designer Maya
('company',
 (SELECT id FROM companies WHERE kvk_number = '56234890'),
 'worker',
 (SELECT id FROM workers WHERE email = 'maya.patel@training.nl'),
 (SELECT id FROM jobs WHERE title LIKE '%UX/UI Designer%' LIMIT 1),
 'UX/UI Designer - Digital Campaigns',
 75, '2024-11-05', 4,
 'Creatieve designer met goede user research skills',
 'Maya heeft mooie designs gemaakt voor onze campagne van een fintech startup. Haar user research was grondig en de wireframes goed doordacht. De samenwerking met development liep soepel. Sommige design keuzes waren misschien iets te innovatief voor de doelgroep, maar overall een goed resultaat.',
 4, 4, 4, 4, 4,
 true, true,
 ARRAY['creative', 'user-research', 'wireframing', 'collaboration', 'innovative'],
 true, 'job-completion',
 'Amsterdam', 'nl'),

-- Holland Express Logistics reviews Coordinator Marcel
('company',
 (SELECT id FROM companies WHERE kvk_number = '90678234'),
 'worker',
 (SELECT id FROM workers WHERE email = 'marcel.vandijk@logistics.nl'),
 (SELECT id FROM jobs WHERE title LIKE '%Logistics Coordinator%' LIMIT 1),
 'Logistics Coordinator - International Transport',
 180, '2024-09-30', 5,
 'Zeer ervaren logistiek coördinator',
 'Marcel heeft onze internationale transportroutes geoptimaliseerd en nieuwe klantrelaties opgebouwd. Zijn kennis van Europese douane procedures is uitstekend. Hij heeft ons geholpen met de implementatie van een nieuw TMS systeem. Zeer betrouwbaar en resultaatgericht.',
 5, 5, 5, 5, 4,
 true, true,
 ARRAY['logistics-expert', 'international', 'system-implementation', 'reliable', 'customer-relations'],
 true, 'job-completion',
 'Schiphol', 'nl'),

-- Now add reviews from workers about companies

-- Lars reviews TechNova Amsterdam
('worker',
 (SELECT id FROM workers WHERE email = 'lars.vandeberg@email.nl'),
 'company',
 (SELECT id FROM companies WHERE kvk_number = '68750110'),
 (SELECT id FROM jobs WHERE title LIKE '%React Developer%' LIMIT 1),
 'Senior React Developer voor E-commerce Platform',
 45, '2024-12-15', 5,
 'Geweldige company om voor te werken',
 'TechNova Amsterdam is een professionele organisatie met een duidelijke visie. Het team was zeer ondersteunend en ik had alle vrijheid om de beste technische oplossingen te implementeren. De communicatie was open en eerlijk, deadlines realistisch. Payment was altijd op tijd. Zeker een aanrader voor developers!',
 5, 5, 5, 5, 5,
 true, true,
 ARRAY['professional', 'supportive-team', 'realistic-deadlines', 'timely-payment', 'technical-freedom'],
 true, 'job-completion',
 'Amsterdam', 'nl'),

-- Ahmed reviews CloudFirst Utrecht
('worker',
 (SELECT id FROM workers WHERE email = 'ahmed.hassan@devtech.nl'),
 'company',
 (SELECT id FROM companies WHERE kvk_number = '73892456'),
 (SELECT id FROM jobs WHERE title LIKE '%DevOps Engineer%' LIMIT 1),
 'DevOps Engineer - AWS Specialist',
 60, '2024-11-28', 4,
 'Goede remote-first culture',
 'CloudFirst Utrecht heeft een sterke remote-first cultuur wat perfect paste bij mijn werkstijl. Het project was technisch uitdagend en ik kreeg de ruimte om moderne tools te gebruiken. Enige minpunt was dat sommige requirements pas laat duidelijk werden, maar overall een positieve ervaring.',
 4, 4, 3, 5, 4,
 true, true,
 ARRAY['remote-friendly', 'technically-challenging', 'modern-tools', 'late-requirements'],
 true, 'payment-confirmed',
 'Utrecht', 'nl'),

-- Sophie reviews DataDriven Solutions
('worker',
 (SELECT id FROM workers WHERE email = 'sophie.vanbeek@datatech.nl'),
 'company',
 (SELECT id FROM companies WHERE kvk_number = '82156789'),
 (SELECT id FROM jobs WHERE title LIKE '%Data Scientist%' LIMIT 1),
 'Data Scientist - Machine Learning Focus',
 30, '2024-12-01', 4,
 'Interessante data science projecten',
 'Leuk project met real-world impact. De datasets waren interessant en het probleem goed gedefinieerd. Goede begeleiding van Michael Chen. Zou wel meer tijd hebben kunnen gebruiken voor hyperparameter tuning, maar overall tevreden met het resultaat.',
 4, 4, 3, 4, 4,
 true, true,
 ARRAY['interesting-projects', 'real-world-impact', 'good-guidance', 'time-constraints'],
 true, 'job-completion',
 'Amsterdam', 'nl'),

-- Add more reviews with varying ratings and scenarios

-- Mixed review - construction project
('company',
 (SELECT id FROM companies WHERE kvk_number = '45123789'),
 'worker',
 (SELECT id FROM workers WHERE email = 'stefan.mueller@hvac.nl'),
 NULL, 'HVAC Installatie Kantoorgebouw',
 28, '2024-10-30', 3,
 'Goed vakmanschap, communicatie kan beter',
 'Stefan heeft technisch goed werk geleverd aan ons HVAC systeem. Zijn kennis van warmtepompen is uitstekend en de installatie werkt perfect. Echter was de communicatie soms onduidelijk over planning en hij was een paar keer te laat zonder bericht. Voor volgende keer afspraken beter vastleggen.',
 2, 4, 2, 3, 4,
 true, false,
 ARRAY['technical-expertise', 'hvac-specialist', 'poor-communication', 'timing-issues'],
 true, 'job-completion',
 'Rotterdam', 'nl'),

-- Negative review handled professionally
('worker',
 (SELECT id FROM workers WHERE email = 'lisa.dejong@marketing.nl'),
 'company',
 (SELECT id FROM companies WHERE kvk_number = '12890456'),
 NULL, 'SEO Optimalisatie Webshop',
 14, '2024-11-15', 2,
 'Onduidelijke requirements en late betalingen',
 'Het project begon goed maar liep al snel vast door onduidelijke eisen en continue wijzigingen. Communicatie met het management was moeizaam en betaling kwam 3 weken te laat. Uiteindelijk wel een werkend resultaat opgeleverd maar niet de prettigste ervaring.',
 2, 3, 1, 2, 2,
 false, false,
 ARRAY['unclear-requirements', 'late-payment', 'scope-creep', 'poor-management'],
 true, 'payment-confirmed',
 'Amsterdam', 'nl'),

-- Excellent international project
('company',
 (SELECT id FROM companies WHERE kvk_number = '90678234'),
 'worker',
 (SELECT id FROM workers WHERE email = 'alex.rodriguez@sales.nl'),
 NULL, 'Business Development - Duitse Markt',
 90, '2024-09-20', 5,
 'Outstanding business development results',
 'Alex heeft fantastische resultaten behaald in de Duitse markt. Hij heeft 8 nieuwe klanten binnengebracht en de omzet met 40% verhoogd. Zijn kennis van de Duitse business cultuur en taalvaardigheden waren cruciaal. Professional, resultaatgericht en betrouwbaar.',
 5, 5, 5, 5, 5,
 true, true,
 ARRAY['business-development', 'german-market', 'sales-results', 'cultural-knowledge', 'multilingual'],
 true, 'job-completion',
 'Schiphol', 'nl'),

-- Healthcare excellence
('worker',
 (SELECT id FROM workers WHERE email = 'sandra.bakker@physiotherapy.nl'),
 'company',
 (SELECT id FROM companies WHERE kvk_number = '78456012'),
 NULL, 'Fysiotherapie Begeleiding Patiënten',
 120, '2024-08-15', 5,
 'Professionele zorgorganisatie met goede ondersteuning',
 'Zorgplus biedt een uitstekende werkomgeving voor fysiotherapeuten. Goede administratieve ondersteuning, moderne apparatuur en een echt patiëntgerichte aanpak. Het team is collegiaal en er is ruimte voor professionele ontwikkeling. Payment altijd correct en op tijd.',
 5, 5, 5, 5, 5,
 true, true,
 ARRAY['professional-environment', 'patient-focused', 'good-equipment', 'team-support', 'development-opportunities'],
 true, 'job-completion',
 'Eindhoven', 'nl'),

-- Tech startup experience
('worker',
 (SELECT id FROM workers WHERE email = 'dmitri.petrov@gamedev.nl'),
 'company',
 (SELECT id FROM companies WHERE kvk_number = '34012678'),
 NULL, 'Game Development - Mobile App',
 45, '2024-11-10', 4,
 'Innovatieve startup met goede energy',
 'FinTech Innovations heeft een leuke startup vibe en er wordt gewerkt aan cutting-edge technologie. Het team is jong en gedreven. Soms was de planning wat chaotisch en requirements wijzigden vaak, maar dat hoort bij een startup. Goede leerervaring.',
 3, 4, 3, 4, 4,
 true, true,
 ARRAY['startup-culture', 'innovative', 'young-team', 'chaotic-planning', 'learning-experience'],
 true, 'job-completion',
 'Amsterdam', 'nl');

-- =================================================================
-- ADD RESPONSES TO SOME REVIEWS
-- =================================================================

-- Add responses from companies to worker reviews
UPDATE reviews 
SET has_response = true, 
    response_text = 'Dank je wel Lars voor je positieve review! Het was een plezier om met je samen te werken. Je professionele aanpak en technische expertise hebben echt bijgedragen aan het succes van ons platform. We kijken uit naar toekomstige samenwerkingen.',
    response_date = NOW() - INTERVAL '2 days',
    response_by = (SELECT id FROM companies WHERE kvk_number = '68750110')
WHERE reviewer_type = 'worker' 
  AND reviewer_id = (SELECT id FROM workers WHERE email = 'lars.vandeberg@email.nl')
  AND reviewee_type = 'company';

-- Add response to negative review
UPDATE reviews 
SET has_response = true,
    response_text = 'Bedankt voor je feedback Lisa. We begrijpen je frustraties en hebben inmiddels onze projectmanagement processen verbeterd. De betalingsprocedure is ook aangepast om vertragingen te voorkomen. We waarderen je professionele aanpak ondanks de uitdagingen.',
    response_date = NOW() - INTERVAL '1 day',
    response_by = (SELECT id FROM companies WHERE kvk_number = '12890456')
WHERE reviewer_type = 'worker' 
  AND reviewee_type = 'company'
  AND rating = 2;

-- =================================================================
-- UPDATE WORKER AND COMPANY RATINGS
-- =================================================================

-- Update worker average ratings based on reviews
UPDATE workers 
SET average_rating = subquery.avg_rating,
    reviews_count = subquery.review_count
FROM (
    SELECT 
        reviewee_id,
        ROUND(AVG(rating::DECIMAL), 2) as avg_rating,
        COUNT(*) as review_count
    FROM reviews 
    WHERE reviewee_type = 'worker' AND status = 'published'
    GROUP BY reviewee_id
) AS subquery
WHERE workers.id = subquery.reviewee_id;

-- Update company ratings based on reviews
UPDATE companies 
SET rating = subquery.avg_rating,
    reviews_count = subquery.review_count
FROM (
    SELECT 
        reviewee_id,
        ROUND(AVG(rating::DECIMAL), 2) as avg_rating,
        COUNT(*) as review_count
    FROM reviews 
    WHERE reviewee_type = 'company' AND status = 'published'
    GROUP BY reviewee_id
) AS subquery
WHERE companies.id = subquery.reviewee_id;

-- =================================================================
-- INDEXES AND PERFORMANCE OPTIMIZATION
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_type, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_type, reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job ON reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_tags ON reviews USING gin(tags);

-- Full-text search index for review content
CREATE INDEX IF NOT EXISTS idx_reviews_search ON reviews USING gin(
    to_tsvector('dutch', title || ' ' || review_text)
);

-- =================================================================
-- REVIEW STATISTICS VIEW
-- =================================================================

CREATE OR REPLACE VIEW review_stats AS
SELECT 
    'Overall' as category,
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
    COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
    COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
    COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
    COUNT(*) FILTER (WHERE rating = 1) as one_star_count,
    COUNT(*) FILTER (WHERE would_recommend = true) as would_recommend_count,
    COUNT(*) FILTER (WHERE has_response = true) as responded_reviews
FROM reviews 
WHERE status = 'published'

UNION ALL

SELECT 
    reviewer_type as category,
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
    COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
    COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
    COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
    COUNT(*) FILTER (WHERE rating = 1) as one_star_count,
    COUNT(*) FILTER (WHERE would_recommend = true) as would_recommend_count,
    COUNT(*) FILTER (WHERE has_response = true) as responded_reviews
FROM reviews 
WHERE status = 'published'
GROUP BY reviewer_type
ORDER BY category;

-- =================================================================
-- REVIEW SEARCH FUNCTION
-- =================================================================

CREATE OR REPLACE FUNCTION search_reviews(
    target_type VARCHAR DEFAULT NULL, -- 'worker', 'company'
    target_id UUID DEFAULT NULL,
    min_rating INTEGER DEFAULT NULL,
    max_rating INTEGER DEFAULT NULL,
    search_term TEXT DEFAULT NULL,
    verified_only BOOLEAN DEFAULT FALSE,
    has_response_filter BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    reviewer_type VARCHAR,
    reviewee_type VARCHAR,
    rating INTEGER,
    title VARCHAR,
    review_text TEXT,
    tags TEXT[],
    would_recommend BOOLEAN,
    has_response BOOLEAN,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.reviewer_type,
        r.reviewee_type,
        r.rating,
        r.title,
        r.review_text,
        r.tags,
        r.would_recommend,
        r.has_response,
        r.created_at
    FROM reviews r
    WHERE 
        r.status = 'published'
        AND (target_type IS NULL OR r.reviewee_type = target_type)
        AND (target_id IS NULL OR r.reviewee_id = target_id)
        AND (min_rating IS NULL OR r.rating >= min_rating)
        AND (max_rating IS NULL OR r.rating <= max_rating)
        AND (search_term IS NULL OR 
             to_tsvector('dutch', r.title || ' ' || r.review_text) @@ plainto_tsquery('dutch', search_term))
        AND (verified_only = false OR r.is_verified = true)
        AND (has_response_filter IS NULL OR r.has_response = has_response_filter)
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- REVIEW REPUTATION FUNCTION
-- =================================================================

CREATE OR REPLACE FUNCTION get_reputation_score(
    entity_type VARCHAR, -- 'worker' or 'company'
    entity_id UUID
)
RETURNS TABLE (
    overall_rating DECIMAL,
    total_reviews INTEGER,
    communication_avg DECIMAL,
    quality_avg DECIMAL,
    timeliness_avg DECIMAL,
    professionalism_avg DECIMAL,
    value_avg DECIMAL,
    recommendation_percentage DECIMAL,
    response_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(r.rating), 2) as overall_rating,
        COUNT(*)::INTEGER as total_reviews,
        ROUND(AVG(r.communication_rating), 2) as communication_avg,
        ROUND(AVG(r.quality_rating), 2) as quality_avg,
        ROUND(AVG(r.timeliness_rating), 2) as timeliness_avg,
        ROUND(AVG(r.professionalism_rating), 2) as professionalism_avg,
        ROUND(AVG(r.value_rating), 2) as value_avg,
        ROUND((COUNT(*) FILTER (WHERE r.would_recommend = true) * 100.0 / COUNT(*)), 1) as recommendation_percentage,
        CASE 
            WHEN entity_type = 'company' THEN
                ROUND((COUNT(*) FILTER (WHERE r.has_response = true) * 100.0 / COUNT(*)), 1)
            ELSE 0.0
        END as response_rate
    FROM reviews r
    WHERE 
        r.reviewee_type = entity_type 
        AND r.reviewee_id = entity_id
        AND r.status = 'published';
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- HELPFUL VOTES UPDATE TRIGGER
-- =================================================================

CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    voter_type VARCHAR(20) NOT NULL, -- 'worker', 'company'
    voter_id UUID NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- 'helpful', 'not_helpful'
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(review_id, voter_type, voter_id)
);

-- Function to update helpful votes
CREATE OR REPLACE FUNCTION update_review_votes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reviews 
    SET 
        helpful_votes = (
            SELECT COUNT(*) FROM review_votes 
            WHERE review_id = NEW.review_id AND vote_type = 'helpful'
        ),
        total_votes = (
            SELECT COUNT(*) FROM review_votes 
            WHERE review_id = NEW.review_id
        )
    WHERE id = NEW.review_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_votes_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_votes();

COMMIT;