/**
 * 브라우저 측 Supabase 클라이언트
 * 싱글톤 패턴으로 중복 인스턴스 생성 방지
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/** 브라우저 환경 Supabase 클라이언트 생성 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
