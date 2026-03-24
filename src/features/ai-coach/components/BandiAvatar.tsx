'use client';

/**
 * BandiAvatar — BINAH AI 코치 반디 SVG 캐릭터
 * 황금빛 발광 구체 + 5 mood + pulse 애니메이션
 * 참조: Bandi.png (황금빛 구체, 심플한 눈코입, 오라 효과)
 */

export type BandiMood = 'default' | 'happy' | 'thinking' | 'excited' | 'glowing';

interface BandiAvatarProps {
  mood?: BandiMood;
  size?: number;
  animate?: boolean;
  className?: string;
}

/* ── mood별 눈/입 렌더러 ── */

function Eyes({ mood }: { mood: BandiMood }) {
  if (mood === 'happy') {
    /* 눈웃음 — 반달형 */
    return (
      <>
        {/* 왼쪽 눈 */}
        <ellipse cx="36" cy="44" rx="7" ry="6" fill="white" />
        <path d="M29.5 44 Q36 38.5 42.5 44" fill="#1C1917" />
        {/* 오른쪽 눈 */}
        <ellipse cx="64" cy="44" rx="7" ry="6" fill="white" />
        <path d="M57.5 44 Q64 38.5 70.5 44" fill="#1C1917" />
      </>
    );
  }
  if (mood === 'thinking') {
    /* 한쪽 눈 살짝 좁아짐 */
    return (
      <>
        {/* 왼쪽 눈 (약간 좁음) */}
        <ellipse cx="36" cy="44" rx="7" ry="5" fill="white" />
        <circle cx="37" cy="45" r="3.5" fill="#1C1917" />
        {/* 오른쪽 눈 (정상) */}
        <circle cx="64" cy="44" r="7" fill="white" />
        <circle cx="65" cy="45" r="4" fill="#1C1917" />
        {/* 생각 점 3개 */}
        <circle cx="72" cy="32" r="1.5" fill="white" opacity="0.8" />
        <circle cx="76" cy="27" r="2" fill="white" opacity="0.6" />
        <circle cx="81" cy="21" r="2.5" fill="white" opacity="0.4" />
      </>
    );
  }
  if (mood === 'excited') {
    /* 크게 뜬 눈 */
    return (
      <>
        <circle cx="36" cy="43" r="9" fill="white" />
        <circle cx="37" cy="44" r="5.5" fill="#1C1917" />
        <circle cx="35" cy="41" r="1.5" fill="white" />
        <circle cx="64" cy="43" r="9" fill="white" />
        <circle cx="65" cy="44" r="5.5" fill="#1C1917" />
        <circle cx="63" cy="41" r="1.5" fill="white" />
      </>
    );
  }
  if (mood === 'glowing') {
    /* 별 모양 반짝이는 눈 */
    return (
      <>
        {/* 왼쪽 별눈 */}
        <circle cx="36" cy="44" r="7" fill="white" />
        <path
          d="M36 38 L37.2 42.4 L42 43 L38.6 46.2 L39.6 51 L36 48.4 L32.4 51 L33.4 46.2 L30 43 L34.8 42.4 Z"
          fill="#92400E"
          transform="scale(0.65) translate(21.5 22)"
        />
        {/* 오른쪽 별눈 */}
        <circle cx="64" cy="44" r="7" fill="white" />
        <path
          d="M36 38 L37.2 42.4 L42 43 L38.6 46.2 L39.6 51 L36 48.4 L32.4 51 L33.4 46.2 L30 43 L34.8 42.4 Z"
          fill="#92400E"
          transform="scale(0.65) translate(55 22)"
        />
      </>
    );
  }
  /* default */
  return (
    <>
      <circle cx="36" cy="44" r="7" fill="white" />
      <circle cx="37" cy="45" r="4" fill="#1C1917" />
      <circle cx="35.5" cy="43" r="1.2" fill="white" />
      <circle cx="64" cy="44" r="7" fill="white" />
      <circle cx="65" cy="45" r="4" fill="#1C1917" />
      <circle cx="63.5" cy="43" r="1.2" fill="white" />
    </>
  );
}

function Mouth({ mood }: { mood: BandiMood }) {
  if (mood === 'happy') {
    return <path d="M42 62 Q50 70 58 62" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />;
  }
  if (mood === 'thinking') {
    return <path d="M44 63 Q50 61 56 65" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />;
  }
  if (mood === 'excited') {
    return (
      <>
        <ellipse cx="50" cy="64" rx="8" ry="5" fill="#92400E" />
        <ellipse cx="50" cy="63" rx="6" ry="3" fill="#DC2626" />
      </>
    );
  }
  if (mood === 'glowing') {
    return <path d="M42 62 Q50 71 58 62" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />;
  }
  /* default — 작은 수평선 */
  return <rect x="44" y="61" width="12" height="3" rx="1.5" fill="#92400E" />;
}

/* ── 메인 컴포넌트 ── */

export function BandiAvatar({ mood = 'default', size = 80, animate = false, className = '' }: BandiAvatarProps) {
  const animClass =
    animate && mood === 'glowing'
      ? 'animate-[bandiGlow_1.5s_ease-in-out_infinite]'
      : animate
        ? 'animate-[bandiBreath_3s_ease-in-out_infinite]'
        : '';

  return (
    <>
      <style>{`
        @keyframes bandiBreath {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(253,230,138,0.6)); transform: scale(1); }
          50%       { filter: drop-shadow(0 0 18px rgba(253,230,138,0.95)); transform: scale(1.04); }
        }
        @keyframes bandiGlow {
          0%, 100% { filter: drop-shadow(0 0 14px rgba(253,230,138,0.9)) drop-shadow(0 0 28px rgba(163,230,53,0.5)); }
          50%       { filter: drop-shadow(0 0 28px rgba(253,230,138,1)) drop-shadow(0 0 56px rgba(163,230,53,0.8)); }
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={`${animClass} ${className}`}
        aria-label={`반디 (${mood})`}
        role="img"
      >
        <defs>
          {/* 몸체 radial gradient — 이미지 참조: 중앙 밝고 외곽 어두운 황금빛 */}
          <radialGradient id={`bandiBody-${mood}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="35%" stopColor="#FCD34D" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
          {/* 외부 오라 gradient */}
          <radialGradient id={`bandiAura-${mood}`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="rgba(253,230,138,0)" />
            <stop offset="100%" stopColor="rgba(253,230,138,0.25)" />
          </radialGradient>
        </defs>

        {/* 외부 오라 레이어 (glowing/excited일 때 더 밝음) */}
        <circle
          cx="50" cy="50" r="48"
          fill={`url(#bandiAura-${mood})`}
          opacity={mood === 'glowing' ? 1 : mood === 'excited' ? 0.8 : 0.5}
        />
        <circle
          cx="50" cy="50" r="44"
          fill="rgba(253,230,138,0.12)"
        />

        {/* 몸체 메인 원 */}
        <circle cx="50" cy="50" r="40" fill={`url(#bandiBody-${mood})`} />

        {/* glowing mode 추가 빛 효과 */}
        {(mood === 'glowing' || mood === 'excited') && (
          <circle cx="50" cy="50" r="40" fill="rgba(253,246,178,0.15)" />
        )}

        {/* 하이라이트 (왼쪽 상단 밝은 반사) */}
        <ellipse cx="37" cy="32" rx="10" ry="7" fill="rgba(255,255,255,0.35)" transform="rotate(-20 37 32)" />

        {/* 눈 */}
        <Eyes mood={mood} />

        {/* 입 */}
        <Mouth mood={mood} />

        {/* 바닥 그림자/반사 (이미지의 황금빛 바닥 반사광) */}
        <ellipse cx="50" cy="93" rx="22" ry="5" fill="rgba(253,230,138,0.35)" />

        {/* 오라 흐름 파티클 (excited/glowing) */}
        {(mood === 'excited' || mood === 'glowing') && (
          <>
            <circle cx="16" cy="38" r="2" fill="rgba(253,230,138,0.7)" />
            <circle cx="84" cy="30" r="1.5" fill="rgba(253,230,138,0.6)" />
            <circle cx="80" cy="68" r="2" fill="rgba(163,230,53,0.6)" />
            <circle cx="20" cy="62" r="1.5" fill="rgba(253,230,138,0.5)" />
          </>
        )}
      </svg>
    </>
  );
}

export default BandiAvatar;
