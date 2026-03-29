// src/app/api/data/[id]/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Validate id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid id: " + id },
        { status: 400 }
      );
    }

    const mode = request.headers.get("app_mode") || "anime";

    const tableName = mode === "hanime" ? "hanimes" : "animes";
    const detailTable = mode === "hanime" ? "hanime_details" : "anime_details";

    const client = await pool.connect();

    // [UPDATE] Sử dụng LEFT JOIN để gộp dữ liệu từ bảng chính và bảng details
    // Chúng ta lấy tất cả từ bảng chính (t.*) và lấy thêm synopsis, raw_data từ bảng phụ (d)
    const query = `
      SELECT 
        t.*, 
        d.synopsis, 
        d.raw_data 
      FROM ${tableName} t
      LEFT JOIN ${detailTable} d ON t.id = d.id
      WHERE t.id = $1
    `;

    const result = await client.query(query, [id]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Detail API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
