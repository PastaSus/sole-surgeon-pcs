import { PcsError } from "./errors";
import type { PcsRepository } from "./repository";
import {
  buildBatchDetail,
  hasBatchStarted,
  isTaskDone,
  isTaskLocked,
  summarizeBatch,
  summarizeBatches,
  tasksForBatch,
} from "./summary";
import type {
  BatchDetail,
  BatchSummary,
  CompleteTaskResult,
  Task,
} from "./types";
import { BUSINESS_DATE, WORKER_NAME } from "./types";

export function createPcsService(repository: PcsRepository) {
  async function getBatchList(
    worker = WORKER_NAME,
    businessDate = BUSINESS_DATE,
  ): Promise<BatchSummary[]> {
    const [batches, tasks] = await Promise.all([
      repository.listBatches(),
      repository.listTasks(),
    ]);

    return summarizeBatches(batches, tasks, worker, businessDate);
  }

  async function getBatchDetail(id: string): Promise<BatchDetail> {
    if (!id.trim()) {
      throw new PcsError("INVALID_REQUEST", "A batch id is required.", 400);
    }

    const batch = await repository.getBatch(id);
    if (!batch) {
      throw new PcsError("NOT_FOUND", "Batch not found.", 404);
    }

    const [tasks, items] = await Promise.all([
      repository.listTasks(),
      repository.listItems(),
    ]);

    return buildBatchDetail(batch, tasks, items);
  }

  async function startBatch(id: string): Promise<BatchSummary> {
    if (!id.trim()) {
      throw new PcsError("INVALID_REQUEST", "A batch id is required.", 400);
    }

    const existing = await repository.getBatch(id);
    if (!existing) {
      throw new PcsError("NOT_FOUND", "Batch not found.", 404);
    }

    if (hasBatchStarted(existing.startedAt)) {
      throw new PcsError(
        "ALREADY_STARTED",
        "This batch has already been started.",
        409,
      );
    }

    const startedAt = new Date().toISOString();
    await repository.setBatchStartedAt(id, startedAt);

    const saved = await repository.getBatch(id);
    if (!saved) {
      throw new PcsError("NOT_FOUND", "Batch not found after saving.", 404);
    }

    const tasks = await repository.listTasks();
    return summarizeBatch(saved, tasks);
  }

  async function completeTask(id: string): Promise<CompleteTaskResult> {
    if (!id.trim()) {
      throw new PcsError("INVALID_REQUEST", "A task id is required.", 400);
    }

    const existing = await repository.getTask(id);
    if (!existing) {
      throw new PcsError("NOT_FOUND", "Task not found.", 404);
    }

    if (isTaskLocked(existing.taskState)) {
      throw new PcsError(
        "TASK_LOCKED",
        "This task is locked and cannot be completed yet.",
        409,
      );
    }

    if (isTaskDone(existing.status)) {
      throw new PcsError(
        "TASK_ALREADY_DONE",
        "This task is already done.",
        409,
      );
    }

    await repository.markTaskDone(id);

    const [savedTask, tasks] = await Promise.all([
      repository.getTask(id),
      repository.listTasks(),
    ]);

    const updatedTask: Task = savedTask ?? {
      ...existing,
      status: "Done",
    };

    let batch: BatchSummary | null = null;
    const batchId = existing.batchIds[0];
    if (batchId) {
      const batchRecord = await repository.getBatch(batchId);
      if (batchRecord) {
        batch = summarizeBatch(batchRecord, tasksForBatch(batchRecord, tasks));
      }
    }

    return {
      task: {
        id: updatedTask.id,
        status: updatedTask.status,
        taskState: updatedTask.taskState,
      },
      batch,
    };
  }

  return {
    getBatchList,
    getBatchDetail,
    startBatch,
    completeTask,
  };
}

export type PcsService = ReturnType<typeof createPcsService>;
