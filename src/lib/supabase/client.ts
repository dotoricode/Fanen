/**
 * 브라우저 측 Supabase 클라이언트
 * 싱글톤 패턴으로 중복 인스턴스 생성 방지
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/** 브라우저 환경 Supabase 클라이언트 생성 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
