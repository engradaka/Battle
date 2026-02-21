-- EMERGENCY DATABASE RESTORE SCRIPT
-- This will recreate your entire database structure and add sample data
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CLEAN SLATE - Remove existing tables if needed
-- =============================================

-- Uncomment these lines ONLY if you want to completely start over
-- DROP TABLE IF EXISTS used_questions CASCADE;
-- DROP TABLE IF EXISTS diamond_questions CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS admin_requests CASCADE;
-- DROP TABLE IF EXISTS admins CASCADE;
-- DROP TABLE IF EXISTS login_logs CASCADE;

-- =============================================
-- 2. CREATE CORE TABLES
-- =============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diamond questions table
CREATE TABLE IF NOT EXISTS diamond_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  diamonds INTEGER NOT NULL CHECK (diamonds IN (10, 25, 50, 75, 100)),
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'image', 'video', 'audio')),
  media_url TEXT,
  media_duration INTEGER,
  answer_type TEXT DEFAULT 'text' CHECK (answer_type IN ('text', 'image', 'video', 'audio')),
  answer_media_url TEXT,
  answer_media_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Used questions tracking
CREATE TABLE IF NOT EXISTS used_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES diamond_questions(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login logs table
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('master_admin', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Admin requests table
CREATE TABLE IF NOT EXISTS admin_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('category', 'question')),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. INSERT MASTER ADMIN
-- =============================================

-- Insert your master admin (replace with your actual email)
INSERT INTO admins (email, role, status) 
VALUES ('engradaka@gmail.com', 'master_admin', 'active')
ON CONFLICT (email) DO UPDATE SET 
  role = 'master_admin',
  status = 'active';

-- =============================================
-- 4. INSERT SAMPLE CATEGORIES
-- =============================================

INSERT INTO categories (name_ar, name_en, description_ar, description_en, image_url) VALUES
('التاريخ الإسلامي', 'Islamic History', 'أسئلة حول التاريخ الإسلامي والخلفاء والفتوحات', 'Questions about Islamic history, caliphs and conquests', '/placeholder.svg'),
('العلوم والطبيعة', 'Science & Nature', 'أسئلة علمية حول الطبيعة والاكتشافات', 'Scientific questions about nature and discoveries', '/placeholder.svg'),
('الجغرافيا العربية', 'Arab Geography', 'أسئلة حول جغرافية الوطن العربي', 'Questions about Arab world geography', '/placeholder.svg'),
('الأدب العربي', 'Arabic Literature', 'أسئلة حول الشعر والأدب العربي', 'Questions about Arabic poetry and literature', '/placeholder.svg'),
('الرياضة', 'Sports', 'أسئلة رياضية متنوعة', 'Various sports questions', '/placeholder.svg'),
('التكنولوجيا', 'Technology', 'أسئلة حول التقنية والحاسوب', 'Questions about technology and computers', '/placeholder.svg')
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. INSERT SAMPLE QUESTIONS
-- =============================================

-- Get category IDs for inserting questions
DO $$
DECLARE
    history_id UUID;
    science_id UUID;
    geography_id UUID;
    literature_id UUID;
    sports_id UUID;
    tech_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO history_id FROM categories WHERE name_en = 'Islamic History' LIMIT 1;
    SELECT id INTO science_id FROM categories WHERE name_en = 'Science & Nature' LIMIT 1;
    SELECT id INTO geography_id FROM categories WHERE name_en = 'Arab Geography' LIMIT 1;
    SELECT id INTO literature_id FROM categories WHERE name_en = 'Arabic Literature' LIMIT 1;
    SELECT id INTO sports_id FROM categories WHERE name_en = 'Sports' LIMIT 1;
    SELECT id INTO tech_id FROM categories WHERE name_en = 'Technology' LIMIT 1;

    -- Islamic History Questions
    IF history_id IS NOT NULL THEN
        INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds) VALUES
        (history_id, 'متى تأسست الدولة السعودية الأولى؟', 'When was the First Saudi State established?', '1744م', '1744 AD', 25),
        (history_id, 'من هو أول خليفة راشدي؟', 'Who was the first Rashidun Caliph?', 'أبو بكر الصديق', 'Abu Bakr Al-Siddiq', 25),
        (history_id, 'في أي عام فتح المسلمون القسطنطينية؟', 'In which year did Muslims conquer Constantinople?', '1453م', '1453 AD', 50),
        (history_id, 'من هو قائد الفتح الإسلامي لمصر؟', 'Who led the Islamic conquest of Egypt?', 'عمرو بن العاص', 'Amr ibn al-As', 50),
        (history_id, 'متى وقعت معركة حطين؟', 'When did the Battle of Hattin take place?', '1187م', '1187 AD', 75),
        (history_id, 'من هو مؤسس الدولة الأموية؟', 'Who founded the Umayyad Caliphate?', 'معاوية بن أبي سفيان', 'Muawiya ibn Abi Sufyan', 75),
        (history_id, 'في أي عام وقعت معركة القادسية؟', 'In which year did the Battle of Qadisiyyah occur?', '636م', '636 AD', 100),
        (history_id, 'من هو آخر خليفة عباسي في بغداد؟', 'Who was the last Abbasid Caliph in Baghdad?', 'المستعصم بالله', 'Al-Musta\'sim', 100);
    END IF;

    -- Science & Nature Questions
    IF science_id IS NOT NULL THEN
        INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds) VALUES
        (science_id, 'ما هو الرمز الكيميائي للذهب؟', 'What is the chemical symbol for gold?', 'Au', 'Au', 10),
        (science_id, 'كم عدد عظام جسم الإنسان البالغ؟', 'How many bones are in an adult human body?', '206', '206', 25),
        (science_id, 'ما هو أسرع حيوان في العالم؟', 'What is the fastest animal in the world?', 'الفهد', 'Cheetah', 25),
        (science_id, 'ما هو أكبر كوكب في النظام الشمسي؟', 'What is the largest planet in our solar system?', 'المشتري', 'Jupiter', 50),
        (science_id, 'من اكتشف البنسلين؟', 'Who discovered penicillin?', 'ألكسندر فليمنغ', 'Alexander Fleming', 75),
        (science_id, 'ما هي وحدة قياس القوة؟', 'What is the unit of measurement for force?', 'نيوتن', 'Newton', 75),
        (science_id, 'ما هو العنصر الأكثر وفرة في الكون؟', 'What is the most abundant element in the universe?', 'الهيدروجين', 'Hydrogen', 100);
    END IF;

    -- Geography Questions
    IF geography_id IS NOT NULL THEN
        INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds) VALUES
        (geography_id, 'ما هي عاصمة المغرب؟', 'What is the capital of Morocco?', 'الرباط', 'Rabat', 10),
        (geography_id, 'أي نهر يمر عبر مصر؟', 'Which river flows through Egypt?', 'النيل', 'Nile', 25),
        (geography_id, 'ما هي أكبر دولة عربية من حيث المساحة؟', 'What is the largest Arab country by area?', 'الجزائر', 'Algeria', 50),
        (geography_id, 'في أي قارة تقع دولة الإمارات؟', 'On which continent is the UAE located?', 'آسيا', 'Asia', 25),
        (geography_id, 'ما هو أعلى جبل في الوطن العربي؟', 'What is the highest mountain in the Arab world?', 'جبل توبقال', 'Mount Toubkal', 75),
        (geography_id, 'أي بحر يفصل بين آسيا وأفريقيا؟', 'Which sea separates Asia and Africa?', 'البحر الأحمر', 'Red Sea', 100);
    END IF;

    -- Literature Questions
    IF literature_id IS NOT NULL THEN
        INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds) VALUES
        (literature_id, 'من هو شاعر الرسول؟', 'Who was the Prophet\'s poet?', 'حسان بن ثابت', 'Hassan ibn Thabit', 25),
        (literature_id, 'من كتب رواية "مدن الملح"؟', 'Who wrote the novel "Cities of Salt"?', 'عبد الرحمن منيف', 'Abdul Rahman Munif', 50),
        (literature_id, 'ما هو لقب المتنبي؟', 'What was Al-Mutanabbi\'s title?', 'شاعر العرب', 'Poet of the Arabs', 75),
        (literature_id, 'من هو صاحب معلقة "قفا نبك"؟', 'Who is the author of the Mu\'allaqa "Qifa nabki"?', 'امرؤ القيس', 'Imru\' al-Qais', 100);
    END IF;

    -- Sports Questions
    IF sports_id IS NOT NULL THEN
        INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds) VALUES
        (sports_id, 'كم عدد لاعبي كرة القدم في الفريق الواحد؟', 'How many players are on a football team?', '11', '11', 10),
        (sports_id, 'في أي عام أقيمت أول بطولة كأس العالم؟', 'In which year was the first World Cup held?', '1930', '1930', 25),
        (sports_id, 'من هو أكثر لاعب تسجيلاً للأهداف في تاريخ كرة القدم؟', 'Who is the highest goal scorer in football history?', 'كريستيانو رونالدو', 'Cristiano Ronaldo', 50),
        (sports_id, 'كم عدد الأشواط في مباراة التنس؟', 'How many sets are in a tennis match?', 'يختلف حسب البطولة', 'Varies by tournament', 75);
    END IF;

    -- Technology Questions
    IF tech_id IS NOT NULL THEN
        INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds) VALUES
        (tech_id, 'من هو مؤسس شركة مايكروسوفت؟', 'Who founded Microsoft?', 'بيل غيتس', 'Bill Gates', 25),
        (tech_id, 'ما هو اختصار WWW؟', 'What does WWW stand for?', 'الشبكة العنكبوتية العالمية', 'World Wide Web', 50),
        (tech_id, 'في أي عام تم إطلاق أول آيفون؟', 'In which year was the first iPhone released?', '2007', '2007', 75),
        (tech_id, 'ما هي أكبر شركة تقنية في العالم من حيث القيمة السوقية؟', 'What is the largest tech company by market value?', 'أبل', 'Apple', 100);
    END IF;

END $$;

-- =============================================
-- 6. DISABLE RLS FOR EASIER ACCESS (TEMPORARY)
-- =============================================

-- Disable RLS temporarily to make sure everything works
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE used_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_diamond_questions_category_id ON diamond_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_diamond_questions_diamonds ON diamond_questions(diamonds);
CREATE INDEX IF NOT EXISTS idx_used_questions_question_id ON used_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_email ON activity_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_login_logs_admin_email ON login_logs(admin_email);

-- =============================================
-- 8. VERIFICATION
-- =============================================

-- Check what was created
SELECT 'RESTORATION COMPLETE!' as status;
SELECT 'Categories created:' as info, COUNT(*) as count FROM categories;
SELECT 'Questions created:' as info, COUNT(*) as count FROM diamond_questions;
SELECT 'Master admin:' as info, email FROM admins WHERE role = 'master_admin';

-- Show summary by category
SELECT 
  c.name_en as category,
  COUNT(q.id) as question_count,
  SUM(q.diamonds) as total_diamonds
FROM categories c
LEFT JOIN diamond_questions q ON c.id = q.category_id
GROUP BY c.id, c.name_en
ORDER BY c.name_en;