# supabase/ CLAUDE.md

## 마이그레이션 파일 명명 규칙
`YYYYMMDDHHmmss_description.sql`

예시: `20260323000001_create_profiles.sql`

## RLS 정책 필수 적용 원칙
모든 테이블에 반드시 RLS를 활성화하고 정책을 함께 작성한다.

```sql
ALTER TABLE 테이블명 ENABLE ROW LEVEL SECURITY;
```

## 테이블 분류

### 사용자 데이터 테이블 (auth.uid() = user_id 정책)
- profiles (단, id = auth.uid() 매칭)
- portfolios
- dividend_simulations
- mock_accounts
- mock_trades
- trade_journals

### 공개 테이블 (SELECT TO public USING (true))
- news_impacts
- sector_causal_maps
- mock_seasons
- dividend_calendar
- mock_rankings

공개 테이블의 INSERT/UPDATE/DELETE는 service_role 전용이다.

## Supabase CLI 명령어
```bash
# 로컬 Supabase 시작
supabase start

# 새 마이그레이션 생성
supabase migration new 설명

# 마이그레이션 적용
supabase db push

# 타입 생성
supabase gen types typescript --local > src/types/database.types.ts
```
