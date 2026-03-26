import { getFinancials, getWorkOrders } from "@/lib/google-sheets";
import { FinancialTimeline } from "@/components/FinancialTimeline";
import MondayTable, { workOrderToTask } from "@/components/monday-table";
import { StatusDonut } from "@/components/StatusDonut";
import { TasksBarChart, type BarBucket } from "@/components/TasksBarChart";
import { CountUp } from "@/components/ui/CountUp";
import { BlurText } from "@/components/ui/BlurText";
import { NewTaskModal } from "@/components/NewTaskModal";

export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────
function isToday(d: string) {
  try {
    const t = new Date(d), n = new Date();
    return (
      t.getFullYear() === n.getFullYear() &&
      t.getMonth() === n.getMonth() &&
      t.getDate() === n.getDate()
    );
  } catch { return false; }
}

function withinDays(d: string, days: number) {
  try {
    const ms = new Date().getTime() - new Date(d).getTime();
    return ms >= 0 && ms <= days * 86_400_000;
  } catch { return false; }
}

function fmtUSD(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.abs(Math.round(n))}`;
}

function normalizeStatus(s: string): 'done' | 'working' | 'stuck' | 'pending' {
  const n = s.toLowerCase();
  if (n === 'done' || n === 'completed')                               return 'done';
  if (n === 'working on it' || n === 'in progress' || n === 'active') return 'working';
  if (n === 'stuck')                                                   return 'stuck';
  return 'pending';
}

function buildWeekBuckets(
  orders: Awaited<ReturnType<typeof getWorkOrders>>,
): BarBucket[] {
  const now = new Date();
  const buckets: BarBucket[] = Array.from({ length: 5 }, (_, i) => ({
    label:   `W${i + 1}`,
    done:    0,
    working: 0,
    stuck:   0,
    pending: 0,
  }));

  for (const order of orders) {
    try {
      const d   = new Date(order.date);
      if (isNaN(d.getTime())) continue;
      const ms  = now.getTime() - d.getTime();
      const wk  = Math.floor(ms / (7 * 86_400_000));
      const idx = 4 - wk;
      if (idx < 0 || idx >= 5) continue;
      buckets[idx][normalizeStatus(order.status)]++;
    } catch { /* skip malformed dates */ }
  }

  return buckets;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const [financials, workOrders] = await Promise.all([
    getFinancials(),
    getWorkOrders(),
  ]);

  // ── Metrics ───────────────────────────────────────────────────────────────
  const dayProfit    = financials.filter(f => isToday(f.date))        .reduce((s, f) => s + f.revenue - f.costs, 0);
  const weekProfit   = financials.filter(f => withinDays(f.date,  7)) .reduce((s, f) => s + f.revenue - f.costs, 0);
  const monthRevenue = financials.filter(f => withinDays(f.date, 30)) .reduce((s, f) => s + f.revenue, 0);
  const weekRevenue  = financials.filter(f => withinDays(f.date,  7)) .reduce((s, f) => s + f.revenue, 0);
  const monthProfit  = financials.filter(f => withinDays(f.date, 30)) .reduce((s, f) => s + f.revenue - f.costs, 0);

  const metrics = [
    { label: "Today's Profit",  value: dayProfit,    sub: 'day',                             icon: '☀',  color: '#16a34a' },
    { label: "Week Revenue",    value: weekRevenue,  sub: `+${fmtUSD(weekProfit)} profit`,   icon: '◈',  color: '#2563eb' },
    { label: "Month Revenue",   value: monthRevenue, sub: `+${fmtUSD(monthProfit)} profit`,  icon: '▣',  color: '#9333ea' },
  ];

  // ── Status donut ──────────────────────────────────────────────────────────
  const donuts = [
    { label: 'Done',          color: '#00C875', value: workOrders.filter(o => normalizeStatus(o.status) === 'done').length    },
    { label: 'Working on it', color: '#FDAB3D', value: workOrders.filter(o => normalizeStatus(o.status) === 'working').length },
    { label: 'Stuck',         color: '#E2445C', value: workOrders.filter(o => normalizeStatus(o.status) === 'stuck').length   },
    { label: 'Pending',       color: '#A25DDC', value: workOrders.filter(o => normalizeStatus(o.status) === 'pending').length },
  ].filter(d => d.value > 0);

  const weekBuckets   = buildWeekBuckets(workOrders);
  const tasks         = workOrders.map(o => workOrderToTask(o));
  const activeCount   = workOrders.filter(o => normalizeStatus(o.status) !== 'done').length;

  // Unique tech names for dropdown
  const techOptions = [...new Set(
    workOrders
      .map(o => o.assignedTech)
      .filter(Boolean),
  )];

  return (
    <div className="flex flex-col gap-8 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            <BlurText text="Owner Dashboard" className="text-gray-900" />
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {workOrders.length} total orders · {activeCount} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-widest">
            <span className="pulse-dot" />
            Live
          </div>
          <NewTaskModal techOptions={techOptions} />
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={m.label} className="metric-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {m.label}
              </span>
              <span className="text-xl">{m.icon}</span>
            </div>
            <div
              className="text-3xl font-bold tabular-nums mb-1"
              style={{ color: m.color }}
            >
              <CountUp
                to={Math.abs(m.value)}
                prefix={m.value < 0 ? '-$' : '$'}
                duration={1200 + i * 150}
              />
            </div>
            <div className="text-xs text-gray-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Team progress donut */}
        <div className="glow-card p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            Team Progress Overview
          </h2>
          {donuts.length > 0 ? (
            <StatusDonut segments={donuts} size={150} thickness={20} />
          ) : (
            <p className="text-gray-300 text-xs text-center py-8">No orders yet</p>
          )}
        </div>

        {/* Tasks overview stacked bars */}
        <div className="glow-card p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            Tasks Overview · Last 5 Weeks
          </h2>
          <TasksBarChart buckets={weekBuckets} height={140} />
        </div>
      </div>

      {/* ── Gantt Timeline ── */}
      <div className="glow-card overflow-hidden">
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #E1E4E8' }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Project Timeline
          </h2>
          <span className="text-xs text-gray-300 tabular-nums">
            {workOrders.length} orders
          </span>
        </div>
        <div className="p-5">
          <FinancialTimeline orders={workOrders} />
        </div>
      </div>

      {/* ── Work Orders table ── */}
      <div className="glow-card overflow-hidden">
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #E1E4E8' }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Work Orders
          </h2>
          <span className="text-xs text-gray-400 tabular-nums">
            {activeCount} active · {workOrders.length - activeCount} done
          </span>
        </div>
        <MondayTable tasks={tasks} />
      </div>

    </div>
  );
}
