# Design: senior-mode-fix

> version: v0.0.1 | created: 2026-03-26 | phase: design

## Context Anchor

| | |
|---|---|
| **WHY** | Senior 모드 루트 font-size 변경이 rem 팽창 → 레이아웃 붕괴 |
| **WHO** | 고령 투자자, 시력 약자 (파낸 핵심 타깃) |
| **RISK** | CSS 변수 도입 시 기존 standard 모드 회귀 위험 |
| **SUCCESS** | Senior 모드 사이드바 겹침 0건, 글씨 명확히 크게 표시 |
| **SCOPE** | senior.css, zoom.css, globals.css, SideNav.tsx, UiModeSwitch.tsx |

---

## 1. 현재 문제 분석

```
[현재 구조]
html.senior { font-size: 120% }  ← 루트 rem 기준 변경
  └─ 모든 rem 단위 × 1.2배
     └─ 카드, nav, 버튼 등 크기 팽창
        └─ SideNav w-[220px] (px 고정) 내부 텍스트 오버플로
           └─ 콘텐츠 영역 겹침 발생
```

---

## 2. 설계 방향: CSS Variable 방식

**루트 font-size 변경을 제거하고, CSS 변수로 개별 요소 크기를 제어한다.**

```
[신규 구조]
:root { --senior-font-scale: 1; }
html.senior { --senior-font-scale: 1.25; }

senior.css 각 요소:
  font-size: calc(1rem * var(--senior-font-scale))  ← rem은 항상 16px 고정

SideNav:
  standard: w-[220px], ml-[220px]
  senior:   min-w-[260px], ml-[260px]  ← CSS 변수로 제어
```

---

## 3. 구현 명세

### 3.1 `globals.css` — CSS 변수 추가

```css
:root {
  /* Senior 모드 스케일 변수 (기본값: 1 = no effect) */
  --senior-font-scale: 1;
  --senior-sidebar-w: 220px;
}

html.senior {
  --senior-font-scale: 1.25;
  --senior-sidebar-w: 260px;
}
```

### 3.2 `senior.css` — 전면 재작성

**제거:**
```css
/* 삭제 */
.senior {
  font-size: 120%;  ← 이것이 원인
  line-height: 1.8;
}
```

**변경 후:**
```css
/* senior.css — CSS 변수 기반 폰트 스케일링 */
.senior {
  /* 루트 font-size 변경 없음 — CSS 변수로만 제어 */
  line-height: 1.8;
}

.senior button,
.senior [role="button"] {
  min-height: 52px;
  font-size: calc(0.875rem * var(--senior-font-scale));
  padding: 0.75rem 1.5rem;
}

.senior input,
.senior select,
.senior textarea {
  min-height: 52px;
  font-size: calc(0.875rem * var(--senior-font-scale));
}

/* 카드 패딩만 조정 (font-size 변경 없이) */
.senior .card,
.senior [class*="rounded"] {
  padding: 1.5rem;
}

.senior h1 { font-size: calc(1.5rem * var(--senior-font-scale)); }
.senior h2 { font-size: calc(1.25rem * var(--senior-font-scale)); }
.senior h3 { font-size: calc(1.125rem * var(--senior-font-scale)); }

.senior p,
.senior li {
  font-size: calc(0.875rem * var(--senior-font-scale));
  line-height: 1.9;
}

/* 텍스트 명도 강화 (FR-04) */
.senior .text-zinc-500,
.senior .text-gray-500,
.senior [class*="text-secondary"] {
  --tw-text-opacity: 1;
  color: rgb(63 63 70 / var(--tw-text-opacity)); /* zinc-700 */
}

.dark .senior .text-zinc-400,
.dark .senior .text-gray-400 {
  --tw-text-opacity: 1;
  color: rgb(212 212 216 / var(--tw-text-opacity)); /* zinc-300 */
}

/* CSS 레거시 변수 오버라이드 */
.senior {
  --text-secondary: #3f3f46;  /* zinc-700 (기존 #6B7280) */
}
.dark .senior {
  --text-secondary: #d4d4d8;  /* zinc-300 (기존 #a1a1aa) */
}
```

### 3.3 `SideNav.tsx` — 가변 너비 + z-index 강화

**현재:**
```tsx
<aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[220px] z-40 ...">
```

**변경:**
```tsx
{/* senior 모드 감지 */}
const [isSenior, setIsSenior] = useState(false);
useEffect(() => {
  const check = () => setIsSenior(document.documentElement.classList.contains('senior'));
  check();
  // MutationObserver로 클래스 변경 감지
  const obs = new MutationObserver(check);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => obs.disconnect();
}, []);

<aside className={`hidden md:flex flex-col fixed top-0 left-0 h-screen z-50 border-r ...
  ${isSenior ? 'w-[260px]' : 'w-[220px]'}`}>
```

**또는 순수 CSS 방식 (더 단순):**
```tsx
{/* style prop으로 CSS 변수 활용 */}
<aside
  style={{ width: 'var(--senior-sidebar-w, 220px)' }}
  className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-50 border-r ..."
>
```

→ **순수 CSS 방식 채택** (JS 상태 불필요, CSS 변수로 자동 반응)

### 3.4 레이아웃 컨테이너 (app layout)

메인 컨텐츠 영역의 `ml-[220px]`도 CSS 변수로 연동 필요.
주요 layout 파일 확인 후 동일 패턴 적용:

```tsx
<main style={{ marginLeft: 'var(--senior-sidebar-w, 220px)' }} ...>
```

### 3.5 고정 높이 처리

`senior.css`에서 `min-height` 확대 시 기존 고정 `h-[xx]` 클래스가 충돌할 수 있음.
카드/컨테이너에 `h-auto` 오버라이드 추가:

```css
.senior .card,
.senior [data-card] {
  height: auto !important;
  min-height: 0;
}
```

---

## 4. 파일별 변경 요약

| 파일 | 변경 유형 | 주요 내용 |
|------|-----------|-----------|
| `src/app/globals.css` | 추가 | `--senior-font-scale`, `--senior-sidebar-w` 변수 |
| `src/styles/senior.css` | 전면 재작성 | font-size: 120% 제거, calc(rem × scale) 방식으로 전환, 명도 강화 |
| `src/styles/zoom.css` | 수정 | font-size: 150% 제거, 동일 패턴 적용 |
| `src/components/common/SideNav.tsx` | 수정 | width → CSS 변수, z-40 → z-50 |
| `src/app/layout.tsx` (또는 dashboard layout) | 수정 | main marginLeft → CSS 변수 |

---

## 5. 구현 순서 (Session Guide)

### Module 1 — CSS 변수 기반 (Frontend Agent)
1. `globals.css` 에 `--senior-font-scale`, `--senior-sidebar-w` 추가
2. `senior.css` 전면 재작성 (font-size: 120% 제거)
3. `zoom.css` 동일 패턴 정리

### Module 2 — 레이아웃 수정 (Frontend Agent)
4. `SideNav.tsx` width CSS 변수 방식으로 변경, z-40 → z-50
5. 메인 layout 파일 marginLeft CSS 변수 연동

### Module 3 — 검증 (QA Agent)
6. Senior 모드 ON/OFF 전환 시 레이아웃 확인
7. 사이드바 겹침 여부 확인
8. 텍스트 명도 개선 확인
9. 다크모드 + Senior 조합 확인
