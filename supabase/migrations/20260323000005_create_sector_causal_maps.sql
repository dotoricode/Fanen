-- sector_causal_maps 테이블: 섹터 인과 관계 맵 (공개 테이블)
CREATE TABLE IF NOT EXISTS sector_causal_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_sector text NOT NULL,
  to_sector text NOT NULL,
  causal_strength numeric,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE sector_causal_maps ENABLE ROW LEVEL SECURITY;

-- 공개 테이블: 누구나 조회 가능, 쓰기는 service_role만
CREATE POLICY "섹터맵 공개 조회" ON sector_causal_maps FOR SELECT USING (true);
CREATE POLICY "섹터맵 서비스 생성" ON sector_causal_maps FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "섹터맵 서비스 수정" ON sector_causal_maps FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "섹터맵 서비스 삭제" ON sector_causal_maps FOR DELETE USING (auth.role() = 'service_role');
