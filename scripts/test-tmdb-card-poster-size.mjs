import test from "node:test";
import assert from "node:assert/strict";

const { Platform } = await import("../js/platform/index.js");
const {
  normalizeTmdbBackdropUrl,
  normalizeTmdbCardBackdropUrl,
  normalizeTmdbLogoUrl,
  normalizeTmdbPosterUrl,
  preferredTmdbCardPosterSize,
  resetPreferredTmdbCardPosterSizeForTests
} = await import("../js/core/tmdb/tmdbImageUrl.js");
const { mdbMedia } = await import("../js/data/repository/mdbListTrackingCodec.js");
const { decodeMdbListItems } = await import("../js/data/repository/mdbListLibraryCodec.js");

const ORIGINAL_POSTER = "https://image.tmdb.org/t/p/original/poster.jpg";
const W500_POSTER = "https://image.tmdb.org/t/p/w500/poster.jpg";
const ORIGINAL_BACKDROP = "https://image.tmdb.org/t/p/original/backdrop.jpg";
const METAHUB_POSTER = "https://images.metahub.space/poster/small/tt0001/img";
const ADDON_W500_LOOKALIKE = "https://cdn.example.org/t/p/w500/poster.jpg";

function withRuntime(
  {
    platform = null,
    offscreenCanvas = false,
    viewportWidth = 1920,
    screenWidth = 1920,
    devicePixelRatio = 1
  } = {},
  run
) {
  const previousOverride = globalThis.__NUVIO_PLATFORM__;
  const hadOffscreenCanvas = Object.prototype.hasOwnProperty.call(globalThis, "OffscreenCanvas");
  const previousOffscreenCanvas = globalThis.OffscreenCanvas;
  const hadScreen = Object.prototype.hasOwnProperty.call(globalThis, "screen");
  const previousScreen = globalThis.screen;
  const hadInnerWidth = Object.prototype.hasOwnProperty.call(globalThis, "innerWidth");
  const previousInnerWidth = globalThis.innerWidth;
  const hadDevicePixelRatio = Object.prototype.hasOwnProperty.call(globalThis, "devicePixelRatio");
  const previousDevicePixelRatio = globalThis.devicePixelRatio;
  try {
    if (platform) {
      globalThis.__NUVIO_PLATFORM__ = platform;
    } else {
      delete globalThis.__NUVIO_PLATFORM__;
    }
    if (offscreenCanvas) {
      globalThis.OffscreenCanvas = class OffscreenCanvasStub {};
    } else {
      delete globalThis.OffscreenCanvas;
    }
    globalThis.innerWidth = viewportWidth;
    globalThis.screen = { width: screenWidth };
    globalThis.devicePixelRatio = devicePixelRatio;
    Platform.current = null;
    resetPreferredTmdbCardPosterSizeForTests();
    return run();
  } finally {
    if (previousOverride === undefined) {
      delete globalThis.__NUVIO_PLATFORM__;
    } else {
      globalThis.__NUVIO_PLATFORM__ = previousOverride;
    }
    if (hadOffscreenCanvas) {
      globalThis.OffscreenCanvas = previousOffscreenCanvas;
    } else {
      delete globalThis.OffscreenCanvas;
    }
    if (hadScreen) {
      globalThis.screen = previousScreen;
    } else {
      delete globalThis.screen;
    }
    if (hadInnerWidth) {
      globalThis.innerWidth = previousInnerWidth;
    } else {
      delete globalThis.innerWidth;
    }
    if (hadDevicePixelRatio) {
      globalThis.devicePixelRatio = previousDevicePixelRatio;
    } else {
      delete globalThis.devicePixelRatio;
    }
    Platform.current = null;
    resetPreferredTmdbCardPosterSizeForTests();
  }
}

test("browser keeps w500 card posters whether or not OffscreenCanvas exists", () => {
  for (const offscreenCanvas of [false, true]) {
    withRuntime({ platform: null, offscreenCanvas }, () => {
      assert.equal(Platform.isBrowser(), true);
      assert.equal(preferredTmdbCardPosterSize(), "w500");
      assert.equal(normalizeTmdbPosterUrl(ORIGINAL_POSTER), W500_POSTER);
      assert.equal(normalizeTmdbPosterUrl(W500_POSTER), W500_POSTER);
      assert.equal(
        mdbMedia({ ids: { imdb: "tt0001" }, poster: "/p.jpg" }).poster,
        "https://image.tmdb.org/t/p/w500/p.jpg"
      );
    });
  }
});

for (const platform of ["tizen", "webos"]) {
  test(`${platform} without OffscreenCanvas serves w342 TMDB card posters`, () => {
    withRuntime({ platform, offscreenCanvas: false }, () => {
      assert.equal(Platform.isTizen() || Platform.isWebOS(), true);
      assert.equal(preferredTmdbCardPosterSize(), "w342");
      assert.equal(
        normalizeTmdbPosterUrl(ORIGINAL_POSTER),
        "https://image.tmdb.org/t/p/w342/poster.jpg"
      );
      assert.equal(
        normalizeTmdbPosterUrl(W500_POSTER),
        "https://image.tmdb.org/t/p/w342/poster.jpg"
      );
      assert.equal(
        normalizeTmdbPosterUrl("//image.tmdb.org/t/p/W500/poster.jpg"),
        "//image.tmdb.org/t/p/w342/poster.jpg"
      );
      assert.equal(
        mdbMedia({ ids: { imdb: "tt0001" }, poster: "/p.jpg" }).poster,
        "https://image.tmdb.org/t/p/w342/p.jpg"
      );
      const [libraryItem] = decodeMdbListItems({
        movies: [
          {
            title: "Fixture",
            ids: { imdb: "tt0001", tmdb: 1 },
            poster: "/p.jpg",
            backdrop: "/b.jpg"
          }
        ]
      });
      assert.equal(libraryItem.poster, "https://image.tmdb.org/t/p/w342/p.jpg");
      assert.equal(libraryItem.background, "https://image.tmdb.org/t/p/w1280/b.jpg");
    });
  });

  test(`${platform} without OffscreenCanvas on a 4K panel keeps w500 card posters`, () => {
    // A 4K panel that lays the app out at 1920 CSS px paints the card at two
    // device pixels per CSS pixel, so w342 would be upscaled. Android TV keeps
    // w500 here too.
    withRuntime(
      { platform, offscreenCanvas: false, screenWidth: 3840, devicePixelRatio: 2 },
      () => {
        assert.equal(preferredTmdbCardPosterSize(), "w500");
        assert.equal(normalizeTmdbPosterUrl(ORIGINAL_POSTER), W500_POSTER);
        assert.equal(normalizeTmdbPosterUrl(W500_POSTER), W500_POSTER);
        assert.equal(
          mdbMedia({ ids: { imdb: "tt0001" }, poster: "/p.jpg" }).poster,
          "https://image.tmdb.org/t/p/w500/p.jpg"
        );
      }
    );
  });

  test(`${platform} with OffscreenCanvas keeps w500 card posters`, () => {
    withRuntime({ platform, offscreenCanvas: true }, () => {
      assert.equal(preferredTmdbCardPosterSize(), "w500");
      assert.equal(normalizeTmdbPosterUrl(ORIGINAL_POSTER), W500_POSTER);
      assert.equal(normalizeTmdbPosterUrl(W500_POSTER), W500_POSTER);
      assert.equal(
        mdbMedia({ ids: { imdb: "tt0001" }, poster: "/p.jpg" }).poster,
        "https://image.tmdb.org/t/p/w500/p.jpg"
      );
    });
  });
}

test("non-TMDB poster URLs stay byte-for-byte unchanged on every runtime", () => {
  for (const runtime of [
    { platform: null, offscreenCanvas: false },
    { platform: "tizen", offscreenCanvas: false },
    { platform: "webos", offscreenCanvas: true }
  ]) {
    withRuntime(runtime, () => {
      assert.equal(normalizeTmdbPosterUrl(METAHUB_POSTER), METAHUB_POSTER);
      assert.equal(normalizeTmdbPosterUrl(ADDON_W500_LOOKALIKE), ADDON_W500_LOOKALIKE);
      assert.equal(normalizeTmdbPosterUrl(""), "");
      assert.equal(normalizeTmdbPosterUrl(null), "");
      assert.equal(
        mdbMedia({ ids: { imdb: "tt0001" }, poster: METAHUB_POSTER }).poster,
        METAHUB_POSTER
      );
    });
  }
});

test("backdrops still resolve to w1280 on TVs without the rescaler", () => {
  withRuntime({ platform: "tizen", offscreenCanvas: false }, () => {
    assert.equal(
      normalizeTmdbBackdropUrl(ORIGINAL_BACKDROP),
      "https://image.tmdb.org/t/p/w1280/backdrop.jpg"
    );
    assert.equal(
      normalizeTmdbBackdropUrl("https://image.tmdb.org/t/p/w780/backdrop.jpg"),
      "https://image.tmdb.org/t/p/w1280/backdrop.jpg"
    );
    assert.equal(
      mdbMedia({ ids: { imdb: "tt0001" }, backdrop: "/b.jpg" }).background,
      "https://image.tmdb.org/t/p/w1280/b.jpg"
    );
  });
});

test("the card poster size is computed once until reset", () => {
  withRuntime({ platform: "tizen", offscreenCanvas: false }, () => {
    assert.equal(preferredTmdbCardPosterSize(), "w342");
    globalThis.OffscreenCanvas = class OffscreenCanvasStub {};
    assert.equal(preferredTmdbCardPosterSize(), "w342", "cached until reset");
    resetPreferredTmdbCardPosterSizeForTests();
    assert.equal(preferredTmdbCardPosterSize(), "w500");
  });
});

const W1280_BACKDROP = "https://image.tmdb.org/t/p/w1280/backdrop.jpg";
const ORIGINAL_LOGO = "https://image.tmdb.org/t/p/original/logo.png";

for (const platform of ["tizen", "webos"]) {
  test(`${platform} at one device pixel per CSS pixel serves w500 card backdrops and logos`, () => {
    withRuntime({ platform, offscreenCanvas: true, devicePixelRatio: 2 }, () => {
      const W500_BACKDROP = "https://image.tmdb.org/t/p/w500/backdrop.jpg";
      assert.equal(normalizeTmdbCardBackdropUrl(ORIGINAL_BACKDROP), W500_BACKDROP);
      assert.equal(normalizeTmdbCardBackdropUrl(W1280_BACKDROP), W500_BACKDROP);
      assert.equal(
        normalizeTmdbCardBackdropUrl("https://image.tmdb.org/t/p/w780/backdrop.jpg"),
        W500_BACKDROP
      );
      assert.equal(normalizeTmdbLogoUrl(ORIGINAL_LOGO), "https://image.tmdb.org/t/p/w500/logo.png");
      // The hero keeps its full-size source.
      assert.equal(normalizeTmdbBackdropUrl(ORIGINAL_BACKDROP), W1280_BACKDROP);
    });
  });

  test(`${platform} on a 4K-painting panel keeps hero-sized card backdrops and original logos`, () => {
    withRuntime({ platform, offscreenCanvas: true, screenWidth: 3840, devicePixelRatio: 2 }, () => {
      assert.equal(normalizeTmdbCardBackdropUrl(ORIGINAL_BACKDROP), W1280_BACKDROP);
      assert.equal(normalizeTmdbLogoUrl(ORIGINAL_LOGO), ORIGINAL_LOGO);
    });
  });
}

test("browsers keep hero-sized card backdrops and leave other hosts untouched", () => {
  withRuntime({ platform: null }, () => {
    assert.equal(normalizeTmdbCardBackdropUrl(ORIGINAL_BACKDROP), W1280_BACKDROP);
    assert.equal(normalizeTmdbLogoUrl(ORIGINAL_LOGO), ORIGINAL_LOGO);
  });
  withRuntime({ platform: "webos" }, () => {
    assert.equal(normalizeTmdbCardBackdropUrl(METAHUB_POSTER), METAHUB_POSTER);
    assert.equal(
      normalizeTmdbLogoUrl("https://cdn.example.org/t/p/original/logo.png"),
      "https://cdn.example.org/t/p/original/logo.png"
    );
    assert.equal(normalizeTmdbCardBackdropUrl(""), "");
  });
});
