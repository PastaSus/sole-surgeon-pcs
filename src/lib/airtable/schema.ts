export type RawRecord = {
  id: string;
  fields: Record<string, unknown>;
  createdTime?: string;
};

type AliasMap = Record<string, string[]>;

export const BATCH_FIELD_ALIASES = {
  name: ["Name", "Batch Name", "Batch"],
  worker: ["Worker", "Assigned To", "Assigned Worker", "Worker Name"],
  targetDate: ["Target Date", "Target date", "TargetDate"],
  taskIds: ["Tasks", "Assigned Tasks", "Batch Tasks", "Task"],
  startedAt: ["Started At", "Started at", "StartedAt", "Start At"],
  endTime: ["End Time", "End time", "Ended At", "EndedAt", "Finished At", "Completed At"],
  doneCount: ["Done Count", "Done count", "DoneCount", "Completed Count"],
} satisfies AliasMap;

export const TASK_FIELD_ALIASES = {
  name: ["Name", "Task Name", "Task"],
  sequence: ["Sequence", "Seq", "Order", "Step", "Sequence Number"],
  status: ["Status", "Task Status"],
  taskState: ["Task State", "Task state", "TaskState", "State"],
  itemLevel: ["Item Level", "Item level", "ItemLevel"],
  batchIds: ["Batch", "Batches", "Assigned Batch", "Batch Assigned"],
  itemIds: ["Item", "Items", "Item Name", "Product"],
} satisfies AliasMap;

export const ITEM_FIELD_ALIASES = {
  name: ["Name", "Item Name", "Item"],
  service: ["Service", "Services", "Service Type"],
  dueDate: ["Due Date", "Due date", "DueDate"],
} satisfies AliasMap;

export type BatchFields = { [K in keyof typeof BATCH_FIELD_ALIASES]: string };
export type TaskFields = { [K in keyof typeof TASK_FIELD_ALIASES]: string };
export type ItemFields = { [K in keyof typeof ITEM_FIELD_ALIASES]: string };

function normalizeFieldName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function collectFieldNames(records: RawRecord[]): string[] {
  const names = new Set<string>();
  for (const record of records) {
    for (const key of Object.keys(record.fields)) {
      names.add(key);
    }
  }
  return [...names];
}

function resolveAlias(availableNames: string[], aliases: string[]): string {
  for (const alias of aliases) {
    const exact = availableNames.find(
      (name) => name.trim().toLowerCase() === alias.toLowerCase(),
    );
    if (exact) {
      return exact;
    }
  }

  for (const alias of aliases) {
    const normalizedAlias = normalizeFieldName(alias);
    const close = availableNames.find(
      (name) => normalizeFieldName(name) === normalizedAlias,
    );
    if (close) {
      return close;
    }
  }

  for (const alias of aliases) {
    const normalizedAlias = normalizeFieldName(alias);
    const partial = availableNames.find((name) => {
      const normalizedName = normalizeFieldName(name);
      return (
        normalizedName.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedName)
      );
    });
    if (partial) {
      return partial;
    }
  }

  return aliases[0];
}

function resolveFields<T extends AliasMap>(
  records: RawRecord[],
  aliases: T,
): { [K in keyof T]: string } {
  const availableNames = collectFieldNames(records);
  const resolved = {} as { [K in keyof T]: string };

  for (const key of Object.keys(aliases) as Array<keyof T>) {
    resolved[key] = resolveAlias(availableNames, aliases[key]);
  }

  return resolved;
}

export function resolveBatchFields(records: RawRecord[]): BatchFields {
  return resolveFields(records, BATCH_FIELD_ALIASES);
}

export function resolveTaskFields(records: RawRecord[]): TaskFields {
  return resolveFields(records, TASK_FIELD_ALIASES);
}

export function resolveItemFields(records: RawRecord[]): ItemFields {
  return resolveFields(records, ITEM_FIELD_ALIASES);
}
