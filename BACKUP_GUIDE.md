# Complete Backup Guide

## Quick Backup (Recommended)

### 1. Web Interface Backup
1. Go to your quiz app → Master Dashboard → Backup & Export
2. Click **"Complete Backup"** - downloads all data + media URLs
3. Click **"Export Media URLs"** - downloads media file list

### 2. Media Files Backup (Node.js Script)
```bash
# Install dependencies
npm install dotenv

# Run the backup script
node backup-media.js
```

This creates a `media-backup/` folder with all your images and files.

## Manual Supabase Backup

### Database Backup
1. Go to Supabase Dashboard → Settings → Database
2. Click **"Database backups"**
3. Create a new backup or download existing ones

### Storage Backup
1. Go to Supabase Dashboard → Storage → media
2. Select all files → Download (browser limitation: may need to do in batches)

## What Gets Backed Up

### ✅ Complete Backup Includes:
- **Categories**: All quiz categories with descriptions
- **Questions**: All questions with answers and diamond values
- **Activity Logs**: Admin actions and changes
- **Admin Users**: User management data
- **Media URLs**: Links to all uploaded files

### ✅ Media Backup Includes:
- **Images**: Category images, question images
- **Files**: Any uploaded documents or media
- **Metadata**: File sizes, upload dates

## Backup Schedule Recommendations

### Daily (Automated)
- Use Supabase's built-in backup (paid plans)
- Or set up a cron job with the backup script

### Weekly (Manual)
- Download complete backup from web interface
- Run media backup script
- Store backups in multiple locations

### Before Major Changes
- Always backup before bulk imports
- Backup before admin changes
- Backup before app updates

## Restore Process

### Database Restore
1. **From Supabase Backup**: Use Supabase dashboard restore feature
2. **From JSON Backup**: Import data using bulk import feature
3. **From CSV Backup**: Use Excel/Google Sheets to clean and re-import

### Media Restore
1. **Upload to Supabase Storage**: Drag and drop files to media bucket
2. **Batch Upload**: Use Supabase CLI for large amounts
3. **Update References**: Ensure database references match new file URLs

## Emergency Recovery

If your database goes to sleep again:
1. **First**: Try the restore button in Supabase dashboard
2. **If that fails**: Contact Supabase support with your project ID
3. **Meanwhile**: Use your backups to recreate data if needed

## Storage Locations

### Recommended Backup Storage:
- **Local**: Your computer (immediate access)
- **Cloud**: Google Drive, Dropbox, OneDrive (redundancy)
- **External**: USB drive or external hard drive (offline backup)

## File Naming Convention

Backups are automatically named with timestamps:
- `complete-backup-2024-01-15.json`
- `categories-backup-2024-01-15.csv`
- `questions-backup-2024-01-15.json`
- `media-backup/` folder with original filenames

## Security Notes

- **Backup files contain sensitive data** - store securely
- **Don't share backup files** - they include admin emails and system data
- **Encrypt backups** if storing in cloud services
- **Regular cleanup** - delete old backups to save space

## Troubleshooting

### Script Fails
```bash
# Check Node.js version
node --version

# Install missing packages
npm install @supabase/supabase-js dotenv

# Check environment variables
cat .env.local
```

### Large Media Files
- Browser downloads may timeout for large files
- Use the Node.js script for reliable downloads
- Consider using Supabase CLI for very large datasets

### Database Connection Issues
- Verify your Supabase URL and keys in `.env.local`
- Check if database is paused (wake it up first)
- Ensure you have proper permissions

## Prevention Tips

### Keep Database Active
- Set up a simple health check that pings your database daily
- Use Supabase's built-in monitoring
- Consider upgrading to a paid plan for always-on databases

### Regular Maintenance
- Clean up old activity logs periodically
- Optimize images before uploading
- Monitor storage usage in Supabase dashboard

---

**Remember**: The best backup is the one you actually use regularly! 🔄