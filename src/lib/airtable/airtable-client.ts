import { AirtableConfigError, AirtableRequestError } from "@/lib/pcs/errors";
import type { RawRecord } from "./schema";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

export type AirtableConfig = {
  apiKey: string;
  baseId: string;
  batchesTable: string;
  tasksTable: string;
  itemsTable: string;
};

function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function loadAirtableConfig(): AirtableConfig {
  const apiKey = readEnv("AIRTABLE_API_KEY");
  const baseId = readEnv("AIRTABLE_BASE_ID");

  if (!apiKey || !baseId) {
    throw new AirtableConfigError(
      "Airtable is not configured. Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID to .env.local.",
    );
  }

  return {
    apiKey,
    baseId,
    batchesTable: readEnv("AIRTABLE_BATCHES_TABLE") || "Batches",
    tasksTable: readEnv("AIRTABLE_TASKS_TABLE") || "Tasks",
    itemsTable: readEnv("AIRTABLE_ITEMS_TABLE") || "Items",
  };
}

type AirtableListResponse = {
  records: RawRecord[];
  offset?: string;
};

type AirtableErrorResponse = {
  error?: {
    type?: string;
    message?: string;
  };
};

async function requestJson<T>(
  config: AirtableConfig,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${AIRTABLE_API_URL}/${config.baseId}/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = `Airtable request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as AirtableErrorResponse;
      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      // Keep the status-based message when Airtable returns a non-JSON body.
    }
    throw new AirtableRequestError(message, response.status);
  }

  return (await response.json()) as T;
}

function tablePath(table: string): string {
  return encodeURIComponent(table);
}

export function createAirtableClient(config: AirtableConfig) {
  async function listRecords(table: string): Promise<RawRecord[]> {
    const records: RawRecord[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams({ pageSize: "100" });
      if (offset) {
        params.set("offset", offset);
      }

      const body = await requestJson<AirtableListResponse>(
        config,
        `${tablePath(table)}?${params.toString()}`,
      );
      records.push(...body.records);
      offset = body.offset;
    } while (offset);

    return records;
  }

  async function getRecord(
    table: string,
    recordId: string,
  ): Promise<RawRecord | null> {
    try {
      return await requestJson<RawRecord>(
        config,
        `${tablePath(table)}/${encodeURIComponent(recordId)}`,
      );
    } catch (error) {
      if (error instanceof AirtableRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async function updateRecord(
    table: string,
    recordId: string,
    fields: Record<string, unknown>,
  ): Promise<RawRecord> {
    return requestJson<RawRecord>(
      config,
      `${tablePath(table)}/${encodeURIComponent(recordId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ fields, typecast: true }),
      },
    );
  }

  return {
    listRecords,
    getRecord,
    updateRecord,
    config,
  };
}

export type AirtableClient = ReturnType<typeof createAirtableClient>;
