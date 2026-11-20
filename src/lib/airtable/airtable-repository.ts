import { AirtableConfigError } from "@/lib/pcs/errors";
import type { PcsRepository } from "@/lib/pcs/repository";
import type { Batch, Item, Task } from "@/lib/pcs/types";
import {
  createAirtableClient,
  loadAirtableConfig,
  type AirtableClient,
  type AirtableConfig,
} from "./airtable-client";
import {
  resolveBatchFields,
  resolveItemFields,
  resolveTaskFields,
  type RawRecord,
} from "./schema";

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => toText(entry))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return toText(record.name ?? record.email ?? record.label ?? "");
  }
  return "";
}

function toNumber(value: unknown): number | null {
  if (Array.isArray(value)) {
    return value.length > 0 ? toNumber(value[0]) : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        return typeof record.id === "string" ? record.id : "";
      }
      return "";
    })
    .filter(Boolean);
}

function mapBatch(record: RawRecord, available: RawRecord[]): Batch {
  const fields = resolveBatchFields(available);

  return {
    id: record.id,
    name: toText(record.fields[fields.name]) || `Batch ${record.id.slice(-4)}`,
    worker: toText(record.fields[fields.worker]),
    targetDate: toText(record.fields[fields.targetDate]),
    taskIds: toIds(record.fields[fields.taskIds]),
    startedAt: toText(record.fields[fields.startedAt]) || null,
    endTime: toText(record.fields[fields.endTime]) || null,
    doneCount: toNumber(record.fields[fields.doneCount]),
  };
}

function mapTask(record: RawRecord, available: RawRecord[]): Task {
  const fields = resolveTaskFields(available);

  return {
    id: record.id,
    name: toText(record.fields[fields.name]) || "Untitled task",
    sequence: toNumber(record.fields[fields.sequence]),
    status: toText(record.fields[fields.status]),
    taskState: toText(record.fields[fields.taskState]),
    itemLevel: toText(record.fields[fields.itemLevel]),
    batchIds: toIds(record.fields[fields.batchIds]),
    itemIds: toIds(record.fields[fields.itemIds]),
  };
}

function mapItem(record: RawRecord, available: RawRecord[]): Item {
  const fields = resolveItemFields(available);

  return {
    id: record.id,
    name: toText(record.fields[fields.name]) || "Unknown item",
    service: toText(record.fields[fields.service]),
    dueDate: toText(record.fields[fields.dueDate]),
  };
}

export function createAirtableRepository(
  config: AirtableConfig = loadAirtableConfig(),
  client: AirtableClient = createAirtableClient(config),
): PcsRepository {
  async function allBatches(): Promise<RawRecord[]> {
    return client.listRecords(config.batchesTable);
  }

  async function allTasks(): Promise<RawRecord[]> {
    return client.listRecords(config.tasksTable);
  }

  async function allItems(): Promise<RawRecord[]> {
    return client.listRecords(config.itemsTable);
  }

  return {
    async listBatches() {
      const records = await allBatches();
      return records.map((record) => mapBatch(record, records));
    },

    async getBatch(id) {
      const records = await allBatches();
      const record = records.find((entry) => entry.id === id);
      return record ? mapBatch(record, records) : null;
    },

    async setBatchStartedAt(id, startedAt) {
      const records = await allBatches();
      const record = records.find((entry) => entry.id === id);
      if (!record) {
        throw new AirtableConfigError("Batch not found while saving.");
      }
      const fields = resolveBatchFields(records);
      await client.updateRecord(config.batchesTable, id, {
        [fields.startedAt]: startedAt,
      });
    },

    async listTasks() {
      const records = await allTasks();
      return records.map((record) => mapTask(record, records));
    },

    async getTask(id) {
      const records = await allTasks();
      const record = records.find((entry) => entry.id === id);
      return record ? mapTask(record, records) : null;
    },

    async markTaskDone(id) {
      const records = await allTasks();
      const record = records.find((entry) => entry.id === id);
      if (!record) {
        throw new AirtableConfigError("Task not found while saving.");
      }
      const fields = resolveTaskFields(records);
      await client.updateRecord(config.tasksTable, id, {
        [fields.status]: "Done",
      });
    },

    async listItems() {
      const records = await allItems();
      return records.map((record) => mapItem(record, records));
    },
  };
}
