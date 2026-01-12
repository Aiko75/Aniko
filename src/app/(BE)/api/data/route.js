import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request) {
  let client;
  try {
    const body = await request.json();

    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "newest",
      mode = "anime",
      filters = {},
    } = body;

    const {
      genre = "All",
      studio = "All",
      tag = "All",
      minYear,
      maxYear,
      minView,
      maxView,
    } = filters;

    // Validate limit để tránh lỗi chia cho 0 hoặc load quá nặng
    const safeLimit = Math.max(1, Math.min(parseInt(limit), 100));
    const offset = (page - 1) * safeLimit;

    const tableMap = { anime: "animes", hanime: "hanimes" };
    const tableName = tableMap[mode] || "animes";
    const alias = "t"; // [FIX] Sử dụng alias cố định ngay từ đầu

    client = await pool.connect();

    let whereClauses = [];
    let queryParams = [];

    // --- 1. XÂY DỰNG WHERE CLAUSE (Dùng alias 't') ---

    // -- Search (Title)
    if (search) {
      queryParams.push(`%${search}%`);
      whereClauses.push(`${alias}.title ILIKE $${queryParams.length}`);
    }

    // -- Filter: Genre (JSONB)
    if (genre && genre !== "All") {
      const jsonParam = JSON.stringify([{ name: genre }]);
      queryParams.push(jsonParam);
      whereClauses.push(`${alias}.genres @> $${queryParams.length}::jsonb`);
    }

    // -- Filter: Studio (JSONB)
    if (studio && studio !== "All") {
      const jsonParam = JSON.stringify([{ name: studio }]);
      queryParams.push(jsonParam);
      whereClauses.push(`${alias}.studios @> $${queryParams.length}::jsonb`);
    }

    // -- Filter: Tag (JSONB)
    if (tag && tag !== "All") {
      const jsonParam = JSON.stringify([{ name: tag }]);
      queryParams.push(jsonParam);
      whereClauses.push(`${alias}.tags @> $${queryParams.length}::jsonb`);
    }

    // -- Filter: Year
    if (minYear) {
      queryParams.push(parseInt(minYear));
      whereClauses.push(`${alias}.release_year >= $${queryParams.length}`);
    }
    if (maxYear) {
      queryParams.push(parseInt(maxYear));
      whereClauses.push(`${alias}.release_year <= $${queryParams.length}`);
    }

    // -- Filter: Views
    if (minView) {
      queryParams.push(parseInt(minView));
      whereClauses.push(`${alias}.views >= $${queryParams.length}`);
    }
    if (maxView) {
      queryParams.push(parseInt(maxView));
      whereClauses.push(`${alias}.views <= $${queryParams.length}`);
    }

    const whereString =
      whereClauses.length > 0 ? whereClauses.join(" AND ") : "1=1";

    // --- 2. SORTING (Dùng alias 't') ---
    let orderBy = `${alias}.created_at DESC`;
    switch (sortBy) {
      case "oldest":
        orderBy = `${alias}.release_year ASC, ${alias}.created_at ASC`;
        break;
      case "newest":
        orderBy = `${alias}.release_year DESC, ${alias}.created_at DESC`;
        break;
      case "most_viewed":
        orderBy = `${alias}.views DESC`;
        break;
      case "least_viewed":
        orderBy = `${alias}.views ASC`;
        break;
    }

    // --- 3. EXECUTE QUERIES ---

    // A. Count Query (Giữ nguyên)
    const countQuery = `SELECT COUNT(*) FROM ${tableName} ${alias} WHERE ${whereString}`;
    const countRes = await client.query(countQuery, queryParams);
    const totalItems = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / safeLimit);

    // Cập nhật lại câu query trong API List
    const dataQuery = `
    SELECT 
      ${alias}.*,
      ${alias}.release_year AS "release_year" -- Đảm bảo lấy đúng tên cột từ DB
    FROM ${tableName} ${alias}
    WHERE ${whereString}
    ORDER BY ${orderBy}
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
`;

    const dataRes = await client.query(dataQuery, [
      ...queryParams,
      safeLimit,
      offset,
    ]);

    return NextResponse.json({
      success: true,
      data: dataRes.rows,
      pagination: {
        page: parseInt(page),
        limit: safeLimit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
