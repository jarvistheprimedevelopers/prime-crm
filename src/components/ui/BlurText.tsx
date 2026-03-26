'use client';

// ── ReactBits-style BlurText ───────────────────────────────────────────────
// Animates text in word-by-word with a blur + translate effect.
// Inspired by reactbits.dev/text-animations/blur-text

import { useEffect, useRef, useState } from 'react';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;       // stagger between words in ms (default 60)
  duration?: number;    // each word animation duration in ms (default 500)
}

export function BlurText({
  text,
  className = '',
  delay = 60,
  duration = 500,
}: BlurTextProps) {
  const words   = text.split(' ');
  const ref     = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity:    visible ? 1 : 0,
            filter:     visible ? 'blur(0px)' : 'blur(8px)',
            transform:  visible ? 'translateY(0)' : 'translateY(6px)',
            transition: `opacity ${duration}ms ease, filter ${duration}ms ease, transform ${duration}ms ease`,
            transitionDelay: `${i * delay}ms`,
            marginRight: '0.28em',
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
