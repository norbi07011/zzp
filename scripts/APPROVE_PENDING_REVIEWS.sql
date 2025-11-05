-- Zmień status opinii na "approved" aby triggery zadziałały
UPDATE reviews
SET status = 'approved'
WHERE status = 'pending';

-- Sprawdź wynik
SELECT id, status, rating, reviewee_id
FROM reviews;
