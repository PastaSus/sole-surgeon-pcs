export const WORKER_NAME = "Ana";
export const BUSINESS_DATE = "2026-10-22";

export type Batch = {
  id: string;
  name: string;
  worker: string;
  targetDate: string;
  taskIds: string[];
  startedAt: string | null;
  endTime: string | null;
  doneCount: number | null;
};

export type Task = {
  id: string;
  name: string;
  sequence: number | null;
  status: string;
  taskState: string;
  itemLevel: string;
  batchIds: string[];
  itemIds: string[];
};

export type Item = {
  id: string;
  name: string;
  service: string;
  dueDate: string;
};

export type BatchSummary = {
  id: string;
  name: string;
  targetDate: string;
  startedAt: string | null;
  endTime: string | null;
  totalTasks: number;
  completedTasks: number;
  started: boolean;
};

export type BatchTaskView = {
  id: string;
  name: string;
  sequence: number | null;
  status: string;
  taskState: string;
  itemLevel: string;
  itemName: string;
  itemService: string;
  itemDueDate: string;
  locked: boolean;
  done: boolean;
};

export type BatchDetail = {
  batch: BatchSummary;
  tasks: BatchTaskView[];
};

export type CompleteTaskResult = {
  task: {
    id: string;
    status: string;
    taskState: string;
  };
  batch: BatchSummary | null;
};
