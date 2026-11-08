import test from "node:test";
import assert from "node:assert/strict";
import { isLgConstrainedModel } from "./tvRuntimePerformance.js";

test("LG alpha5/alpha7 model lines are performance-constrained", () => {
  for (const model of [
    "OLED55B29LA",
    "OLED55B29LA.DEUQLJP",
    "OLED65B36LA",
    "OLED48A16LA",
    "OLED55A26LA",
    "55UQ70006LB",
    "43UP75009LF",
    "50NANO756PA",
    "32LQ63006LA"
  ]) {
    assert.equal(isLgConstrainedModel(model), true, model);
  }
});

test("LG flagship and newer B-series stay on the full effects profile", () => {
  for (const model of [
    "OLED55C29LD",
    "OLED65G26LA",
    "OLED55B46LA",
    "OLED77B56LA",
    "OLED42C34LA",
    "65QNED866RE",
    "",
    null
  ]) {
    assert.equal(isLgConstrainedModel(model), false, String(model));
  }
});
