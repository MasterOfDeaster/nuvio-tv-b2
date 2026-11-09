import { getCachedAddonLogoDisplayUrl } from "./addonLogoCache.js";

// The badge cache persists its images as base64 data: URLs. Assigning one of
// those (about 20 KB each) to img.src makes the browser re-parse the whole
// string on the main thread: about 2.8 ms per image on an OLED B2. The stream
// list re-hydrates its badge rows on every focus move, roughly 60 images per
// step, which made each D-pad press there cost ~180 ms. Hand each distinct data
// URL to the DOM as a short blob: URL instead, created once per session.
const blobUrlByDataUrl = new Map();

function dataUrlToBlobUrl(dataUrl) {
  const match = /^data:([^;,]+)(;base64)?,/i.exec(dataUrl);
  if (!match || typeof URL?.createObjectURL !== "function" || typeof Blob !== "function") {
    return "";
  }
  const payload = dataUrl.slice(match[0].length);
  let bytes;
  if (match[2]) {
    const binary = atob(payload);
    bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
  } else {
    bytes = new TextEncoder().encode(decodeURIComponent(payload));
  }
  return URL.createObjectURL(new Blob([bytes], { type: match[1] }));
}

export function toCheapImageSrc(url) {
  const value = String(url || "");
  if (!value.startsWith("data:")) {
    return value;
  }
  let blobUrl = blobUrlByDataUrl.get(value);
  if (blobUrl === undefined) {
    try {
      blobUrl = dataUrlToBlobUrl(value);
    } catch (_) {
      blobUrl = "";
    }
    blobUrlByDataUrl.set(value, blobUrl);
  }
  return blobUrl || value;
}

// Keep cached image payloads out of innerHTML. Assigning src after parsing
// preserves the existing webOS cache/decoder without parsing base64 per card.
export function bindCachedBadgeImages(container) {
  container?.querySelectorAll("img[data-cached-badge-image]").forEach((image) => {
    const url = getCachedAddonLogoDisplayUrl(image.getAttribute("data-cached-badge-image"));
    if (!url) return;
    image.src = toCheapImageSrc(url);
    image.removeAttribute("data-cached-badge-image");
  });
}

export function resetCachedBadgeImageUrlsForTests() {
  blobUrlByDataUrl.forEach((blobUrl) => {
    try {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    } catch (_) {}
  });
  blobUrlByDataUrl.clear();
}
