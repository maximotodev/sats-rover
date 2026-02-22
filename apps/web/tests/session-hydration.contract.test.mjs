import test from "node:test";
import assert from "node:assert/strict";

import { hydrateUserProfile } from "../src/lib/session-hydration.js";

test("hydrates profile from mocked fetchProfile result", async () => {
  let calls = 0;
  const user = {
    profile: undefined,
    async fetchProfile() {
      calls += 1;
      return {
        name: "Rover",
        displayName: "Rover Ops",
        image: "https://example.com/avatar.png",
      };
    },
  };

  const profile = await hydrateUserProfile(user);

  assert.equal(calls, 1);
  assert.equal(profile?.name, "Rover");
  assert.equal(profile?.image, "https://example.com/avatar.png");
  assert.equal(user.profile?.displayName, "Rover Ops");
});

test("does not fetch when profile already exists", async () => {
  let calls = 0;
  const user = {
    profile: { name: "Existing", image: "https://example.com/existing.png" },
    async fetchProfile() {
      calls += 1;
      return { name: "Unexpected" };
    },
  };

  const profile = await hydrateUserProfile(user);

  assert.equal(calls, 0);
  assert.equal(profile?.name, "Existing");
});
