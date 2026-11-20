import { connection } from "next/server";
import { createAirtableRepository } from "@/lib/airtable/airtable-repository";
import {
  formatBusinessDate,
  formatDateTime,
  progressPercent,
} from "@/lib/format";
import { createPcsService } from "@/lib/pcs/service";
import type { BatchDetail as BatchDetailData } from "@/lib/pcs/types";
import { DataError } from "./data-error";
import { StartedBadge } from "./badges";
import { StartBatchButton } from "./start-batch-button";
import { TaskList } from "./task-list";

export async function BatchDetail({ id }: { id: string }) {
  await connection();

  let detail: BatchDetailData;
  try {
    const service = createPcsService(createAirtableRepository());
    detail = await service.getBatchDetail(id);
  } catch (error) {
    return <DataError error={error} />;
  }

  const { batch, tasks } = detail;
  const percent = progressPercent(batch.completedTasks, batch.totalTasks);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StartedBadge started={batch.started} />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Target {formatBusinessDate(batch.targetDate)}
          </p>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {batch.name}
        </h1>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              {batch.completedTasks} of {batch.totalTasks} tasks done
            </span>
            <span className="tabular-nums text-slate-500">{percent}%</span>
          </div>
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={batch.totalTasks}
            aria-valuenow={batch.completedTasks}
            aria-label="Batch progress"
          >
            <div
              className={`h-full rounded-full transition-all ${
                percent === 100 ? "bg-emerald-500" : "bg-teal-600"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {batch.startedAt ? (
          <p className="mt-4 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">
            Started at {formatDateTime(batch.startedAt)}
            {batch.endTime ? ` · Finished ${formatDateTime(batch.endTime)}` : ""}
          </p>
        ) : (
          <div className="mt-4">
            <StartBatchButton batchId={batch.id} />
          </div>
        )}
      </section>

      <section aria-labelledby="tasks-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2
              id="tasks-heading"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              Tasks
            </h2>
            <p className="text-sm text-slate-500">
              Sorted by sequence. Complete each unlocked step in order.
            </p>
          </div>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {tasks.length}
          </span>
        </div>
        <TaskList tasks={tasks} />
      </section>
    </div>
  );
}
