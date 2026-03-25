# Changelog

## [2026-03-25] — Value Chain 분석 피처 완료

### Added
- `src/features/value-chain/` 전체 구조 신규 생성
  - `types.ts` — ValueChainNode, ValueChain, TierLevel, SignalType 타입 정의
  - `components/ValueChainView.tsx` — D3 Sankey 다이어그램 (데스크톱) + 모바일 계층 리스트
  - `components/TierBadge.tsx` — T0/T1/T2/T3 색상 뱃지
  - `components/CompanyCard.tsx` — 신호등 + 배당률 + 반디 설명 + AiBadge
  - `hooks/useValueChain.ts` — 섹터 파라미터 → mock 데이터 조회
  - `mock/mockValueChains.ts` — 방산/반도체/2차전지 3종 × 8노드 (24개 기업)
- `src/app/value-chain/page.tsx` — /value-chain?sector={sector} 페이지
- BinahMap 섹터 드릴다운 → /value-chain 연결
- 헤더 네비게이션에 Value Chain 메뉴 추가

### Changed
- Plan v0.0.1 → v0.0.2 (d3-sankey 설치 후 Sankey 다이어그램으로 재설계)
- 초기 구현의 계층 리스트 → 실제 D3 Sankey 다이어그램으로 업그레이드

### Fixed
- Gap-1: D3 dynamic import 미적용 → `next/dynamic` 추가 (SSR 번들 오류 방지)
- Gap-2: ResizeObserver Sankey 재계산 미완 → `containerWidth` state로 강제 재계산
- Gap-3: AiBadge source prop 누락 → CompanyCard에서 `source={node.sourceUrl}` 전달
- Design Match Rate: 93% → 100% (모든 이슈 해결)

### Quality
- TypeScript strict 오류: 0건
- CLAUDE.md 원칙 준수: 4/4 (DisclaimerBanner, AiBadge+sourceUrl, AI 환각방지)
- PDCA Cycle: 완전 선순환 (Plan → Design → Do → Check → Act)

---

## Sprint 11 BINAH 요약

| 피처 | 상태 | Duration |
|------|------|----------|
| BinahMap World Event Tracker | ✅ Complete | 6일 |
| DashboardHome 리디자인 | ✅ Complete | 3일 |
| **Value Chain 분석** | ✅ Complete | 6일 |
| BandiAvatar SVG + 핀이→반디 rename | ✅ Complete | 2일 |

Sprint 11 전체: **17일** (2026-03-19~2026-03-25)
