-- Create table to store pending WebAuthn challenges
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  challenge TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure a user only has one active challenge per type
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_challenges_user_type_idx
  ON webauthn_challenges(user_id, type);

-- Enable row level security even though the edge function uses the service role
ALTER TABLE webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own challenges if needed
CREATE POLICY "Users can view their challenges" ON webauthn_challenges
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to manage their own challenges
CREATE POLICY "Users can manage their challenges" ON webauthn_challenges
  FOR ALL USING (auth.uid() = user_id);
