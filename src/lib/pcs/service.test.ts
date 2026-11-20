import { describe, expect, it, vi } from "vitest";
import type { PcsRepository } from "./repository";
import { createPcsService } from "./service";
import type { Batch, Item, Task } from "./types";

function makeBatch(overrides: Partial<Batch> = {}): Batch {
  return {
    id: "rec-batch-1",
    name: "Batch A",
    worker: "Ana",
    targetDate: "2026-10-22",
    taskIds: ["rec-task-1"],
    startedAt: null,
    endTime: null,
    doneCount: 0,
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "rec-task-1",
    name: "Clean upper",
    sequence: 1,
    status: "In progress",
    taskState: "READY",
    itemLevel: "Upper",
    batchIds: ["rec-batch-1"],
    itemIds: ["rec-item-1"],
    ...overrides,
  };
}

function makeRepository(overrides: Partial<PcsRepository> = {}) {
  const repository: PcsRepository = {
    listBatches: vi.fn(async () => [makeBatch()]),
    getBatch: vi.fn(async () => makeBatch()),
    setBatchStartedAt: vi.fn(async () => undefined),
    listTasks: vi.fn(async () => [makeTask()]),
    getTask: vi.fn(async () => makeTask()),
    markTaskDone: vi.fn(async () => undefined),
    listItems: vi.fn(async () => [] as Item[]),
    ...overrides,
  };

  return repository;
}

describe("backend action guards", () => {
  it("blocks starting a batch that already has Started At", async () => {
    const repository = makeRepository({
      getBatch: vi.fn(async () =>
        makeBatch({ startedAt: "2026-10-22T08:15:00.000Z" }),
      ),
    });
    const service = createPcsService(repository);

    await expect(service.startBatch("rec-batch-1")).rejects.toMatchObject({
      code: "ALREADY_STARTED",
      status: 409,
    });
    expect(repository.setBatchStartedAt).not.toHaveBeenCalled();
  });

  it("blocks completing a task whose Task State is LOCKED", async () => {
    const repository = makeRepository({
      getTask: vi.fn(async () => makeTask({ taskState: "LOCKED" })),
    });
    const service = createPcsService(repository);

    await expect(service.completeTask("rec-task-1")).rejects.toMatchObject({
      code: "TASK_LOCKED",
      status: 409,
    });
    expect(repository.markTaskDone).not.toHaveBeenCalled();
  });

  it("does not re-start or re-complete eligible records twice", async () => {
    const repository = makeRepository({
      getTask: vi.fn(async () => makeTask({ status: "Done" })),
    });
    const service = createPcsService(repository);

    await expect(service.completeTask("rec-task-1")).rejects.toMatchObject({
      code: "TASK_ALREADY_DONE",
      status: 409,
    });
    expect(repository.markTaskDone).not.toHaveBeenCalled();
  });
});
