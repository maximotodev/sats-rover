import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const shimPath = path.join(repoRoot, "apps/web/src/contexts/NostrSessionContext.tsx");
const layoutPath = path.join(repoRoot, "apps/web/src/app/layout.tsx");

test("legacy NostrSessionContext shim is removed from root wiring", async () => {
  const shimExists = await fs
    .stat(shimPath)
    .then(() => true)
    .catch(() => false);

  const layout = await fs.readFile(layoutPath, "utf8");

  if (shimExists) {
    const source = await fs.readFile(shimPath, "utf8");
    assert.match(source, /useIdentity/);
    assert.doesNotMatch(source, /useNostr/);
    assert.match(source, /export function useSession/);
    assert.match(source, /export function NostrSessionProvider/);
  } else {
    assert.equal(shimExists, false);
    assert.doesNotMatch(layout, /NostrSessionProvider/);
    assert.doesNotMatch(layout, /@\/contexts\/NostrSessionContext/);
  }
});
