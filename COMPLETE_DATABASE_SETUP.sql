-- =====================================================
-- COMPLETE DATABASE SETUP FOR NBK BATTLE QUIZ APP
-- Fresh Supabase Project - Run this entire script
-- =====================================================

-- =====================================================
-- PART 0: CLEANUP (if tables exist with wrong types)
-- =====================================================

-- Drop tables if they exist (to start fresh)
DROP TABLE IF EXISTS used_questions CASCADE;
DROP TABLE IF EXISTS diamond_questions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS admin_requests CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS login_logs CASCADE;

-- =====================================================
-- PART 1: CORE GAME TABLES
-- =====================================================

-- 1. Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  image_url TEXT,
  description_ar TEXT,
  description_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Diamond Questions Table (with answer media support)
CREATE TABLE diamond_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  diamonds INTEGER NOT NULL CHECK (diamonds IN (10, 25, 50, 75, 100)),
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'video', 'image', 'audio')),
  media_url TEXT,
  media_duration INTEGER,
  answer_type TEXT DEFAULT 'text' CHECK (answer_type IN ('text', 'video', 'image', 'audio')),
  answer_media_url TEXT,
  answer_media_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Used Questions Table (for question rotation)
CREATE TABLE used_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES diamond_questions(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 2: ADMIN SYSTEM TABLES
-- =====================================================

-- 4. Admins Table
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('master_admin', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  last_login TIMESTAMP WITH TIME ZONE
);

-- 5. Admin Requests Table
CREATE TABLE admin_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

-- 6. Activity Logs Table
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject', 'import')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('category', 'question', 'admin_request', 'bulk_import', 'settings')),
  resource_id TEXT,
  resource_name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Login Logs Table
CREATE TABLE login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER,
  user_agent TEXT,
  ip_address TEXT
);

-- =====================================================
-- PART 3: INDEXES FOR PERFORMANCE
-- =====================================================

-- Core game tables indexes
CREATE INDEX IF NOT EXISTS idx_diamond_questions_category_id ON diamond_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_diamond_questions_diamonds ON diamond_questions(diamonds);
CREATE INDEX IF NOT EXISTS idx_used_questions_question_id ON used_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_used_questions_used_at ON used_questions(used_at);

-- Admin system indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_requests_email ON admin_requests(email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_email ON activity_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_login_logs_admin_email ON login_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON login_logs(login_time DESC);

-- =====================================================
-- PART 4: STORAGE SETUP
-- =====================================================

-- Create storage bucket for images and media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Note: Storage RLS is managed by Supabase automatically
-- You can configure storage policies in Supabase Dashboard → Storage → Policies

-- =====================================================
-- PART 5: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE used_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 6: RLS POLICIES - PUBLIC ACCESS (GAME PLAY)
-- =====================================================

-- Categories - Public read access for game
CREATE POLICY "Allow public read categories" 
  ON categories FOR SELECT 
  USING (true);

-- Questions - Public read access for game
CREATE POLICY "Allow public read questions" 
  ON diamond_questions FOR SELECT 
  USING (true);

-- Used questions - Public read and insert for game
CREATE POLICY "Allow public read used_questions" 
  ON used_questions FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert used_questions" 
  ON used_questions FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- PART 7: RLS POLICIES - AUTHENTICATED ACCESS (ADMIN)
-- =====================================================

-- Categories - Authenticated users can do everything
CREATE POLICY "Allow authenticated all on categories" 
  ON categories FOR ALL 
  USING (auth.role() = 'authenticated');

-- Questions - Authenticated users can do everything
CREATE POLICY "Allow authenticated all on questions" 
  ON diamond_questions FOR ALL 
  USING (auth.role() = 'authenticated');

-- Used questions - Authenticated users can do everything
CREATE POLICY "Allow authenticated all on used_questions" 
  ON used_questions FOR ALL 
  USING (auth.role() = 'authenticated');

-- Admins - Authenticated users can read, insert, update
CREATE POLICY "Allow authenticated read admins" 
  ON admins FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert admins" 
  ON admins FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update admins" 
  ON admins FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Admin requests - Authenticated users can read, insert, update
CREATE POLICY "Allow authenticated read admin_requests" 
  ON admin_requests FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert admin_requests" 
  ON admin_requests FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update admin_requests" 
  ON admin_requests FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Activity logs - Authenticated users can read and insert
CREATE POLICY "Allow authenticated read activity_logs" 
  ON activity_logs FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert activity_logs" 
  ON activity_logs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Login logs - Authenticated users can read and insert
CREATE POLICY "Allow authenticated read login_logs" 
  ON login_logs FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert login_logs" 
  ON login_logs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update login_logs" 
  ON login_logs FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- =====================================================
-- PART 8: INSERT MASTER ADMIN
-- =====================================================

-- Insert master admin (REPLACE EMAIL WITH YOUR ACTUAL EMAIL)
INSERT INTO admins (email, full_name, role, status, created_at)
VALUES (
  'engradaka@gmail.com',  -- CHANGE THIS TO YOUR EMAIL
  'Master Admin',
  'master_admin',
  'active',
  NOW()
)
ON CONFLICT (email) DO UPDATE 
SET role = 'master_admin', status = 'active';

-- =====================================================
-- PART 9: SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name_ar, name_en, image_url, description_ar, description_en) VALUES
('التاريخ', 'History', null, 'أسئلة عن التاريخ', 'Questions about history'),
('العلوم', 'Science', null, 'أسئلة عن العلوم', 'Questions about science'),
('الرياضة', 'Sports', null, 'أسئلة عن الرياضة', 'Questions about sports'),
('الجغرافيا', 'Geography', null, 'أسئلة عن الجغرافيا', 'Questions about geography'),
('الأدب', 'Literature', null, 'أسئلة عن الأدب', 'Questions about literature'),
('التكنولوجيا', 'Technology', null, 'أسئلة عن التكنولوجيا', 'Questions about technology')
ON CONFLICT DO NOTHING;

-- Insert sample questions for History (one for each diamond value)
INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'متى تأسست الدولة السعودية الأولى؟',
  'When was the First Saudi State established?',
  '1744م',
  '1744 AD',
  10
FROM categories c WHERE c.name_en = 'History'
ON CONFLICT DO NOTHING;

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'من هو أول خليفة راشدي؟',
  'Who was the first Rashidun Caliph?',
  'أبو بكر الصديق',
  'Abu Bakr Al-Siddiq',
  25
FROM categories c WHERE c.name_en = 'History'
ON CONFLICT DO NOTHING;

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'متى وقعت معركة حطين؟',
  'When did the Battle of Hattin take place?',
  '1187م',
  '1187 AD',
  50
FROM categories c WHERE c.name_en = 'History'
ON CONFLICT DO NOTHING;

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'من فتح القسطنطينية؟',
  'Who conquered Constantinople?',
  'محمد الفاتح',
  'Mehmed the Conqueror',
  75
FROM categories c WHERE c.name_en = 'History'
ON CONFLICT DO NOTHING;

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'متى انتهت الحرب العالمية الثانية؟',
  'When did World War II end?',
  '1945م',
  '1945 AD',
  100
FROM categories c WHERE c.name_en = 'History'
ON CONFLICT DO NOTHING;

-- Insert sample questions for Science (one for each diamond value)
INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'ما هو الرمز الكيميائي للماء؟',
  'What is the chemical symbol for water?',
  'H2O',
  'H2O',
  10
FROM categories c WHERE c.name_en = 'Science'
ON CONFLICT DO NOTHING;

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'ما هو الرمز الكيميائي للذهب؟',
  'What is the chemical symbol for gold?',
  'Au',
  'Au',
  25
FROM categories c WHERE c.name_en = 'Science'
ON CONFLICT DO NOTHING;

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'ما هو أكبر كوكب في النظام الشمسي؟',
  'What is the largest planet in our solar system?',
  'المشتري',
  'Jupiter',
  50
FROM categories c WHERE c.name_en = 'Science'
ON CONFLICT DO NOTHING;

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'من اكتشف البنسلين؟',
  'Who discovered penicillin?',
  'ألكسندر فليمنغ',
  'Alexander Fleming',
  75
FROM categories c WHERE c.name_en = 'Science'
ON CONFLICT DO NOTHING;

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT 
  c.id,
  'ما هي سرعة الضوء؟',
  'What is the speed of light?',
  '299,792 كم/ثانية',
  '299,792 km/s',
  100
FROM categories c WHERE c.name_en = 'Science'
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 10: VERIFICATION QUERIES
-- =====================================================

-- Run these after the script completes to verify everything

-- Check all tables exist
SELECT 
  'Tables Created' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'categories', 
    'diamond_questions', 
    'used_questions',
    'admins',
    'admin_requests',
    'activity_logs',
    'login_logs'
  );

-- Check master admin exists
SELECT 
  'Master Admin' as status,
  email,
  role,
  status as admin_status
FROM admins 
WHERE role = 'master_admin';

-- Check sample data
SELECT 
  'Sample Data' as status,
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM diamond_questions) as questions,
  (SELECT COUNT(*) FROM admins) as admins;

-- Check indexes
SELECT 
  'Indexes Created' as status,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN (
    'categories', 
    'diamond_questions', 
    'used_questions',
    'admins',
    'admin_requests',
    'activity_logs',
    'login_logs'
  );

-- Check RLS policies
SELECT 
  'RLS Policies' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public';

-- Check storage bucket
SELECT 
  'Storage Bucket' as status,
  name,
  public
FROM storage.buckets 
WHERE name = 'images';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Next steps:
-- 1. Update your .env.local with new Supabase project URL and keys
-- 2. Create admin user in Supabase Authentication (engradaka@gmail.com)
-- 3. Test the app
-- 4. Report back: "Database setup complete!"
