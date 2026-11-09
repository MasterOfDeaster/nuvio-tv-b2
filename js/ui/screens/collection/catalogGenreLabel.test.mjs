import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage ??= {
  getItem: () => null,
  setItem() {},
  removeItem() {},
  key: () => null,
  length: 0
};
const { buildAddonTabLabel, isDisplayableCatalogGenre } =
  await import("./folderDetailScreenHelpers-02-build-fallback-streaming-sources.js");

test("'None' and empty genres are not shown in catalog titles", () => {
  for (const genre of ["None", "none", " NONE ", "null", "undefined", "", null, undefined]) {
    assert.equal(isDisplayableCatalogGenre(genre), false, String(genre));
    assert.equal(buildAddonTabLabel({ catalogName: "Netflix", genre }), "Netflix");
  }
});

test("real genres are still shown", () => {
  assert.equal(isDisplayableCatalogGenre("Action"), true);
  assert.equal(buildAddonTabLabel({ catalogName: "Netflix", genre: "Action" }), "Netflix · Action");
  // A genre that only contains the word is kept.
  assert.equal(buildAddonTabLabel({ catalogName: "Docs", genre: "Nonesuch" }), "Docs · Nonesuch");
});
