export function getRandomItem(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export function normalizeList(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => {
      if (typeof value === "string") return value.trim();
      if (
        value &&
        typeof value === "object" &&
        typeof value.name === "string"
      ) {
        return value.name.trim();
      }
      return "";
    })
    .filter(Boolean);
}

export function normalizeAnimeData(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    thumbnail: row.thumbnail || row.poster || null,
    views: Number(row.views) || 0,
    year: row.release_year,
    genres: normalizeList(row.genres),
    studios: normalizeList(row.studios),
  };
}

export function sortByRanking(a, b, orderDir = "DESC") {
  if (b.views !== a.views) {
    return orderDir === "ASC" ? a.views - b.views : b.views - a.views;
  }
  return a.title.localeCompare(b.title);
}
