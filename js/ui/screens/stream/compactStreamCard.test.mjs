import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage ??= {
  getItem: () => null,
  setItem() {},
  removeItem() {},
  key: () => null,
  length: 0
};
const { getCompactStreamSummary, getStreamReleaseGroup } =
  await import("./streamScreenHelpers-02-flatten-streams.js");

const AIO = {
  name: "   4K ‍‍    ‍‍‍⚡‍‍\n  〈Bluray〉‍     ‍\n  ★★★☆            ",
  description:
    "✎  Oppenheimer (2023) \n▣  HEVC ✦ DV · HDR10  \n◈ 42 GB · 31.1 ᴹᵇᵖˢ · 8d\n⛉ [TB] ComeTorz · MainFrame\n✓ ᴇɴ",
  behaviorHints: {
    filename: "Oppenheimer.2023.2160p.BluRay.DTS-HD.MA.5.1.DV.HDR10.x265-MainFrame.mkv",
    videoSize: 42033663382
  }
};

test("AIOStreams stream becomes cached + source · release group", () => {
  assert.deepEqual(getCompactStreamSummary(AIO), { cached: true, label: "ComeTorz · MainFrame" });
});

test("release group parsing", () => {
  assert.equal(
    getStreamReleaseGroup("The.Morning.Show.S01E01.1080p.WEB-DL.DDP5.1.H.264-METCON.mkv"),
    "METCON"
  );
  assert.equal(getStreamReleaseGroup("Movie.2020.1080p.WEB.h264-GRP [rartv].mkv"), "GRP");
  assert.equal(getStreamReleaseGroup("NoGroupHere.mkv"), "");
  assert.equal(getStreamReleaseGroup(""), "");
});

test("uncached marker, missing source and plain addons", () => {
  assert.deepEqual(
    getCompactStreamSummary({
      name: "⏳ 1080p",
      behaviorHints: { filename: "A.2020.1080p-GRP.mkv" }
    }),
    { cached: false, label: "GRP" }
  );
  assert.deepEqual(
    getCompactStreamSummary({
      name: "⚡",
      addonName: "Torrentio",
      behaviorHints: { filename: "a.mkv" }
    }),
    { cached: true, label: "Torrentio" }
  );
  // No filename and no cache marker: keep the full card.
  assert.equal(
    getCompactStreamSummary({ name: "HD", description: "Direct link", addonName: "X" }),
    null
  );
});
