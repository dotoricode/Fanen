-- mock_trades 테이블: 모의투자 거래 내역
CREATE TABLE IF NOT EXISTS mock_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES mock_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_code text NOT NULL,
  stock_name text NOT NULL,
  trade_type text NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  quantity integer NOT NULL,
  price numeric NOT NULL,
  traded_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE mock_trades ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 거래만 접근 가능
CREATE POLICY "모의거래 조회" ON mock_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "모의거래 생성" ON mock_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "모의거래 수정" ON mock_trades FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "모의거래 삭제" ON mock_trades FOR DELETE USING (auth.uid() = user_id);
