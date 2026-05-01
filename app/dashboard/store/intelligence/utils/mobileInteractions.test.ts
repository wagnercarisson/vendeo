import test from "node:test";
import assert from "node:assert/strict";
import { getSwipeTabDirection } from "./mobileInteractions.ts";

test("getSwipeTabDirection returns next tab for a strong left swipe", () => {
  assert.equal(getSwipeTabDirection(200, 100, 120, 105), 1);
});

test("getSwipeTabDirection returns previous tab for a strong right swipe", () => {
  assert.equal(getSwipeTabDirection(120, 100, 210, 95), -1);
});

test("getSwipeTabDirection ignores short or mostly vertical gestures", () => {
  assert.equal(getSwipeTabDirection(100, 100, 130, 104), 0);
  assert.equal(getSwipeTabDirection(100, 100, 170, 220), 0);
});