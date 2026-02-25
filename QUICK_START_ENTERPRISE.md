# Quick Start - Enterprise System Setup

## 🎯 Your Task Right Now

### Step 1: Open Supabase

1. Go to https://supabase.com/dashboard
2. Select your project: `uablgqkjivzbdqmiqbls`
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Create Tables

Copy this entire SQL block and paste it into the SQL Editor:

```sql
-- ADMIN SYSTEM TABLES
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('master_admin', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS admin_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject', 'import')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('category', 'question', 'admin_request', 'bulk_import', 'settings')),
  resource_id TEXT,
  resource_name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_requests_email ON admin_requests(email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_email ON activity_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read admins" ON admins FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert admins" ON admins FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update admins" ON admins FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read admin_requests" ON admin_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert admin_requests" ON admin_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update admin_requests" ON admin_requests FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read activity_logs" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert activity_logs" ON activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

Click "Run" button (or press Ctrl+Enter)

### Step 3: Insert Master Admin

Create a new query and run this:

```sql
INSERT INTO admins (email, full_name, role, status, created_at)
VALUES (
  'engradaka@gmail.com',
  'Master Admin',
  'master_admin',
  'active',
  NOW()
)
ON CONFLICT (email) DO NOTHING;
```

### Step 4: Verify Everything

Create a new query and run this:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('admins', 'admin_requests', 'activity_logs')
ORDER BY table_name;

-- Check master admin exists
SELECT * FROM admins WHERE role = 'master_admin';

-- Count records
SELECT
  (SELECT COUNT(*) FROM admins) as admin_count,
  (SELECT COUNT(*) FROM admin_requests) as request_count,
  (SELECT COUNT(*) FROM activity_logs) as log_count;
```

### Step 5: Report Back

Tell me:

- ✅ "Tables created successfully"
- ✅ "Master admin inserted"
- ✅ Share the output of the verification query

---

## 🎯 Expected Results

You should see:

```
table_name
--------------
activity_logs
admin_requests
admins

email                  | full_name    | role         | status
-----------------------|--------------|--------------|--------
engradaka@gmail.com    | Master Admin | master_admin | active

admin_count | request_count | log_count
------------|---------------|----------
1           | 0             | 0
```

---

## ❌ If You Get Errors

### Error: "relation already exists"

**Solution:** Tables already exist, skip to Step 3

### Error: "permission denied"

**Solution:** Make sure you're logged into the correct Supabase project

### Error: "syntax error"

**Solution:** Make sure you copied the entire SQL block, including all semicolons

---

## ✅ Once Complete

Reply with: "Phase 1 complete! Tables verified."

Then I'll immediately start implementing Phase 2 (code integration)!

---

## 📞 Need Help?

If you encounter any issues:

1. Take a screenshot of the error
2. Copy the error message
3. Tell me which step you're on
4. I'll help you fix it immediately

Let's do this! 🚀
