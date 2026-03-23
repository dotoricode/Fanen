-- portfolios 테이블: 사용자 포트폴리오
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  total_value numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 포트폴리오만 접근 가능
CREATE POLICY "포트폴리오 조회" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "포트폴리오 생성" ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "포트폴리오 수정" ON portfolios FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "포트폴리오 삭제" ON portfolios FOR DELETE USING (auth.uid() = user_id);
