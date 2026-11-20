import type { Batch, Item, Task } from "./types";

export interface PcsRepository {
  listBatches(): Promise<Batch[]>;
  getBatch(id: string): Promise<Batch | null>;
  setBatchStartedAt(id: string, startedAt: string): Promise<void>;
  listTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  markTaskDone(id: string): Promise<void>;
  listItems(): Promise<Item[]>;
}
