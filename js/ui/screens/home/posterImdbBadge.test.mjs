import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage ??= {
  getItem: () => null,
  setItem() {},
  removeItem() {},
  key: () => null,
  length: 0
};
const { renderPosterImdbBadge } =
  await import("./homeScreenHelpers-15-create-poster-card-markup.js");

const TMDB_POSTER = "https://image.tmdb.org/t/p/w500/poster.jpg";

test("renders one IMDb badge with the formatted score", () => {
  const html = renderPosterImdbBadge({ imdbRating: "8.14" }, TMDB_POSTER, {
    homeImdbRatingsVisibility: "SHOW_ALL"
  });
  assert.match(html, /class="home-poster-imdb-badge"/);
  assert.match(html, />IMDb</);
  assert.match(html, />8\.1</);
});

test("no badge without a rating, when ratings are hidden, or on rating posters", () => {
  assert.equal(renderPosterImdbBadge({}, TMDB_POSTER, {}), "");
  assert.equal(renderPosterImdbBadge({ imdbRating: "0" }, TMDB_POSTER, {}), "");
  assert.equal(
    renderPosterImdbBadge({ imdbRating: 7.5 }, TMDB_POSTER, {
      homeImdbRatingsVisibility: "HIDE_ALL"
    }),
    ""
  );
  for (const host of [
    "api.aioratings.com/KEY",
    "api.ratingposterdb.com/KEY",
    "api.top-posters.com/KEY"
  ]) {
    assert.equal(
      renderPosterImdbBadge({ imdbRating: 7.5 }, `https://${host}/imdb/poster-default/tt1.jpg`, {}),
      ""
    );
  }
});

test("score text is escaped", () => {
  const html = renderPosterImdbBadge({ imdbRating: 9 }, TMDB_POSTER, {});
  assert.match(html, /aria-label="IMDb 9\.0"/);
});
