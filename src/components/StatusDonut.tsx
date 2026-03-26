'use client';

// ── Animated SVG Donut chart — Monday.com "Team progress overview" style ──

import { useEffect, useRef, useState } from 'react';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface StatusDonutProps {
  segments: Segment[];
  size?: number;
  thickness?: number;
}

const TOTAL_DASH = 283; // circumference of r=45 circle (2π×45)

export function StatusDonut({ segments, size = 160, thickness = 22 }: StatusDonutProps) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setAnimated(true); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Build cumulative offsets for each segment
  let cumulative = 0;
  const arcs = segments.map(seg => {
    const fraction = seg.value / total;
    const dash     = fraction * TOTAL_DASH;
    const offset   = TOTAL_DASH - cumulative * TOTAL_DASH / total;
    // We rotate each segment by cumulative degrees so they stack
    const rotation = (cumulative / total) * 360 - 90; // start at top
    cumulative += seg.value;
    return { ...seg, dash, offset: TOTAL_DASH - dash, rotation };
  });

  const center = size / 2;
  const r      = size / 2 - thickness / 2 - 4;
  const circ   = 2 * Math.PI * r;

  // Rebuild with proper circumference
  let cum2 = 0;
  const arcs2 = segments.map(seg => {
    const fraction  = seg.value / total;
    const dashLen   = fraction * circ;
    const gapLen    = circ - dashLen;
    const rotationDeg = (cum2 / total) * 360 - 90;
    cum2 += seg.value;
    return { ...seg, dashLen, gapLen, rotationDeg, fraction };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={thickness}
        />

        {/* Segments */}
        {arcs2.map((arc, i) => (
          <circle
            key={arc.label}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeDasharray={`${animated ? arc.dashLen : 0} ${circ}`}
            strokeDashoffset={0}
            strokeLinecap="butt"
            transform={`rotate(${arc.rotationDeg} ${center} ${center})`}
            style={{
              transition: `stroke-dasharray 900ms cubic-bezier(0.4, 0, 0.2, 1)`,
              transitionDelay: `${i * 120}ms`,
            }}
          />
        ))}

        {/* Centre label: total */}
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold"
          style={{ fill: '#fff', fontSize: size * 0.17, fontWeight: 700 }}
        >
          {total}
        </text>
        <text
          x={center}
          y={center + size * 0.13}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: '#555', fontSize: size * 0.09, textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          orders
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-400">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: seg.color }}
              />
              {seg.label}
            </span>
            <span className="font-bold tabular-nums" style={{ color: seg.color }}>
              {seg.value}
              <span className="text-gray-600 font-normal ml-1">
                ({Math.round((seg.value / total) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
