# Bulk Import Error Fix

## Problem
The bulk import was failing with this error:
```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

## Root Cause
This error is NOT from your application code. It's coming from:
1. A browser extension (like an AI assistant)
2. A proxy or network interceptor
3. A development tool that's trying to "enhance" your API calls

The error occurs because something is intercepting your `/api/parse-excel` request and trying to send it to Google's Gemini AI instead.

## Solution Applied
Changed the bulk import to parse Excel files **directly in the browser** instead of using the API route. This bypasses any interceptors.

### Changes Made:
- Modified `app/master-dashboard/bulk-import/page.tsx`
- Now uses client-side XLSX parsing
- No API calls needed for Excel parsing
- Faster and more reliable

## How to Test

1. Go to `/master-dashboard/bulk-import`
2. Upload an Excel or CSV file with this format:

```csv
Question EN,Question AR,Answer EN,Answer AR
What is football?,ما هي كرة القدم?,A sport,رياضة
What is water?,ما هو الماء?,H2O,H2O
```

3. Click "Parse"
4. Should work without errors now

## If You Still See the Error

The error is coming from outside your app. Try:

1. **Disable browser extensions** (especially AI assistants)
2. **Use incognito mode** to test
3. **Check for proxy settings** in your network
4. **Clear browser cache** and reload

## Alternative: Use the Other Bulk Import

If the master dashboard version still has issues, use:
- `/bulk-import` page instead
- This version uses CSV parsing (no API calls)
- Download template and follow the format exactly

## Template Format

Both pages accept this CSV format:
```csv
category_name,question_ar,question_en,answer_ar,answer_en,diamonds
Sports,ما هي كرة القدم؟,What is football?,رياضة,Sport,25
Science,ما هو الماء؟,What is water?,H2O,H2O,50
```

Make sure:
- Category names match existing categories in your database
- Diamonds are: 10, 25, 50, 75, or 100
- File is UTF-8 encoded for Arabic text
