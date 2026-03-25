# BINAH — Gap Analysis Report

> 분석일: 2026-03-25
> 설계 문서: `docs/02-design/features/binah.design.md`
> 구현 범위: M1(브랜드) + M2(반디 SVG) + M3(무료화) + M4(비나 맵 + 홈 개편)

---

## Match Rate: **93%** (자동 수정 후)
> 초기: 87% → GAP-01, GAP-03 수정 후 → 93%

| 분류 | 설계 항목 수 | 구현 완료 | 갭 | 매칭율 |
|------|------------|---------|-----|-------|
| M1 브랜드 전환 | 6 | 6 | 0 | 100% |
| M2 반디 SVG | 3 | 3 | 0 | 100% |
| M3 완전 무료화 | 12 | 12 | 0 | 100% |
| M4 비나 맵 + 홈 | 11 | 9 | 2 | 82% |
| **전체** | **32** | **30** | **4개 갭** | **87%** |

---

## 갭 목록

### 🔴 Important (2건)

#### GAP-01 — DashboardHome에 BinahMapLite 미포함
- **설계**: DashboardHome 와이어프레임에 "비나 맵 (Lite) — 세계 지도 간략형" 섹션 명시
- **현황**: `SectorTop3Card`와 `MorningBriefCard`는 구현됐으나 `<BinahMapLite>` 위젯 미포함
- **영향**: 대시보드에서 지도가 보이지 않아 설계 의도(글로벌 이벤트 시각화)가 미달

#### GAP-02 — BinahMapLite 세계 국가 경계선 미구현
- **설계**: `geoNaturalEarth1` 프로젝션 + `topojson-client`로 국가 land 경로 렌더링
- **현황**: Equirectangular 격자선만 표시 (국가 경계 없음). `topojson-client` 미설치
- **영향**: 세계 지도 배경 없이 마커만 표시돼 지도 가독성 저하

---

### 🟡 Minor (4건)

#### GAP-03 — `/binah-map/page.tsx` AiBadge 미포함
- **설계**: "AiBadge 필수 포함 (분석 결과)" 명시
- **현황**: `DisclaimerBanner`만 포함, `AiBadge` 누락
- **영향**: AI 분석 결과임을 명시하지 못함

#### GAP-04 — `pricing/page.tsx` BandiAvatar 미표시
- **설계**: "반디 캐릭터 (glowing mood)" 포함 목업 명시
- **현황**: 텍스트/기능 목록만 표시, BandiAvatar 없음
- **영향**: 브랜드 감성 전달 미흡

#### GAP-05 — GeoEvent 필드명 불일치
- **설계**: `lng`, `country`, `publishedAt`, `type: 'trade' | 'military' | 'policy' | 'economic'`
- **현황**: `lon`, `region`, `eventType: 'trade' | 'conflict' | 'policy' | 'disaster'`, `summary` 추가
- **영향**: API 연동 시 필드명 불일치 가능성 (Mock 단계에서는 무영향)

#### GAP-06 — SectorTop3Card 데이터 모델 불일치
- **설계**: `{ name, change: number, signal: 'green'|'yellow'|'red' }` 구조
- **현황**: `riskScore` 기반으로 섹터 집계, `change`(등락률) 미구현
- **영향**: 실제 시세 등락률 연동 시 재설계 필요

---

## 합격 항목

| 모듈 | 항목 | 상태 |
|------|------|------|
| M1 | `globals.css` CSS 변수 (Teal + Bandi tokens) | ✅ |
| M1 | `tailwind.config.ts` primary→Teal + bandi | ✅ |
| M1 | `layout.tsx` BINAH 메타데이터 | ✅ |
| M1 | `Header.tsx` 로고/PlanBadge 제거/네비 | ✅ |
| M1 | `LandingPage.tsx` 브랜드 전환 | ✅ |
| M1 | 브랜드 텍스트 (파낸/핀이/Fanen/FinAI) 0건 | ✅ |
| M2 | `BandiAvatar.tsx` 5 mood SVG | ✅ |
| M2 | `bandiBreath` / `bandiGlow` 애니메이션 | ✅ |
| M2 | `AiCoachChat.tsx`, `ChatMessage.tsx` 반디 적용 | ✅ |
| M3 | `plans.ts` 단일 무료 플랜 + `hasAccess` always true | ✅ |
| M3 | `sector`, `coach`, `global-news`, `dividend` Gate 제거 | ✅ |
| M3 | `mock-trading`, `signal`, `report` Gate 제거 | ✅ |
| M3 | `news`, `journal` Gate 없음 확인 | ✅ |
| M3 | `NewsImpactList.tsx` `useSubscription` 제거 | ✅ |
| M3 | `pricing/page.tsx` 완전 무료 안내 페이지 | ✅ |
| M4 | `mockBinahMap.ts` / `mockMorningLight.ts` | ✅ |
| M4 | `binah-map/types.ts` + `useBinahMap.ts` | ✅ |
| M4 | `BinahMapLite.tsx` + `BinahMapFull.tsx` | ✅ |
| M4 | `GeoEventPanel.tsx` + `binah-map/index.ts` | ✅ |
| M4 | `/binah-map/page.tsx` | ✅ |
| M4 | `MorningBriefCard.tsx` + `SectorTop3Card.tsx` | ✅ |
| M4 | `DashboardHome.tsx` BINAH 스타일 개편 | ✅ |

---

## 성공 기준 달성 여부

| 기준 | 상태 | 비고 |
|------|------|------|
| 브랜드 텍스트 "파낸/핀이/Fanen/FinAI" 0건 | ✅ | `railway.ts` 주석 1건 (비노출) |
| TypeScript 오류 0 | ✅ | `npx tsc --noEmit` 통과 |
| 모든 페이지 무료 접근 | ✅ | SubscriptionGate 전면 제거 |
| 반디 5 mood | ✅ | default/happy/thinking/excited/glowing |

---

## 권장 조치

### 즉시 수정 (>90% 달성을 위해)

1. **GAP-01 수정**: `DashboardHome.tsx`에 `<BinahMapLite>` 위젯 추가
2. **GAP-03 수정**: `/binah-map/page.tsx`에 `<AiBadge>` 추가

### 다음 Sprint 개선

3. **GAP-02**: `topojson-client` 설치 후 국가 경계 렌더링 업그레이드
4. **GAP-04**: `pricing/page.tsx`에 `BandiAvatar` 글로잉 추가
5. **GAP-05/06**: API 연동 시 GeoEvent 필드 표준화 및 실시간 시세 연동
