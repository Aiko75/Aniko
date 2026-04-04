import pool from "@/lib/db";
import { CACHE_DURATION } from "./config";
import { QUESTION_CACHE } from "./state";
import { normalizeAnimeData } from "./utils";

export function buildCatalog(rows) {
  const genreCounts = {};
  const studioCounts = {};
  const yearCounts = {};
  const decadeCounts = {};

  rows.forEach((row) => {
    row.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    row.studios.forEach((studio) => {
      studioCounts[studio] = (studioCounts[studio] || 0) + 1;
    });
    if (row.year) {
      const y = Number(row.year);
      yearCounts[y] = (yearCounts[y] || 0) + 1;
      const d = Math.floor(y / 10) * 10;
      decadeCounts[d] = (decadeCounts[d] || 0) + 1;
    }
  });

  const multiGenreCounts = {};
  rows.forEach((row) => {
    const sortedGenres = [...row.genres].sort();
    for (let i = 0; i < sortedGenres.length; i++) {
        for (let j = i + 1; j < sortedGenres.length; j++) {
            const key = `${sortedGenres[i]}|${sortedGenres[j]}`;
            multiGenreCounts[key] = (multiGenreCounts[key] || 0) + 1;
        }
    }
  });

  return {
    totalCount: rows.length,
    genreCounts,
    studioCounts,
    yearCounts,
    decadeCounts,
    multiGenreCounts,
  };
}

export async function getCachedData(mode) {
  const normalizedMode = mode === "hanime" ? "hanime" : "anime";
  const now = Date.now();

  if (
    QUESTION_CACHE[normalizedMode] &&
    now - QUESTION_CACHE.lastUpdated[normalizedMode] < CACHE_DURATION
  ) {
    return QUESTION_CACHE[normalizedMode];
  }

  const tableName = normalizedMode === "hanime" ? "hanimes" : "animes";
  const client = await pool.connect();

  try {
    const query = `
      SELECT id, title, slug, thumbnail, poster, release_year, views, genres, studios
      FROM ${tableName}
      WHERE title IS NOT NULL
    `;
    const res = await client.query(query);
    const rows = res.rows.map(normalizeAnimeData);
    const catalog = buildCatalog(rows);

    const payload = { rows, catalog };
    QUESTION_CACHE[normalizedMode] = payload;
    QUESTION_CACHE.lastUpdated[normalizedMode] = now;

    return payload;
  } finally {
    client.release();
  }
}
