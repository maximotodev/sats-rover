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

test("check-in signal tags always include explicit v2 tag", async () => {
  const { buildCheckinSignalTags } = await loadTsModule(
    "apps/web/src/flows/signal-tags.ts",
  );
  const tags = buildCheckinSignalTags("btcmap:node:1", "success");
  assert.deepEqual(tags[0], ["t", "satsrover"]);
  assert.deepEqual(tags[1], ["v", "2"]);
  assert.deepEqual(tags[2], ["place", "btcmap:node:1"]);
  assert.deepEqual(tags[3], ["status", "success"]);
});
