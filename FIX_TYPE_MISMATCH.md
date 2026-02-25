# Fix: Type Mismatch Error

## What Happened

Supabase created a `categories` table with `bigint` ID (through the UI), but our script expects `uuid` ID. This causes a type mismatch error.

## Solution

The updated `COMPLETE_DATABASE_SETUP.sql` now:

1. **Drops all tables first** (if they exist)
2. **Recreates them with correct UUID types**
3. **Ensures all foreign keys match**

## What to Do Now

### Step 1: Run the Updated Script

1. Open Supabase SQL Editor
2. Copy the ENTIRE updated `COMPLETE_DATABASE_SETUP.sql` file
3. Paste into SQL Editor
4. Click "Run"

The script will:

- Drop any existing tables (safe, it's a fresh project)
- Create all tables with UUID types
- Set up indexes, RLS policies, storage
- Insert master admin
- Insert sample data

### Step 2: Verify Success

You should see:

```
Success. No rows returned
```

Then scroll down in the SQL Editor and you'll see the verification query results showing:

- 7 tables created
- 1 master admin
- 6 categories
- 10 questions

### Step 3: Continue with Setup

Once the script runs successfully, continue with `NEW_PROJECT_SETUP_GUIDE.md`:

- Get new Supabase credentials
- Update .env.local
- Create admin user in Authentication
- Test the app

## Why This Happened

When you create tables through Supabase UI (Table Editor), it defaults to `bigint` for ID columns. Our app uses `uuid` for better security and scalability.

The updated script ensures everything uses `uuid` consistently.

## Safe to Run

Don't worry about the `DROP TABLE` commands - this is a fresh project with no real data yet. The script will recreate everything correctly.

---

## Ready?

Run the updated `COMPLETE_DATABASE_SETUP.sql` script now and tell me the result! 🚀
