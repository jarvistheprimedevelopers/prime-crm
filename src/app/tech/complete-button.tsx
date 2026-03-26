"use client";

import { completeTask } from "@/app/actions";
import { useTransition } from "react";

export function CompleteButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="btn-complete"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await completeTask(orderId);
        });
      }}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 border-2 border-vivid-green border-t-transparent rounded-full animate-spin" />
          Completing…
        </span>
      ) : (
        "✓ Complete"
      )}
    </button>
  );
}
