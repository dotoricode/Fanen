/**
 * Supabase Auth OAuth 콜백 핸들러
 * OAuth 인증 완료 후 code를 세션으로 교환
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/auth/callback — OAuth 콜백 처리 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 인증 성공 → 대시보드로 리다이렉트
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // 인증 실패 → 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
