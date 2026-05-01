import test from "node:test";
import assert from "node:assert/strict";
import { getInitialOnlineStatus } from "./useOfflineDetection.ts";

test("getInitialOnlineStatus falls back to true when navigator is unavailable", () => {
  assert.equal(getInitialOnlineStatus(), true);
});