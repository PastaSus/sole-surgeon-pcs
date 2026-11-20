import { describe, expect, it } from "vitest";
import { buildBatchDetail, summarizeBatches } from "./summary";
import { BUSINESS_DATE, WORKER_NAME, type Batch, type Item, type Task } from "./types";

const batches: Batch[] = [
  {
    id: "b1",
    name: "Batch A",
    worker: "Ana",
    targetDate: "2026-10-22T00:00:00.000Z",
    taskIds: ["t1", "t2"],
    startedAt: "2026-10-22T09:00:00.000Z",
    endTime: null,
    doneCount: 1,
  },
  {
    id: "b2",
    name: "Batch B",
    worker: "Ana",
    targetDate: "2026-10-22",
    taskIds: [],
    startedAt: null,
    endTime: null,
    doneCount: null,
  },
  {
    id: "b3",
    name: "Wrong date",
    worker: "Ana",
    targetDate: "2026-10-23",
    taskIds: ["t5"],
    startedAt: null,
    endTime: null,
    doneCount: 0,
  },
  {
    id: "b4",
    name: "Wrong worker",
    worker: "Luis",
    targetDate: "2026-10-22",
    taskIds: ["t6"],
    startedAt: null,
    endTime: null,
    doneCount: 0,
  },
];

const tasks: Task[] = [
  {
    id: "t1",
    name: "Clean upper",
    sequence: 1,
    status: "Done",
    taskState: "DONE",
    itemLevel: "Upper",
    batchIds: ["b1"],
    itemIds: ["i1"],
  },
  {
    id: "t2",
    name: "Stitch sole",
    sequence: 2,
    status: "Ready",
    taskState: "READY",
    itemLevel: "Sole",
    batchIds: ["b1"],
    itemIds: ["i1"],
  },
  {
    id: "t3",
    name: "Polish",
    sequence: 1,
    status: "Done",
    taskState: "DONE",
    itemLevel: "Upper",
    batchIds: ["b2"],
    itemIds: ["i2"],
  },
  {
    id: "t4",
    name: "Pack",
    sequence: 2,
    status: "Done",
    taskState: "DONE",
    itemLevel: "Final",
    batchIds: ["b2"],
    itemIds: ["i2"],
  },
  {
    id: "t5",
    name: "Other date task",
    sequence: 1,
    status: "Ready",
    taskState: "READY",
    itemLevel: "Upper",
    batchIds: ["b3"],
    itemIds: ["i1"],
  },
  {
    id: "t6",
    name: "Other worker task",
    sequence: 1,
    status: "Ready",
    taskState: "READY",
    itemLevel: "Upper",
    batchIds: ["b4"],
    itemIds: ["i1"],
  },
];

const items: Item[] = [
  { id: "i1", name: "Oxford", service: "Resole", dueDate: "2026-10-24" },
  { id: "i2", name: "Tote", service: "Stitch", dueDate: "2026-10-25" },
];

describe("batch list calculation", () => {
  it("filters Ana's batches for 2026-10-22 and totals tasks accurately", () => {
    const summaries = summarizeBatches(
      batches,
      tasks,
      WORKER_NAME,
      BUSINESS_DATE,
    );

    expect(summaries).toHaveLength(2);
    expect(summaries.map((batch) => batch.id)).toEqual(["b1", "b2"]);

    const first = summaries.find((batch) => batch.id === "b1");
    expect(first).toMatchObject({
      totalTasks: 2,
      completedTasks: 1,
      started: true,
    });

    const second = summaries.find((batch) => batch.id === "b2");
    expect(second).toMatchObject({
      totalTasks: 2,
      completedTasks: 2,
      started: false,
    });

    const totalTasks = summaries.reduce((sum, batch) => sum + batch.totalTasks, 0);
    const completedTasks = summaries.reduce(
      (sum, batch) => sum + batch.completedTasks,
      0,
    );
    expect(totalTasks).toBe(4);
    expect(completedTasks).toBe(3);
  });

  it("sorts tasks by sequence and resolves linked item names", () => {
    const detail = buildBatchDetail(batches[0], tasks, items);

    expect(detail.tasks.map((task) => task.id)).toEqual(["t1", "t2"]);
    expect(detail.tasks.every((task) => task.itemName === "Oxford")).toBe(true);
  });
});
