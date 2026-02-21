-- Fix login_logs table issues
-- Run this in Supabase SQL Editor

-- 1. Check if login_logs table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'login_logs';

-- 2. Disable RLS on login_logs table (if enabled)
ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;

-- 3. Grant full access to authenticated users
GRANT ALL ON login_logs TO authenticated;
GRANT ALL ON login_logs TO anon;

-- 4. Check for any constraints that might block updates
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'login_logs'::regclass;

-- 5. Test update manually (replace with actual ID from your data)
-- UPDATE login_logs 
-- SET logout_time = NOW(), session_duration = 5 
-- WHERE id = 'e8231fa2-fb76-4d33-8aeb-3c13efb2635c';

-- 6. Verify the update worked
SELECT admin_email, login_time, logout_time, session_duration 
FROM login_logs 
ORDER BY login_time DESC 
LIMIT 5;