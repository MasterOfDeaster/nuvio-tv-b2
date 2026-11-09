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
