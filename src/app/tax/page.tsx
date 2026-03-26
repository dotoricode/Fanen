'use client';

import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import TaxForm from '@/features/tax-simulator/components/TaxForm';

/** 세금 시뮬레이터 페이지 — 완전 무료 */
export default function TaxPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">세금 시뮬레이터</h1>
        <DisclaimerBanner variant="tax" />
        <TaxForm />
      </div>
    </main>
  );
}
