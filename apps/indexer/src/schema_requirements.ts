import type { Pool } from "pg";

type ColumnTypeSpec = {
  name: string;
  allowedTypes: string[];
};

type TableRequirement = {
  tableName: string;
  columns: ColumnTypeSpec[];
  primaryKey: string[];
};

const REQUIRED_TABLES: TableRequirement[] = [
  {
    tableName: "ingestion_state",
    columns: [
      { name: "key", allowedTypes: ["text"] },
      { name: "value", allowedTypes: ["bigint", "int8"] },
      { name: "value_json", allowedTypes: ["jsonb"] },
      {
        name: "updated_at",
        allowedTypes: ["timestamp with time zone", "timestamptz"],
      },
    ],
    primaryKey: ["key"],
  },
  {
    tableName: "app_state_claims",
    columns: [
      { name: "pubkey", allowedTypes: ["text"] },
      { name: "d", allowedTypes: ["text"] },
      { name: "place_id", allowedTypes: ["text"] },
      { name: "role", allowedTypes: ["text"] },
      { name: "created_at", allowedTypes: ["bigint", "int8"] },
      { name: "event_id", allowedTypes: ["text"] },
      { name: "content", allowedTypes: ["text"] },
      {
        name: "updated_at",
        allowedTypes: ["timestamp with time zone", "timestamptz"],
      },
    ],
    primaryKey: ["pubkey", "d"],
  },
  {
    tableName: "signals_v2_events",
    columns: [
      { name: "event_id", allowedTypes: ["text"] },
      { name: "pubkey", allowedTypes: ["text"] },
      { name: "created_at", allowedTypes: ["bigint", "int8"] },
      { name: "place_id", allowedTypes: ["text"] },
      { name: "status", allowedTypes: ["text"] },
      { name: "day_utc", allowedTypes: ["integer", "int4"] },
      { name: "g", allowedTypes: ["text"] },
      { name: "client", allowedTypes: ["text"] },
      { name: "amount_msat", allowedTypes: ["bigint", "int8"] },
      { name: "zap", allowedTypes: ["text"] },
      { name: "bolt11", allowedTypes: ["text"] },
      { name: "content", allowedTypes: ["text"] },
      { name: "raw_event", allowedTypes: ["jsonb"] },
      { name: "payment_evidence", allowedTypes: ["jsonb"] },
      { name: "relay", allowedTypes: ["text"] },
      {
        name: "inserted_at",
        allowedTypes: ["timestamp with time zone", "timestamptz"],
      },
    ],
    primaryKey: ["event_id"],
  },
  {
    tableName: "signals_v2_state",
    columns: [
      { name: "pubkey", allowedTypes: ["text"] },
      { name: "place_id", allowedTypes: ["text"] },
      { name: "day_utc", allowedTypes: ["integer", "int4"] },
      { name: "status", allowedTypes: ["text"] },
      { name: "created_at", allowedTypes: ["bigint", "int8"] },
      { name: "event_id", allowedTypes: ["text"] },
      { name: "g", allowedTypes: ["text"] },
      { name: "client", allowedTypes: ["text"] },
      { name: "amount_msat", allowedTypes: ["bigint", "int8"] },
      { name: "zap", allowedTypes: ["text"] },
      { name: "bolt11", allowedTypes: ["text"] },
      { name: "content", allowedTypes: ["text"] },
      {
        name: "updated_at",
        allowedTypes: ["timestamp with time zone", "timestamptz"],
      },
    ],
    primaryKey: ["pubkey", "place_id", "day_utc"],
  },
];

const REQUIRED_INDEXES = ["signals_v2_events_dup_lookup_idx"] as const;

function normalizeTypeNames(dataType: string, udtName: string): Set<string> {
  return new Set([dataType.toLowerCase(), udtName.toLowerCase()]);
}

async function assertRequiredTablesExist(pool: Pool): Promise<void> {
  const tableNames = REQUIRED_TABLES.map((table) => table.tableName);
  const res = await pool.query<{ table_name: string }>(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = current_schema()
        AND table_name = ANY($1::text[])
    `,
    [tableNames],
  );
  const existing = new Set(res.rows.map((row) => row.table_name));
  const missing = tableNames.filter((tableName) => !existing.has(tableName));
  if (missing.length > 0) {
    throw new Error(
      `missing required schema table(s): ${missing.join(", ")}; run alembic upgrade head`,
    );
  }
}

async function assertRequiredColumns(pool: Pool): Promise<void> {
  const tableNames = REQUIRED_TABLES.map((table) => table.tableName);
  const res = await pool.query<{
    table_name: string;
    column_name: string;
    data_type: string;
    udt_name: string;
  }>(
    `
      SELECT table_name, column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = ANY($1::text[])
    `,
    [tableNames],
  );

  const byTable = new Map<string, Map<string, Set<string>>>();
  for (const row of res.rows) {
    const columns = byTable.get(row.table_name) ?? new Map<string, Set<string>>();
    columns.set(
      row.column_name,
      normalizeTypeNames(row.data_type, row.udt_name),
    );
    byTable.set(row.table_name, columns);
  }

  for (const table of REQUIRED_TABLES) {
    const columns = byTable.get(table.tableName) ?? new Map();
    for (const spec of table.columns) {
      const actualTypes = columns.get(spec.name);
      if (!actualTypes) {
        throw new Error(
          `table ${table.tableName} missing required column ${spec.name}; run alembic upgrade head`,
        );
      }
      const matches = spec.allowedTypes.some((typeName) =>
        actualTypes.has(typeName.toLowerCase()),
      );
      if (!matches) {
        throw new Error(
          `table ${table.tableName} column ${spec.name} has incompatible type; expected one of ${spec.allowedTypes.join(", ")}, found ${Array.from(actualTypes).join(", ")}`,
        );
      }
    }
  }
}

async function assertRequiredPrimaryKeys(pool: Pool): Promise<void> {
  const tableNames = REQUIRED_TABLES.map((table) => table.tableName);
  const res = await pool.query<{
    table_name: string;
    column_name: string;
    ordinal_position: string | number;
  }>(
    `
      SELECT kcu.table_name, kcu.column_name, kcu.ordinal_position
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = current_schema()
        AND tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = ANY($1::text[])
      ORDER BY kcu.table_name, kcu.ordinal_position
    `,
    [tableNames],
  );

  const byTable = new Map<string, string[]>();
  for (const row of res.rows) {
    const columns = byTable.get(row.table_name) ?? [];
    columns.push(row.column_name);
    byTable.set(row.table_name, columns);
  }

  for (const table of REQUIRED_TABLES) {
    const actual = byTable.get(table.tableName) ?? [];
    if (
      actual.length !== table.primaryKey.length ||
      actual.some((value, index) => value !== table.primaryKey[index])
    ) {
      throw new Error(
        `table ${table.tableName} has incompatible primary key; expected (${table.primaryKey.join(", ")}) but found (${actual.join(", ") || "none"})`,
      );
    }
  }
}

async function assertRequiredIndexes(pool: Pool): Promise<void> {
  const res = await pool.query<{ indexname: string }>(
    `
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = current_schema()
        AND indexname = ANY($1::text[])
    `,
    [[...REQUIRED_INDEXES]],
  );
  const existing = new Set(res.rows.map((row) => row.indexname));
  const missing = REQUIRED_INDEXES.filter((indexName) => !existing.has(indexName));
  if (missing.length > 0) {
    throw new Error(
      `missing required schema index(es): ${missing.join(", ")}; run alembic upgrade head`,
    );
  }
}

export async function assertRequiredIndexerSchema(pool: Pool): Promise<void> {
  await assertRequiredTablesExist(pool);
  await assertRequiredColumns(pool);
  await assertRequiredPrimaryKeys(pool);
  await assertRequiredIndexes(pool);
}
