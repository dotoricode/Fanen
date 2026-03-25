# Dashboard Hub — Design Document v0.0.1

> Feature: dashboard-hub
> 작성일: 2026-03-25
> 구현 완료: 2026-03-25 (Sprint 13 이후)
> 선택 설계안: Achromatic Minimalism + Framer Motion 하이엔드 애니메이션
> 참조 커밋: `8aa6b46` `727bd48` `8a00b45` `371904b`

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 기존 shadcn-ui 카드 기반 레이아웃은 기능적이나 어드민 스타일. BINAH 브랜드("반디가 찾은 오늘의 기회")를 상단 로고부터 하단 푸터까지 하나의 유기적 경험으로 연결하는 하이엔드 UI가 필요. |
| **WHO** | 20~60대 투자자. 첫 방문에서 "이 서비스는 다르다"는 인상을 주는 것이 핵심. |
| **RISK** | (1) framer-motion v12 strict typing — `ease: string` 불가, cubic bezier 배열 필수 (2) SVG `r` keyframe → NaN 오류 (scale 대체 해결) (3) SSR에서 `getPointAtLength()` 미지원 → try/catch 처리 (4) `Bandi.png` public/ 경로 누락 |
| **SUCCESS** | 콘솔 에러 0, 라이트/다크 모드 양쪽 정상, 타이핑 푸터 동작, Animated Beam 흐름, SVG pathLength draw 동작 |
| **SCOPE** | Header BinahLogo + HubMenu 퀵메뉴 + MorningLightCard + DisclaimerBanner 푸터 |

---

## 1. 핵심 디자인 원칙

### 1.1 무채색(Achromatic) 기반

- **색상**: `zinc-*`, `white`, `black` 계열만 사용. 컬러 포인트 없음.
- **깊이**: 투명도(`/5`, `/10`, `/20`, `/60`)와 `backdrop-blur-sm`으로 레이어 표현.
- **강조**: 색이 아닌 **애니메이션의 빛**으로만 시선을 끈다.

| 용도 | 라이트 | 다크 |
|------|--------|------|
| 카드 배경 | `bg-white/60 backdrop-blur-sm` | `bg-zinc-900/60 backdrop-blur-sm` |
| 카드 테두리 | `border-white/10` | `border-white/5` |
| 주요 텍스트 | `text-zinc-900` | `text-zinc-100` |
| 보조 텍스트 | `text-zinc-500` | `text-zinc-400` |
| 태그/뱃지 | `bg-zinc-100` | `bg-zinc-800` |
| 연결선 | `stroke-zinc-200` | `stroke-zinc-700` |
| 빔 입자 | `fill-zinc-400` | `fill-zinc-300` |

### 1.2 Framer Motion 애니메이션 계층

```
페이지 로드
 └─ BinahLogo: pathLength 0→1 (1s, stagger 0.2s × 3 lines)
 └─ HubMenu
     ├─ 연결선: pathLength 0→1 (0.8s, stagger 0.15s)
     ├─ 중앙 노드: opacity+scale 0→1 (0.5s, backOut)
     └─ 위성 노드: opacity+scale 0→1 (0.5s, delay 0.5+i*0.15, spring)
 └─ MorningLightCard 카드: staggerChildren 0.12s (slide-up fade)

Idle (반복)
 └─ HubMenu 중앙 pulse: scale [1,1.11,1] + opacity [0.6,0.2,0.6] (2.5s, ∞)
 └─ BeamParticle: path 위 3초 주기 순환 (stagger 1s × 3)

Hover
 └─ BinahLogo: letterSpacing 0→0.12em (spring, stiffness 300, damping 30)
 └─ HubMenu 위성: scale 1.15 (spring, stiffness 350, damping 22)
 └─ MorningLightCard 카드: shimmer glare (CSS translate-x)
```

---

## 2. 컴포넌트 상세 설계

### 2.1 BinahLogo (`src/components/common/BinahLogo.tsx`)

**역할**: Header의 BINAH 브랜드 심볼 — SVG draw + hover letterSpacing

**SVG 구조:**
```
중앙 점 (cx=12, cy=12, r=2.5)
 ├─ 연결선 → 위성 위 (12,4)
 ├─ 연결선 → 위성 우하 (19,16)
 └─ 연결선 → 위성 좌하 (5,16)
위성 점 × 3 (r=2)
```

**애니메이션:**
```tsx
// 연결선 3개 — pathLength draw
initial={{ pathLength: 0 }}
animate={{ pathLength: 1 }}
transition={{ duration: 1, delay: i * 0.2, ease: [0.25, 0.1, 0.25, 1] }}

// 위성 점 — scale pop-in
initial={{ scale: 0, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ duration: 0.4, delay: 0.6 + i * 0.1, ease: 'backOut' }}

// BINAH 텍스트 — hover 자간 확장
variants={{ hover: { letterSpacing: '0.12em' } }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

**의존성:** `framer-motion`, `next/link`

---

### 2.2 HubMenu (`src/features/dashboard/components/HubMenu.tsx`)

**역할**: 퀵메뉴 — 삼위일체 허브 (중앙 반디 + 3대 기능 연결망)

**레이아웃:**
```
SIZE: 340×340 SVG
CENTER: (170, 170)
RADIUS: 110

위성 배치 (각도):
 비나 맵  (170,  60)  ← -90° (정북)
 Value Chain (265, 225) ← 30° (동남)
 배당 허브   (75, 225)  ← 150° (서남)
```

**Bézier 연결선:**
```
중앙→비나 맵:    M 170 170 C 170 130, 170 100, 170 60
중앙→Value Chain: M 170 170 C 210 190, 240 210, 265 225
중앙→배당 허브:   M 170 170 C 130 190, 100 210, 75 225
```

**BeamParticle 구현 (SSR 안전):**
```tsx
function BeamParticle({ pathD, delay }) {
  useAnimationFrame((time) => {
    const cycle = ((time / 1000 - delay) % 3) / 3;  // 3초 주기
    const progress = Math.max(0, Math.min(1, cycle));
    try {
      const pathEl = svgEl.querySelector(`[data-beam-path="${pathD.slice(0,10)}"]`);
      const pt = pathEl.getPointAtLength(progress * pathEl.getTotalLength());
      ref.current.setAttribute('cx', pt.x); // DOM 직접 조작 (React state 회피)
    } catch { /* SSR/렌더링 전 무시 */ }
  });
}
```

**중앙 노드 pulse (r 직접 조작 → NaN 회피):**
```tsx
// ❌ 잘못된 방식: animate={{ r: [36, 40, 36] }} → SVG r 속성에 NaN 발생
// ✅ 올바른 방식: scale 애니메이션
animate={{ scale: [1, 1.11, 1], opacity: [0.6, 0.2, 0.6] }}
style={{ originX: `${CENTER.x}px`, originY: `${CENTER.y}px` }}
transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
```

**위성 hover spring (transition 중복 주의):**
```tsx
// ❌ 잘못된 방식: whileHoverTransition (존재하지 않는 prop)
// ✅ 올바른 방식: transition 단일 통합
whileHover={{ scale: 1.15 }}
transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.5 + i * 0.15 }}
```

**의존성:** `framer-motion` (motion, useAnimationFrame, useMotionValue), `next/link`

---

### 2.3 MorningLightCard (`src/features/dashboard/components/MorningLightCard.tsx`)

**역할**: 뉴스 영역 — '반디의 모닝 라이트' 리브랜딩 (NewsCard 대체)

**카드 구조:**
```
MorningLightCard (glass container)
 ├─ Header
 │   ├─ BandiAvatar (grayscale, w-10 h-10 rounded-full ring-1)
 │   ├─ 타이틀/서브타이틀
 │   └─ "전체 보기 →" 링크
 └─ Grid (1col mobile / 3col sm+)
     └─ MorningLightItem × 3
         ├─ shimmer glare overlay (CSS group-hover)
         ├─ 이모지 + 태그 뱃지
         ├─ 제목 (font-semibold)
         └─ 요약 (line-clamp-2)
```

**Glassmorphism 컨테이너:**
```tsx
'rounded-2xl border border-white/10 dark:border-white/5'
'bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm p-6'
```

**Shimmer glare (CSS-only, group-hover):**
```tsx
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent
                  -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
</div>
```

**Stagger slide-up:**
```tsx
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};
```

**Bandi 썸네일 처리:**
```tsx
// public/Bandi.png 필수 — /Bandi.png 경로로 서빙
<Image src="/Bandi.png" fill className="object-cover grayscale" />
// ⚠️ sizes prop 추가 권장 (Next.js Image fill 경고 방지)
```

**의존성:** `framer-motion` (motion, Variants type), `next/image`, `next/link`

---

### 2.4 DisclaimerBanner (`src/components/common/DisclaimerBanner.tsx`)

**역할**: 면책 고지 — 타이핑 푸터 (노란 배너 제거, 모노 폰트 타이핑 효과)

**동작 흐름:**
```
1. IntersectionObserver (threshold: 0.5) → 뷰포트 진입 감지
2. setVisible(true) → 타이핑 시작
3. setInterval(35ms/char) → displayedText 누적
4. 타이핑 완료 시 clearInterval + 커서 사라짐
```

**타이핑 커서:**
```tsx
{displayedText.length < fullText.length && visible && (
  <motion.span
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.8, repeat: Infinity }}
    className="inline-block w-0.5 h-3 bg-zinc-400 dark:bg-zinc-600 ml-0.5 align-middle"
  />
)}
```

**variant별 문구:**
| variant | 문구 |
|---------|------|
| `default` | AI 분석 결과는 참고용이며, KRX/DART 공식 데이터를 기반으로 합니다. |
| `pack` | 본 팩은 투자 권유가 아닌 정보 제공 서비스입니다. 투자 판단은 본인에게 있습니다. |
| `tax` | 현행 세법(2026년 기준)이며 세법 변경 시 달라질 수 있습니다. 세무 전문가 확인을 권장합니다. |
| `signal` | 본 시그널은 AI 분석 결과이며 투자 판단의 근거가 아닙니다. 투자 책임은 본인에게 있습니다. |

**스타일:**
```tsx
<div className="py-6 text-center">
  <p className="font-mono text-xs text-zinc-400 dark:text-zinc-600 tracking-wide">
```

**의존성:** `framer-motion`, React `useEffect`, `useRef`, `useState`

---

## 3. DashboardHome 레이아웃

```tsx
// src/features/dashboard/DashboardHome.tsx
<div className="bg-slate-50 dark:bg-[#0F1923]">
  <div className="mx-auto max-w-7xl px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* 1: 모닝 브리핑 — full width */}
      <MorningBriefCard className="md:col-span-2 order-1" />

      {/* 2: Hub 퀵메뉴 — 모바일: 브리핑 직후, 데스크탑: 최하단 */}
      <div className="md:col-span-2 order-2 md:order-last flex justify-center py-4">
        <HubMenu />
      </div>

      {/* 3: Hot Zone 지도 — 데스크탑 좌측 2행 span */}
      <HotZoneCard className="order-3 md:row-span-2" />

      {/* 4: 섹터 Top3 */}
      <SectorTop3Card className="order-4" />

      {/* 5: 포트폴리오 */}
      <PortfolioCard className="order-5" />

      {/* 6: 모닝 라이트 — full width */}
      <MorningLightCard className="order-6 md:col-span-2" />

      {/* 면책 고지 타이핑 푸터 */}
      <div className="md:col-span-2 order-last">
        <DisclaimerBanner variant="default" />
      </div>

    </div>
  </div>
</div>
```

**모바일 순서:** MorningBriefCard → HubMenu → HotZoneCard → SectorTop3Card → PortfolioCard → MorningLightCard → DisclaimerBanner

---

## 4. 기술 결정 및 트레이드오프

| 결정 | 이유 |
|------|------|
| SVG `r` 대신 `scale` 애니메이션 | framer-motion v12에서 SVG presentation attribute 직접 keyframe 애니메이션 시 NaN 발생 |
| `ease: [0.25,0.1,0.25,1]` (cubic bezier) | framer-motion v12에서 `ease: 'easeOut'` string → `Variants` type 불일치 오류 |
| BeamParticle: DOM 직접 조작 | `useAnimationFrame`에서 React state 업데이트 시 60fps 유지 불가 → `setAttribute` 직접 조작 |
| Shimmer: CSS transition (framer-motion 아님) | group-hover `translate-x` transition은 CSS가 더 성능 우수 |
| `whileHoverTransition` 제거 | 존재하지 않는 prop — `transition`으로 통합 (spring 적용) |
| `min-h-screen` 제거 | DashboardHome에서 하단 과도한 공백 유발 |

---

## 5. 파일 영향 범위

| 파일 | 변경 유형 |
|------|---------|
| `src/components/common/BinahLogo.tsx` | 신규 생성 |
| `src/components/common/Header.tsx` | BinahLogo import 교체 |
| `src/features/dashboard/components/HubMenu.tsx` | 신규 생성 |
| `src/features/dashboard/components/MorningLightCard.tsx` | 신규 생성 (NewsCard 대체) |
| `src/components/common/DisclaimerBanner.tsx` | 전면 재작성 (타이핑 푸터) |
| `src/features/dashboard/DashboardHome.tsx` | HubMenu + MorningLightCard 적용 |
| `src/app/globals.css` | hot-zone-map CSS 추가 |
| `public/Bandi.png` | public/ 이동 (404 수정) |
| `package.json` | framer-motion v12.38.0 추가 |

---

## 6. 검증 체크리스트 (Playwright 완료)

- [x] 라이트모드: 콘솔 에러 0
- [x] 다크모드: 콘솔 에러 0
- [x] BinahLogo SVG draw 애니메이션 동작
- [x] HubMenu Animated Beam 입자 흐름
- [x] HubMenu 중앙 pulse (scale 방식, NaN 없음)
- [x] MorningLightCard stagger slide-up
- [x] MorningLightCard Bandi 이미지 grayscale
- [x] DisclaimerBanner 타이핑 푸터 동작
- [x] Hot Zone 라이트모드 배경 투명
- [x] Progress 바 양끝 rounded-full
- [x] 다크모드 카드 헤딩 텍스트 명도 정상
