-- news_impacts 테이블: 뉴스 영향 분석 (공개 테이블)
CREATE TABLE IF NOT EXISTS news_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  source text,
  published_at timestamptz,
  impact_score numeric,
  affected_sectors text[],
  affected_stocks text[],
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE news_impacts ENABLE ROW LEVEL SECURITY;

-- 공개 테이블: 누구나 조회 가능, 쓰기는 service_role만
CREATE POLICY "뉴스 공개 조회" ON news_impacts FOR SELECT USING (true);
CREATE POLICY "뉴스 서비스 생성" ON news_impacts FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "뉴스 서비스 수정" ON news_impacts FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "뉴스 서비스 삭제" ON news_impacts FOR DELETE USING (auth.role() = 'service_role');
