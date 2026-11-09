import test from "node:test";
import assert from "node:assert/strict";

const { toCheapImageSrc, resetCachedBadgeImageUrlsForTests } =
  await import("./cachedBadgeImages.js");

const PNG_1X1 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

test("data URLs become one reusable blob URL with the same bytes", async () => {
  resetCachedBadgeImageUrlsForTests();
  const first = toCheapImageSrc(PNG_1X1);
  assert.match(first, /^blob:/);
  assert.equal(toCheapImageSrc(PNG_1X1), first, "same data URL reuses its blob URL");
  const blob = await (await fetch(first)).arrayBuffer();
  const original = await (await fetch(PNG_1X1)).arrayBuffer();
  assert.deepEqual(new Uint8Array(blob), new Uint8Array(original));
  resetCachedBadgeImageUrlsForTests();
});

test("non-data URLs and broken payloads pass through unchanged", () => {
  resetCachedBadgeImageUrlsForTests();
  assert.equal(toCheapImageSrc("https://example.org/badge.png"), "https://example.org/badge.png");
  assert.equal(toCheapImageSrc(""), "");
  assert.equal(toCheapImageSrc("data:image/png;base64,***"), "data:image/png;base64,***");
  resetCachedBadgeImageUrlsForTests();
});
