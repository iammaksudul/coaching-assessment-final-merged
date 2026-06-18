-- Update users table to handle simplified authentication
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'CREDENTIALS';

-- Update existing users to have proper account type
UPDATE users 
SET account_type = 'CREDENTIALS' 
WHERE account_type IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
