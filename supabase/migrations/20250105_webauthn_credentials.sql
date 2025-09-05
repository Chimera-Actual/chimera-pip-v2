-- Create WebAuthn credentials table
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
CREATE INDEX idx_webauthn_credentials_credential_id ON webauthn_credentials(credential_id);

-- Enable RLS
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own credentials" 
  ON webauthn_credentials FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials" 
  ON webauthn_credentials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials" 
  ON webauthn_credentials FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials" 
  ON webauthn_credentials FOR UPDATE 
  USING (auth.uid() = user_id);