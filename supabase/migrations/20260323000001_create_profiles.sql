-- profiles 테이블: 사용자 프로필 정보
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text,
  age_group text CHECK (age_group IN ('20s','30s','40s','50s','60s+')),
  ui_mode text DEFAULT 'standard' CHECK (ui_mode IN ('standard','senior')),
  language_level text DEFAULT 'general' CHECK (language_level IN ('general','expert')),
  investment_type text CHECK (investment_type IN ('aggressive','balanced','conservative')),
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 접근 가능
CREATE POLICY "사용자 프로필 접근" ON profiles
  FOR ALL USING (auth.uid() = id);
