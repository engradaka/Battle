# What Your App Actually Needs

## Current Status: App is Ready, Database Needs Setup

Your app code is working correctly with the question rotation fix applied. Here's what you need to get it fully functional:

---

## 1. DATABASE SETUP (CRITICAL - MUST DO)

Your app needs these tables in Supabase. Go to your Supabase project → SQL Editor and run this:

```sql
-- =====================================================
-- REQUIRED TABLES FOR NBK BATTLE QUIZ APP
-- =====================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  image_url TEXT,
  description_ar TEXT,
  description_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Diamond Questions Table (with answer media support)
CREATE TABLE IF NOT EXISTS diamond_questions (
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
CREATE TABLE IF NOT EXISTS used_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES diamond_questions(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Login Logs Table (optional - for tracking admin logins)
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_diamond_questions_category_id ON diamond_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_used_questions_question_id ON used_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_used_questions_used_at ON used_questions(used_at);

-- 6. Setup Storage Bucket for Images/Media
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Disable RLS on storage (to allow uploads)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 8. Enable RLS on Tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE used_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- 9. Create Policies for Public Access (Game Play)
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read questions" ON diamond_questions FOR SELECT USING (true);
CREATE POLICY "Allow public read used_questions" ON used_questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert used_questions" ON used_questions FOR INSERT WITH CHECK (true);

-- 10. Create Policies for Authenticated Users (Admin Dashboard)
CREATE POLICY "Allow authenticated all on categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all on questions" ON diamond_questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all on used_questions" ON used_questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all on login_logs" ON login_logs FOR ALL USING (auth.role() = 'authenticated');
```

---

## 2. CREATE ADMIN USER (CRITICAL - MUST DO)

Your app checks if the logged-in user's email is `engradaka@gmail.com` to grant master admin access.

**Steps:**

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" or "Invite user"
3. Email: `engradaka@gmail.com`
4. Password: (choose a secure password)
5. Click "Create user"

**Why:** Without this user in Supabase Authentication, you cannot log into the admin dashboard.

---

## 3. ADD SAMPLE DATA (RECOMMENDED)

After creating tables, add some sample categories and questions so you can test the game:

```sql
-- Insert sample categories
INSERT INTO categories (name_ar, name_en, image_url) VALUES
('التاريخ', 'History', null),
('العلوم', 'Science', null),
('الرياضة', 'Sports', null),
('الجغرافيا', 'Geography', null),
('الأدب', 'Literature', null),
('التكنولوجيا', 'Technology', null);

-- Insert sample questions for History (10, 25, 50, 75, 100 diamonds)
INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'متى تأسست الدولة السعودية الأولى؟',
  'When was the First Saudi State established?',
  '1744م',
  '1744 AD',
  10
FROM categories c WHERE c.name_en = 'History';

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'من هو أول خليفة راشدي؟',
  'Who was the first Rashidun Caliph?',
  'أبو بكر الصديق',
  'Abu Bakr Al-Siddiq',
  25
FROM categories c WHERE c.name_en = 'History';

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'متى وقعت معركة حطين؟',
  'When did the Battle of Hattin take place?',
  '1187م',
  '1187 AD',
  50
FROM categories c WHERE c.name_en = 'History';

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'من فتح القسطنطينية؟',
  'Who conquered Constantinople?',
  'محمد الفاتح',
  'Mehmed the Conqueror',
  75
FROM categories c WHERE c.name_en = 'History';

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'متى انتهت الحرب العالمية الثانية؟',
  'When did World War II end?',
  '1945م',
  '1945 AD',
  100
FROM categories c WHERE c.name_en = 'History';

-- Insert sample questions for Science (10, 25, 50, 75, 100 diamonds)
INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'ما هو الرمز الكيميائي للماء؟',
  'What is the chemical symbol for water?',
  'H2O',
  'H2O',
  10
FROM categories c WHERE c.name_en = 'Science';

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'ما هو الرمز الكيميائي للذهب؟',
  'What is the chemical symbol for gold?',
  'Au',
  'Au',
  25
FROM categories c WHERE c.name_en = 'Science';

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'ما هو أكبر كوكب في النظام الشمسي؟',
  'What is the largest planet in our solar system?',
  'المشتري',
  'Jupiter',
  50
FROM categories c WHERE c.name_en = 'Science';

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'من اكتشف البنسلين؟',
  'Who discovered penicillin?',
  'ألكسندر فليمنغ',
  'Alexander Fleming',
  75
FROM categories c WHERE c.name_en = 'Science';

INSERT INTO diamond_questions (category_id, question_ar, question_en, answer_ar, answer_en, diamonds)
SELECT
  c.id,
  'ما هي سرعة الضوء؟',
  'What is the speed of light?',
  '299,792 كم/ثانية',
  '299,792 km/s',
  100
FROM categories c WHERE c.name_en = 'Science';
```

---

## 4. VERIFY ENVIRONMENT VARIABLES (ALREADY DONE ✅)

Your `.env.local` file is already configured correctly:

- ✅ Supabase URL: `https://uablgqkjivzbdqmiqbls.supabase.co`
- ✅ Supabase Anon Key: Present
- ✅ Master Admin Email: `engradaka@gmail.com`

---

## 5. TEST THE APP

After completing steps 1-3, test your app:

```bash
npm run dev
```

### Test Public Game Flow (No Login Required):

1. Go to `http://localhost:3000`
2. Click "Start"
3. Enter team names
4. Select categories for each team
5. Play the game
6. Verify questions don't repeat until all are used
7. Verify oldest questions appear first when all are exhausted

### Test Admin Dashboard (Login Required):

1. Go to `http://localhost:3000/login`
2. Login with: `engradaka@gmail.com` and your password
3. Should redirect to `/dashboard`
4. Test adding/editing categories
5. Test adding/editing questions
6. Test bulk import feature

---

## What You DON'T Need

❌ **Admins table** - Your app uses Supabase Authentication + email check
❌ **Complex middleware** - Simple security headers are enough
❌ **Server-side auth** - Client-side AuthGuard component works fine
❌ **Games/game_categories/game_questions tables** - Not used by current app version

---

## Summary Checklist

- [ ] Run database setup SQL in Supabase SQL Editor
- [ ] Create admin user in Supabase Authentication (`engradaka@gmail.com`)
- [ ] Add sample categories and questions (optional but recommended)
- [ ] Run `npm run dev`
- [ ] Test public game flow (home → team setup → game)
- [ ] Test admin login and dashboard

Once these are done, your app will be fully functional!

---

## If You Have Issues

**Login fails:**

- Check that user exists in Supabase Authentication
- Check email matches exactly: `engradaka@gmail.com`
- Check password is correct

**No categories/questions show:**

- Check tables exist in Supabase
- Check you added sample data
- Check browser console for errors

**Questions repeat immediately:**

- The fix is already applied in `app/game/page.tsx`
- Check `used_questions` table exists
- Check RLS policies allow public insert on `used_questions`

**Can't upload images:**

- Check `images` storage bucket exists
- Check RLS is disabled on `storage.objects`
