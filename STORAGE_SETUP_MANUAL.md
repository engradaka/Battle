# Storage Setup - Manual Configuration

## Why Manual Setup?

The `storage.objects` table is managed by Supabase and can't be modified via SQL. We need to configure storage policies through the Supabase Dashboard.

---

## Step 1: Run the Updated SQL Script

The script now creates the storage bucket without trying to modify RLS on storage.objects.

1. Copy the updated `COMPLETE_DATABASE_SETUP.sql`
2. Paste into Supabase SQL Editor
3. Run it

This should work now! ✅

---

## Step 2: Configure Storage Policies (After Script Runs)

### Option A: Allow All Uploads (Simple - Good for Development)

1. Go to Supabase Dashboard
2. Click "Storage" in the sidebar
3. Click on "images" bucket
4. Click "Policies" tab
5. Click "New Policy"
6. Choose "For full customization"
7. Policy name: `Allow public uploads`
8. Allowed operations: Check ALL (SELECT, INSERT, UPDATE, DELETE)
9. Target roles: `public`
10. USING expression: `true`
11. WITH CHECK expression: `true`
12. Click "Save"

### Option B: Allow Authenticated Uploads Only (More Secure)

1. Go to Supabase Dashboard
2. Click "Storage" in the sidebar
3. Click on "images" bucket
4. Click "Policies" tab
5. Click "New Policy"
6. Choose "For full customization"
7. Policy name: `Allow authenticated uploads`
8. Allowed operations: Check ALL (SELECT, INSERT, UPDATE, DELETE)
9. Target roles: `authenticated`
10. USING expression: `true`
11. WITH CHECK expression: `true`
12. Click "Save"

### Option C: Public Read, Authenticated Write (Recommended)

**Policy 1: Public Read**

1. New Policy → "For full customization"
2. Name: `Public read access`
3. Operations: SELECT only
4. Target roles: `public`
5. USING: `true`
6. Save

**Policy 2: Authenticated Write**

1. New Policy → "For full customization"
2. Name: `Authenticated write access`
3. Operations: INSERT, UPDATE, DELETE
4. Target roles: `authenticated`
5. USING: `true`
6. WITH CHECK: `true`
7. Save

---

## Step 3: Test Upload (Optional)

After setting up policies, test if uploads work:

1. Login to your app
2. Go to dashboard
3. Try to create a category with an image
4. If it works, storage is configured correctly! ✅

---

## Quick Fix: If You Don't Need Image Uploads Yet

If you're not using image uploads right now, you can skip the storage policies setup. The app will work fine without it. You can configure storage later when you need it.

---

## Current Status

Run the updated SQL script now. It will:

- ✅ Create all tables
- ✅ Create storage bucket
- ✅ Skip the problematic storage.objects RLS command

Then configure storage policies manually when you need image uploads.

---

## Ready?

1. Run the updated `COMPLETE_DATABASE_SETUP.sql` script
2. Tell me if it succeeds
3. We'll configure storage policies later if needed

Let's get past this error! 🚀
