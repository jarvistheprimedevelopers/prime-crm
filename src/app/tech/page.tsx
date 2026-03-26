import { getWorkOrders } from "@/lib/google-sheets";
import { CompleteButton } from "./complete-button";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let className = "badge badge-pending";
  let label = status;

  if (normalized === "completed" || normalized === "done") {
    className = "badge badge-completed";
    label = "Completed";
  } else if (
    normalized === "active" ||
    normalized === "in progress" ||
    normalized === "in-progress"
  ) {
    className = "badge badge-active";
    label = "Active";
  } else if (normalized === "pending" || normalized === "new") {
    className = "badge badge-pending";
    label = "Pending";
  }

  return <span className={className}>{label}</span>;
}

export default async function TechFeedPage() {
  const allOrders = await getWorkOrders();
  const orders = allOrders.filter(
    (o) => o.status.toLowerCase() !== "completed" && o.status.toLowerCase() !== "done"
  );
  const completedCount = allOrders.length - orders.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tech <span className="text-vivid-green">Feed</span>
          </h1>
          <p className="text-muted text-xs mt-1 uppercase tracking-wider">
            {orders.length} active · {completedCount} completed
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-widest">
          <span className="pulse-dot" />
          Live
        </div>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="glow-card p-12 text-center">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-muted text-sm">
            All work orders completed. No active tasks.
          </p>
        </div>
      )}

      {/* Work Order Cards */}
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="glow-card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-base font-semibold truncate">
                    {order.client}
                  </h2>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">
                  ID: {order.id}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-5 text-sm">
              <div className="flex gap-3">
                <span className="text-muted min-w-[80px]">Address</span>
                <span className="text-foreground">{order.address || "—"}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-muted min-w-[80px]">Task</span>
                <span className="text-foreground">
                  {order.description || "—"}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-muted min-w-[80px]">Tech</span>
                <span className="text-vivid-green font-medium">
                  {order.assignedTech || "Unassigned"}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-muted min-w-[80px]">Date</span>
                <span className="text-foreground">{order.date || "—"}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <CompleteButton orderId={order.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
