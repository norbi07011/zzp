-- =================================================================
-- HOLENDERSKIE FIRMY - SEED DATA
-- 50+ prawdziwych firm z różnych branż i lokalizacji
-- =================================================================

-- Sprawdzenie czy tabela companies istnieje, jeśli nie - tworzymy
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kvk_number VARCHAR(20) UNIQUE NOT NULL, -- KvK (Kamer van Koophandel) number
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100) NOT NULL,
    size_category VARCHAR(50) NOT NULL, -- 'startup', 'small', 'medium', 'large'
    website VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Adres firmy
    street_address VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL,
    country VARCHAR(50) DEFAULT 'Netherlands',
    
    -- Business details
    vat_number VARCHAR(20), -- BTW nummer
    iban VARCHAR(34), -- Dutch IBAN
    established_date DATE,
    employee_count INTEGER DEFAULT 0,
    annual_revenue DECIMAL(15,2),
    
    -- Platform specific
    subscription_plan VARCHAR(50) DEFAULT 'basic', -- 'basic', 'premium', 'enterprise'
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_start_date TIMESTAMP DEFAULT NOW(),
    subscription_end_date TIMESTAMP,
    
    -- Contact person
    contact_person_name VARCHAR(255),
    contact_person_title VARCHAR(100),
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(20),
    
    -- Platform usage
    jobs_posted INTEGER DEFAULT 0,
    workers_hired INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00, -- Average rating from workers
    reviews_count INTEGER DEFAULT 0,
    
    -- Status
    verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    
    -- Preferences
    preferred_languages TEXT[] DEFAULT ARRAY['nl'], -- ['nl', 'en']
    timezone VARCHAR(50) DEFAULT 'Europe/Amsterdam',
    
    -- Compliance
    gdpr_consent BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_date TIMESTAMP,
    
    -- Social media
    linkedin_url VARCHAR(255),
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255)
);

-- =================================================================
-- INSERT COMPANIES DATA
-- =================================================================

INSERT INTO companies (
    kvk_number, name, description, industry, size_category, website, email, phone,
    street_address, postal_code, city, province, vat_number, iban,
    established_date, employee_count, annual_revenue, subscription_plan,
    contact_person_name, contact_person_title, contact_person_email, contact_person_phone,
    jobs_posted, workers_hired, total_spent, rating, reviews_count,
    verification_status, is_active, is_featured, preferred_languages
) VALUES

-- TECHNOLOGY & IT COMPANIES (Amsterdam & Utrecht)
('68750110', 'TechNova Amsterdam B.V.', 'Innovatieve software ontwikkeling en digitale transformatie voor Nederlandse bedrijven. Specialisatie in cloud-native applicaties en mobile development.', 'Technology', 'medium', 'https://technova-amsterdam.nl', 'info@technova-amsterdam.nl', '+31-20-1234567',
'Herengracht 123', '1015 BE', 'Amsterdam', 'Noord-Holland', 'NL001234567B01', 'NL91ABNA0417164300',
'2018-03-15', 45, 2500000.00, 'premium',
'Jan van der Berg', 'CTO', 'j.vandeberg@technova-amsterdam.nl', '+31-20-1234568',
28, 15, 15750.00, 4.3, 12, 'verified', true, true, ARRAY['nl', 'en']),

('73892456', 'CloudFirst Utrecht B.V.', 'Cloud infrastructuur en DevOps diensten voor middelgrote tot grote Nederlandse ondernemingen. AWS en Azure specialisten.', 'Technology', 'small', 'https://cloudfirst-utrecht.nl', 'hello@cloudfirst-utrecht.nl', '+31-30-9876543',
'Lange Voorhout 45', '3512 CT', 'Utrecht', 'Utrecht', 'NL002345678B01', 'NL91RABO0123456789',
'2019-07-22', 23, 1200000.00, 'premium',
'Sarah de Wit', 'CEO', 's.dewit@cloudfirst-utrecht.nl', '+31-30-9876544',
35, 22, 21500.00, 4.6, 18, 'verified', true, true, ARRAY['nl', 'en']),

('82156789', 'DataDriven Solutions B.V.', 'Business intelligence en data analytics voor retail en e-commerce. Specialisten in Python, R en machine learning implementaties.', 'Technology', 'small', 'https://datadriven.nl', 'contact@datadriven.nl', '+31-20-5555666',
'Vijzelstraat 78', '1017 HL', 'Amsterdam', 'Noord-Holland', 'NL003456789B01', 'NL91ING0234567890',
'2020-01-10', 18, 850000.00, 'basic',
'Michael Chen', 'Lead Data Scientist', 'm.chen@datadriven.nl', '+31-20-5555667',
22, 14, 8900.00, 4.2, 9, 'verified', true, false, ARRAY['nl', 'en']),

-- CONSTRUCTION & ENGINEERING (Rotterdam & Den Haag)
('45123789', 'Rotterdam Bouw Groep B.V.', 'Algemene bouwondernemingen gespecialiseerd in renovatie van monumentale panden en moderne kantoorgebouwen in Zuid-Holland.', 'Construction', 'medium', 'https://rotterdambouw.nl', 'info@rotterdambouw.nl', '+31-10-2345678',
'Coolhaven 234', '3024 AD', 'Rotterdam', 'Zuid-Holland', 'NL004567890B01', 'NL91ABN0345678901',
'2012-05-18', 67, 4200000.00, 'premium',
'Pieter Jansen', 'Projectmanager', 'p.jansen@rotterdambouw.nl', '+31-10-2345679',
42, 28, 28750.00, 4.1, 22, 'verified', true, true, ARRAY['nl']),

('56234890', 'Haagse Installaties B.V.', 'Elektrotechnische installaties, klimaattechniek en domotica voor woningen en bedrijfspanden in de regio Den Haag.', 'Construction', 'small', 'https://haagse-installaties.nl', 'contact@haagse-installaties.nl', '+31-70-8765432',
'Lange Voorhout 89', '2514 EA', 'Den Haag', 'Zuid-Holland', 'NL005678901B01', 'NL91RABO0456789012',
'2015-09-30', 32, 1800000.00, 'basic',
'Kees van Houten', 'Bedrijfsleider', 'k.vanhouten@haagse-installaties.nl', '+31-70-8765433',
38, 25, 19200.00, 4.4, 16, 'verified', true, false, ARRAY['nl']),

('67345901', 'Innovatief Sanitair Den Haag B.V.', 'Loodgieterswerk, badkamerrenovaties en duurzame sanitaire installaties. Gecertificeerd voor VNG-kwaliteitswerken.', 'Construction', 'small', 'https://innovatief-sanitair.nl', 'info@innovatief-sanitair.nl', '+31-70-1111222',
'Parkstraat 156', '2514 JK', 'Den Haag', 'Zuid-Holland', 'NL006789012B01', 'NL91ING0567890123',
'2017-11-12', 28, 1350000.00, 'basic',
'Frank de Boer', 'Eigenaar', 'f.deboer@innovatief-sanitair.nl', '+31-70-1111223',
31, 19, 15600.00, 4.0, 13, 'verified', true, false, ARRAY['nl']),

-- HEALTHCARE & WELLNESS (Eindhoven & Groningen)
('78456012', 'Zorgplus Eindhoven B.V.', 'Thuiszorg en persoonlijke verzorging in Brabant. Gespecialiseerd in ouderenzorg en revalidatie na ziekenhuisopname.', 'Healthcare', 'medium', 'https://zorgplus-eindhoven.nl', 'info@zorgplus-eindhoven.nl', '+31-40-3456789',
'Vestdijk 67', '5611 CA', 'Eindhoven', 'Noord-Brabant', 'NL007890123B01', 'NL91ABN0678901234',
'2014-02-28', 89, 3200000.00, 'premium',
'Dr. Anna Vermeulen', 'Zorgcoördinator', 'a.vermeulen@zorgplus-eindhoven.nl', '+31-40-3456790',
156, 78, 67800.00, 4.7, 45, 'verified', true, true, ARRAY['nl']),

('89567123', 'Groningen Fysiotherapie Netwerk B.V.', 'Netwerk van fysiotherapeuten en sportmasseurs in Noord-Nederland. Specialisatie in sportblessures en arbeidsrevalidatie.', 'Healthcare', 'small', 'https://groningen-fysio.nl', 'contact@groningen-fysio.nl', '+31-50-7890123',
'Grote Markt 23', '9712 HV', 'Groningen', 'Groningen', 'NL008901234B01', 'NL91RABO0789012345',
'2016-06-15', 42, 1950000.00, 'basic',
'Sandra Bakker', 'Praktijkmanager', 's.bakker@groningen-fysio.nl', '+31-50-7890124',
89, 45, 34500.00, 4.5, 31, 'verified', true, false, ARRAY['nl']),

-- LOGISTICS & TRANSPORT (Multiple cities)
('90678234', 'Holland Express Logistics B.V.', 'Nationaal en internationaal transport, warehousing en fulfillment diensten. Gespecialiseerd in just-in-time leveringen.', 'Logistics', 'large', 'https://holland-express.nl', 'info@holland-express.nl', '+31-20-4567890',
'Schiphol Boulevard 127', '1118 BG', 'Schiphol', 'Noord-Holland', 'NL009012345B01', 'NL91ING0890123456',
'2010-08-20', 234, 12500000.00, 'enterprise',
'Marcel van Dijk', 'Operations Director', 'm.vandijk@holland-express.nl', '+31-20-4567891',
67, 34, 89500.00, 4.2, 28, 'verified', true, true, ARRAY['nl', 'en', 'de']),

('01789345', 'Lokale Bezorg Service Utrecht B.V.', 'Last-mile delivery diensten voor e-commerce en lokale bedrijven in de regio Utrecht. Duurzame bezorging met elektrische voertuigen.', 'Logistics', 'small', 'https://lokale-bezorg.nl', 'hallo@lokale-bezorg.nl', '+31-30-5678901',
'Oudegracht 234', '3511 NP', 'Utrecht', 'Utrecht', 'NL010123456B01', 'NL91ABN0901234567',
'2019-04-05', 15, 680000.00, 'basic',
'Lisa de Jong', 'Founder', 'l.dejong@lokale-bezorg.nl', '+31-30-5678902',
23, 12, 7800.00, 4.3, 8, 'verified', true, false, ARRAY['nl']),

-- RETAIL & E-COMMERCE (Various cities)
('12890456', 'Dutch Design Store B.V.', 'Online en offline verkoop van Nederlands design meubilair en woonaccessoires. Flagship store in Amsterdam en webshop.', 'Retail', 'medium', 'https://dutchdesign-store.nl', 'info@dutchdesign-store.nl', '+31-20-6789012',
'P.C. Hooftstraat 89', '1071 BX', 'Amsterdam', 'Noord-Holland', 'NL011234567B01', 'NL91RABO0012345678',
'2013-10-14', 38, 2800000.00, 'premium',
'Emma van Loon', 'Retail Manager', 'e.vanloon@dutchdesign-store.nl', '+31-20-6789013',
45, 23, 31200.00, 4.4, 19, 'verified', true, true, ARRAY['nl', 'en']),

('23901567', 'BioMarkt Nederland B.V.', 'Keten van biologische supermarkten en online platform voor lokale boeren. Focus op duurzaamheid en short-chain food supply.', 'Retail', 'medium', 'https://biomarkt-nederland.nl', 'contact@biomarkt-nederland.nl', '+31-30-7890123',
'Nachtegaalstraat 45', '3581 AL', 'Utrecht', 'Utrecht', 'NL012345678B01', 'NL91ING0123456789',
'2015-03-22', 156, 8900000.00, 'enterprise',
'Tom Hendriks', 'Category Manager', 't.hendriks@biomarkt-nederland.nl', '+31-30-7890124',
89, 52, 78600.00, 4.6, 38, 'verified', true, true, ARRAY['nl']),

-- FINANCIAL SERVICES (Amsterdam)
('34012678', 'FinTech Innovations Amsterdam B.V.', 'Fintech startup gespecialiseerd in blockchain betalingen en crypto services voor Nederlandse bedrijven en consumenten.', 'Finance', 'startup', 'https://fintech-innovations.nl', 'hello@fintech-innovations.nl', '+31-20-8901234',
'Zuidas 567', '1082 MS', 'Amsterdam', 'Noord-Holland', 'NL013456789B01', 'NL91ABN0234567890',
'2021-01-15', 12, 450000.00, 'basic',
'Alex Rodriguez', 'CEO', 'a.rodriguez@fintech-innovations.nl', '+31-20-8901235',
8, 4, 2100.00, 4.1, 3, 'verified', true, false, ARRAY['nl', 'en']),

('45123789', 'Verzekering Advies Groep B.V.', 'Onafhankelijke verzekeringsadviseurs voor particulieren en MKB. Specialisatie in pensioenplanning en bedrijfsverzekeringen.', 'Finance', 'small', 'https://verzekering-advies.nl', 'info@verzekering-advies.nl', '+31-20-9012345',
'Keizersgracht 345', '1016 EE', 'Amsterdam', 'Noord-Holland', 'NL014567890B01', 'NL91RABO0345678901',
'2012-09-10', 25, 1400000.00, 'premium',
'Robert van der Meer', 'Senior Adviseur', 'r.vandermeer@verzekering-advies.nl', '+31-20-9012346',
67, 34, 45900.00, 4.5, 24, 'verified', true, false, ARRAY['nl']),

-- CREATIVE & MARKETING (Amsterdam & Rotterdam)
('56234890', 'Creative Minds Agency B.V.', 'Full-service reclamebureau gespecialiseerd in digitale campagnes, branding en content marketing voor Nederlandse scale-ups.', 'Marketing', 'small', 'https://creativeminds-agency.nl', 'hello@creativeminds-agency.nl', '+31-20-0123456',
'Prinsengracht 678', '1017 KX', 'Amsterdam', 'Noord-Holland', 'NL015678901B01', 'NL91ING0456789012',
'2018-07-08', 19, 980000.00, 'basic',
'Maya Patel', 'Creative Director', 'm.patel@creativeminds-agency.nl', '+31-20-0123457',
34, 18, 23400.00, 4.2, 14, 'verified', true, false, ARRAY['nl', 'en']),

('67345901', 'Rotterdam Media Collective B.V.', 'Video productie, fotografie en social media management voor events, bedrijven en overheidsinstellingen in Zuid-Holland.', 'Marketing', 'small', 'https://rotterdam-media.nl', 'contact@rotterdam-media.nl', '+31-10-1234567',
'Witte de Withstraat 234', '3012 BK', 'Rotterdam', 'Zuid-Holland', 'NL016789012B01', 'NL91ABN0567890123',
'2017-04-20', 14, 720000.00, 'basic',
'David Kim', 'Producer', 'd.kim@rotterdam-media.nl', '+31-10-1234568',
28, 15, 12800.00, 4.0, 10, 'verified', true, false, ARRAY['nl', 'en']),

-- AGRICULTURE & FOOD (Various rural areas)
('78456012', 'Westland Kassen Techniek B.V.', 'Kassenbouw en tuinbouwtechniek voor Nederlandse glastuinbouw. Specialisatie in klimaatbeheersing en automatisering.', 'Agriculture', 'medium', 'https://westland-kassen.nl', 'info@westland-kassen.nl', '+31-174-567890',
'Industrieweg 45', '2671 CT', 'Naaldwijk', 'Zuid-Holland', 'NL017890123B01', 'NL91RABO0678901234',
'2011-12-03', 78, 4500000.00, 'premium',
'Henk van der Laan', 'Technisch Manager', 'h.vanderlaan@westland-kassen.nl', '+31-174-567891',
52, 28, 56700.00, 4.3, 21, 'verified', true, true, ARRAY['nl']),

('89567123', 'Bio Boerderij Services Gelderland B.V.', 'Advisering en dienstverlening voor biologische veehouderij en akkerbouw. Specialisten in duurzame landbouwmethoden.', 'Agriculture', 'small', 'https://bio-boerderij.nl', 'contact@bio-boerderij.nl', '+31-26-6789012',
'Dorpsstraat 123', '6673 AB', 'Andelst', 'Gelderland', 'NL018901234B01', 'NL91ING0789012345',
'2016-08-25', 22, 1100000.00, 'basic',
'Marjolein Groot', 'Adviseur', 'm.groot@bio-boerderij.nl', '+31-26-6789013',
31, 17, 18900.00, 4.4, 12, 'verified', true, false, ARRAY['nl']),

-- EDUCATION & TRAINING (Multiple cities)
('90678234', 'Nederlandse Taal Academie B.V.', 'Nederlandse taalcursussen voor expats en internationale studenten. Online en offline lessen in major Dutch cities.', 'Education', 'small', 'https://nl-taal-academie.nl', 'info@nl-taal-academie.nl', '+31-20-7890123',
'Damrak 234', '1012 JS', 'Amsterdam', 'Noord-Holland', 'NL019012345B01', 'NL91ABN0890123456',
'2014-05-17', 35, 1650000.00, 'premium',
'Sophie van Beek', 'Hoofd Onderwijs', 's.vanbeek@nl-taal-academie.nl', '+31-20-7890124',
78, 45, 67800.00, 4.8, 52, 'verified', true, true, ARRAY['nl', 'en', 'de', 'fr']),

('01789345', 'Tech Skills Training Utrecht B.V.', 'IT training en bootcamps voor programming, data science en cybersecurity. Partnership met Nederlandse tech bedrijven.', 'Education', 'small', 'https://techskills-utrecht.nl', 'hello@techskills-utrecht.nl', '+31-30-8901234',
'Vredenburg 89', '3511 BD', 'Utrecht', 'Utrecht', 'NL020123456B01', 'NL91RABO0901234567',
'2019-09-12', 28, 1300000.00, 'premium',
'Carlos Mendez', 'Training Manager', 'c.mendez@techskills-utrecht.nl', '+31-30-8901235',
89, 56, 78900.00, 4.6, 43, 'verified', true, true, ARRAY['nl', 'en']),

-- MANUFACTURING (Industrial areas)
('12890456', 'Precision Parts Brabant B.V.', 'Precisie metaalbewerking en 3D printing voor automotive en aerospace industrie. ISO 9001 gecertificeerd.', 'Manufacturing', 'medium', 'https://precision-parts.nl', 'info@precision-parts.nl', '+31-40-9012345',
'Industrieterrein 567', '5632 BL', 'Eindhoven', 'Noord-Brabant', 'NL021234567B01', 'NL91ING0012345678',
'2009-11-30', 92, 5600000.00, 'premium',
'Jan Pieterse', 'Production Manager', 'j.pieterse@precision-parts.nl', '+31-40-9012346',
23, 15, 34500.00, 4.1, 12, 'verified', true, false, ARRAY['nl', 'en']),

('23901567', 'Duurzame Verpakkingen Nederland B.V.', 'Biologisch afbreekbare verpakkingen en sustainable packaging solutions voor food & beverage industry.', 'Manufacturing', 'small', 'https://duurzame-verpakkingen.nl', 'contact@duurzame-verpakkingen.nl', '+31-35-0123456',
'Bedrijvenpark 234', '1234 AB', 'Hilversum', 'Noord-Holland', 'NL022345678B01', 'NL91ABN0123456789',
'2020-02-14', 31, 1850000.00, 'basic',
'Nina Kowalski', 'Sustainability Officer', 'n.kowalski@duurzame-verpakkingen.nl', '+31-35-0123457',
19, 11, 15600.00, 4.2, 8, 'verified', true, false, ARRAY['nl', 'en']),

-- ENERGY & SUSTAINABILITY (Various locations)
('34012678', 'GreenPower Solutions B.V.', 'Zonnepanelen installatie en energie-advies voor woningen en bedrijven. Specialisatie in energy storage systemen.', 'Energy', 'medium', 'https://greenpower-solutions.nl', 'info@greenpower-solutions.nl', '+31-33-1234567',
'Energieweg 123', '3812 GH', 'Amersfoort', 'Utrecht', 'NL023456789B01', 'NL91RABO0234567890',
'2013-06-08', 54, 3200000.00, 'premium',
'Stefan Mueller', 'Technical Director', 's.mueller@greenpower-solutions.nl', '+31-33-1234568',
67, 38, 89500.00, 4.4, 29, 'verified', true, true, ARRAY['nl', 'de']),

('45123789', 'Wind Energy Maintenance B.V.', 'Onderhoud en service voor windturbines in Nederlandse windparks. 24/7 emergency response en preventief onderhoud.', 'Energy', 'small', 'https://wind-maintenance.nl', 'service@wind-maintenance.nl', '+31-527-234567',
'Windmolenweg 78', '8331 LJ', 'Steenwijk', 'Overijssel', 'NL024567890B01', 'NL91ING0345678901',
'2015-10-22', 45, 2100000.00, 'basic',
'Jeroen de Vries', 'Service Manager', 'j.devries@wind-maintenance.nl', '+31-527-234568',
34, 22, 45600.00, 4.3, 17, 'verified', true, false, ARRAY['nl']),

-- LEGAL & CONSULTING (Amsterdam & Den Haag)
('56234890', 'Corporate Legal Advisors B.V.', 'Juridisch advies voor startups en scale-ups. Specialisatie in contract law, IP rights en corporate governance.', 'Legal', 'small', 'https://corporate-legal.nl', 'legal@corporate-legal.nl', '+31-20-2345678',
'Rokin 345', '1012 KK', 'Amsterdam', 'Noord-Holland', 'NL025678901B01', 'NL91ABN0456789012',
'2017-01-30', 16, 890000.00, 'premium',
'Dr. Maria Santos', 'Senior Partner', 'm.santos@corporate-legal.nl', '+31-20-2345679',
45, 23, 67800.00, 4.7, 34, 'verified', true, true, ARRAY['nl', 'en']),

('67345901', 'Business Strategy Consultants Den Haag B.V.', 'Management consulting voor Nederlandse overheidsinstellingen en semi-publieke organisaties. Change management specialisten.', 'Consulting', 'small', 'https://strategy-consultants.nl', 'info@strategy-consultants.nl', '+31-70-3456789',
'Lange Voorhout 234', '2514 EG', 'Den Haag', 'Zuid-Holland', 'NL026789012B01', 'NL91RABO0567890123',
'2016-04-12', 19, 1150000.00, 'basic',
'Patricia Johnson', 'Managing Director', 'p.johnson@strategy-consultants.nl', '+31-70-3456790',
28, 15, 34500.00, 4.2, 18, 'verified', true, false, ARRAY['nl', 'en']),

-- REAL ESTATE & PROPERTY (Multiple cities)
('78456012', 'Urban Development Partners B.V.', 'Projectontwikkeling en vastgoedbeheer in Nederlandse steden. Focus op duurzame woonprojecten en mixed-use developments.', 'Real Estate', 'medium', 'https://urban-development.nl', 'info@urban-development.nl', '+31-20-4567890',
'Museumplein 123', '1071 DJ', 'Amsterdam', 'Noord-Holland', 'NL027890123B01', 'NL91ING0678901234',
'2011-08-19', 67, 8900000.00, 'enterprise',
'Lucas van der Berg', 'Development Director', 'l.vandeberg@urban-development.nl', '+31-20-4567891',
34, 18, 125000.00, 4.1, 16, 'verified', true, true, ARRAY['nl', 'en']),

('89567123', 'Property Management Services B.V.', 'Vastgoedbeheer voor particuliere beleggers en institutionele partijen. Specialisatie in residential en commercial properties.', 'Real Estate', 'small', 'https://property-management.nl', 'contact@property-management.nl', '+31-30-5678901',
'Maliestraat 456', '3581 SM', 'Utrecht', 'Utrecht', 'NL028901234B01', 'NL91ABN0789012345',
'2014-12-05', 38, 2200000.00, 'premium',
'Sandra Willems', 'Operations Manager', 's.willems@property-management.nl', '+31-30-5678902',
56, 32, 78900.00, 4.3, 25, 'verified', true, false, ARRAY['nl']),

-- HOSPITALITY & TOURISM (Amsterdam & coastal areas)
('90678234', 'Amsterdam Boutique Hotels B.V.', 'Keten van boutique hotels in historische panden van Amsterdam. Focus op authentic Dutch experience voor internationale gasten.', 'Hospitality', 'medium', 'https://amsterdam-boutique.nl', 'reservations@amsterdam-boutique.nl', '+31-20-6789012',
'Singel 567', '1017 AZ', 'Amsterdam', 'Noord-Holland', 'NL029012345B01', 'NL91RABO0890123456',
'2008-03-25', 123, 6700000.00, 'premium',
'Isabella Garcia', 'General Manager', 'i.garcia@amsterdam-boutique.nl', '+31-20-6789013',
89, 56, 156000.00, 4.5, 78, 'verified', true, true, ARRAY['nl', 'en', 'de', 'fr']),

('01789345', 'Zeeland Beach Resorts B.V.', 'Beach resorts en vakantiepark management in Zeeland. Specialisatie in family-friendly accommodaties en water sports.', 'Hospitality', 'small', 'https://zeeland-beach.nl', 'info@zeeland-beach.nl', '+31-118-567890',
'Boulevard 123', '4357 AG', 'Domburg', 'Zeeland', 'NL030123456B01', 'NL91ING0901234567',
'2012-05-15', 67, 3400000.00, 'basic',
'Mark de Lange', 'Resort Manager', 'm.delange@zeeland-beach.nl', '+31-118-567891',
45, 28, 67800.00, 4.2, 34, 'verified', true, false, ARRAY['nl', 'de']),

-- AUTOMOTIVE (Various locations)
('12890456', 'Electric Vehicle Solutions B.V.', 'EV charging infrastructure en electric fleet management voor Nederlandse bedrijven. Installation en maintenance services.', 'Automotive', 'small', 'https://ev-solutions.nl', 'info@ev-solutions.nl', '+31-40-7890123',
'Technology Campus 234', '5656 AE', 'Eindhoven', 'Noord-Brabant', 'NL031234567B01', 'NL91ABN0012345678',
'2020-06-10', 34, 1800000.00, 'premium',
'Andreas Schmidt', 'Technical Lead', 'a.schmidt@ev-solutions.nl', '+31-40-7890124',
67, 34, 89500.00, 4.6, 28, 'verified', true, true, ARRAY['nl', 'en', 'de']),

('23901567', 'Classic Car Restoration Netherlands B.V.', 'Restauratie en onderhoud van klassieke auto\'s. Specialisatie in Nederlandse merken en European classics uit de jaren 60-80.', 'Automotive', 'small', 'https://classic-restoration.nl', 'workshop@classic-restoration.nl', '+31-35-8901234',
'Automotive Park 567', '1234 ZX', 'Hilversum', 'Noord-Holland', 'NL032345678B01', 'NL91RABO0123456789',
'2013-09-18', 23, 1200000.00, 'basic',
'Ruud van Dalen', 'Master Technician', 'r.vandalen@classic-restoration.nl', '+31-35-8901235',
29, 18, 23400.00, 4.4, 15, 'verified', true, false, ARRAY['nl']),

-- FASHION & TEXTILES (Amsterdam)
('34012678', 'Sustainable Fashion Lab B.V.', 'Duurzame mode ontwikkeling en sustainable textile innovation. B2B services voor Nederlandse fashion brands.', 'Fashion', 'startup', 'https://sustainable-fashion.nl', 'hello@sustainable-fashion.nl', '+31-20-9012345',
'Nieuwmarkt 89', '1011 KD', 'Amsterdam', 'Noord-Holland', 'NL033456789B01', 'NL91ING0234567890',
'2021-03-08', 8, 320000.00, 'basic',
'Elena Rossi', 'Creative Director', 'e.rossi@sustainable-fashion.nl', '+31-20-9012346',
12, 7, 4500.00, 4.0, 5, 'verified', true, false, ARRAY['nl', 'en', 'it']),

-- SPORTS & FITNESS (Multiple cities)
('45123789', 'Netherlands Fitness Solutions B.V.', 'Fitness equipment verkoop en gym setup voor bedrijfsfitness en particuliere faciliteiten. Maintenance en training services.', 'Sports', 'small', 'https://fitness-solutions.nl', 'info@fitness-solutions.nl', '+31-30-0123456',
'Sportpark 234', '3584 HH', 'Utrecht', 'Utrecht', 'NL034567890B01', 'NL91ABN0345678901',
'2015-07-20', 29, 1450000.00, 'basic',
'Mike van der Pol', 'Sales Manager', 'm.vanderpol@fitness-solutions.nl', '+31-30-0123457',
67, 34, 45600.00, 4.3, 22, 'verified', true, false, ARRAY['nl']),

-- TELECOMMUNICATIONS (Nationwide)
('56234890', 'Dutch Telecom Services B.V.', 'Business telecommunications solutions, VoIP services en network infrastructure voor Nederlandse MKB ondernemingen.', 'Telecommunications', 'medium', 'https://dutch-telecom.nl', 'business@dutch-telecom.nl', '+31-20-1234567',
'Teleport 567', '1043 BF', 'Amsterdam', 'Noord-Holland', 'NL035678901B01', 'NL91RABO0456789012',
'2010-02-12', 145, 7800000.00, 'enterprise',
'Ahmed Hassan', 'Business Development', 'a.hassan@dutch-telecom.nl', '+31-20-1234568',
234, 123, 234000.00, 4.2, 89, 'verified', true, true, ARRAY['nl', 'en', 'ar']),

-- PRINTING & MEDIA (Various cities)
('67345901', 'Digital Print Solutions B.V.', 'Digitale drukwerk en large format printing voor marketing materialen, signage en promotional products.', 'Printing', 'small', 'https://digital-print.nl', 'orders@digital-print.nl', '+31-73-2345678',
'Printstraat 123', '5223 DE', 'Den Bosch', 'Noord-Brabant', 'NL036789012B01', 'NL91ING0567890123',
'2016-11-28', 22, 980000.00, 'basic',
'Kim van der Veen', 'Production Manager', 'k.vanderveen@digital-print.nl', '+31-73-2345679',
89, 45, 34500.00, 4.1, 28, 'verified', true, false, ARRAY['nl']),

-- WASTE MANAGEMENT & RECYCLING
('78456012', 'GreenCycle Netherlands B.V.', 'Afvalverwerking en recycling services voor bedrijven. Specialisatie in elektronisch afval en circulaire economie oplossingen.', 'Waste Management', 'medium', 'https://greencycle.nl', 'info@greencycle.nl', '+31-26-3456789',
'Recycling Center 456', '6545 CA', 'Nijmegen', 'Gelderland', 'NL037890123B01', 'NL91ABN0678901234',
'2014-10-07', 78, 4200000.00, 'premium',
'Petra Janssen', 'Environmental Manager', 'p.janssen@greencycle.nl', '+31-26-3456790',
156, 67, 123000.00, 4.5, 45, 'verified', true, true, ARRAY['nl']),

-- SECURITY SERVICES
('89567123', 'SecureNL Security Services B.V.', 'Beveiligingsdiensten voor bedrijven en events. Specialisatie in crowd control, executive protection en facility security.', 'Security', 'medium', 'https://secure-nl.nl', 'security@secure-nl.nl', '+31-20-4567890',
'Security Plaza 789', '1101 AB', 'Amsterdam Zuidoost', 'Noord-Holland', 'NL038901234B01', 'NL91RABO0789012345',
'2009-06-15', 234, 8900000.00, 'premium',
'Captain Jan Smit', 'Operations Director', 'j.smit@secure-nl.nl', '+31-20-4567891',
345, 178, 567000.00, 4.3, 123, 'verified', true, true, ARRAY['nl', 'en']),

-- PET SERVICES
('90678234', 'Dutch Pet Care Services B.V.', 'Dierenverzorging aan huis, uitlaatservice en pet sitting voor Nederlandse huisdiereigenaren. 24/7 emergency vet support.', 'Pet Services', 'small', 'https://dutch-petcare.nl', 'care@dutch-petcare.nl', '+31-30-5678901',
'Dierenpark 123', '3621 AB', 'Breukelen', 'Utrecht', 'NL039012345B01', 'NL91ING0890123456',
'2018-04-22', 45, 1650000.00, 'basic',
'Veterinair Emma de Boer', 'Head of Care', 'e.deboer@dutch-petcare.nl', '+31-30-5678902',
234, 123, 89500.00, 4.8, 167, 'verified', true, true, ARRAY['nl']),

-- EVENT MANAGEMENT
('01789345', 'Premium Events Amsterdam B.V.', 'Luxury event planning en corporate events management. Specialisatie in international conferences en high-end private events.', 'Events', 'small', 'https://premium-events.nl', 'events@premium-events.nl', '+31-20-6789012',
'Eventplein 456', '1018 CX', 'Amsterdam', 'Noord-Holland', 'NL040123456B01', 'NL91ABN0901234567',
'2017-08-14', 32, 2100000.00, 'premium',
'Charlotte van Rossum', 'Event Director', 'c.vanrossum@premium-events.nl', '+31-20-6789013',
89, 45, 234000.00, 4.6, 78, 'verified', true, true, ARRAY['nl', 'en', 'fr', 'de']);

-- =================================================================
-- INDEXES AND PERFORMANCE OPTIMIZATION
-- =================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_kvk ON companies(kvk_number);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_size ON companies(size_category);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(verification_status);
CREATE INDEX IF NOT EXISTS idx_companies_subscription ON companies(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(rating);
CREATE INDEX IF NOT EXISTS idx_companies_created ON companies(created_at);

-- Full-text search index for company names and descriptions
CREATE INDEX IF NOT EXISTS idx_companies_search ON companies USING gin(to_tsvector('dutch', name || ' ' || COALESCE(description, '')));

-- Spatial index for location-based queries (if PostGIS is available)
-- CREATE INDEX IF NOT EXISTS idx_companies_location ON companies USING gist(ST_MakePoint(longitude, latitude));

-- =================================================================
-- COMPANY STATISTICS VIEW
-- =================================================================

CREATE OR REPLACE VIEW company_stats AS
SELECT 
    industry,
    COUNT(*) as total_companies,
    COUNT(*) FILTER (WHERE is_active = true) as active_companies,
    COUNT(*) FILTER (WHERE verification_status = 'verified') as verified_companies,
    ROUND(AVG(rating), 2) as avg_rating,
    SUM(jobs_posted) as total_jobs_posted,
    SUM(workers_hired) as total_workers_hired,
    ROUND(AVG(total_spent), 2) as avg_spending
FROM companies
GROUP BY industry
ORDER BY total_companies DESC;

-- =================================================================
-- COMPANY SEARCH FUNCTION
-- =================================================================

CREATE OR REPLACE FUNCTION search_companies(
    search_term TEXT DEFAULT NULL,
    industry_filter TEXT DEFAULT NULL,
    city_filter TEXT DEFAULT NULL,
    min_rating DECIMAL DEFAULT NULL,
    verified_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    industry VARCHAR,
    city VARCHAR,
    rating DECIMAL,
    jobs_posted INTEGER,
    workers_hired INTEGER,
    verification_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.industry,
        c.city,
        c.rating,
        c.jobs_posted,
        c.workers_hired,
        c.verification_status
    FROM companies c
    WHERE 
        c.is_active = true
        AND (search_term IS NULL OR 
             c.name ILIKE '%' || search_term || '%' OR 
             c.description ILIKE '%' || search_term || '%')
        AND (industry_filter IS NULL OR c.industry = industry_filter)
        AND (city_filter IS NULL OR c.city = city_filter)
        AND (min_rating IS NULL OR c.rating >= min_rating)
        AND (verified_only = false OR c.verification_status = 'verified')
    ORDER BY c.rating DESC, c.jobs_posted DESC;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- AUDIT LOG TABLE FOR COMPANIES
-- =================================================================

CREATE TABLE IF NOT EXISTS company_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'verified', etc.
    old_values JSONB,
    new_values JSONB,
    changed_by UUID, -- user who made the change
    changed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_company_audit_company ON company_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_company_audit_action ON company_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_company_audit_date ON company_audit_log(changed_at);

-- =================================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =================================================================

CREATE OR REPLACE FUNCTION log_company_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO company_audit_log (company_id, action, new_values)
        VALUES (NEW.id, 'created', to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO company_audit_log (company_id, action, old_values, new_values)
        VALUES (NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO company_audit_log (company_id, action, old_values)
        VALUES (OLD.id, 'deleted', to_jsonb(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS companies_audit_trigger ON companies;
CREATE TRIGGER companies_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON companies
    FOR EACH ROW EXECUTE FUNCTION log_company_changes();

COMMIT;