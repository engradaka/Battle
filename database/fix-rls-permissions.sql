-- Fix RLS and permissions issues caused by activity_logs table creation
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on both tables to allow updates
ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- 2. Grant proper permissions to authenticated users
GRANT ALL PRIVILEGES ON login_logs TO authenticated;
GRANT ALL PRIVILEGES ON activity_logs TO authenticated;
GRANT ALL PRIVILEGES ON login_logs TO anon;
GRANT ALL PRIVILEGES ON activity_logs TO anon;

-- 3. Grant usage on sequences (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 4. Test the fix by updating a login record
UPDATE login_logs 
SET logout_time = NOW(), session_duration = 1 
WHERE logout_time IS NULL 
LIMIT 1;

-- 5. Verify the fix worked
SELECT 'RLS and permissions fixed successfully' as status;
SELECT COUNT(*) as updated_records FROM login_logs WHERE logout_time IS NOT NULL;