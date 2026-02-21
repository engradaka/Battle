-- BACKUP CURRENT DATA SCRIPT
-- Run this in Supabase SQL Editor to backup your current data
-- Copy the results and save them to a file

-- =============================================
-- 1. BACKUP CATEGORIES
-- =============================================

SELECT 'CATEGORIES_BACKUP_START' as marker;

SELECT 
  'INSERT INTO categories (id, name_ar, name_en, description_ar, description_en, image_url, created_at) VALUES' as sql_start
UNION ALL
SELECT 
  CONCAT(
    '(''', id, ''', ''', 
    REPLACE(name_ar, '''', ''''''), ''', ''', 
    REPLACE(name_en, '''', ''''''), ''', ''', 
    COALESCE(REPLACE(description_ar, '''', ''''''), ''), ''', ''', 
    COALESCE(REPLACE(description_en, '''', ''''''), ''), ''', ''', 
    COALESCE(image_url, ''), ''', ''', 
    created_at, '''),')
  ) as backup_sql
FROM categories
ORDER BY created_at;

SELECT 'CATEGORIES_BACKUP_END' as marker;

-- =============================================
-- 2. BACKUP QUESTIONS
-- =============================================

SELECT 'QUESTIONS_BACKUP_START' as marker;

SELECT 
  'INSERT INTO diamond_questions (id, category_id, question_ar, question_en, answer_ar, answer_en, diamonds, question_type, media_url, media_duration, answer_type, answer_media_url, answer_media_duration, created_at) VALUES' as sql_start
UNION ALL
SELECT 
  CONCAT(
    '(''', id, ''', ''', 
    category_id, ''', ''', 
    REPLACE(question_ar, '''', ''''''), ''', ''', 
    REPLACE(question_en, '''', ''''''), ''', ''', 
    REPLACE(answer_ar, '''', ''''''), ''', ''', 
    REPLACE(answer_en, '''', ''''''), ''', ', 
    diamonds, ', ''', 
    COALESCE(question_type, 'text'), ''', ''', 
    COALESCE(media_url, ''), ''', ', 
    COALESCE(media_duration, 0), ', ''', 
    COALESCE(answer_type, 'text'), ''', ''', 
    COALESCE(answer_media_url, ''), ''', ', 
    COALESCE(answer_media_duration, 0), ', ''', 
    created_at, '''),')
  ) as backup_sql
FROM diamond_questions
ORDER BY created_at;

SELECT 'QUESTIONS_BACKUP_END' as marker;

-- =============================================
-- 3. BACKUP SUMMARY
-- =============================================

SELECT 'BACKUP_SUMMARY_START' as marker;

SELECT 
  'Categories backed up:' as info, 
  COUNT(*) as count 
FROM categories
UNION ALL
SELECT 
  'Questions backed up:' as info, 
  COUNT(*) as count 
FROM diamond_questions
UNION ALL
SELECT 
  'Total diamonds:' as info, 
  SUM(diamonds) as count 
FROM diamond_questions;

-- Show breakdown by category
SELECT 
  CONCAT('Category: ', c.name_en) as info,
  COUNT(q.id) as question_count,
  COALESCE(SUM(q.diamonds), 0) as total_diamonds
FROM categories c
LEFT JOIN diamond_questions q ON c.id = q.category_id
GROUP BY c.id, c.name_en
ORDER BY c.name_en;

SELECT 'BACKUP_SUMMARY_END' as marker;

-- =============================================
-- 4. MEDIA FILES LIST
-- =============================================

SELECT 'MEDIA_FILES_START' as marker;

SELECT DISTINCT 
  'Question media:' as type,
  media_url as file_url
FROM diamond_questions 
WHERE media_url IS NOT NULL AND media_url != ''
UNION ALL
SELECT DISTINCT 
  'Answer media:' as type,
  answer_media_url as file_url
FROM diamond_questions 
WHERE answer_media_url IS NOT NULL AND answer_media_url != ''
UNION ALL
SELECT DISTINCT 
  'Category images:' as type,
  image_url as file_url
FROM categories 
WHERE image_url IS NOT NULL AND image_url != '';

SELECT 'MEDIA_FILES_END' as marker;