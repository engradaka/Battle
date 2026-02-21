# 🚨 DATABASE RECOVERY GUIDE

## IMMEDIATE RECOVERY STEPS

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `uablgqkjivzbdqmiqbls`

### Step 2: Run Emergency Restore Script
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `database/emergency-restore.sql`
3. Paste it in the SQL Editor
4. Click **Run** to execute the script

### Step 3: Verify Restoration
After running the script, you should see:
- ✅ 6 categories created
- ✅ 25+ sample questions added
- ✅ Master admin account restored
- ✅ All tables recreated

### Step 4: Test Login
1. Go to your app: `http://localhost:3000/login`
2. Login with: `engradaka@gmail.com` and your password
3. You should be able to access the dashboard

## WHAT THE SCRIPT DOES

### 🔧 Database Structure
- **Categories table**: Stores quiz categories
- **Diamond_questions table**: Stores questions with diamond values
- **Used_questions table**: Tracks used questions in games
- **Admins table**: Manages admin users
- **Login_logs table**: Tracks login sessions
- **Activity_logs table**: Tracks admin actions

### 📊 Sample Data Added
- **Islamic History**: 8 questions (25-100 diamonds)
- **Science & Nature**: 7 questions (10-100 diamonds)
- **Arab Geography**: 6 questions (10-100 diamonds)
- **Arabic Literature**: 4 questions (25-100 diamonds)
- **Sports**: 4 questions (10-75 diamonds)
- **Technology**: 4 questions (25-100 diamonds)

## PREVENTING FUTURE DATA LOSS

### 1. Regular Backups
Run this query monthly in Supabase SQL Editor:
```sql
-- Export all your data
SELECT 'CATEGORIES_BACKUP' as table_name, * FROM categories
UNION ALL
SELECT 'QUESTIONS_BACKUP' as table_name, 
       category_id::text, question_ar, question_en, answer_ar, answer_en, 
       diamonds::text, question_type, media_url, 
       COALESCE(media_duration::text, ''), answer_type, answer_media_url,
       COALESCE(answer_media_duration::text, ''), created_at::text, 
       created_by, updated_by, updated_at::text
FROM diamond_questions;
```

### 2. Export to CSV
1. In Supabase dashboard, go to **Table Editor**
2. Select each table (categories, diamond_questions)
3. Click **Export** → **CSV**
4. Save files to your computer

### 3. Use the Backup Feature
Your app has a built-in backup feature:
1. Go to `/backup-export` in your app
2. Click **Export All Data**
3. Save the generated files

### 4. Version Control
Always commit your database scripts to Git:
```bash
git add database/
git commit -m "Database backup - $(date)"
git push
```

## TROUBLESHOOTING

### If Login Still Doesn't Work
1. Clear browser data completely
2. Run the reset script: `reset-auth-complete.js` in browser console
3. Check `/debug-auth` page for authentication status

### If Questions Don't Appear
1. Check if categories exist: `SELECT * FROM categories;`
2. Check if questions exist: `SELECT * FROM diamond_questions;`
3. Verify foreign key relationships

### If Media Files Are Missing
Media files in Supabase Storage need to be re-uploaded:
1. Go to Supabase → Storage → images bucket
2. Upload your media files again
3. Update the URLs in your questions

## EMERGENCY CONTACTS

- **Supabase Support**: [support@supabase.com](mailto:support@supabase.com)
- **Project URL**: https://uablgqkjivzbdqmiqbls.supabase.co
- **Your Email**: engradaka@gmail.com

## RECOVERY CHECKLIST

- [ ] Supabase project accessible
- [ ] Emergency restore script executed
- [ ] Categories visible in dashboard
- [ ] Questions visible in categories
- [ ] Login working with your email
- [ ] Master dashboard accessible
- [ ] Media upload working
- [ ] Backup system set up for future

## NEXT STEPS AFTER RECOVERY

1. **Re-add your custom questions** using the dashboard
2. **Re-upload media files** for questions that had images/videos
3. **Set up automated backups** using the backup feature
4. **Test the quiz game** to ensure everything works
5. **Document your questions** in a separate file for safety

---

**Remember**: Always backup before making major changes to your database!