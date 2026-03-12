import test from "node:test";
import assert from "node:assert/strict";

import { hydrateUserProfile } from "../src/lib/session-hydration.js";

test("normalizes raw {name,picture} into displayName and image", async () => {
  const user = {
    profile: undefined,
    async fetchProfile() {
      return {
        name: "Rover",
        image: "https://example.com/avatar.png",
        picture: "https://example.com/picture.png",
      };
    },
  };

  const profile = await hydrateUserProfile(user);

  assert.equal(profile?.name, "Rover");
  assert.equal(profile?.image, "https://example.com/avatar.png");
  assert.equal(profile?.displayName, "Rover");
  assert.equal(profile?.picture, "https://example.com/picture.png");
});

test("normalizes raw {display_name,picture} into displayName and image", async () => {
  const user = {
    profile: undefined,
    async fetchProfile() {
      return {
        display_name: "Display Name",
        picture: "https://example.com/picture.png",
      };
    },
  };

  const profile = await hydrateUserProfile(user);

  assert.equal(profile?.displayName, "Display Name");
  assert.equal(profile?.image, "https://example.com/picture.png");
  assert.equal(profile?.display_name, "Display Name");
});

test("raw {image,name} stays valid", async () => {
  const user = {
    profile: undefined,
    async fetchProfile() {
      return {
        name: "Existing",
        image: "https://example.com/existing.png",
      };
    },
  };

  const profile = await hydrateUserProfile(user);

  assert.equal(profile?.name, "Existing");
  assert.equal(profile?.image, "https://example.com/existing.png");
  assert.equal(profile?.displayName, "Existing");
});

test("null or invalid profile returns undefined", async () => {
  assert.equal(await hydrateUserProfile(null), undefined);

  const user = {
    profile: "invalid",
    async fetchProfile() {
      return { name: "Unexpected" };
    },
  };

  const profile = await hydrateUserProfile(user);
  assert.equal(profile, undefined);
});
