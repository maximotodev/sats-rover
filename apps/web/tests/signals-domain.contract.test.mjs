import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

async function loadTsModule(relativePath) {
  const abs = path.join(process.cwd(), relativePath);
  const source = await fs.readFile(abs, "utf8");
  const out = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: abs,
  });
  const dataUrl =
    "data:text/javascript;base64," +
    Buffer.from(out.outputText, "utf8").toString("base64");
  return import(dataUrl);
}

test("unwrapData supports {data:T} and raw T", async () => {
  const { unwrapData } = await loadTsModule("apps/web/src/domain/signals/transport.ts");
  assert.equal(unwrapData({ data: { ok: true } }).ok, true);
  assert.equal(unwrapData({ ok: true }).ok, true);
  assert.equal(unwrapData(42), 42);
});

test("normalize + dedupe sorts newest first and prefers non-pending", async () => {
  const { normalizeSignalFeedItem, dedupeAndSortSignalFeed } = await loadTsModule(
    "apps/web/src/domain/signals/normalize.ts",
  );

  const older = normalizeSignalFeedItem(
    {
      event_id: "evt-1",
      pubkey: "a".repeat(64),
      status: "success",
      content: "older",
      created_at: "2026-01-01T00:00:00.000Z",
    },
    { placeId: "p1", source: "optimistic", pending: true },
  );

  const newer = normalizeSignalFeedItem(
    {
      event_id: "evt-1",
      pubkey: "a".repeat(64),
      status: "success",
      content: "newer",
      created_at: "2026-01-01T00:01:00.000Z",
    },
    { placeId: "p1", source: "indexer", pending: false },
  );

  const another = normalizeSignalFeedItem(
    {
      event_id: "evt-2",
      pubkey: "b".repeat(64),
      status: "failed",
      content: "second",
      created_at: "2026-01-02T00:00:00.000Z",
    },
    { placeId: "p1", source: "indexer" },
  );

  assert.ok(older);
  assert.ok(newer);
  assert.ok(another);

  const result = dedupeAndSortSignalFeed([
    older,
    newer,
    another,
  ]);

  assert.equal(result.length, 2);
  assert.equal(result[0].id, "evt-2");
  assert.equal(result[1].id, "evt-1");
  assert.equal(result[1].pending, false);
  assert.equal(result[1].content, "newer");
});

test("collapsePendingForEventId clears pending only for exact event id", async () => {
  const { collapsePendingForEventId } = await loadTsModule(
    "apps/web/src/domain/signals/normalize.ts",
  );

  const items = [
    {
      id: "evt-1",
      placeId: "p1",
      pubkey: "a".repeat(64),
      status: "success",
      content: "optimistic",
      createdAt: "2026-01-01T00:00:00.000Z",
      createdAtMs: Date.parse("2026-01-01T00:00:00.000Z"),
      source: "optimistic",
      pending: true,
    },
    {
      id: "evt-2",
      placeId: "p1",
      pubkey: "b".repeat(64),
      status: "failed",
      content: "still pending",
      createdAt: "2026-01-01T00:01:00.000Z",
      createdAtMs: Date.parse("2026-01-01T00:01:00.000Z"),
      source: "optimistic",
      pending: true,
    },
  ];

  const result = collapsePendingForEventId(items, "evt-1");
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "evt-1");
  assert.equal(result[0].pending, false);
  assert.equal(result[0].source, "indexer");
  assert.equal(result[1].id, "evt-2");
  assert.equal(result[1].pending, true);
});

test("collapsePendingForEventId does nothing when event id does not match", async () => {
  const { collapsePendingForEventId } = await loadTsModule(
    "apps/web/src/domain/signals/normalize.ts",
  );
  const item = {
    id: "evt-local",
    placeId: "p1",
    pubkey: "a".repeat(64),
    status: "success",
    content: "optimistic",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdAtMs: Date.parse("2026-01-01T00:00:00.000Z"),
    source: "optimistic",
    pending: true,
  };
  const result = collapsePendingForEventId([item], "evt-canonical");
  assert.equal(result[0].id, "evt-local");
  assert.equal(result[0].pending, true);
  assert.equal(result[0].source, "optimistic");
});
