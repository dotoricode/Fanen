'use client';

/**
 * 포트폴리오 생성/수정 모달 폼 컴포넌트
 * initial이 null이면 생성, 값이 있으면 수정
 */
import { useState, useEffect, type FormEvent } from 'react';
import type { PortfolioRow } from '../types';

interface PortfolioFormProps {
  /** null이면 신규 생성, 값이 있으면 수정 */
  initial?: PortfolioRow | null;
  onSubmit: (data: {
    name: string;
    description: string;
    total_value: number;
  }) => Promise<void>;
  onClose: () => void;
}

export default function PortfolioForm({ initial, onSubmit, onClose }: PortfolioFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  /** 만원 단위 입력값 */
  const [totalValueMan, setTotalValueMan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /* 수정 모드일 때 초기값 채우기 */
  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? '');
      // 원 → 만원 변환
      setTotalValueMan(String(Math.round(initial.total_value / 10000)));
    } else {
      setName('');
      setDescription('');
      setTotalValueMan('');
    }
  }, [initial]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('포트폴리오명을 입력해주세요');
      return;
    }

    const manValue = Number(totalValueMan);
    if (!totalValueMan || isNaN(manValue) || manValue < 0) {
      setFormError('올바른 평가금액을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      // 만원 → 원 변환
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        total_value: manValue * 10000,
      });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(initial);

  return (
    /* 오버레이 */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {/* 모달 카드 */}
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          {isEdit ? '포트폴리오 수정' : '새 포트폴리오'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* 포트폴리오명 */}
          <div>
            <label htmlFor="pf-name" className="mb-1 block text-sm font-medium text-gray-700">
              포트폴리오명 <span className="text-red-500">*</span>
            </label>
            <input
              id="pf-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 배당주 포트폴리오"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label
              htmlFor="pf-description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              설명 (선택)
            </label>
            <textarea
              id="pf-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="포트폴리오에 대한 간단한 설명을 입력하세요"
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 평가금액 (만원 단위 입력) */}
          <div>
            <label
              htmlFor="pf-total-value"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              평가금액 (만원) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="pf-total-value"
                type="number"
                min="0"
                step="1"
                value={totalValueMan}
                onChange={(e) => setTotalValueMan(e.target.value)}
                placeholder="예: 1000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <span className="shrink-0 text-sm text-gray-500">만원</span>
            </div>
            {totalValueMan && !isNaN(Number(totalValueMan)) && (
              <p className="mt-1 text-xs text-gray-400">
                = {(Number(totalValueMan) * 10000).toLocaleString('ko-KR')}원
              </p>
            )}
          </div>

          {/* 폼 에러 */}
          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}

          {/* 버튼 그룹 */}
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '저장 중...' : isEdit ? '수정 완료' : '포트폴리오 추가'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
