'use client';

// ── MondayTable — Monday.com "This week" task list style ──────────────────
// Features:
//   • Collapsible groups with coloured left-border accent
//   • 4px vertical pulse border per row (status colour)
//   • Sticky header with thin 1px gray-800 borders
//   • StatusCell inline pop-up
//   • AnimatedList entrance animation

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { WorkOrder } from '@/lib/google-sheets';
import { StatusCell } from './StatusCell';
import { AnimatedList } from './ui/AnimatedList';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  address: string;
  detail: string;
  status: string;
  profit: string;
  tech?: string;
  date?: string;
}

export function workOrderToTask(order: WorkOrder, profit?: number): Task {
  return {
    id: order.id,
    address: `${order.client}${order.address ? ' — ' + order.address : ''}`,
    detail: order.description,
    status: order.status,
    profit: (profit ?? 0).toFixed(0),
    tech: order.assignedTech || undefined,
    date: order.date || undefined,
  };
}

// ── Palette helpers ───────────────────────────────────────────────────────────
function getPulseColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'done' || s === 'completed')                                return '#00FF00';
  if (s === 'working on it' || s === 'in progress' || s === 'active')  return '#FFA500';
  if (s === 'stuck')                                                    return '#ef4444';
  return '#6366f1';
}

// ── Group logic ───────────────────────────────────────────────────────────────
type GroupKey = 'active' | 'complete';

interface Group {
  key: GroupKey;
  label: string;
  accent: string;
  tasks: Task[];
}

function groupTasks(tasks: Task[]): Group[] {
  const active: Task[]   = [];
  const complete: Task[] = [];

  for (const t of tasks) {
    const s = t.status.toLowerCase();
    if (s === 'done' || s === 'completed') complete.push(t);
    else active.push(t);
  }

  return [
    { key: 'active',   label: 'Active Projects',     accent: '#6366f1', tasks: active   },
    { key: 'complete', label: 'Complete — This Week', accent: '#00FF00', tasks: complete },
  ];
}

// ── Initials avatar ───────────────────────────────────────────────────────────
function TechAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Stable colour from name hash
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold flex-shrink-0"
      style={{ background: `hsl(${hue},55%,30%)`, color: `hsl(${hue},80%,80%)`, border: '1px solid rgba(255,255,255,0.08)' }}
      title={name}
    >
      {initials}
    </span>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, index }: { task: Task; index: number }) {
  const pulse = getPulseColor(task.status);

  return (
    <tr
      className="border-b transition-colors group"
      style={{ borderColor: '#111' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#0d0d0d')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Pulse border + row number */}
      <td
        className="py-3 px-3 text-gray-600 text-center text-xs tabular-nums w-10"
        style={{ borderLeft: `4px solid ${pulse}`, borderRight: '1px solid #111' }}
      >
        {index + 1}
      </td>

      {/* Project / address */}
      <td className="py-3 px-4 w-64">
        <div className="font-semibold text-white text-sm leading-snug truncate max-w-[220px]">
          {task.address}
        </div>
        {task.date && (
          <div className="text-[10px] text-gray-600 mt-0.5 tabular-nums">{task.date}</div>
        )}
      </td>

      {/* Detail */}
      <td className="py-3 px-4 text-gray-500 font-mono text-xs max-w-xs">
        <span className="line-clamp-2">{task.detail || '—'}</span>
      </td>

      {/* Tech avatar */}
      <td className="py-3 px-4 w-24">
        {task.tech ? (
          <div className="flex items-center gap-2">
            <TechAvatar name={task.tech} />
            <span className="text-[11px] text-gray-400 truncate">{task.tech.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-[11px] text-gray-700">—</span>
        )}
      </td>

      {/* Status — interactive pop-up */}
      <td className="py-3 px-3 w-36 text-center">
        <StatusCell taskId={task.id} status={task.status} />
      </td>

      {/* Profit */}
      <td className="py-3 px-4 w-28 text-right font-mono text-sm" style={{ color: '#00FF00' }}>
        {task.profit !== '0' ? `$${task.profit}` : <span className="text-gray-700">—</span>}
      </td>
    </tr>
  );
}

// ── Group header row ──────────────────────────────────────────────────────────
function GroupHeader({
  group,
  open,
  onToggle,
}: {
  group: Group;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = open ? ChevronDown : ChevronRight;
  return (
    <tr
      className="cursor-pointer select-none"
      style={{ background: '#0a0a0a' }}
      onClick={onToggle}
    >
      <td
        colSpan={6}
        className="py-2 pl-3 pr-4"
        style={{ borderLeft: `4px solid ${group.accent}` }}
      >
        <div className="flex items-center gap-2">
          <Icon size={12} style={{ color: group.accent }} />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: group.accent }}
          >
            {group.label}
          </span>
          <span className="text-[10px] text-gray-700 ml-1">
            {group.tasks.length}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MondayTable({ tasks }: { tasks: Task[] }) {
  const groups = groupTasks(tasks);
  const [openGroups, setOpenGroups] = useState<Record<GroupKey, boolean>>({
    active: true,
    complete: true,
  });

  const toggle = (key: GroupKey) =>
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="overflow-x-auto" style={{ borderRadius: '0 0 12px 12px' }}>
      <table
        className="w-full text-left bg-[#050505]"
        style={{ borderCollapse: 'collapse' }}
      >
        {/* ── Sticky header ── */}
        <thead
          className="sticky top-0 z-10"
          style={{ background: '#0e0e0e', borderBottom: '1px solid #1a1a1a' }}
        >
          <tr className="text-[9px] uppercase tracking-widest text-gray-600">
            <th className="py-3 px-3 w-10" style={{ borderLeft: '4px solid transparent', borderRight: '1px solid #1a1a1a' }}>#</th>
            <th className="py-3 px-4 w-64">Project / Address</th>
            <th className="py-3 px-4">Task</th>
            <th className="py-3 px-4 w-24">Owner</th>
            <th className="py-3 px-3 w-36 text-center">Status</th>
            <th className="py-3 px-4 w-28 text-right">Profit</th>
          </tr>
        </thead>

        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-700 text-xs uppercase tracking-widest">
                No work orders · Connect your Google Sheet to get started
              </td>
            </tr>
          )}

          {groups.map(group =>
            group.tasks.length > 0 ? (
              <>
                <GroupHeader
                  key={`hdr-${group.key}`}
                  group={group}
                  open={openGroups[group.key]}
                  onToggle={() => toggle(group.key)}
                />
                {openGroups[group.key] &&
                  group.tasks.map((task, i) => (
                    <TaskRow key={task.id} task={task} index={i} />
                  ))}
              </>
            ) : null
          )}
        </tbody>
      </table>
    </div>
  );
}
