-- mock_accounts 테이블: 모의투자 계좌
CREATE TABLE IF NOT EXISTS mock_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id uuid REFERENCES mock_seasons(id),
  initial_balance numeric NOT NULL DEFAULT 10000000,
  current_balance numeric NOT NULL DEFAULT 10000000,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE mock_accounts ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 계좌만 접근 가능
CREATE POLICY "모의계좌 조회" ON mock_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "모의계좌 생성" ON mock_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "모의계좌 수정" ON mock_accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "모의계좌 삭제" ON mock_accounts FOR DELETE USING (auth.uid() = user_id);
