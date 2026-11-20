import type { Batch, BatchDetail, BatchSummary, BatchTaskView, Item, Task } from "./types";

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function normalizeState(value: string): string {
  return value.trim().toUpperCase();
}

export function isTaskDone(status: string): boolean {
  return normalizeState(status) === "DONE";
}

export function isTaskLocked(taskState: string): boolean {
  return normalizeState(taskState) === "LOCKED";
}

export function hasBatchStarted(startedAt: string | null): boolean {
  return Boolean(normalizeText(startedAt));
}

export function targetDateOnly(value: string): string {
  return value.trim().slice(0, 10);
}

export function batchMatches(batch: Batch, worker: string, businessDate: string): boolean {
  const sameWorker = normalizeText(batch.worker).toLowerCase() === worker.trim().toLowerCase();
  return sameWorker && targetDateOnly(batch.targetDate) === businessDate;
}

export function tasksForBatch(batch: Batch, tasks: Task[]): Task[] {
  const batchTaskIds = new Set(batch.taskIds);
  return tasks.filter(
    (task) => batchTaskIds.has(task.id) || task.batchIds.includes(batch.id),
  );
}

export function summarizeBatch(batch: Batch, tasks: Task[]): BatchSummary {
  const batchTasks = tasksForBatch(batch, tasks);
  const linkedTotal =
    batch.taskIds.length > 0 ? batch.taskIds.length : batchTasks.length;
  const totalTasks = linkedTotal > 0 ? linkedTotal : (batch.doneCount ?? 0);
  const derivedDone = batchTasks.filter((task) => isTaskDone(task.status)).length;
  const completedTasks = batch.doneCount ?? derivedDone;

  return {
    id: batch.id,
    name: batch.name,
    targetDate: batch.targetDate,
    startedAt: batch.startedAt,
    endTime: batch.endTime,
    totalTasks,
    completedTasks: Math.min(Math.max(completedTasks, 0), totalTasks),
    started: hasBatchStarted(batch.startedAt),
  };
}

export function summarizeBatches(
  batches: Batch[],
  tasks: Task[],
  worker: string,
  businessDate: string,
): BatchSummary[] {
  return batches
    .filter((batch) => batchMatches(batch, worker, businessDate))
    .map((batch) => summarizeBatch(batch, tasks))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function sortTasks(left: Task, right: Task): number {
  const leftSequence = left.sequence ?? Number.MAX_SAFE_INTEGER;
  const rightSequence = right.sequence ?? Number.MAX_SAFE_INTEGER;
  if (leftSequence !== rightSequence) {
    return leftSequence - rightSequence;
  }
  return left.name.localeCompare(right.name);
}

export function toBatchTaskViews(tasks: Task[], items: Item[]): BatchTaskView[] {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  return [...tasks].sort(sortTasks).map((task) => {
    const item = task.itemIds.map((id) => itemsById.get(id)).find(Boolean);

    return {
      id: task.id,
      name: task.name,
      sequence: task.sequence,
      status: task.status,
      taskState: task.taskState,
      itemLevel: task.itemLevel,
      itemName: item?.name ?? "Unknown item",
      itemService: item?.service ?? "",
      itemDueDate: item?.dueDate ?? "",
      locked: isTaskLocked(task.taskState),
      done: isTaskDone(task.status),
    };
  });
}

export function buildBatchDetail(
  batch: Batch,
  tasks: Task[],
  items: Item[],
): BatchDetail {
  return {
    batch: summarizeBatch(batch, tasks),
    tasks: toBatchTaskViews(tasksForBatch(batch, tasks), items),
  };
}
