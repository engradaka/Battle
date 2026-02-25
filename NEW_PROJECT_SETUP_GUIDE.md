# New Supabase Project Setup Guide

## 🎯 Complete Setup for Fresh Supabase Project

---

## Step 1: Run the Complete Database Script

### 1.1 Open Your New Supabase Project

1. Go to https://supabase.com/dashboard
2. Select your NEW project (not the old one)
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### 1.2 Copy and Run the Script

1. Open the file: `COMPLETE_DATABASE_SETUP.sql`
2. Copy the ENTIRE file (all ~400 lines)
3. Paste into Supabase SQL Editor
4. Click "Run" (or press Ctrl+Enter)

**Wait for it to complete** - should take 5-10 seconds

### 1.3 Check for Errors

- If you see "Success. No rows returned" - PERFECT! ✅
- If you see any red errors - copy them and send to me

---

## Step 2: Verify Database Setup

### 2.1 Run Verification Queries

The script includes verification queries at the end. You should see results like:

```
status              | table_count
--------------------|------------
Tables Created      | 7

status              | email                | role         | admin_status
--------------------|----------------------|--------------|-------------
Master Admin        | engradaka@gmail.com  | master_admin | active

status              | categories | questions | admins
--------------------|------------|-----------|--------
Sample Data         | 6          | 10        | 1

status              | index_count
--------------------|------------
Indexes Created     | 15+

status              | policy_count
--------------------|-------------
RLS Policies        | 15+

status              | name   | public
--------------------|--------|-------
Storage Bucket      | images | true
```

### 2.2 Manual Verification (Optional)

Go to Supabase → Table Editor and check you see these tables:

- ✅ categories
- ✅ diamond_questions
- ✅ used_questions
- ✅ admins
- ✅ admin_requests
- ✅ activity_logs
- ✅ login_logs

---

## Step 3: Get New Supabase Credentials

### 3.1 Get Project URL

1. In Supabase Dashboard, click "Settings" (gear icon)
2. Click "API"
3. Copy "Project URL" (looks like: https://xxxxx.supabase.co)

### 3.2 Get Anon Key

1. Same page (Settings → API)
2. Under "Project API keys"
3. Copy "anon" / "public" key (long string starting with "eyJ...")

---

## Step 4: Update Your .env.local File

### 4.1 Open .env.local in Your Project

Replace the old values with new ones:

```env
NEXT_PUBLIC_MASTER_ADMIN_EMAIL=engradaka@gmail.com

# NEW SUPABASE PROJECT CREDENTIALS
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-NEW-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-NEW-KEY-HERE
```

**IMPORTANT:** Replace both values with your NEW project credentials!

---

## Step 5: Create Admin User in Supabase Authentication

### 5.1 Go to Authentication

1. In Supabase Dashboard, click "Authentication" in sidebar
2. Click "Users" tab
3. Click "Add user" button

### 5.2 Create Your Admin User

- Email: `engradaka@gmail.com` (must match .env.local)
- Password: Choose a strong password (you'll use this to login)
- Email Confirm: Toggle OFF (or confirm manually)
- Click "Create user"

### 5.3 Verify User Created

You should see your user in the list with:

- Email: engradaka@gmail.com
- Status: Confirmed (green checkmark)

---

## Step 6: Test Your App

### 6.1 Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 6.2 Test Public Game Flow (No Login)

1. Go to http://localhost:3000
2. Click "Start"
3. Enter team names
4. Select categories
5. Play a few questions
6. Verify questions load and scoring works

### 6.3 Test Admin Login

1. Go to http://localhost:3000/login
2. Login with:
   - Email: engradaka@gmail.com
   - Password: (the one you set in Step 5)
3. Should redirect to /master-dashboard
4. Verify you can see the dashboard

### 6.4 Test Admin Features

1. Click "Categories" - should see 6 sample categories
2. Click "Questions" - should see 10 sample questions
3. Try creating a new category
4. Try creating a new question
5. Go to "Activity Logs" - should see your actions logged
6. Go to "Admin Management" - should see empty (no requests yet)

---

## Step 7: Report Back

Once you've completed all steps, tell me:

✅ "Database setup complete!"
✅ "App is running on new Supabase project"
✅ "Login works"
✅ "Can see sample data"

Then I'll proceed with Phase 2 (code integration)!

---

## 🚨 Troubleshooting

### Error: "relation does not exist"

**Cause:** Script didn't run completely
**Fix:** Run the script again

### Error: "permission denied for schema public"

**Cause:** Wrong Supabase project or permissions issue
**Fix:** Make sure you're in the NEW project, not the old one

### Error: "duplicate key value violates unique constraint"

**Cause:** Script ran twice
**Fix:** This is OK! It means data already exists

### Login doesn't work

**Cause:** User not created in Authentication OR wrong credentials in .env.local
**Fix:**

1. Check user exists in Authentication → Users
2. Check .env.local has correct URL and key
3. Restart dev server

### Can't see sample data

**Cause:** Sample data insert failed OR RLS policies blocking
**Fix:**

1. Check tables have data: `SELECT COUNT(*) FROM categories;`
2. Check RLS policies are created
3. Make sure you're logged in

### "Failed to fetch" errors

**Cause:** Wrong Supabase URL or key in .env.local
**Fix:**

1. Double-check URL and key from Supabase Settings → API
2. Make sure you copied the ANON key, not the SERVICE key
3. Restart dev server after changing .env.local

---

## 📞 Need Help?

If you encounter any issues:

1. Take a screenshot of the error
2. Copy the error message
3. Tell me which step you're on
4. Send me the verification query results

I'll help you fix it immediately!

---

## ✅ Success Checklist

Before moving to Phase 2, verify:

- [ ] SQL script ran without errors
- [ ] All 7 tables exist in Supabase
- [ ] Master admin record exists in admins table
- [ ] Sample categories and questions exist
- [ ] Storage bucket "images" exists
- [ ] .env.local updated with new credentials
- [ ] Admin user created in Supabase Authentication
- [ ] App runs without errors
- [ ] Can login to admin dashboard
- [ ] Can see sample data
- [ ] Activity logs page loads

Once all checked, you're ready for Phase 2! 🚀
