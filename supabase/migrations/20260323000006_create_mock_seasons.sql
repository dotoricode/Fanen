-- mock_seasons 테이블: 모의투자 시즌 (공개 테이블)
CREATE TABLE IF NOT EXISTS mock_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date,
  end_date date,
  is_active boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE mock_seasons ENABLE ROW LEVEL SECURITY;

-- 공개 테이블: 누구나 조회 가능, 쓰기는 service_role만
CREATE POLICY "시즌 공개 조회" ON mock_seasons FOR SELECT USING (true);
CREATE POLICY "시즌 서비스 생성" ON mock_seasons FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "시즌 서비스 수정" ON mock_seasons FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "시즌 서비스 삭제" ON mock_seasons FOR DELETE USING (auth.role() = 'service_role');
