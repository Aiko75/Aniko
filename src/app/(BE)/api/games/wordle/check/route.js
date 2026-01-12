import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let client;
  try {
    const { guessId, targetId } = await request.json();
    const mode = request.headers.get("app_mode") || "anime";
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    if (!guessId || !targetId) {
      return NextResponse.json(
        { success: false, message: "Missing IDs" },
        { status: 400 }
      );
    }

    client = await pool.connect();

    const query = `SELECT * FROM ${tableName} WHERE id IN ($1, $2)`;

    const res = await client.query(query, [guessId, targetId]);
    const rows = res.rows;

    const guessAnime = rows.find((r) => String(r.id) === String(guessId));
    const targetAnime = rows.find((r) => String(r.id) === String(targetId));

    if (!guessAnime || !targetAnime) {
      return NextResponse.json(
        { success: false, message: "Data not found" },
        { status: 404 }
      );
    }

    // --- LOGIC SO SÁNH ---

    // A. Năm (Year) - release_year giờ đã là số nguyên (int4) từ DB
    const gYear = guessAnime.release_year || 0;
    const tYear = targetAnime.release_year || 0;
    let yearStatus = "correct";
    if (gYear < tYear) yearStatus = "higher";
    if (gYear > tYear) yearStatus = "lower";

    // B. Views
    const gViews = guessAnime.views || 0;
    const tViews = targetAnime.views || 0;
    let viewStatus = "correct";
    if (gViews < tViews) viewStatus = "higher";
    if (gViews > tViews) viewStatus = "lower";

    // C. Censorship - So sánh trực tiếp từ cột Text
    const isCensorCorrect =
      (guessAnime.censorship || "") === (targetAnime.censorship || "");

    const isCategoryCorrect =
      (guessAnime.category || "") === (targetAnime.category || "");

    // D. Helper xử lý JSON Array
    const extractNames = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.map((item) =>
        item && typeof item === "object" && item.name ? item.name : item
      );
    };

    const gStudios = extractNames(guessAnime.studios);
    const tStudios = extractNames(targetAnime.studios);
    const gGenres = extractNames(guessAnime.genres);
    const tGenres = extractNames(targetAnime.genres);

    // E. Overlap Check
    const isStudioCorrect = gStudios.some((s) => tStudios.includes(s));
    const matchingGenres = gGenres.filter((g) => tGenres.includes(g));
    const isGenreCorrect = matchingGenres.length > 0;

    return NextResponse.json({
      success: true,
      guess: {
        ...guessAnime,
        result: {
          isCorrect: String(guessId) === String(targetId),
          yearStatus,
          viewStatus,
          isStudioCorrect,
          isGenreCorrect,
          matchingGenres,
          isCensorCorrect,
          isCategoryCorrect,
        },
      },
    });
  } catch (error) {
    console.error("❌ Check Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
