import { readFileSync } from "node:fs";

const ENV_FILE = ".env.local";

try {
  const contents = readFileSync(ENV_FILE, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
} catch {
  console.warn(`No ${ENV_FILE} found. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID first.`);
}

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tables = [
  process.env.AIRTABLE_BATCHES_TABLE || "Batches",
  process.env.AIRTABLE_TASKS_TABLE || "Tasks",
  process.env.AIRTABLE_ITEMS_TABLE || "Items",
];

if (!apiKey || !baseId) {
  console.error("AIRTABLE_API_KEY and AIRTABLE_BASE_ID are required.");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${apiKey}` };

async function getJson(url) {
  const response = await fetch(url, { headers });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || `HTTP ${response.status}`);
  }
  return body;
}

console.log(`Base: ${baseId}\n`);

try {
  const metadata = await getJson(
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
  );
  for (const table of metadata.tables) {
    if (!tables.includes(table.name)) continue;
    console.log(`[metadata] ${table.name}`);
    for (const field of table.fields) {
      console.log(`  - ${field.name} (${field.type})`);
    }
    console.log();
  }
} catch (error) {
  console.warn(
    `Metadata API unavailable (${error.message}). Falling back to one sample record per table.\n`,
  );
}

for (const table of tables) {
  const url = new URL(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
  );
  url.searchParams.set("maxRecords", "1");

  try {
    const body = await getJson(url);
    const record = body.records?.[0];
    console.log(`[records] ${table}`);
    if (!record) {
      console.log("  (no records)");
    } else {
      for (const [field, value] of Object.entries(record.fields)) {
        console.log(`  - ${field}: ${JSON.stringify(value)}`);
      }
    }
    console.log();
  } catch (error) {
    console.error(`[records] ${table}: ${error.message}\n`);
  }
}
