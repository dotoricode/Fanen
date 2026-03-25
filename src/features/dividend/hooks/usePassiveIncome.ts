import { useMemo } from 'react';
import type { PassiveIncomeInput, PassiveIncomeResult } from '../types';
import { MOCK_PORTFOLIOS } from '@/lib/mock/mockDividend';

/** 투자 성향별 반디 멘트 */
function generateBandiComment(type: string, investment: number): string {
  const eok = Math.round(investment / 100_000_000);
  const man = Math.round(investment / 10_000);

  const amountStr = eok >= 1 ? `${eok}억` : `${man.toLocaleString('ko-KR')}만원`;

  const comments: Record<string, string> = {
    dividend: `${amountStr}을 고배당주 중심으로 분산하면 안정적인 월 현금흐름을 만들 수 있어요! 💰`,
    value: `${amountStr}을 저평가 우량주에 배분하면 배당과 시세 차익을 동시에 노릴 수 있어요! 📊`,
    growth: `${amountStr}을 성장 배당주에 투자하면 Value Chain 수혜까지 겸할 수 있어요! 🚀`,
    theme: `${amountStr}을 방산·반도체 수혜주에 집중하면 테마 성장 + 배당을 함께 챙길 수 있어요! 🌐`,
    etf: `${amountStr}을 월배당 ETF로 분산하면 낮은 변동성으로 꾸준한 수입을 기대할 수 있어요! 🛡️`,
  };

  return comments[type] ?? `${amountStr}으로 불로소득 포트폴리오를 구성해 보세요!`;
}

/**
 * 불로소득 역산 계산 훅
 * requiredInvestment = targetMonthlyIncome * 12 / (annualYieldPercent / 100)
 */
export function usePassiveIncome(input: PassiveIncomeInput): PassiveIncomeResult {
  return useMemo(() => {
    const requiredInvestment =
      (input.targetMonthlyIncome * 12) / (input.annualYieldPercent / 100);
    const portfolio = MOCK_PORTFOLIOS[input.portfolioType] ?? [];
    const bandiComment = generateBandiComment(input.portfolioType, requiredInvestment);

    return {
      requiredInvestment,
      recommendedPortfolio: portfolio,
      bandiComment,
      sourceUrl: 'https://www.krx.co.kr',
    };
  }, [input.targetMonthlyIncome, input.annualYieldPercent, input.portfolioType]);
}
