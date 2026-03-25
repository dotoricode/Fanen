'use client';

/**
 * 랜딩 페이지 — 비로그인 사용자에게 서비스 소개
 * 섹션: Hero → FeatureCards → 반디 소개 → 요금제 미리보기 → CTA
 */
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { BandiAvatar } from '@/features/ai-coach/components/BandiAvatar';

/* ── 기능 카드 데이터 ── */
const FEATURE_CARDS = [
  { title: '세계 정세 맵', desc: '세계 정세를 지도 위에 시각화하고 수혜 기업을 자동 발굴합니다.', href: '/binah-map', icon: '🌍' },
  { title: 'AI 뉴스 분석', desc: 'AI가 뉴스를 읽고 투자 영향도를 실시간 분석합니다.', href: '/news', icon: '📰' },
  { title: '섹터 인과관계', desc: '산업 간 연결고리를 시각화하여 투자 기회를 포착합니다.', href: '/sector', icon: '📊' },
  { title: '내 포트폴리오', desc: '내 투자 현황을 한눈에 파악하고 관리합니다.', href: '/portfolio', icon: '💼' },
  { title: 'AI 코치 반디', desc: '궁금한 것은 반디에게 물어보세요. 친절하게 알려드려요.', href: '/coach', icon: '✨' },
  { title: '배당 수익률 계산기', desc: '불로소득 목표 계산기와 월배당 ETF 시뮬레이터를 제공합니다.', href: '/dividend', icon: '💰' },
] as const;

/* ── Hero Section ── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:py-28">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-200 mb-4">
          파낸 · Fanen · 세상이 움직이면, 파낸이 먼저 압니다
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          반디가 찾은 오늘의 기회,
        </h1>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mt-2">
          당신의 내일이 빛나도록
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-teal-100 sm:text-xl">
          AI 어시스턴트 반디가 글로벌 정세에서 수혜 기업을 자동 발굴합니다. 완전 무료.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-teal-700 shadow-lg transition-colors hover:bg-teal-50"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/binah-map"
            className="rounded-lg border border-white/30 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            세계 정세 보기
          </Link>
        </div>
      </div>
      {/* 배경 장식 */}
      <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gray-50 dark:bg-zinc-950 rounded-t-[2rem]" />
    </section>
  );
}

/* ── Feature Cards ── */
function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-zinc-100 sm:text-3xl">
        파낸이 제공하는 기능
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <Card className="h-full p-6 transition-shadow group-hover:shadow-md">
              <div className="mb-3 text-3xl">{card.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-teal-600 transition-colors">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">{card.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── 반디 소개 ── */
function BandiIntro() {
  return (
    <section className="bg-teal-50 dark:bg-zinc-950 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <BandiAvatar size={80} mood="happy" animate />
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-zinc-100">AI 코치 반디를 만나보세요</h2>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          궁금한 종목, 시장 동향, 불로소득 전략 — 무엇이든 반디에게 물어보세요.
        </p>
        {/* 예시 대화 */}
        <div className="mt-8 space-y-3 text-left">
          <div className="flex justify-end">
            <div className="max-w-xs rounded-2xl rounded-br-md bg-teal-600 px-4 py-2.5 text-sm text-white">
              방산 섹터 관련 주식 추천해줘요!
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <BandiAvatar size={32} mood="excited" />
            </div>
            <div className="max-w-sm rounded-2xl rounded-bl-md bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm text-gray-800 dark:text-zinc-200 shadow-sm">
              반짝이는 기회를 찾았어요! 한화에어로스페이스가 Tier 0 메이저이고, HSD엔진이 Tier 1 직접 납품사예요. 세계 정세 맵에서 수혜 기업 연결망 전체를 확인해볼까요? 🌍
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 완전 무료 안내 ── */
function FreeSection() {
  const FREE_FEATURES = [
    '세계 정세 맵 — 글로벌 이슈 + 수혜 기업 자동 발굴',
    'AI 뉴스 분석 — 무제한',
    '수혜 기업 연결망 분석 (Tier 1~3)',
    '반디 AI 코치 — 무제한',
    '불로소득 목표 계산기',
    '배당 수익률 계산기 + 월배당 ETF 시뮬레이터',
  ];
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-zinc-100 sm:text-3xl">
        파낸은 완전 무료입니다
      </h2>
      <Card className="p-6 text-center">
        <p className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-2">₩0</p>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">영원히 무료 · 신용카드 불필요</p>
        <ul className="space-y-3 text-left">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <span className="mt-0.5 text-teal-500 font-bold">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/signup"
          className="mt-6 block rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
        >
          지금 무료로 시작하기
        </Link>
      </Card>
    </section>
  );
}

/* ── CTA Section ── */
function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-teal-600 to-cyan-700 py-16 text-center text-white">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-2xl font-bold sm:text-3xl">반디와 함께 오늘의 기회를 찾아보세요</h2>
        <p className="mt-3 text-teal-100">가입 즉시 모든 기능을 무료로 사용할 수 있습니다.</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-teal-700 shadow transition-colors hover:bg-teal-50"
          >
            이메일로 가입하기
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/30 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 메인 랜딩 페이지 ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <HeroSection />
      <FeatureCards />
      <BandiIntro />
      <FreeSection />
      <CtaSection />
    </div>
  );
}
