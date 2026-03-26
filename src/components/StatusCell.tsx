'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { updateStatus } from '@/app/actions';

// ── Status palette ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { label: 'Pending',       color: '#6366f1', popBg: 'rgba(99,102,241,0.18)'  },
  { label: 'Working on it', color: '#FFA500', popBg: 'rgba(255,165,0,0.18)'   },
  { label: 'Stuck',         color: '#ef4444', popBg: 'rgba(239,68,68,0.18)'   },
  { label: 'Done',          color: '#00FF00', popBg: 'rgba(0,255,0,0.18)'     },
] as const;

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Done':           { bg: '#00FF00', text: '#000' },
  'COMPLETED':      { bg: '#00FF00', text: '#000' },
  'Working on it':  { bg: '#FFA500', text: '#000' },
  'In Progress':    { bg: '#FFA500', text: '#000' },
  'Active':         { bg: '#FFA500', text: '#000' },
  'Stuck':          { bg: '#ef4444', text: '#fff' },
  'Pending':        { bg: '#6366f1', text: '#fff' },
};

function getStyle(status: string) {
  return STATUS_STYLE[status] ?? { bg: '#2a2a2a', text: '#888' };
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface StatusCellProps {
  taskId: string;
  status: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function StatusCell({ taskId, status: initial }: StatusCellProps) {
  const [status, setStatus] = useState(initial);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const select = (next: string) => {
    setOpen(false);
    if (next === status) return;
    const prev = status;
    setStatus(next); // optimistic update
    startTransition(async () => {
      const ok = await updateStatus(taskId, next);
      if (!ok) setStatus(prev); // rollback on failure
    });
  };

  const { bg, text } = getStyle(status);

  return (
    <div ref={containerRef} className="relative flex justify-center">
      {/* ── Pill button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        style={{
          background: bg,
          color: text,
          borderRadius: 4,
          border: 'none',
          minWidth: 120,
        }}
        className="px-3 py-[5px] text-[10px] font-bold uppercase cursor-pointer select-none
                   transition-all hover:brightness-110 active:scale-95 disabled:opacity-40
                   text-center tracking-wider"
      >
        {isPending ? '· · ·' : status}
      </button>

      {/* ── Dropdown popup ── */}
      {open && (
        <div
          className="absolute z-50 top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-44 overflow-hidden"
          style={{
            background: '#0e0e0e',
            border: '1px solid #2a2a2a',
            borderRadius: 6,
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          }}
        >
          {STATUS_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => select(opt.label)}
              className="w-full flex items-center gap-2 px-3 py-[9px] text-[11px] font-bold
                         uppercase transition-all hover:brightness-125 cursor-pointer"
              style={{
                background: status === opt.label ? opt.popBg : 'transparent',
                color: opt.color,
                border: 'none',
                borderBottom: i < STATUS_OPTIONS.length - 1 ? '1px solid #1c1c1c' : 'none',
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: opt.color }}
              />
              {opt.label}
              {status === opt.label && (
                <span className="ml-auto text-[9px] opacity-60">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
