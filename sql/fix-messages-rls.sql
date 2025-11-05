-- =====================================================
-- FIX RLS POLICIES FOR MESSAGES TABLE
-- =====================================================
-- Allow authenticated users to send and read their messages

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can read their messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;

-- Enable RLS (if not already enabled)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can INSERT their own messages (as sender)
CREATE POLICY "Users can send messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Policy 2: Users can SELECT messages where they are sender or recipient
CREATE POLICY "Users can read their messages"
ON messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id
);

-- Policy 3: Users can UPDATE their own sent messages (mark as read, etc)
CREATE POLICY "Users can update their messages"
ON messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id)
WITH CHECK (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'messages';
