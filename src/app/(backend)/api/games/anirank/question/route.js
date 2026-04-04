import { NextResponse } from "next/server";
import {
  QUESTION_TYPES,
  getRandomItem,
  getCachedData,
  buildQuestionDetail,
  matchesQuestion,
  sortByRanking,
  buildRequirementText,
  updateHistory,
  buildHintText,
} from "@/lib/api/anirank";

export const dynamic = "force-dynamic";

const TYPE_HISTORY_LIMIT = 4;
const recentTypeHistory = [];

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function prioritizeQuestionTypes() {
  const nonRecent = QUESTION_TYPES.filter(
    (q) => !recentTypeHistory.includes(q.id),
  );
  const recent = QUESTION_TYPES.filter((q) => recentTypeHistory.includes(q.id));
  return [...shuffle(nonRecent), ...shuffle(recent)];
}

function rememberQuestionType(questionId) {
  recentTypeHistory.unshift(questionId);
  if (recentTypeHistory.length > TYPE_HISTORY_LIMIT) {
    recentTypeHistory.pop();
  }
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

    const orderedTypes = prioritizeQuestionTypes();

    for (const questionType of orderedTypes) {
      const questionDetail = buildQuestionDetail(
        questionType,
        count,
        catalog,
      );
      if (!questionDetail) continue;

      const matchedRows = rows
        .filter((row) =>
          matchesQuestion(row, questionType, questionDetail.filters),
        )
        .sort((a, b) => sortByRanking(a, b, questionDetail.filters.orderDir));

      const answers = matchedRows.slice(0, count);
      if (!answers.length) continue; // Safety check

      if (questionType.params.type && questionDetail.historyValue) {
        updateHistory(questionType.params.type, questionDetail.historyValue);
      }
      rememberQuestionType(questionType.id);

      return NextResponse.json({
        success: true,
        data: {
          questionId: questionType.id,
          type: questionType.type,
          question: questionDetail.questionText,
          requirement: buildRequirementText(questionType, count, questionDetail.filters.orderDir),
          hint: buildHintText(questionType, questionDetail.filters.orderDir),
          targetCount: count,
          totalMatches: matchedRows.length,
          filters: questionDetail.filters,
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
