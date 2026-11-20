import { describe, expect, it, vi } from "vitest";
import type { AirtableClient, AirtableConfig } from "./airtable-client";
import { createAirtableRepository } from "./airtable-repository";
import type { RawRecord } from "./schema";

const config: AirtableConfig = {
  apiKey: "test-key",
  baseId: "app-test",
  batchesTable: "Batches",
  tasksTable: "Tasks",
  itemsTable: "Items",
};

const records: Record<string, RawRecord[]> = {
  Batches: [
    {
      id: "b1",
      fields: {
        "Batch Name": "Batch A",
        Worker: "Ana",
        "Target Date": "2026-10-22",
        Tasks: ["t1", "t2"],
        "Started At": "",
        "End Time": "",
        "Done Count": 1,
      },
    },
  ],
  Tasks: [
    {
      id: "t1",
      fields: {
        "Task Name": "Clean upper",
        Sequence: 1,
        Status: "Done",
        "Task State": "DONE",
        "Item Level": "Upper",
        Batch: ["b1"],
        Item: ["i1"],
      },
    },
    {
      id: "t2",
      fields: {
        "Task Name": "Stitch sole",
        Sequence: 2,
        Status: "Ready",
        "Task State": "READY",
        "Item Level": "Sole",
        Batch: ["b1"],
        Item: ["i1"],
      },
    },
  ],
  Items: [
    {
      id: "i1",
      fields: {
        "Item Name": "Oxford",
        Service: "Resole",
        "Due Date": "2026-10-24",
      },
    },
  ],
};

function makeClient() {
  const updateRecord = vi.fn(async () => records.Batches[0]);

  const client = {
    config,
    listRecords: vi.fn(async (table: string) => records[table] ?? []),
    getRecord: vi.fn(async (table: string, id: string) => {
      return records[table]?.find((record) => record.id === id) ?? null;
    }),
    updateRecord,
  } satisfies AirtableClient;

  return { client, updateRecord };
}

describe("Airtable repository mapping", () => {
  it("maps alternate field names and linked-record ids without live calls", async () => {
    const { client } = makeClient();
    const repository = createAirtableRepository(config, client);

    const batches = await repository.listBatches();
    expect(batches[0]).toEqual({
      id: "b1",
      name: "Batch A",
      worker: "Ana",
      targetDate: "2026-10-22",
      taskIds: ["t1", "t2"],
      startedAt: null,
      endTime: null,
      doneCount: 1,
    });

    const tasks = await repository.listTasks();
    expect(tasks[1]).toMatchObject({
      id: "t2",
      name: "Stitch sole",
      sequence: 2,
      status: "Ready",
      taskState: "READY",
      batchIds: ["b1"],
      itemIds: ["i1"],
    });

    const items = await repository.listItems();
    expect(items[0]).toEqual({
      id: "i1",
      name: "Oxford",
      service: "Resole",
      dueDate: "2026-10-24",
    });
  });

  it("writes to the resolved Airtable field names", async () => {
    const { client, updateRecord } = makeClient();
    const repository = createAirtableRepository(config, client);
    const startedAt = "2026-10-22T12:34:56.000Z";

    await repository.setBatchStartedAt("b1", startedAt);
    expect(updateRecord).toHaveBeenCalledWith("Batches", "b1", {
      "Started At": startedAt,
    });

    await repository.markTaskDone("t1");
    expect(updateRecord).toHaveBeenCalledWith("Tasks", "t1", {
      Status: "Done",
    });
  });
});
