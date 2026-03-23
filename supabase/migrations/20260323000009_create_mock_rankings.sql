-- mock_rankings 테이블: 모의투자 랭킹 (공개 테이블)
CREATE TABLE IF NOT EXISTS mock_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES mock_seasons(id),
  user_id uuid,
  nickname text,
  rank integer,
  profit_rate numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE mock_rankings ENABLE ROW LEVEL SECURITY;

-- 공개 테이블: 누구나 조회 가능, 쓰기는 service_role만
CREATE POLICY "랭킹 공개 조회" ON mock_rankings FOR SELECT USING (true);
CREATE POLICY "랭킹 서비스 생성" ON mock_rankings FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "랭킹 서비스 수정" ON mock_rankings FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "랭킹 서비스 삭제" ON mock_rankings FOR DELETE USING (auth.role() = 'service_role');
