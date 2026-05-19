-- ============================================================
-- OurJournal — Database Schema
-- Chạy file này trong Supabase SQL Editor
-- (Project Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. BẢNG CHÍNH
-- ============================================================

-- Nhật ký entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(120) NOT NULL,
  date DATE NOT NULL,
  mood VARCHAR(10) NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  author VARCHAR(2) NOT NULL CHECK (author IN ('BK', 'Bi')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ảnh trong entry
CREATE TABLE IF NOT EXISTS entry_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0
);

-- Reactions trên entry
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  author VARCHAR(2) NOT NULL CHECK (author IN ('BK', 'Bi')),
  UNIQUE (entry_id, emoji, author)
);

-- Comments trên entry
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  author VARCHAR(2) NOT NULL CHECK (author IN ('BK', 'Bi')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255),
  note TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'done', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ngày quan trọng
CREATE TABLE IF NOT EXISTS important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji VARCHAR(10) NOT NULL,
  label VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  person VARCHAR(2)
);

-- Câu hỏi couple hàng ngày
CREATE TABLE IF NOT EXISTS couple_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  date DATE NOT NULL,
  emoji VARCHAR(10) NOT NULL
);

-- Câu trả lời prompt
CREATE TABLE IF NOT EXISTS prompt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES couple_prompts(id) ON DELETE CASCADE,
  author VARCHAR(2) NOT NULL CHECK (author IN ('BK', 'Bi')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (prompt_id, author)
);

-- Thư viện ảnh chung (gallery page)
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  width INT NOT NULL DEFAULT 600,
  height INT NOT NULL DEFAULT 800,
  caption TEXT,
  date DATE NOT NULL
);

-- 2. ROW LEVEL SECURITY
-- ============================================================
-- App chỉ có 2 users (BK và Bi), tất cả data là shared
-- Policy: authenticated users có toàn quyền

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON journal_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON entry_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON reactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON important_dates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON couple_prompts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON prompt_answers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON gallery_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. INDEXES
-- ============================================================
-- Tối ưu các queries thường dùng

CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_author ON journal_entries(author);
CREATE INDEX IF NOT EXISTS idx_entry_photos_entry ON entry_photos(entry_id);
CREATE INDEX IF NOT EXISTS idx_reactions_entry ON reactions(entry_id);
CREATE INDEX IF NOT EXISTS idx_comments_entry ON comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_comments_date ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_plans_date ON plans(date);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);
CREATE INDEX IF NOT EXISTS idx_prompts_date ON couple_prompts(date);
CREATE INDEX IF NOT EXISTS idx_prompt_answers_prompt ON prompt_answers(prompt_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_date ON gallery_photos(date DESC);

-- 4. SEED DATA
-- ============================================================

-- Ngày quan trọng (5 entries mặc định)
INSERT INTO important_dates (emoji, label, date, type, person) VALUES
  ('💫', 'Ngày đầu gặp nhau', '2024-11-15', 'first-meet', NULL),
  ('💘', 'Ngày đầu hẹn hò', '2024-12-01', 'first-date', NULL),
  ('💍', 'Kỷ niệm yêu nhau', '2025-06-10', 'anniversary', NULL),
  ('🎂', 'Sinh nhật anh', '1998-03-15', 'birthday-him', 'BK'),
  ('🎂', 'Sinh nhật em', '1999-08-22', 'birthday-her', 'Bi');

-- Vài couple prompts mẫu
INSERT INTO couple_prompts (question, date, emoji) VALUES
  ('Điều gì khiến bạn cười nhiều nhất hôm nay?', CURRENT_DATE, '😊'),
  ('Một kỷ niệm đẹp nhất của tụi mình trong tuần qua là gì?', CURRENT_DATE - INTERVAL '1 day', '💭'),
  ('Bạn thích điều gì nhất ở người kia?', CURRENT_DATE - INTERVAL '2 days', '💕'),
  ('Nếu được đi du lịch cùng nhau ngay bây giờ, bạn muốn đi đâu?', CURRENT_DATE - INTERVAL '3 days', '✈️'),
  ('Bài hát nào khiến bạn nhớ đến đối phương nhất?', CURRENT_DATE - INTERVAL '4 days', '🎵');
