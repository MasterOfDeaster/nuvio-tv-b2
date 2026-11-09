import test from "node:test";
import assert from "node:assert/strict";
import { plainPosterForRatingPoster } from "./ratingPosterFallback.js";

test("IMDb-addressed rating posters become the plain archive poster", () => {
  for (const host of ["api.aioratings.com", "api.ratingposterdb.com", "api.top-posters.com"]) {
    assert.equal(
      plainPosterForRatingPoster(`https://${host}/KEY123/imdb/poster-default/tt7203552.jpg`),
      "https://images.metahub.space/poster/small/tt7203552/img"
    );
  }
  assert.equal(
    plainPosterForRatingPoster(
      "https://api.aioratings.com/KEY/imdb/poster-default/tt0903747.jpg?ratings_order=imdb"
    ),
    "https://images.metahub.space/poster/small/tt0903747/img"
  );
});

test("Xperience poster proxy URLs are treated as rating posters", () => {
  assert.equal(
    plainPosterForRatingPoster(
      "https://xperience-app.com/manifest/640755b4/eyJ.TOKEN/poster/movie/tt10548174.jpg?tmdb=1100988"
    ),
    "https://images.metahub.space/poster/small/tt10548174/img"
  );
  assert.equal(
    plainPosterForRatingPoster(
      "https://xperience-app.com/manifest/a/b/poster/series/tt0903747.jpg"
    ),
    "https://images.metahub.space/poster/small/tt0903747/img"
  );
  // Xperience cover art (genre tiles etc.) is not a rating poster.
  const cover = "https://cdn.xperience-app.com/covers/default/genres.action.webp?v=7";
  assert.equal(plainPosterForRatingPoster(cover), cover);
});

test("other posters stay byte-for-byte unchanged", () => {
  for (const url of [
    "https://image.tmdb.org/t/p/w500/poster.jpg",
    "https://api.aioratings.com/KEY/tmdb/poster-default/movie-603.jpg",
    "https://example.org/aioratings.com/KEY/imdb/poster-default/tt1.jpg",
    ""
  ]) {
    assert.equal(plainPosterForRatingPoster(url), url);
  }
  assert.equal(plainPosterForRatingPoster(null), "");
});
