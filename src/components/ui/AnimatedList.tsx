'use client';

// ── ReactBits-style AnimatedList ───────────────────────────────────────────
// List items slide + fade in with staggered delays on mount.
// Inspired by reactbits.dev/components/animated-list

import { useEffect, useRef, useState, ReactNode } from 'react';

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  delay?: number;     // stagger delay per item in ms (default 50)
  duration?: number;  // each item's animation duration in ms (default 350)
}

export function AnimatedList({
  children,
  className = '',
  delay = 50,
  duration = 350,
}: AnimatedListProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.05 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
            transitionDelay: `${i * delay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
