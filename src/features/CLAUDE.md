# src/features/ CLAUDE.md

## 용도
기능별 컴포넌트 모음. 각 feature는 독립적으로 관리된다.

## 디렉토리 구조 예시
```
features/
├── portfolio/
│   ├── components/     # 포트폴리오 전용 컴포넌트
│   ├── hooks/          # 포트폴리오 전용 훅
│   ├── utils/          # 포트폴리오 전용 유틸리티
│   └── types.ts        # 포트폴리오 전용 타입
├── news/
│   ├── components/
│   ├── hooks/
│   └── types.ts
├── mock-trading/
│   ├── components/
│   ├── hooks/
│   └── types.ts
└── dividend/
    ├── components/
    ├── hooks/
    └── types.ts
```

## 핵심 원칙
- **feature 간 직접 import 금지**: 공통 모듈은 `lib/`나 `components/common/` 경유
- 각 feature 폴더 내부에서만 사용하는 컴포넌트, 훅, 유틸리티를 관리
- feature 외부에서 사용해야 하는 것은 `components/common/` 또는 `lib/`로 승격
