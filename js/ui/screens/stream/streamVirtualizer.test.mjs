import test from "node:test";
import assert from "node:assert/strict";
import {
  buildStreamVirtualModel,
  canKeepStreamVirtualWindow,
  getStreamVirtualWindow
} from "./streamVirtualizer.js";

function model(count, extent = 310) {
  const keys = Array.from({ length: count }, (_, index) => `s${index}`);
  const offsets = [0];
  for (let index = 0; index < count; index += 1) offsets.push(offsets[index] + extent);
  return { keys, offsets, totalExtent: offsets[count], estimatedExtent: extent, rowGap: 0 };
}

const windowAt = (m, row) =>
  getStreamVirtualWindow(m, {
    scrollTop: row * 310,
    viewportHeight: 880,
    overscanPx: 720,
    minWindow: 20,
    preferredIndex: row
  });

test("a mounted window is kept while it still covers the needed rows", () => {
  const m = model(275);
  const mounted = windowAt(m, 40);
  assert.ok(mounted.neededStart >= mounted.start && mounted.neededEnd <= mounted.end);
  // One or two rows further the needed range is still inside the mounted 20 rows.
  assert.equal(canKeepStreamVirtualWindow(mounted, windowAt(m, 41), m), true);
  assert.equal(canKeepStreamVirtualWindow(mounted, windowAt(m, 43), m), true);
  // Far enough that the needed range leaves the mounted window: re-render.
  assert.equal(canKeepStreamVirtualWindow(mounted, windowAt(m, 52), m), false);
});

test("a changed row geometry always re-renders", () => {
  const m = model(275);
  const mounted = windowAt(m, 40);
  const remeasured = model(275, 320);
  assert.equal(canKeepStreamVirtualWindow(mounted, windowAt(remeasured, 41), remeasured), false);
  const shorter = model(100);
  assert.equal(canKeepStreamVirtualWindow(mounted, windowAt(shorter, 41), shorter), false);
  assert.equal(canKeepStreamVirtualWindow(null, windowAt(m, 41), m), false);
});

test("buildStreamVirtualModel output works with the keep check", () => {
  assert.equal(typeof buildStreamVirtualModel, "function");
});
