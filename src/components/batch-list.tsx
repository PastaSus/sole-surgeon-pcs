import { connection } from "next/server";
import { createAirtableRepository } from "@/lib/airtable/airtable-repository";
import { formatBusinessDate } from "@/lib/format";
import { createPcsService } from "@/lib/pcs/service";
import { BUSINESS_DATE, WORKER_NAME, type BatchSummary } from "@/lib/pcs/types";
import { BatchCard } from "./batch-card";
import { DataError, EmptyState } from "./data-error";

export async function BatchList() {
  await connection();

  let batches: BatchSummary[];
  try {
    const service = createPcsService(createAirtableRepository());
    batches = await service.getBatchList();
  } catch (error) {
    return <DataError error={error} />;
  }

  if (batches.length === 0) {
    return (
      <EmptyState
        title="No batches for this date"
        body={`${WORKER_NAME} has no batches targeted for ${formatBusinessDate(
          BUSINESS_DATE,
        )}.`}
      />
    );
  }

  const totalTasks = batches.reduce((sum, batch) => sum + batch.totalTasks, 0);
  const completedTasks = batches.reduce(
    (sum, batch) => sum + batch.completedTasks,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Batches" value={batches.length} />
        <Stat label="Tasks" value={totalTasks} />
        <Stat
          label="Completed"
          value={`${completedTasks}/${totalTasks}`}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <ul className="grid gap-3 sm:gap-4">
        {batches.map((batch) => (
          <li key={batch.id}>
            <BatchCard batch={batch} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}
