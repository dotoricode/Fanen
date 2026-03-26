'use client';

import { useState, useEffect } from 'react';
import { mockSectorData } from '../mock/mockSectorData';
import type { ValueChain } from '../types';

/**
 * useSectorAnalysis — 섹터별 분석 데이터 훅
 * v0.0.1: mock 데이터 반환 (향후 Railway FastAPI로 교체 예정)
 *
 * @param sector - 섹터 키 ("defense" | "semiconductor" | "battery")
 *                 null 전달 시 "defense" 기본값 사용
 */
export function useSectorAnalysis(sector: string | null) {
  const [chain, setChain] = useState<ValueChain | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const key = sector ?? 'defense';
    setIsLoading(true);
    // v0.0.1: mock 데이터 반환 (향후 Railway API로 교체)
    const data = mockSectorData[key] ?? mockSectorData['defense'];
    setChain(data);
    setIsLoading(false);
  }, [sector]);

  return { chain, isLoading, error };
}
