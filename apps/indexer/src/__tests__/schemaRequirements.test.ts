import test from "node:test";
import assert from "node:assert/strict";

import { assertRequiredIndexerSchema } from "../schema_requirements.js";

type QueryResultRow = Record<string, string>;

class FakePool {
  private readonly responses: {
    tables?: QueryResultRow[];
    columns?: QueryResultRow[];
    primaryKeys?: QueryResultRow[];
    indexes?: QueryResultRow[];
  };

  constructor(responses: {
    tables?: QueryResultRow[];
    columns?: QueryResultRow[];
    primaryKeys?: QueryResultRow[];
    indexes?: QueryResultRow[];
  }) {
    this.responses = responses;
  }

  async query(sql: string): Promise<{ rows: QueryResultRow[] }> {
    if (sql.includes("FROM information_schema.tables")) {
      return { rows: this.responses.tables ?? [] };
    }
    if (sql.includes("FROM information_schema.columns")) {
      return { rows: this.responses.columns ?? [] };
    }
    if (sql.includes("FROM information_schema.table_constraints")) {
      return { rows: this.responses.primaryKeys ?? [] };
    }
    if (sql.includes("FROM pg_indexes")) {
      return { rows: this.responses.indexes ?? [] };
    }
    throw new Error(`unexpected SQL: ${sql}`);
  }
}

function requiredColumns(): QueryResultRow[] {
  return [
    { table_name: "ingestion_state", column_name: "key", data_type: "text", udt_name: "text" },
    { table_name: "ingestion_state", column_name: "value", data_type: "bigint", udt_name: "int8" },
    { table_name: "ingestion_state", column_name: "value_json", data_type: "jsonb", udt_name: "jsonb" },
    { table_name: "ingestion_state", column_name: "updated_at", data_type: "timestamp with time zone", udt_name: "timestamptz" },
    { table_name: "app_state_claims", column_name: "pubkey", data_type: "text", udt_name: "text" },
    { table_name: "app_state_claims", column_name: "d", data_type: "text", udt_name: "text" },
    { table_name: "app_state_claims", column_name: "place_id", data_type: "text", udt_name: "text" },
    { table_name: "app_state_claims", column_name: "role", data_type: "text", udt_name: "text" },
    { table_name: "app_state_claims", column_name: "created_at", data_type: "bigint", udt_name: "int8" },
    { table_name: "app_state_claims", column_name: "event_id", data_type: "text", udt_name: "text" },
    { table_name: "app_state_claims", column_name: "content", data_type: "text", udt_name: "text" },
    { table_name: "app_state_claims", column_name: "updated_at", data_type: "timestamp with time zone", udt_name: "timestamptz" },
    { table_name: "signals_v2_events", column_name: "event_id", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "pubkey", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "created_at", data_type: "bigint", udt_name: "int8" },
    { table_name: "signals_v2_events", column_name: "place_id", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "status", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "day_utc", data_type: "integer", udt_name: "int4" },
    { table_name: "signals_v2_events", column_name: "g", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "client", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "amount_msat", data_type: "bigint", udt_name: "int8" },
    { table_name: "signals_v2_events", column_name: "zap", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "bolt11", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "content", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "raw_event", data_type: "jsonb", udt_name: "jsonb" },
    { table_name: "signals_v2_events", column_name: "payment_evidence", data_type: "jsonb", udt_name: "jsonb" },
    { table_name: "signals_v2_events", column_name: "relay", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_events", column_name: "inserted_at", data_type: "timestamp with time zone", udt_name: "timestamptz" },
    { table_name: "signals_v2_state", column_name: "pubkey", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "place_id", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "day_utc", data_type: "integer", udt_name: "int4" },
    { table_name: "signals_v2_state", column_name: "status", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "created_at", data_type: "bigint", udt_name: "int8" },
    { table_name: "signals_v2_state", column_name: "event_id", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "g", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "client", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "amount_msat", data_type: "bigint", udt_name: "int8" },
    { table_name: "signals_v2_state", column_name: "zap", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "bolt11", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "content", data_type: "text", udt_name: "text" },
    { table_name: "signals_v2_state", column_name: "updated_at", data_type: "timestamp with time zone", udt_name: "timestamptz" },
  ];
}

function requiredPrimaryKeys(): QueryResultRow[] {
  return [
    { table_name: "app_state_claims", column_name: "pubkey", ordinal_position: "1" },
    { table_name: "app_state_claims", column_name: "d", ordinal_position: "2" },
    { table_name: "ingestion_state", column_name: "key", ordinal_position: "1" },
    { table_name: "signals_v2_events", column_name: "event_id", ordinal_position: "1" },
    { table_name: "signals_v2_state", column_name: "pubkey", ordinal_position: "1" },
    { table_name: "signals_v2_state", column_name: "place_id", ordinal_position: "2" },
    { table_name: "signals_v2_state", column_name: "day_utc", ordinal_position: "3" },
  ];
}

test("schema requirements accept the migration-owned v2 schema shape", async () => {
  const pool = new FakePool({
    tables: [
      { table_name: "ingestion_state" },
      { table_name: "app_state_claims" },
      { table_name: "signals_v2_events" },
      { table_name: "signals_v2_state" },
    ],
    columns: requiredColumns(),
    primaryKeys: requiredPrimaryKeys(),
    indexes: [{ indexname: "signals_v2_events_dup_lookup_idx" }],
  });

  await assert.doesNotReject(() =>
    assertRequiredIndexerSchema(pool as any),
  );
});

test("schema requirements fail loudly when a required table is missing", async () => {
  const pool = new FakePool({
    tables: [
      { table_name: "ingestion_state" },
      { table_name: "app_state_claims" },
      { table_name: "signals_v2_events" },
    ],
  });

  await assert.rejects(
    () => assertRequiredIndexerSchema(pool as any),
    /missing required schema table\(s\): signals_v2_state/,
  );
});

test("schema requirements fail loudly when ingestion_state uses the legacy text value shape", async () => {
  const columns = requiredColumns().map((row) =>
    row.table_name === "ingestion_state" && row.column_name === "value"
      ? { ...row, data_type: "text", udt_name: "text" }
      : row,
  );
  const pool = new FakePool({
    tables: [
      { table_name: "ingestion_state" },
      { table_name: "app_state_claims" },
      { table_name: "signals_v2_events" },
      { table_name: "signals_v2_state" },
    ],
    columns,
    primaryKeys: requiredPrimaryKeys(),
    indexes: [{ indexname: "signals_v2_events_dup_lookup_idx" }],
  });

  await assert.rejects(
    () => assertRequiredIndexerSchema(pool as any),
    /table ingestion_state column value has incompatible type/,
  );
});

test("schema requirements fail loudly when the duplicate lookup index is missing", async () => {
  const pool = new FakePool({
    tables: [
      { table_name: "ingestion_state" },
      { table_name: "app_state_claims" },
      { table_name: "signals_v2_events" },
      { table_name: "signals_v2_state" },
    ],
    columns: requiredColumns(),
    primaryKeys: requiredPrimaryKeys(),
    indexes: [],
  });

  await assert.rejects(
    () => assertRequiredIndexerSchema(pool as any),
    /missing required schema index\(es\): signals_v2_events_dup_lookup_idx/,
  );
});
