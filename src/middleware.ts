/**
 * Next.js 미들웨어 — Supabase 세션 갱신 및 인증 보호
 * 모든 요청에서 세션 쿠키를 갱신하고, 보호 경로에서 미인증 시 로그인으로 리다이렉트
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/** 인증이 필요한 보호 경로 목록 */
const PROTECTED_ROUTES = ['/profile', '/portfolio', '/coach', '/journal', '/mock-trading', '/dividend', '/sector', '/signal', '/report', '/tax'];

/** 인증된 사용자가 접근할 필요 없는 Auth 전용 경로 */
const AUTH_ONLY_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 테스트 모드: NEXT_PUBLIC_BYPASS_AUTH=true 설정 시 인증 전체 스킵
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
    return supabaseResponse;
  }

  // Supabase 환경변수 미설정 또는 플레이스홀더인 경우 미들웨어 스킵
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl.startsWith('http') || !supabaseAnonKey || supabaseAnonKey.includes('your-')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 — 쿠키 기반 세션 유지
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호 경로 접근 시 인증 확인
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    // 미인증 → 로그인 후 원래 경로 복귀를 위해 next 파라미터 포함
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // 이미 로그인한 사용자가 Auth 전용 경로 접근 시 홈으로 리다이렉트
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthOnlyRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

/** 미들웨어 적용 경로 설정 — 정적 리소스 제외 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
