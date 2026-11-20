import { isTaskDone, isTaskLocked, normalizeState } from "@/lib/pcs/summary";

export function StartedBadge({ started }: { started: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        started
          ? "bg-teal-100 text-teal-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          started ? "bg-teal-600" : "bg-amber-500"
        }`}
      />
      {started ? "Started" : "Not started"}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const done = isTaskDone(status);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        done ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "—"}
    </span>
  );
}

export function StateBadge({ taskState }: { taskState: string }) {
  const state = normalizeState(taskState);
  const tone =
    state === "LOCKED"
      ? "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200"
      : state === "READY" || state === "UNLOCKED" || state === "AVAILABLE"
        ? "bg-sky-100 text-sky-800"
        : "bg-violet-100 text-violet-800";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      {isTaskLocked(taskState) ? "Locked" : taskState || "—"}
    </span>
  );
}
