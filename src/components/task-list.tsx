import { formatDueDate } from "@/lib/format";
import type { BatchTaskView } from "@/lib/pcs/types";
import { StateBadge, StatusBadge } from "./badges";
import { CompleteTaskButton } from "./complete-task-button";
import { EmptyState } from "./data-error";
import { Lock, Check } from "lucide-react";

export function TaskList({ tasks }: { tasks: BatchTaskView[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks in this batch"
        body="Add tasks to this batch in Airtable, then refresh this page."
      />
    );
  }

  return (
    <ol className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                task.done
                  ? "bg-emerald-100 text-emerald-800"
                  : task.locked
                    ? "bg-slate-100 text-slate-500"
                    : "bg-teal-100 text-teal-800"
              }`}
              aria-label={`Sequence ${task.sequence ?? "unknown"}`}
            >
              {task.sequence ?? "–"}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {task.itemName}
                  </h3>
                  <p className="text-sm text-slate-600">{task.name}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={task.status} />
                  <StateBadge taskState={task.taskState} />
                </div>
              </div>

              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {task.itemService ? (
                  <div className="flex gap-1">
                    <dt className="font-medium text-slate-600">Service</dt>
                    <dd>{task.itemService}</dd>
                  </div>
                ) : null}
                {task.itemDueDate ? (
                  <div className="flex gap-1">
                    <dt className="font-medium text-slate-600">Due</dt>
                    <dd>{formatDueDate(task.itemDueDate)}</dd>
                  </div>
                ) : null}
                {task.itemLevel ? (
                  <div className="flex gap-1">
                    <dt className="font-medium text-slate-600">Item level</dt>
                    <dd>{task.itemLevel}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-3 border-t border-slate-100 pt-3">
                {task.locked ? (
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <Lock />
                    Locked until earlier steps are done
                  </p>
                ) : task.done ? (
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <Check />
                    Completed
                  </p>
                ) : (
                  <CompleteTaskButton taskId={task.id} taskName={task.name} />
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
