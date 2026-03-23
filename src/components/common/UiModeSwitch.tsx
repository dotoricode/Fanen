'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Standard / Senior 모드 전환 스위치
 * Senior 모드 시 document.documentElement에 'senior' 클래스 추가
 * localStorage에 'fanen-ui-mode' 키로 상태 저장
 *
 * @example
 * <UiModeSwitch onToggle={(mode) => console.log(mode)} />
 */

/** UI 모드 타입 */
type UiMode = 'standard' | 'senior';

/** UiModeSwitch Props */
interface UiModeSwitchProps {
  /** 모드 변경 콜백 */
  onToggle?: (mode: UiMode) => void;
}

/** UI 모드 전환 스위치 — Standard/Senior 모드 */
export default function UiModeSwitch({ onToggle }: UiModeSwitchProps) {
  const [mode, setMode] = useState<UiMode>('standard');

  // 마운트 시 localStorage에서 상태 복원
  useEffect(() => {
    const saved = localStorage.getItem('fanen-ui-mode');
    if (saved === 'standard' || saved === 'senior') {
      setMode(saved);
      if (saved === 'senior') {
        document.documentElement.classList.add('senior');
      }
    }
  }, []);

  /** 모드 전환 핸들러 */
  const handleToggle = useCallback(
    (newMode: UiMode) => {
      setMode(newMode);
      localStorage.setItem('fanen-ui-mode', newMode);

      if (newMode === 'senior') {
        document.documentElement.classList.add('senior');
      } else {
        document.documentElement.classList.remove('senior');
      }

      onToggle?.(newMode);
    },
    [onToggle]
  );

  return (
    <div className="inline-flex rounded-lg border border-gray-300" role="radiogroup" aria-label="UI 모드 선택">
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'standard'}
        onClick={() => handleToggle('standard')}
        className={`rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
          mode === 'standard'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Standard
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'senior'}
        onClick={() => handleToggle('senior')}
        className={`rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${
          mode === 'senior'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Senior
      </button>
    </div>
  );
}
