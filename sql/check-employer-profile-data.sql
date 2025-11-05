-- =====================================================
-- CHECK EMPLOYER PROFILE DATA
-- =====================================================
-- See what data employer has in database

SELECT 
  e.id,
  e.company_name,
  e.logo_url,
  e.website,
  e.description,
  e.kvk_number,
  e.industry,
  e.location_city,
  e.phone,
  e.email,
  e.profile_completed,
  e.subscription_tier,
  e.subscription_status,
  p.full_name AS contact_person_name,
  p.avatar_url AS contact_person_avatar
FROM employers e
LEFT JOIN profiles p ON e.profile_id = p.id
ORDER BY e.created_at DESC;
