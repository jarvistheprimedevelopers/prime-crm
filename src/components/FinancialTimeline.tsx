'use client';

// ── FinancialTimeline — Monday.com Gantt-lite ─────────────────────────────
// Maps WorkOrders onto a horizontal date axis.
// Each order = a colour-coded bar. Hover for tooltip. Filter by status.

import { useMemo, useState, useRef } from 'react';
import type { WorkOrder } from '@/lib/google-sheets';

// ── Colours ───────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  'done':           '#00FF00',
  'completed':      '#00FF00',
  'working on it':  '#FFA500',
  'in progress':    '#FFA500',
  'active':         '#FFA500',
  'stuck':          '#ef4444',
  'pending':        '#6366f1',
};
function colorFor(s: string) { return STATUS_COLOR[s.toLowerCase()] ?? '#444'; }

// ── Date helpers ──────────────────────────────────────────────────────────────
function parseDate(raw: string): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function fmtShort(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysBetween(a: Date, b: Date) {
  return Math.ceil(Math.abs(b.getTime() - a.getTime()) / 86_400_000);
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
interface TipData { order: WorkOrder; x: number; y: number }

function Tooltip({ d }: { d: TipData }) {
  const col = colorFor(d.order.status);
  return (
    <div
      className="pointer-events-none fixed z-50 px-3 py-2.5 text-xs"
      style={{
        left: d.x + 14,
        top:  d.y - 10,
        background: '#0e0e0e',
        border: `1px solid ${col}44`,
        borderRadius: 6,
        boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px ${col}22`,
        color: '#fff',
        maxWidth: 220,
        minWidth: 160,
      }}
    >
      <p className="font-bold text-[12px] mb-0.5" style={{ color: col }}>{d.order.client}</p>
      {d.order.address && <p className="text-gray-500 text-[10px] truncate mb-1">{d.order.address}</p>}
      {d.order.description && <p className="text-gray-300 text-[10px] mb-2">{d.order.description}</p>}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-800">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />
          <span className="uppercase tracking-wider font-bold text-[9px]" style={{ color: col }}>{d.order.status}</span>
        </span>
        <span className="text-gray-600 text-[9px] tabular-nums">{d.order.date}</span>
      </div>
      {d.order.assignedTech && (
        <p className="text-gray-600 text-[9px] mt-1">→ {d.order.assignedTech}</p>
      )}
    </div>
  );
}

// ── Props & component ─────────────────────────────────────────────────────────
interface FinancialTimelineProps { orders: WorkOrder[] }

const ROW_H    = 32;
const LABEL_W  = 120; // px reserved for left client label
const BAR_W_PX = 12;  // visual width of each 1-day order marker

export function FinancialTimeline({ orders }: FinancialTimelineProps) {
  const [filter, setFilter] = useState('all');
  const [tip, setTip]       = useState<TipData | null>(null);
  const wrapRef             = useRef<HTMLDivElement>(null);

  // ── Parse & sort ──────────────────────────────────────────────────────────
  const parsed = useMemo(() => {
    return orders
      .map(o => ({ order: o, date: parseDate(o.date) }))
      .filter((x): x is { order: WorkOrder; date: Date } => x.date !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [orders]);

  // ── Timeline range ────────────────────────────────────────────────────────
  const { rangeStart, totalDays } = useMemo(() => {
    if (!parsed.length) {
      const now = new Date();
      return { rangeStart: now, totalDays: 30 };
    }
    const s = new Date(parsed[0].date.getTime()  - 2 * 86_400_000);
    const e = new Date(parsed[parsed.length - 1].date.getTime() + 4 * 86_400_000);
    return { rangeStart: s, totalDays: daysBetween(s, e) };
  }, [parsed]);

  // ── Filter controls ───────────────────────────────────────────────────────
  const statuses = useMemo(() => {
    const s = new Set(orders.map(o => o.status));
    return ['all', ...Array.from(s)];
  }, [orders]);

  const visible = useMemo(() =>
    parsed.filter(x => filter === 'all' || x.order.status === filter),
  [parsed, filter]);

  // ── Tick marks (every 7 days or fewer) ───────────────────────────────────
  const ticks = useMemo(() => {
    const marks: Date[] = [];
    const step = totalDays <= 14 ? 1 : totalDays <= 60 ? 7 : 14;
    for (let d = 0; d <= totalDays; d += step)
      marks.push(new Date(rangeStart.getTime() + d * 86_400_000));
    return marks;
  }, [rangeStart, totalDays]);

  // ── Canvas width ──────────────────────────────────────────────────────────
  const CANVAS_W = Math.max(600, totalDays * 18);

  // Position helpers
  const dayOffset = (date: Date) =>
    daysBetween(rangeStart, date) * (CANVAS_W / totalDays);

  const todayOff  = dayOffset(new Date());

  if (!parsed.length) {
    return (
      <div className="py-8 text-center text-gray-700 text-xs uppercase tracking-widest">
        No dated orders available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map(s => {
          const active = filter === s;
          const col    = s === 'all' ? '#555' : colorFor(s);
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                background:  active ? `${col}22` : 'transparent',
                border:      `1px solid ${active ? col : '#222'}`,
                color:       active ? col : '#444',
                borderRadius: 4,
                padding:     '3px 10px',
                fontSize:    10,
                fontWeight:  700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor:      'pointer',
              }}
            >
              {s}
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-gray-700 tabular-nums">
          {visible.length}/{parsed.length} orders
        </span>
      </div>

      {/* Scrollable canvas */}
      <div ref={wrapRef} className="overflow-x-auto" style={{ borderRadius: 6, border: '1px solid #111' }}>
        <div style={{ width: CANVAS_W + LABEL_W, minWidth: '100%', background: '#050505' }}>

          {/* Date axis */}
          <div
            className="relative flex items-end"
            style={{ height: 28, paddingLeft: LABEL_W, borderBottom: '1px solid #111' }}
          >
            {ticks.map((tick, i) => (
              <span
                key={i}
                className="absolute bottom-1 text-[9px] text-gray-700 -translate-x-1/2"
                style={{ left: LABEL_W + dayOffset(tick), whiteSpace: 'nowrap' }}
              >
                {fmtShort(tick)}
              </span>
            ))}
          </div>

          {/* Today line */}
          {todayOff >= 0 && todayOff <= CANVAS_W && (
            <div
              className="absolute pointer-events-none"
              style={{
                left:    LABEL_W + todayOff,
                top:     28,
                bottom:  0,
                width:   1,
                background: 'rgba(0,255,0,0.2)',
                zIndex:  2,
              }}
            />
          )}

          {/* Order rows */}
          <div className="relative">
            {visible.map(({ order, date }, i) => {
              const col    = colorFor(order.status);
              const left   = LABEL_W + dayOffset(date);

              return (
                <div
                  key={order.id}
                  className="relative flex items-center"
                  style={{
                    height:      ROW_H,
                    borderBottom: '1px solid #0c0c0c',
                    borderLeft:  `3px solid ${col}33`,
                  }}
                >
                  {/* Left: client name */}
                  <div
                    className="absolute left-0 flex items-center gap-2 px-3"
                    style={{ width: LABEL_W }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: col }}
                    />
                    <span className="text-[10px] text-gray-500 truncate">
                      {order.client}
                    </span>
                  </div>

                  {/* Bar marker */}
                  <div
                    className="absolute top-[6px] cursor-pointer transition-all hover:brightness-125 hover:scale-110"
                    style={{
                      left:         left - BAR_W_PX / 2,
                      width:        BAR_W_PX,
                      height:       ROW_H - 12,
                      background:   `linear-gradient(180deg, ${col}, ${col}88)`,
                      borderRadius: 3,
                      boxShadow:    `0 0 6px ${col}66`,
                      zIndex:       3,
                    }}
                    onMouseEnter={e => setTip({ order, x: e.clientX, y: e.clientY })}
                    onMouseMove={e  => setTip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                    onMouseLeave={() => setTip(null)}
                  />

                  {/* Horizontal guide line */}
                  <div
                    className="absolute pointer-events-none"
                    style={{ left: LABEL_W, right: 0, top: '50%', height: 1, background: '#0f0f0f' }}
                  />

                  {/* Tech label, right side */}
                  {order.assignedTech && (
                    <span
                      className="absolute right-3 text-[9px] text-gray-700 truncate"
                      style={{ maxWidth: 80 }}
                    >
                      {order.assignedTech}
                    </span>
                  )}
                </div>
              );
            })}

            {visible.length === 0 && (
              <div className="py-6 text-center text-gray-700 text-xs uppercase tracking-widest">
                No orders match this filter
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: 'Done',          color: '#00FF00' },
          { label: 'Working on it', color: '#FFA500' },
          { label: 'Stuck',         color: '#ef4444' },
          { label: 'Pending',       color: '#6366f1' },
        ].map(x => (
          <span key={x.label} className="flex items-center gap-1.5 text-[10px] text-gray-600">
            <span className="w-2.5 h-[3px] rounded-full inline-block" style={{ background: x.color }} />
            {x.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[10px] text-gray-600 ml-2">
          <span className="w-px h-3 inline-block" style={{ background: 'rgba(0,255,0,0.3)' }} />
          Today
        </span>
      </div>

      {tip && <Tooltip d={tip} />}
    </div>
  );
}
