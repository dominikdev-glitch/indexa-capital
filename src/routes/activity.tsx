import { createFileRoute } from "@tanstack/react-router";
import { FillRow } from "@/routes/index";
import { useBook } from "@/lib/book";

export const Route = createFileRoute("/activity")({ component: ActivityPage });

function ActivityPage() {
  const fills = useBook((state) => state.fills);
  const hidden = useBook((state) => state.hidden);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Activity</h1>
        <p className="mt-2 text-sm text-muted">Sample ledger. Nothing here is a payment.</p>
      </div>
      <ol className="panel divide-y divide-border px-4">
        {fills.map((fill) => (
          <FillRow key={fill.id} fill={fill} hidden={hidden} />
        ))}
      </ol>
    </div>
  );
}
