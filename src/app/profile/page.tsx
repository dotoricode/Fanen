'use client';

/**
 * 프로필 설정 페이지
 * 현재 플랜 카드 + 프로필 설정 폼
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { useSubscription } from '@/hooks/useSubscription';
import PlanBadge from '@/components/common/PlanBadge';

export default function ProfilePage() {
  const { plan, loading } = useSubscription();
  const [currentMode, setCurrentMode] = useState<string>('standard');

  useEffect(() => {
    const saved = localStorage.getItem('fanen-ui-mode') ?? 'standard';
    setCurrentMode(saved);
  }, []);

  const handleModeChange = (mode: string) => {
    const root = document.documentElement;
    root.classList.remove('senior', 'zoom', 'expert');
    if (mode === 'senior') root.classList.add('senior');
    if (mode === 'zoom')   root.classList.add('zoom');
    if (mode === 'expert') root.classList.add('expert');
    localStorage.setItem('fanen-ui-mode', mode);
    setCurrentMode(mode);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-6">내 프로필</h1>

      {/* 현재 플랜 카드 */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-zinc-400">현재 플랜</p>
            <div className="mt-1">
              {loading ? (
                <span className="text-sm text-gray-400 dark:text-zinc-500">불러오는 중...</span>
              ) : (
                <PlanBadge plan={plan} size="md" />
              )}
            </div>
          </div>
          <Link href="/pricing" className="text-sm text-primary hover:underline">
            플랜 변경
          </Link>
        </div>
      </div>

      {/* 화면 표시 모드 설정 */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-sm mb-6">
        <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">화면 표시 모드</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'standard', label: '일반', icon: '💻' },
            { value: 'expert',   label: '전문가', icon: '📊' },
            { value: 'senior',   label: '시니어', icon: '👴' },
            { value: 'zoom',     label: '확대', icon: '🔍' },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => handleModeChange(m.value)}
              className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                currentMode === m.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              <span className="text-lg">{m.icon}</span>
              <span className="ml-2">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ProfileForm />
    </div>
  );
}
