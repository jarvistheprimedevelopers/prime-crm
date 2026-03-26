'use client';

// ── ReactBits-style ShinyText ──────────────────────────────────────────────
// A moving highlight sweep over text using CSS gradient animation.
// Inspired by reactbits.dev/text-animations/shiny-text

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;     // animation duration in seconds (default 2.5)
  color?: string;     // base text colour (default #00FF00)
}

export function ShinyText({
  text,
  className = '',
  speed = 2.5,
  color = '#00FF00',
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        backgroundImage: `linear-gradient(
          120deg,
          ${color} 0%,
          ${color} 30%,
          #ffffff 50%,
          ${color} 70%,
          ${color} 100%
        )`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: `shiny-sweep ${speed}s linear infinite`,
      }}
    >
      {text}
      <style>{`
        @keyframes shiny-sweep {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </span>
  );
}
