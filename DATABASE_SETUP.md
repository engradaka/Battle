# Database Setup Guide

This is the single source of truth for setting up your database.

## Initial Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the scripts in this exact order:

### Step 1: Create Tables
```bash
scripts/01-create-tables.sql
```

### Step 2: Seed Initial Data
```bash
scripts/02-seed-data.sql
```

### Step 3: Setup Storage
```bash
scripts/03-create-storage.sql
scripts/05-create-media-bucket.sql
```

### Step 4: Schema Updates
```bash
scripts/04-update-questions-schema.sql
scripts/06-add-answer-media.sql
scripts/09-create-used-questions-table.sql
```

## Emergency Recovery

If you need to restore your database, use:
```bash
database/emergency-restore.sql
```

## Backup

Before making any changes, always backup:
```bash
database/backup-current-data.sql
```

## Notes

- All other SQL files in `/database` are legacy and should not be used
- Always test changes in a development environment first
- Keep regular backups of your data
