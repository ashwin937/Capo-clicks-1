import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";

// Tables backed up, in an order that's safe to restore (parents before
// children — bookings.order_id references orders.id).
const TABLES = [
  "frame_sizes",
  "packages",
  "quote_services",
  "orders",
  "bookings",
  "gallery_items"
] as const;

const ROWS_PER_INSERT = 200;

// Formats a single JS value (as returned by supabase-js) into a Postgres
// SQL literal suitable for an INSERT statement.
function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";

  if (Array.isArray(value)) {
    // Postgres array literal, e.g. for packages.includes (text[])
    return `ARRAY[${value.map((v) => sqlValue(v)).join(", ")}]`;
  }

  if (typeof value === "object") {
    // jsonb columns (e.g. orders.item_summary) come back as parsed objects
    const json = JSON.stringify(value).replace(/'/g, "''");
    return `'${json}'::jsonb`;
  }

  // Strings, dates, uuids, timestamps — all safe as quoted text literals
  return `'${String(value).replace(/'/g, "''")}'`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function tableToSql(table: string, rows: Record<string, unknown>[]): string {
  if (!rows || rows.length === 0) {
    return `-- Table: ${table} — 0 rows, nothing to restore\n`;
  }

  const columns = Object.keys(rows[0]);
  const hasId = columns.includes("id");

  let sql = `-- Table: ${table} (${rows.length} row${rows.length === 1 ? "" : "s"})\n`;

  for (const batch of chunk(rows, ROWS_PER_INSERT)) {
    const valuesSql = batch
      .map((row) => `  (${columns.map((c) => sqlValue(row[c])).join(", ")})`)
      .join(",\n");

    sql += `INSERT INTO ${table} (${columns.join(", ")}) VALUES\n${valuesSql}\n`;
    sql += hasId ? `ON CONFLICT (id) DO NOTHING;\n\n` : `;\n\n`;
  }

  return sql;
}

export type BackupResult = {
  sql: string;
  filename: string;
  rowCounts: Record<string, number>;
  errors: string[];
};

// Data-only backup: a real `pg_dump` binary isn't available in this app's
// serverless hosting, so this reads every table through Supabase (service
// role client, bypasses RLS) and re-emits it as plain restorable SQL.
export async function generateBackupSql(): Promise<BackupResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase isn't configured — nothing to back up yet.");
  }
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    throw new Error("Supabase service client unavailable.");
  }

  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `capo-clicks-backup-${stamp}.sql`;

  let sql = `-- Capo Clicks Photography — database backup\n`;
  sql += `-- Generated: ${now.toISOString()}\n`;
  sql += `--\n`;
  sql += `-- This is a DATA-ONLY backup (INSERT statements for every row in every\n`;
  sql += `-- app table), not a schema dump.\n`;
  sql += `--\n`;
  sql += `-- To restore on a fresh database:\n`;
  sql += `--   1. Run supabase/schema.sql first (creates tables + RLS policies)\n`;
  sql += `--   2. psql "$DATABASE_URL" -f ${filename}\n`;
  sql += `--      (or paste this file into the Supabase SQL editor)\n\n`;
  sql += `BEGIN;\n\n`;

  const errors: string[] = [];
  const rowCounts: Record<string, number> = {};

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      errors.push(`${table}: ${error.message}`);
      sql += `-- Table: ${table} — FAILED TO READ: ${error.message.replace(/\n/g, " ")}\n\n`;
      continue;
    }
    rowCounts[table] = data?.length ?? 0;
    sql += tableToSql(table, data ?? []);
  }

  sql += `COMMIT;\n`;

  if (errors.length > 0) {
    sql = `-- WARNING: some tables failed to export: ${errors.join("; ")}\n\n` + sql;
  }

  return { sql, filename, rowCounts, errors };
}
