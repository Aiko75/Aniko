import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

const MIN_ANIME_VIEWS = 1000;

// --- CACHE ĐA CHẾ ĐỘ ---
// Lưu data vào RAM server để không phải query DB liên tục
const GLOBAL_CACHE = {
  anime: null,
  hanime: null,
  lastUpdated: { anime: 0, hanime: 0 },
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 tiếng

// Helper: Trích xuất thuộc tính từ mảng anime
function extractAttributes(data) {
  const genres = new Set();
  const studios = new Set();
  const years = new Set();

  data.forEach((item) => {
    // Genres và Studios trong DB là mảng JSONB
    if (Array.isArray(item.genres)) {
      item.genres.forEach((g) =>
        genres.add(typeof g === "string" ? g : g.name)
      );
    }
    if (Array.isArray(item.studios)) {
      item.studios.forEach((s) =>
        studios.add(typeof s === "string" ? s : s.name)
      );
    }
    if (item.release_year) {
      years.add(String(item.release_year));
    }
  });

  return {
    genres: Array.from(genres),
    studios: Array.from(studios),
    years: Array.from(years),
  };
}

// Helper: Check điều kiện match
function checkCondition(anime, attr) {
  if (!anime || !attr) return false;

  if (attr.type === "Genre") {
    return (
      Array.isArray(anime.genres) &&
      anime.genres.some(
        (g) => (typeof g === "string" ? g : g.name) === attr.value
      )
    );
  }
  if (attr.type === "Studio") {
    return (
      Array.isArray(anime.studios) &&
      anime.studios.some(
        (s) => (typeof s === "string" ? s : s.name) === attr.value
      )
    );
  }
  if (attr.type === "Year") {
    // So sánh string để an toàn
    return String(anime.release_year) === String(attr.value);
  }
  return false;
}

// Helper: Kiểm tra tính khả thi (Có ít nhất 1 anime thỏa mãn cả Hàng & Cột)
function hasSolution(data, rowAttr, colAttr) {
  return data.some((anime) => {
    const hasRow = checkCondition(anime, rowAttr);
    const hasCol = checkCondition(anime, colAttr);
    return hasRow && hasCol;
  });
}

// Hàm lấy dữ liệu từ DB (có Cache)
async function getCachedData(mode) {
  const now = Date.now();
  // Nếu cache còn hạn, dùng luôn
  if (
    GLOBAL_CACHE[mode] &&
    now - GLOBAL_CACHE.lastUpdated[mode] < CACHE_DURATION
  ) {
    return GLOBAL_CACHE[mode];
  }

  console.log(`🔄 Fetching DB for mode: ${mode}...`);
  const tableName = mode === "hanime" ? "hanimes" : "animes";
  const client = await pool.connect();

  try {
    // Chỉ lấy các trường cần thiết, lọc views ngay tại DB
    const query = `
            SELECT id, genres, studios, release_year 
            FROM ${tableName} 
            WHERE views >= $1
        `;
    const res = await client.query(query, [MIN_ANIME_VIEWS]);
    const data = res.rows;

    // Xây dựng cache mới
    const cacheObj = {
      data: data,
      attributes: extractAttributes(data),
    };

    GLOBAL_CACHE[mode] = cacheObj;
    GLOBAL_CACHE.lastUpdated[mode] = now;

    console.log(`✅ Cached ${data.length} items for ${mode}.`);
    return cacheObj;
  } finally {
    client.release();
  }
}

export async function GET(request) {
  try {
    const mode = request.headers.get("app_mode") || "anime";

    // Lấy dữ liệu (Từ Cache hoặc DB)
    const { data: filteredData, attributes: cachedAttributes } =
      await getCachedData(mode);

    let board = null;
    let attempts = 0;

    // Vòng lặp tạo bảng ngẫu nhiên
    while (!board) {
      attempts++;

      const getRandomAttr = (excludeTypes = []) => {
        const types = ["Genre", "Studio", "Year"].filter(
          (t) => !excludeTypes.includes(t)
        );
        const type = types[Math.floor(Math.random() * types.length)];

        let pool = [];
        if (type === "Genre") pool = cachedAttributes.genres;
        else if (type === "Studio") pool = cachedAttributes.studios;
        else if (type === "Year") pool = cachedAttributes.years;

        if (!pool || pool.length === 0) return { type, value: "N/A" };
        const value = pool[Math.floor(Math.random() * pool.length)];
        return { type, value };
      };

      const rows = [];
      const cols = [];

      for (let i = 0; i < 3; i++) rows.push(getRandomAttr());
      for (let i = 0; i < 3; i++) cols.push(getRandomAttr());

      let isValidBoard = true;

      // 1. Check trùng lặp label
      const usedLabels = new Set([
        ...rows.map((r) => r.value),
        ...cols.map((c) => c.value),
      ]);
      if (usedLabels.size < 6) isValidBoard = false;

      // 2. Check Logic & Solvability
      if (isValidBoard) {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            // Không để Năm giao với Năm (quá khó hoặc vô lý)
            if (rows[r].type === "Year" && cols[c].type === "Year") {
              isValidBoard = false;
              break;
            }
            // Phải có nghiệm trong DB
            if (!hasSolution(filteredData, rows[r], cols[c])) {
              isValidBoard = false;
              break;
            }
          }
          if (!isValidBoard) break;
        }
      }

      if (isValidBoard) {
        board = { rows, cols };
      }
    }

    if (!board) {
      return NextResponse.json(
        { success: false, message: "Failed to generate valid board" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, board });
  } catch (error) {
    console.error("Board API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
