# Design: dashboard-ux-normalize v0.0.1

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 미니멀 리디자인이 어포던스를 희생시켜 신규 사용자 이탈 위험 증가 |
| **WHO** | 20~60대 일반 투자자, 첫 방문 사용자 |
| **RISK** | TopoJSON 패키지 추가, SVG foreignObject 브라우저 호환 |
| **SUCCESS** | 세계 지도 실루엣 + 카드 버튼 퀵 메뉴 표시 확인 |
| **SCOPE** | BinahMapLite.tsx, HubMenu.tsx, binah.prd.md |

## 1. Overview

미니멀리즘 리디자인으로 손실된 두 가지 핵심 UI 맥락을 복구한다:
1. **비나 맵**: 세계 지도 실루엣 배경 복구 + GeoEvent 툴팁
2. **HubMenu**: 추상적 원 노드 → 텍스트 카드 버튼

선택 아키텍처: **Option C — Pragmatic Balance**
- Bézier 연결선 + BeamParticle 애니메이션 유지
- SVG 내부 구조 최소 변경
- `<foreignObject>` 대신 SVG rect + text 기반 카드 (호환성 우선)

## 2. BinahMapLite 설계

### 2.1 세계 지도 렌더링

```
데이터 흐름:
  public/world-110m.json
    └── fetch('/world-110m.json')
    └── topojson.feature(topo, topo.objects.countries)
    └── GeoJSON FeatureCollection
    └── equirectangular 수식으로 path 좌표 변환
    └── SVG <path> 배열 렌더링
```

**좌표 변환 함수 (기존 유지)**:
```typescript
function lonToX(lon: number, w: number) { return ((lon + 180) / 360) * w; }
function latToY(lat: number, h: number) { return ((90 - lat) / 180) * h; }
```

**GeoJSON path → SVG path 변환**:
```typescript
function geoFeatureToSvgPath(feature: GeoJSON.Feature, w: number, h: number): string
// MultiPolygon, Polygon 모두 처리
// 각 ring: "M x,y L x,y ... Z" 형식
```

**스타일**:
- Light: `fill-zinc-200 stroke-zinc-300`, `strokeWidth={0.3}`
- Dark: `fill-zinc-800/50 stroke-zinc-700`, `strokeWidth={0.3}`

### 2.2 GeoEvent 툴팁

```typescript
// 상태
const [tooltip, setTooltip] = useState<{
  x: number; y: number; title: string; summary: string;
} | null>(null);

// 트리거: GeoEvent 핀 circle의 onMouseEnter/onMouseLeave
// 위치: SVG 좌표 기반 (핀 cx + 8, cy - 8)
// 표시: title (bold) + summary 최대 2줄
```

**툴팁 SVG 요소** (SVG 내부, foreignObject 미사용):
```
<g> rect(배경, rx=4) + text(제목) + text(요약, 최대 40자)
위치: 오버플로우 방지 위해 경계 보정
```

## 3. HubMenu 카드 버튼 설계

### 3.1 현재 구조 vs 개선 구조

| 현재 | 개선 |
|------|------|
| `<circle r={28}>` + 아이콘 + 텍스트(label만) | SVG rect 카드 + 아이콘 + title + sub description |
| 클릭 영역: 원형 | 클릭 영역: 사각형 카드 (더 큰 히트 영역) |
| hover: scale만 | hover: border 색상 변화 + 그림자 (affordance) |

### 3.2 카드 버튼 SVG 구조

```
카드 크기: 72×60 (rx=10 rounded rect)
중심 위치: 기존 위성 cx, cy 유지 (170,60 / 265,225 / 75,225)
레이아웃:
  ├── rect (배경 + border)
  ├── icon (16×16, 카드 상단 중앙)
  ├── text label (한글명, 11px bold)
  └── text sub (영문/설명, 9px, zinc-400)
```

**SATELLITES 데이터 확장**:
```typescript
{
  label: '비나 맵',
  sub: '글로벌 정세 시각화',
  href: '/binah-map',
  cx: 170, cy: 60,
  icon: <path ... />
}
// 기존 sub 텍스트를 의미있는 설명으로 교체:
// '비나 맵' → sub: '글로벌 정세 시각화'
// 'Value Chain' → sub: '산업 가치 사슬 분석'
// '배당 허브' → sub: '배당·ETF 시뮬레이터'
```

**hover 효과 (motion.g)**:
```tsx
whileHover={{ scale: 1.06 }}
// + CSS class 토글로 rect stroke 강조
// framer-motion animate 대신 Tailwind group-hover 사용
```

### 3.3 Bézier 연결선 기준점 유지

위성 노드 cx, cy 값이 동일하므로 CURVES 배열 변경 없음.

## 4. PRD 업데이트 설계

`docs/00-pm/binah.prd.md` section 13.3 NFR 테이블에 행 추가:

```markdown
| **어포던스** | 모든 인터랙티브 요소는 텍스트 레이블·아이콘·hover 피드백을 포함해 처음 방문자도 기능을 즉시 인식할 수 있어야 함 |
```

## 5. 파일 영향도

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `package.json` | 의존성 추가 | `topojson-client`, `@types/topojson-client` |
| `public/world-110m.json` | 신규 | TopoJSON 세계 지도 데이터 |
| `src/features/binah-map/components/BinahMapLite.tsx` | 수정 | 세계 지도 + 툴팁 |
| `src/features/dashboard/components/HubMenu.tsx` | 수정 | 카드 버튼 위성 노드 |
| `docs/00-pm/binah.prd.md` | 수정 | section 13.3 affordance 행 |

## 6. 구현 가이드 (Session Guide)

### Module 1: 의존성 + 데이터
- `npm install topojson-client @types/topojson-client --legacy-peer-deps`
- `public/world-110m.json` — topojson.world 110m 데이터 (fetch from CDN or bundle)

### Module 2: BinahMapLite 세계 지도
- `geoFeatureToSvgPath()` 유틸 함수 추가
- `useEffect`로 world-110m.json fetch + topojson.feature 변환
- SVG `<path>` 배열 렌더링 (지도 레이어가 핀 레이어 아래)

### Module 3: BinahMapLite 툴팁
- `tooltip` state 추가
- GeoEvent 핀 mouseEnter/Leave 핸들러
- SVG 내부 툴팁 요소 (rect + text)

### Module 4: HubMenu 카드 버튼
- SATELLITES sub 설명 텍스트 업데이트
- circle → rect 카드 구조로 교체
- motion.g hover 효과 업데이트

### Module 5: PRD 업데이트
- binah.prd.md section 13.3 테이블에 affordance 행 삽입
