'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 전문가 모드 / 일반인 모드 토글 버튼
 * localStorage에 'fanen-lang' 키로 상태 저장
 *
 * @example
 * <LanguageToggle onChange={(level) => console.log(level)} />
 */

/** 언어 레벨 타입 */
type LanguageLevel = 'general' | 'expert';

/** LanguageToggle Props */
interface LanguageToggleProps {
  /** 언어 레벨 변경 콜백 */
  onChange: (level: LanguageLevel) => void;
  /** 기본 언어 레벨 */
  defaultLevel?: LanguageLevel;
}

/** 언어 레벨 토글 — 전문가/일반인 모드 전환 */
export default function LanguageToggle({ onChange, defaultLevel = 'general' }: LanguageToggleProps) {
  const [level, setLevel] = useState<LanguageLevel>(defaultLevel);

  // 마운트 시 localStorage에서 상태 복원
  useEffect(() => {
    const saved = localStorage.getItem('fanen-lang');
    if (saved === 'general' || saved === 'expert') {
      setLevel(saved);
    }
  }, []);

  /** 토글 핸들러 */
  const handleToggle = useCallback(() => {
    const newLevel: LanguageLevel = level === 'general' ? 'expert' : 'general';
    setLevel(newLevel);
    localStorage.setItem('fanen-lang', newLevel);
    onChange(newLevel);
  }, [level, onChange]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
      aria-label={`현재 모드: ${level === 'general' ? '일반인' : '전문가'}`}
    >
      <span className={level === 'general' ? 'font-bold text-primary' : 'text-gray-400'}>
        일반
      </span>
      <span className="text-gray-300">/</span>
      <span className={level === 'expert' ? 'font-bold text-primary' : 'text-gray-400'}>
        전문가
      </span>
    </button>
  );
}
