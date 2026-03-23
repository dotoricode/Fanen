-- dividend_simulations 테이블: 배당 시뮬레이션 결과
CREATE TABLE IF NOT EXISTS dividend_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id uuid REFERENCES portfolios(id) ON DELETE CASCADE,
  simulation_params jsonb,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE dividend_simulations ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 시뮬레이션만 접근 가능
CREATE POLICY "배당 시뮬레이션 조회" ON dividend_simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "배당 시뮬레이션 생성" ON dividend_simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "배당 시뮬레이션 수정" ON dividend_simulations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "배당 시뮬레이션 삭제" ON dividend_simulations FOR DELETE USING (auth.uid() = user_id);
