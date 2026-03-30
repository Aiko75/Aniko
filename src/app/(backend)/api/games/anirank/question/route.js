import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

const QUESTION_TYPES = [
  {
    id: "TOP_VIEWS_ALL",
    type: "ranking",
    questionTemplate: "List the top {count} most viewed anime",
    params: {},
    orderBy: "views",
    orderDir: "DESC",
  },
  {
    id: "TOP_VIEWS_GENRE",
    type: "ranking",
    questionTemplate: "List the top {count} most viewed {genre} anime",
    params: { type: "genre" },
    orderBy: "views",
    orderDir: "DESC",
  },
  {
    id: "TOP_VIEWS_STUDIO",
    type: "ranking",
    questionTemplate: "List the top {count} most viewed anime from {studio}",
    params: { type: "studio" },
    orderBy: "views",
    orderDir: "DESC",
  },
  {
    id: "TOP_VIEWS_YEAR",
    type: "ranking",
    questionTemplate:
      "List the top {count} most viewed anime released in {year}",
    params: { type: "year" },
    orderBy: "views",
    orderDir: "DESC",
  },
  {
    id: "TOP_VIEWS_DECADE",
    type: "ranking",
    questionTemplate:
      "List the top {count} most viewed anime from the {decade}s",
    params: { type: "decade" },
    orderBy: "views",
    orderDir: "DESC",
  },
  {
    id: "FIND_GENRES_COMBO",
    type: "find",
    questionTemplate:
      "Name {count} anime that have both {genre1} and {genre2} genres",
    params: { type: "multiGenre" },
    orderBy: "views",
    orderDir: "DESC",
  },
  {
    id: "FIND_STUDIO",
    type: "find",
    questionTemplate: "Name {count} anime made by {studio}",
    params: { type: "studio" },
    orderBy: "views",
    orderDir: "DESC",
  },
  {
    id: "FIND_GENRE",
    type: "find",
    questionTemplate: "Name {count} anime with the {genre} genre",
    params: { type: "genre" },
    orderBy: "views",
    orderDir: "DESC",
  },
];

const CACHE_DURATION = 1000 * 60 * 30;
const QUESTION_CACHE = {
  anime: null,
  hanime: null,
  lastUpdated: { anime: 0, hanime: 0 },
};

function getRandomItem(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeList(values) {
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

function normalizeAnimeData(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    thumbnail: row.thumbnail || row.cover_image || null,
    views: Number(row.views) || 0,
    year: row.release_year,
    genres: normalizeList(row.genres),
    studios: normalizeList(row.studios),
  };
}

function buildCatalog(rows) {
  const genres = new Set();
  const studios = new Set();
  const years = new Set();
  const decades = new Set();

  rows.forEach((row) => {
    row.genres.forEach((genre) => genres.add(genre));
    row.studios.forEach((studio) => studios.add(studio));
    if (row.year) {
      years.add(Number(row.year));
      decades.add(Math.floor(Number(row.year) / 10) * 10);
    }
  });

  return {
    genres: [...genres],
    studios: [...studios],
    years: [...years],
    decades: [...decades],
  };
}

async function getCachedData(mode) {
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
      SELECT id, title, slug, thumbnail, cover_image, release_year, views, genres, studios
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

function buildQuestionDetail(questionType, count, catalog) {
  const detail = {
    questionText: questionType.questionTemplate.replace(
      "{count}",
      String(count),
    ),
    filters: {},
  };

  if (questionType.params.type === "genre") {
    const genre = getRandomItem(catalog.genres);
    if (!genre) return null;
    detail.questionText = detail.questionText.replace("{genre}", genre);
    detail.filters.genre = genre;
  }

  if (questionType.params.type === "multiGenre") {
    if (catalog.genres.length < 2) return null;
    const genre1 = getRandomItem(catalog.genres);
    const remainingGenres = catalog.genres.filter((genre) => genre !== genre1);
    const genre2 = getRandomItem(remainingGenres);
    if (!genre1 || !genre2) return null;
    detail.questionText = detail.questionText
      .replace("{genre1}", genre1)
      .replace("{genre2}", genre2);
    detail.filters.genre1 = genre1;
    detail.filters.genre2 = genre2;
  }

  if (questionType.params.type === "studio") {
    const studio = getRandomItem(catalog.studios);
    if (!studio) return null;
    detail.questionText = detail.questionText.replace("{studio}", studio);
    detail.filters.studio = studio;
  }

  if (questionType.params.type === "year") {
    const year = getRandomItem(catalog.years);
    if (!year) return null;
    detail.questionText = detail.questionText.replace("{year}", String(year));
    detail.filters.year = Number(year);
  }

  if (questionType.params.type === "decade") {
    const decade = getRandomItem(catalog.decades);
    if (!decade) return null;
    detail.questionText = detail.questionText.replace(
      "{decade}",
      String(decade),
    );
    detail.filters.decade = Number(decade);
  }

  return detail;
}

function matchesQuestion(row, questionType, filters) {
  if (questionType.params.type === "genre") {
    return row.genres.includes(filters.genre);
  }
  if (questionType.params.type === "multiGenre") {
    return (
      row.genres.includes(filters.genre1) && row.genres.includes(filters.genre2)
    );
  }
  if (questionType.params.type === "studio") {
    return row.studios.includes(filters.studio);
  }
  if (questionType.params.type === "year") {
    return Number(row.year) === Number(filters.year);
  }
  if (questionType.params.type === "decade") {
    const year = Number(row.year);
    return year >= filters.decade && year <= filters.decade + 9;
  }
  return true;
}

function sortByRanking(a, b) {
  if (b.views !== a.views) return b.views - a.views;
  return a.title.localeCompare(b.title);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = request.headers.get("app_mode") || "anime";
    const count = Math.min(parseInt(searchParams.get("count"), 10) || 10, 20);

    const { rows, catalog } = await getCachedData(mode);
    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "No data available to generate question" },
        { status: 500 },
      );
    }

    for (let attempt = 0; ; attempt++) {
      const questionType = getRandomItem(QUESTION_TYPES);
      if (!questionType) break;

      const questionDetail = buildQuestionDetail(questionType, count, catalog);
      if (!questionDetail) continue;

      const answers = rows
        .filter((row) =>
          matchesQuestion(row, questionType, questionDetail.filters),
        )
        .sort(sortByRanking)
        .slice(0, count);

      if (!answers.length) continue;

      return NextResponse.json({
        success: true,
        data: {
          questionId: questionType.id,
          type: questionType.type,
          question: questionDetail.questionText,
          targetCount: count,
          totalMatches: answers.length,
          answers,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "No suitable question could be generated" },
      { status: 404 },
    );
  } catch (error) {
    console.error("AniRank question error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
