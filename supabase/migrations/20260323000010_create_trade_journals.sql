-- trade_journals 테이블: 매매 일지
CREATE TABLE IF NOT EXISTS trade_journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id uuid,
  stock_code text,
  stock_name text,
  note text,
  emotion text,
  ai_feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE trade_journals ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 매매 일지만 접근 가능
CREATE POLICY "매매일지 조회" ON trade_journals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "매매일지 생성" ON trade_journals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "매매일지 수정" ON trade_journals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "매매일지 삭제" ON trade_journals FOR DELETE USING (auth.uid() = user_id);
