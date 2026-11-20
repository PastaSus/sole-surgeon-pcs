import Link from "next/link";
import { formatDateTime, progressPercent } from "@/lib/format";
import type { BatchSummary } from "@/lib/pcs/types";
import { StartedBadge } from "./badges";

export function BatchCard({ batch }: { batch: BatchSummary }) {
  const percent = progressPercent(batch.completedTasks, batch.totalTasks);

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
            {batch.name}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {batch.startedAt
              ? `Started ${formatDateTime(batch.startedAt)}`
              : "Ready to start"}
          </p>
        </div>
        <StartedBadge started={batch.started} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {batch.completedTasks} of {batch.totalTasks} tasks done
          </span>
          <span className="tabular-nums text-slate-500">{percent}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={batch.totalTasks}
          aria-valuenow={batch.completedTasks}
          aria-label={`${batch.name} progress`}
        >
          <div
            className={`h-full rounded-full transition-all ${
              percent === 100 ? "bg-emerald-500" : "bg-teal-600"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {batch.endTime ? (
        <p className="mt-3 text-xs text-slate-500">
          Finished {formatDateTime(batch.endTime)}
        </p>
      ) : null}

      <Link
        href={`/batches/${batch.id}`}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-between rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition group-hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto sm:gap-6"
      >
        Open batch
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
        >
          <path
            d="M4 10h11m0 0-4-4m4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </article>
  );
}
