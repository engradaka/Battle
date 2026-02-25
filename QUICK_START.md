# Quick Start Guide

## You're seeing an error because environment variables are not set yet!

### Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 2: Update .env.local File

I've created a `.env.local` file for you. Open it and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_MASTER_ADMIN_EMAIL=your-email@example.com
```

### Step 3: Restart the Development Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Create Your Admin User in Supabase

1. Go to your Supabase dashboard
2. Click **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Enter the same email you put in `NEXT_PUBLIC_MASTER_ADMIN_EMAIL`
5. Set a password
6. Click **Create user**

### Step 5: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `COMPLETE_SUPABASE_SETUP.sql` from your project
3. Copy all the SQL and paste it into the SQL Editor
4. Click **Run**

### Step 6: Test Your App

1. Go to `http://localhost:3000`
2. Click the menu icon (top left)
3. Click Login
4. Use your admin credentials
5. You should see the dashboard!

## Common Issues

### "Cannot read properties of null (reading 'auth')"

- **Cause**: Environment variables not set
- **Fix**: Follow steps 1-3 above

### "Invalid API key"

- **Cause**: Wrong Supabase credentials
- **Fix**: Double-check you copied the correct URL and anon key

### "User not found" when logging in

- **Cause**: Admin user not created in Supabase
- **Fix**: Follow step 4 above

### Database errors

- **Cause**: Database tables not created
- **Fix**: Follow step 5 above

## Need Help?

Check these files:

- `SETUP.md` - Complete setup guide
- `DATABASE_SETUP.md` - Database setup details
- `BULK_IMPORT_TROUBLESHOOTING.md` - Bulk import help
- `SECURITY.md` - Security best practices

## Your Current Status

✅ Project builds successfully
✅ All code issues fixed
⚠️ Need to set environment variables (follow steps above)
⚠️ Need to create admin user in Supabase
⚠️ Need to set up database tables

Once you complete the steps above, everything will work perfectly!
