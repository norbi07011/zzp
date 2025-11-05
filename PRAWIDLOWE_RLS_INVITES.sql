-- ============================================
-- PRAWIDŁOWE RLS POLICIES dla project_invites
-- (użyj tego po testach)
-- ============================================

-- 1. Najpierw usuń stare policies (jeśli są)
DROP POLICY IF EXISTS "Users can view invites they sent" ON project_invites;
DROP POLICY IF EXISTS "Users can view invites sent to them" ON project_invites;
DROP POLICY IF EXISTS "Users can create invites" ON project_invites;
DROP POLICY IF EXISTS "Users can update their invites" ON project_invites;
DROP POLICY IF EXISTS "Invitees can update invites sent to them" ON project_invites;

-- 2. Włącz RLS
ALTER TABLE project_invites ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Użytkownik może widzieć zaproszenia które wysłał
CREATE POLICY "Users can view invites they sent"
ON project_invites
FOR SELECT
TO authenticated
USING (inviter_id = auth.uid());

-- 4. Policy: Użytkownik może widzieć zaproszenia wysłane do niego
CREATE POLICY "Users can view invites sent to them"
ON project_invites
FOR SELECT
TO authenticated
USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invitee_id = auth.uid()
);

-- 5. Policy: Użytkownik może tworzyć zaproszenia
CREATE POLICY "Users can create invites"
ON project_invites
FOR INSERT
TO authenticated
WITH CHECK (inviter_id = auth.uid());

-- 6. Policy: Użytkownik może aktualizować swoje zaproszenia
CREATE POLICY "Users can update their invites"
ON project_invites
FOR UPDATE
TO authenticated
USING (inviter_id = auth.uid())
WITH CHECK (inviter_id = auth.uid());

-- 7. Policy: Zaproszony może aktualizować status zaproszenia (accept/decline)
CREATE POLICY "Invitees can update invites sent to them"
ON project_invites
FOR UPDATE
TO authenticated
USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invitee_id = auth.uid()
)
WITH CHECK (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invitee_id = auth.uid()
);

-- 8. Sprawdź utworzone policies
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'project_invites'
    AND schemaname = 'public';
