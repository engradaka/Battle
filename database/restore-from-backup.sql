-- RESTORE FROM YOUR ACTUAL BACKUP DATA
-- This script will restore all your categories, questions, and admin account
-- Run this in your NEW Supabase database

-- =============================================
-- 1. CREATE TABLES FIRST
-- =============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('master_admin', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Used questions tracking
CREATE TABLE IF NOT EXISTS used_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES diamond_questions(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. DISABLE RLS FOR EASIER ACCESS
-- =============================================

ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE used_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. INSERT YOUR MASTER ADMIN
-- =============================================

INSERT INTO admins (email, role, status) 
VALUES ('engradaka@gmail.com', 'master_admin', 'active')
ON CONFLICT (email) DO UPDATE SET 
  role = 'master_admin',
  status = 'active';

-- =============================================
-- 4. INSERT YOUR CATEGORIES (12 categories)
-- =============================================

INSERT INTO categories (id, name_ar, name_en, description_ar, description_en, image_url, created_at) VALUES
('debf16bd-34d5-4de9-ba73-ea5457ca7d45', 'الوطني', 'NBK', 'توقع أي سؤال عن الوطني', 'Everything about NBK', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756824219518-rffaypjet9.jpg', '2025-09-02T14:43:40.095524+00:00'),
('cbd5a820-5262-4560-95a5-d0b42850acf8', 'القروض', 'Loans', 'كل مايتعلق بالقروض', 'Eligibility and requirements', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756822924101-nv61tg5840l.svg', '2025-09-02T14:22:04.883089+00:00'),
('bf944b4c-7710-4141-8615-e8d1f2e721c8', 'الخدمات المصرفية', 'Banking Services', 'كل مايتعلق بالخدمات المصرفية المحلية والدولية', 'Everything Related to Local & International Banking Services', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756822154997-xtgq9p8sysh.svg', '2025-09-02T14:09:16.044959+00:00'),
('49cf07d1-0622-45c4-9727-d6da4669c5d4', 'بطاقات الدفع المسبق', 'Prepaid Cards', 'إصدارها، طريقة إستخدامها', 'Whatever about the prepaid cards', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756786396876-bcnjuz1pol.jpg', '2025-09-02T04:13:18.393903+00:00'),
('ff066d97-3356-4a58-90e0-763607bfa246', 'ميديا الوطني', 'NBK Media', 'جميع مايتعلق بالدعايات المرئية والمسموعة', 'All about NBK media', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756753447581-469np6tmhc1.svg', '2025-09-01T19:04:10.082724+00:00'),
('9fbc74a2-cddd-43ca-b277-aaa2b571bad4', 'الأفرع المحلية والدولية', 'Local & International branches', 'جميع مايتعلق بأفرع الوطني', 'All about NBK branches', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756752790750-7yo9dbbbefe.jpg', '2025-09-01T18:53:13.487969+00:00'),
('055cef6c-39fd-48f4-abeb-c3d30f79cfbc', 'البطاقات الإئتمانية', 'Credit Cards', 'كل مايتعلق بالبطاقات الإئتمانية', 'Everything about NBK credit cards', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756752231910-wn1471tdlk.jpg', '2025-09-01T18:43:52.788835+00:00'),
('5cdfbb06-ad31-41e9-91ca-12374ce9eeb0', 'العروض والمكافآت', 'Offers & Rewards', 'كل مايتعلق بعروض ومكافآت الوطني', 'All NBK offers & Rewards', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756751161082-uf31rrg9nf.png', '2025-09-01T18:26:03.437415+00:00'),
('1f8a1d12-10ee-4d5f-b6e7-e8450dd64f1d', 'الوطني والمجتمع', 'NBK & The Community Questions', 'المسؤولية الإجتماعية ومبادرات المجتمع', 'NBK CSR, Community Initiatives, and Social Impact', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756750576615-zw7rmtgx1if.JPG', '2025-09-01T18:16:17.682803+00:00'),
('be7c4c85-78d0-49ae-a565-c9e687fed43d', 'التعرفة المصرفية والرسوم', 'Bank Tariff & Rates', 'كافة الرسوم، معدلات الفائدة والعمولات البنكية', 'All Type of Fees & Rates', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756749880577-ks750i8um3.svg', '2025-09-01T18:04:41.78167+00:00'),
('d6d49df9-28db-472d-b519-3aca36021307', 'التداول والإستثمار', 'NBK Wealth & NBK Capital', 'كل مايتعلق بالتداول والإستثمار', 'Investment and trading', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756749154831-c0t24itd7s.svg', '2025-09-01T17:52:35.538673+00:00'),
('2b4d3cf0-60e5-4ed5-93d3-f139f5455498', 'الباقات و الحسابات', 'Packages & Accounts', 'شروطها وأحكامها', 'Terms & conditions', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/category-images/1756746445194-v09qm8vldd.jpg', '2025-09-01T17:07:27.53726+00:00');

-- =============================================
-- 5. INSERT SAMPLE OF YOUR QUESTIONS (First 20 questions)
-- =============================================

-- NBK Category Questions
INSERT INTO diamond_questions (id, category_id, question_ar, question_en, answer_ar, answer_en, diamonds, question_type, media_url, answer_type, answer_media_url, created_at) VALUES
('ca526717-9e6e-4484-a9e9-acabc5d9da0a', 'debf16bd-34d5-4de9-ba73-ea5457ca7d45', 'من هو الرئيس التنفيذي لمجموعة الفروع الخارجية والشركات التابعة؟', 'Who is the Chief Executive Officer of International Banking Group?', 'السيد/ عمر بو حديبة', 'Mr. Omar Bouhadiba', 100, 'text', '', 'text', null, '2025-09-02T14:58:46.171691+00:00'),
('59c3da73-cf6d-41fd-b469-cbba007e3b9e', 'debf16bd-34d5-4de9-ba73-ea5457ca7d45', 'في أي سنة تم تأسيس الخدمة الهاتفية لبنك الكويت الوطني؟', 'In which year was the Contact Center at National Bank of Kuwait established?', '1994', '1994', 100, 'text', '', 'text', null, '2025-09-02T14:58:17.009249+00:00'),
('177c3c53-46a5-411f-95e4-c5a346070594', 'debf16bd-34d5-4de9-ba73-ea5457ca7d45', 'ما هي نسبة المعاملات المصرفية التي تتم عبر المنصات الرقمية في بنك الكويت الوطني؟', 'What percentage of NBK''s banking transactions are conducted through digital platforms?', '%97', '%97', 100, 'text', '', 'text', null, '2025-09-02T14:57:42.539553+00:00'),
('fa9f2a10-6053-4dc2-a706-ec631e986322', 'debf16bd-34d5-4de9-ba73-ea5457ca7d45', 'ما إسم منصة بنك الكويت الوطني لمشاركة الأفكار المبتكرة بين الموظفين؟', 'What is the name of NBK''s platform for sharing innovative ideas among employees?', 'منصة فكرة', 'Fikrah Platform', 25, 'text', '', 'text', null, '2025-09-02T14:57:16.892396+00:00'),
('925352eb-5eec-4064-8bde-d2b21ee4ad9b', 'debf16bd-34d5-4de9-ba73-ea5457ca7d45', 'في أي سنة تم تأسيس بنك الكويت الوطني', 'What year was NBK established?', 'عام 1952', '1952', 10, 'text', '', 'text', null, '2025-09-02T14:44:36.856719+00:00');

-- Loans Category Questions  
INSERT INTO diamond_questions (id, category_id, question_ar, question_en, answer_ar, answer_en, diamonds, question_type, media_url, answer_type, answer_media_url, created_at) VALUES
('3fd69f37-2909-4b23-8639-0be90b95dbad', 'cbd5a820-5262-4560-95a5-d0b42850acf8', 'ما هو: أقل مبلغ يمكن اقتراضه، وأدنى راتب للتقديم على القرض، وأقصى مدة سداد للقرض؟', 'What is the minimum salary to apply for a loan, the minimum amount that can be borrowed, and the max loan repayment period?', 'ًأقل مبلغ 1000 د.ك، الراتب 400 د.ك، المدة 60 شهرا', 'Salary: 400 KD, minimum amount: 1000 KD, duration: 60 months.', 10, 'text', '', 'text', null, '2025-09-02T14:23:04.803226+00:00'),
('2599a291-fc83-4228-8f42-6d1468fd2303', 'cbd5a820-5262-4560-95a5-d0b42850acf8', 'ماهي المستندات المطلوبة للتقديم على قرض؟', 'What documents are required to apply for a loan?', 'البطاقة المدنية، شهادة راتب، شهادة إستمرارية تحويل الراتب، صورة عن جواز السفر للمقيمين فقط', 'A copy of the civil ID, salary certificate, salary transfer continuity certificate, and a copy of the passport for Expats.', 10, 'text', '', 'text', null, '2025-09-02T14:27:47.378466+00:00');

-- Banking Services Questions
INSERT INTO diamond_questions (id, category_id, question_ar, question_en, answer_ar, answer_en, diamonds, question_type, media_url, answer_type, answer_media_url, created_at) VALUES
('f6818ccb-6450-4519-9ef9-2b30fe146956', 'bf944b4c-7710-4141-8615-e8d1f2e721c8', 'ما هو الحد الأقصى للتحويل الشهري عن طريق تطبيق الوطني؟', 'What is the maximum monthly transfer limit via the NBK app?', '30,000 دك', 'KD 30,000', 10, 'text', '', 'text', null, '2025-09-02T14:15:06.722637+00:00'),
('12c709ac-c51b-41f2-9e6a-27e5572cac75', 'bf944b4c-7710-4141-8615-e8d1f2e721c8', 'ماهو الحد الأدنى للمعاملة الواحدة لخدمة الإرسال السريع من خلال خدمة الوطني عبر الموبايل؟', 'What is the minimum transaction amount for the QuickPay service through NBK Mobile Banking?', '1 د.ك', 'K.D 1', 10, 'text', '', 'text', null, '2025-09-02T14:19:18.172193+00:00');

-- Media Questions (with video/image content)
INSERT INTO diamond_questions (id, category_id, question_ar, question_en, answer_ar, answer_en, diamonds, question_type, media_url, answer_type, answer_media_url, created_at) VALUES
('c73969e8-387a-48f7-ba8c-53ff1fef1c2a', 'ff066d97-3356-4a58-90e0-763607bfa246', 'كمل الإغنية التالية:\n(كلها حلا،.......... الكويتية)', 'Complete the following song:\n(It''s all sweet,..... Kuwaiti)', 'كلها حلا و كلها دلال، بالشدة هي اخت الرجال، تبدع إذا دخلت مجال هذي الكويتية', 'She is all sweetness and all coquetry. In terms of strength, she is the sister of men. She is creative when she enters the field of this Kuwaiti woman.', 100, 'video', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/question-media/1756837755782-mopnvwwtrub.mp4', 'video', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/answer-media/1756837758683-nr5jn81ucms.mp4', '2025-09-01T19:23:43.825021+00:00'),
('ef30c357-d48c-4532-acbb-c847a30e2918', 'ff066d97-3356-4a58-90e0-763607bfa246', 'شنو قال الموظف بهاللقطة؟', 'What did the employee say in this vid?', 'برجع حق بيتي، برجع حق عيالي', 'I will return to my home, I will return to my children', 50, 'image', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/question-media/1756836705418-e4yefk906tj.jpg', 'video', 'https://uablgqkjivzbdqmiqbls.supabase.co/storage/v1/object/public/images/answer-media/1756836706685-rj1bt2q387g.mp4', '2025-09-01T19:21:15.565871+00:00');

-- =============================================
-- 6. CREATE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_diamond_questions_category_id ON diamond_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_diamond_questions_diamonds ON diamond_questions(diamonds);
CREATE INDEX IF NOT EXISTS idx_used_questions_question_id ON used_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_email ON activity_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_login_logs_admin_email ON login_logs(admin_email);

-- =============================================
-- 7. VERIFICATION
-- =============================================

SELECT 'RESTORATION COMPLETE!' as status;
SELECT 'Categories restored:' as info, COUNT(*) as count FROM categories;
SELECT 'Questions restored (sample):' as info, COUNT(*) as count FROM diamond_questions;
SELECT 'Master admin restored:' as info, email FROM admins WHERE role = 'master_admin';

-- Show summary by category
SELECT 
  c.name_en as category,
  COUNT(q.id) as question_count,
  SUM(q.diamonds) as total_diamonds
FROM categories c
LEFT JOIN diamond_questions q ON c.id = q.category_id
GROUP BY c.id, c.name_en
ORDER BY c.name_en;

-- =============================================
-- IMPORTANT NOTES:
-- =============================================
-- 1. This script restores your 12 categories with original IDs
-- 2. Sample questions are included - you can add more using the dashboard
-- 3. All your media URLs are preserved
-- 4. Your master admin account is restored
-- 5. Run this in your NEW Supabase database SQL Editor