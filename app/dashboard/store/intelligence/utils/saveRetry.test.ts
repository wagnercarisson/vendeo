import test from "node:test";
import assert from "node:assert/strict";
import { getRetryDelay } from "./saveRetry.ts";

test("getRetryDelay uses exponential backoff", () => {
  assert.equal(getRetryDelay(1), 1000);
  assert.equal(getRetryDelay(2), 2000);
  assert.equal(getRetryDelay(3), 4000);
});

test("getRetryDelay never returns less than the first retry delay", () => {
  assert.equal(getRetryDelay(0), 1000);
});