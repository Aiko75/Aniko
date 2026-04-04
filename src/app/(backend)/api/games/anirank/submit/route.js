import { NextResponse } from "next/server";
import {
  QUESTION_TYPES,
  getCachedData,
  matchesQuestion,
  sortByRanking,
} from "@/lib/api/anirank";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const mode = request.headers.get("app_mode") || "anime";
    const { questionId, filters, targetCount, submission } = await request.json();

    if (!questionId || !filters || !targetCount || !Array.isArray(submission)) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const questionType = QUESTION_TYPES.find((q) => q.id === questionId);
    if (!questionType) {
      return NextResponse.json(
        { success: false, error: "Invalid questionId" },
        { status: 400 }
      );
    }

    const { rows } = await getCachedData(mode);
    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "No data available to verify answer" },
        { status: 500 }
      );
    }

    const matchedRows = rows
      .filter((row) => matchesQuestion(row, questionType, filters))
      .sort((a, b) => sortByRanking(a, b, filters.orderDir));

    const correctAnswers = matchedRows.slice(0, targetCount);
    const correctAnswerIds = new Set(correctAnswers.map((a) => a.id));

    let score = 0;
    const submissionResult = submission.map((sub) => {
      const isCorrect = correctAnswerIds.has(sub.id);
      if (isCorrect) {
        score++;
      }
      return { ...sub, isCorrect };
    });

    return NextResponse.json({
      success: true,
      data: {
        score,
        submissionResult,
        correctAnswers,
      },
    });
  } catch (error) {
    console.error("AniRank submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
