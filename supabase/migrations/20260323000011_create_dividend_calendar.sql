-- dividend_calendar 테이블: 배당 캘린더 (공개 테이블)
CREATE TABLE IF NOT EXISTS dividend_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_code text NOT NULL,
  stock_name text NOT NULL,
  ex_dividend_date date,
  payment_date date,
  dividend_amount numeric,
  dividend_yield numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE dividend_calendar ENABLE ROW LEVEL SECURITY;

-- 공개 테이블: 누구나 조회 가능, 쓰기는 service_role만
CREATE POLICY "배당캘린더 공개 조회" ON dividend_calendar FOR SELECT USING (true);
CREATE POLICY "배당캘린더 서비스 생성" ON dividend_calendar FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "배당캘린더 서비스 수정" ON dividend_calendar FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "배당캘린더 서비스 삭제" ON dividend_calendar FOR DELETE USING (auth.role() = 'service_role');
