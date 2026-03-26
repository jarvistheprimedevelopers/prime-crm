'use client';

// ── ReactBits-style CountUp ────────────────────────────────────────────────
// Animates a number from 0 → value using requestAnimationFrame.
// Inspired by reactbits.dev/text-animations/count-up

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  to: number;
  duration?: number;          // ms, default 1400
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUp({
  to,
  duration = 1400,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: CountUpProps) {
  const [display, setDisplay] = useState('0');
  const startTs  = useRef<number | null>(null);
  const rafId    = useRef<number>(0);
  const observed = useRef(false);
  const ref       = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;
          observer.disconnect();
          startTs.current = null;

          const tick = (ts: number) => {
            if (!startTs.current) startTs.current = ts;
            const elapsed = ts - startTs.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const current = eased * to;
            setDisplay(current.toFixed(decimals));
            if (progress < 1) rafId.current = requestAnimationFrame(tick);
          };

          rafId.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  }, [to, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
