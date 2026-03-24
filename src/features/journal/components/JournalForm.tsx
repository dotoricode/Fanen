'use client';

/**
 * 투자 일지 생성/수정 겸용 모달 폼
 */
import { useState, useEffect } from 'react';
import { EMOTION_CONFIG } from '../types';
import type { TradeJournalRow, EmotionType } from '../types';

/** JournalForm 제출 데이터 타입 */
interface JournalFormData {
  stock_code?: string;
  stock_name?: string;
  note: string;
  emotion: EmotionType;
}

interface JournalFormProps {
  /** 수정 시 기존 일지 데이터 (생성 시 null) */
  initial?: TradeJournalRow | null;
  onSubmit: (data: JournalFormData) => Promise<void>;
  onClose: () => void;
}

const EMOTION_TYPES = Object.keys(EMOTION_CONFIG) as EmotionType[];
const MAX_NOTE_LENGTH = 500;

/** 투자 일지 생성/수정 모달 폼 */
export default function JournalForm({ initial, onSubmit, onClose }: JournalFormProps) {
  const [stockCode, setStockCode] = useState('');
  const [stockName, setStockName] = useState('');
  const [emotion, setEmotion] = useState<EmotionType>('neutral');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** 수정 모드일 때 초기값 설정 */
  useEffect(() => {
    if (initial) {
      setStockCode(initial.stock_code ?? '');
      setStockName(initial.stock_name ?? '');
      setEmotion((initial.emotion as EmotionType) ?? 'neutral');
      setNote(initial.note ?? '');
    }
  }, [initial]);

  const isEdit = Boolean(initial);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!note.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit({
        stock_code: stockCode.trim() || undefined,
        stock_name: stockName.trim() || undefined,
        note: note.trim(),
        emotion,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  /** 모달 배경 클릭 시 닫기 */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-form-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        {/* 모달 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <h2 id="journal-form-title" className="text-lg font-semibold text-gray-900">
            {isEdit ? '일지 수정' : '새 일지 작성'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* 종목 정보 (선택) */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="stock-code" className="mb-1.5 block text-sm font-medium text-gray-700">
                종목코드 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                id="stock-code"
                type="text"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                placeholder="예: 005930"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="stock-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                종목명 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                id="stock-name"
                type="text"
                value={stockName}
                onChange={(e) => setStockName(e.target.value)}
                placeholder="예: 삼성전자"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 감정 선택 */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-gray-700">오늘의 감정</p>
            <div className="grid grid-cols-4 gap-2">
              {EMOTION_TYPES.map((type) => {
                const config = EMOTION_CONFIG[type];
                const isSelected = emotion === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEmotion(type)}
                    className={
                      isSelected
                        ? 'rounded-xl border-2 border-blue-500 bg-blue-50 px-4 py-3 text-center transition-colors'
                        : 'rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-center hover:border-gray-300 transition-colors'
                    }
                    aria-pressed={isSelected}
                    aria-label={config.label}
                  >
                    <span className="block text-xl leading-none">{config.emoji}</span>
                    <span
                      className={`mt-1 block text-xs font-medium ${
                        isSelected ? 'text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 노트 */}
          <div className="mb-5">
            <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-gray-700">
              기록 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="오늘의 투자 기록, 판단 근거, 느낀 점을 자유롭게 작성하세요."
              rows={5}
              maxLength={MAX_NOTE_LENGTH}
              required
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {note.length} / {MAX_NOTE_LENGTH}자
            </p>
          </div>

          {/* 에러 메시지 */}
          {submitError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !note.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '저장 중...' : isEdit ? '수정 완료' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
