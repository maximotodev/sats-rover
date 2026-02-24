import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const shimPath = path.join(repoRoot, "apps/web/src/contexts/NostrSessionContext.tsx");
const layoutPath = path.join(repoRoot, "apps/web/src/app/layout.tsx");
const srcRoot = path.join(repoRoot, "apps/web/src");

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listFiles(fullPath);
      }
      return [fullPath];
    }),
  );
  return files.flat();
}

test("identity-only architecture has no legacy session shim or wiring", async () => {
  const layout = await fs.readFile(layoutPath, "utf8");
  const files = await listFiles(srcRoot);
  const sourceContents = await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      content: await fs.readFile(filePath, "utf8"),
    })),
  );

  assert.equal(fsSync.existsSync(shimPath), false);
  assert.match(layout, /IdentityProvider/);
  assert.doesNotMatch(layout, /NostrSessionProvider/);
  assert.doesNotMatch(layout, /@\/contexts\/NostrSessionContext/);

  const legacyImports = sourceContents.filter(({ content }) =>
    content.includes('@/contexts/NostrSessionContext'),
  );
  assert.equal(legacyImports.length, 0);
});
