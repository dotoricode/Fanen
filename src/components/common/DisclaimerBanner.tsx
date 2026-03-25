'use client';

/**
 * 면책 고지 배너 컴포넌트 (타이핑 애니메이션 푸터 버전)
 * 모든 분석 화면에 필수 사용
 *
 * @example
 * <DisclaimerBanner variant="default" />
 * <DisclaimerBanner variant="signal" />
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/** 면책 고지 variant별 문구 매핑 */
const DISCLAIMER_MESSAGES: Record<DisclaimerVariant, string> = {
  default: 'AI 분석 결과는 참고용이며, KRX/DART 공식 데이터를 기반으로 합니다.',
  pack: '본 팩은 투자 권유가 아닌 정보 제공 서비스입니다. 투자 판단은 본인에게 있습니다.',
  tax: '현행 세법(2026년 기준)이며 세법 변경 시 달라질 수 있습니다. 세무 전문가 확인을 권장합니다.',
  signal: '본 시그널은 AI 분석 결과이며 투자 판단의 근거가 아닙니다. 투자 책임은 본인에게 있습니다.',
};

/** variant 타입 */
type DisclaimerVariant = 'default' | 'pack' | 'tax' | 'signal';

/** DisclaimerBanner Props */
interface DisclaimerBannerProps {
  /** 면책 고지 문구 유형 */
  variant?: DisclaimerVariant;
}

/** 면책 고지 타이핑 푸터 — 분석 결과 표시 화면에 필수 렌더링 */
export default function DisclaimerBanner({ variant = 'default' }: DisclaimerBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = DISCLAIMER_MESSAGES[variant];

  /* IntersectionObserver로 뷰포트 진입 시 타이핑 시작 */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  /* 타이핑 효과 — 35ms/char */
  useEffect(() => {
    if (!visible) return;
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [visible, fullText]);

  return (
    <div ref={ref} className="py-3 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
        className="font-mono text-xs text-muted-foreground tracking-wide"
      >
        {displayedText}
        {/* 커서 깜빡임 — 타이핑 중에만 표시 */}
        {displayedText.length < fullText.length && visible && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-0.5 h-3 bg-muted-foreground ml-0.5 align-middle"
          />
        )}
      </motion.p>
    </div>
  );
}
