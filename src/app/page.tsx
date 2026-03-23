import Link from 'next/link';

/**
 * 홈 페이지 — 서비스 준비 중 플레이스홀더
 * 서버 컴포넌트 (클라이언트 상호작용 없음)
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center">
        {/* 서비스명 */}
        <h1 className="mb-4 text-5xl font-bold text-primary">파낸</h1>

        {/* 슬로건 */}
        <p className="mb-8 text-xl text-gray-600">
          세상이 움직이면, 파낸이 먼저 압니다
        </p>

        {/* 서비스 준비 중 안내 */}
        <p className="mb-8 text-gray-400">서비스 준비 중입니다</p>

        {/* 로그인 버튼 */}
        <Link
          href="/login"
          className="inline-block rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-600"
        >
          시작하기
        </Link>
      </div>
    </main>
  );
}
