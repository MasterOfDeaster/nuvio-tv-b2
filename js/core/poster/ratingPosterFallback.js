// Nuvio TV B2: catalog addons (for example Xperience with an AIORatings key)
// can hand out rating posters that bake three small score badges into the
// artwork. B2 draws one large IMDb badge itself (renderPosterImdbBadge), so a
// rated poster addressed by IMDb id is swapped for the plain poster from the
// Stremio poster archive. 300x450 covers the 221x339 card at one device pixel
// per CSS pixel. Posters addressed by TMDB/TVDB ids stay untouched.
const RATING_POSTER_IMDB_PATTERN =
  /^https?:\/\/(?:[a-z0-9-]+\.)*(?:aioratings\.com|ratingposterdb\.com|top-posters\.com)\/[^/]+\/imdb\/poster-[a-z0-9-]+\/(tt\d{5,10})\.(?:jpe?g|png|webp)(?:[?#].*)?$/i;

export function plainPosterForRatingPoster(url) {
  const value = String(url || "").trim();
  const match = RATING_POSTER_IMDB_PATTERN.exec(value);
  if (!match) {
    return value;
  }
  return `https://images.metahub.space/poster/small/${match[1]}/img`;
}
