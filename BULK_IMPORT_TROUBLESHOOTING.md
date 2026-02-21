# Bulk Import Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Category not found" Error

**Problem**: The CSV file has category names that don't match your database.

**Solution**:
1. Go to Dashboard and check your exact category names (both Arabic and English)
2. Make sure the `category_name` in your CSV exactly matches one of these names
3. Category names are case-sensitive

**Example**:
```csv
category_name,question_ar,question_en,answer_ar,answer_en,diamonds
Sports,ما هي كرة القدم؟,What is football?,رياضة,Sport,25
```

### Issue 2: File Upload Not Working

**Problem**: File doesn't upload or nothing happens when selecting a file.

**Solutions**:
- Make sure you're uploading a `.csv` file (not `.xlsx` unless you have Excel parsing enabled)
- Check file encoding is UTF-8 (especially for Arabic text)
- File size should be reasonable (< 5MB)
- Try downloading the template and using that format exactly

### Issue 3: "Diamonds must be 10, 25, 50, 75, or 100"

**Problem**: Invalid diamond values in your CSV.

**Solution**: Only use these exact values: 10, 25, 50, 75, or 100

### Issue 4: Excel Files Not Parsing

**Problem**: `.xlsx` or `.xls` files show errors.

**Solution**: The bulk import uses the Excel parser API route. Check:
1. Make sure `/api/parse-excel` route is working
2. Try converting your Excel file to CSV first
3. Use the CSV template instead

### Issue 5: Arabic Text Shows as Gibberish

**Problem**: Arabic characters don't display correctly.

**Solution**:
1. Save your CSV file with UTF-8 encoding
2. In Excel: Save As → CSV UTF-8 (Comma delimited)
3. In Google Sheets: File → Download → CSV

### Issue 6: Import Fails Silently

**Problem**: Import button doesn't work or fails without error.

**Check**:
1. Open browser console (F12) and check for errors
2. Verify you're logged in as master admin
3. Check Supabase connection in `.env.local`
4. Verify `diamond_questions` table exists in database

## CSV Format Requirements

### Required Columns (exact names):
- `category_name` - Must match existing category
- `question_ar` - Arabic question text
- `question_en` - English question text
- `answer_ar` - Arabic answer text
- `answer_en` - English answer text
- `diamonds` - Must be: 10, 25, 50, 75, or 100

### Example Valid CSV:
```csv
category_name,question_ar,question_en,answer_ar,answer_en,diamonds
Sports,ما هي كرة القدم؟,What is football?,رياضة جماعية,Team sport,25
Science,ما هو الماء؟,What is water?,H2O,H2O,50
History,متى تأسست المملكة؟,When was the kingdom founded?,1932,1932,75
```

## Testing Steps

1. **Download Template**
   - Click "Download Template" button
   - Open in text editor or Excel
   - Verify format

2. **Add One Test Row**
   - Use an existing category name
   - Add simple question/answer
   - Use valid diamond value (25)

3. **Upload and Validate**
   - Upload the file
   - Check validation results
   - Fix any errors shown

4. **Import**
   - Click "Import" button
   - Wait for progress bar
   - Verify success message

## Database Requirements

Make sure these tables exist in Supabase:

```sql
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS diamond_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id),
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  diamonds INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Still Having Issues?

1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify environment variables are set correctly
4. Try with a minimal 1-row CSV file first
5. Check that you're logged in as the master admin email
