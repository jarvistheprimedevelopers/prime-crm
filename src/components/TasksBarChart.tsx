'use client';

// ── Stacked bar chart — Monday.com "Tasks overview" style ─────────────────
// Each bar = one time bucket (week/day).
// Stacks: Done (green) / Working (orange) / Stuck (red).

import { useEffect, useRef, useState } from 'react';

export interface BarBucket {
  label: string;
  done: number;
  working: number;
  stuck: number;
  pending: number;
}

interface TasksBarChartProps {
  buckets: BarBucket[];
  height?: number;
}

const COLORS = {
  done:    '#00FF00',
  working: '#FFA500',
  stuck:   '#ef4444',
  pending: '#6366f1',
};

export function TasksBarChart({ buckets, height = 140 }: TasksBarChartProps) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setAnimated(true); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const maxVal = Math.max(
    ...buckets.map(b => b.done + b.working + b.stuck + b.pending),
    1,
  );

  if (buckets.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-gray-600 text-xs uppercase tracking-widest">
        No data
      </div>
    );
  }

  return (
    <div ref={ref} className="flex flex-col gap-2">
      {/* Bars */}
      <div
        className="flex items-end gap-2 px-1"
        style={{ height }}
      >
        {buckets.map((b, i) => {
          const total     = b.done + b.working + b.stuck + b.pending;
          const pctDone   = (b.done    / maxVal) * 100;
          const pctWork   = (b.working / maxVal) * 100;
          const pctStuck  = (b.stuck   / maxVal) * 100;
          const pctPend   = (b.pending / maxVal) * 100;

          return (
            <div
              key={b.label}
              className="flex-1 flex flex-col justify-end rounded-sm overflow-hidden"
              style={{ height: animated ? `${(total / maxVal) * 100}%` : '0%', transition: `height 700ms cubic-bezier(0.4,0,0.2,1)`, transitionDelay: `${i * 60}ms` }}
              title={`${b.label}: ${total} total`}
            >
              {b.stuck > 0 && (
                <div style={{ height: `${(pctStuck / ((total / maxVal) * 100)) * 100}%`, background: COLORS.stuck }} />
              )}
              {b.working > 0 && (
                <div style={{ height: `${(pctWork / ((total / maxVal) * 100)) * 100}%`, background: COLORS.working }} />
              )}
              {b.pending > 0 && (
                <div style={{ height: `${(pctPend / ((total / maxVal) * 100)) * 100}%`, background: COLORS.pending }} />
              )}
              {b.done > 0 && (
                <div style={{ height: `${(pctDone / ((total / maxVal) * 100)) * 100}%`, background: COLORS.done }} />
              )}
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-2 px-1">
        {buckets.map(b => (
          <div
            key={b.label}
            className="flex-1 text-center text-[9px] text-gray-600 uppercase tracking-wider truncate"
          >
            {b.label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center flex-wrap mt-1">
        {(Object.entries(COLORS) as [keyof typeof COLORS, string][]).map(([key, col]) => (
          <span key={key} className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ background: col }} />
            {key === 'done' ? 'Done' : key === 'working' ? 'Working on it' : key === 'stuck' ? 'Stuck' : 'Pending'}
          </span>
        ))}
      </div>
    </div>
  );
}
