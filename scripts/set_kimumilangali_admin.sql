-- SQL script to grant admin role to user kimumilangali@gmail.com
-- This script updates the raw_user_meta_data field in the auth.users table.
-- The application reads the role from user.user_metadata.role, which Supabase derives from raw_user_meta_data.

UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'kimumilangali@gmail.com';

-- After running this script, the user kimumilangali@gmail.com should have admin privileges.
-- You can verify the update with the following query:
-- SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'kimumilangali@gmail.com';
