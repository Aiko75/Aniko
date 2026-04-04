import { getRandomNonRecentItem } from "./state";

export function buildQuestionDetail(questionType, count, catalog) {
  const orderDir = Array.isArray(questionType.orderDir)
    ? (Math.random() > 0.5 ? questionType.orderDir[0] : questionType.orderDir[1])
    : questionType.orderDir || "DESC";

  const highestLowestStr = orderDir === "ASC" ? "thấp nhất" : "cao nhất";
  const mostLeastPopularStr = orderDir === "ASC" ? "ít được quan tâm nhất" : "ăn khách nhất";

  const detail = {
    questionText: questionType.questionTemplate
      .replace("{count}", String(count))
      .replace("{highest_lowest}", highestLowestStr)
      .replace("{most_least_popular}", mostLeastPopularStr),
    filters: {
      orderDir,
    },
    historyValue: null,
  };

  const minPool = Math.max(questionType.minPool || count, count);
  const maxPool = questionType.maxPool || Infinity;

  if (!questionType.params || Object.keys(questionType.params).length === 0) {
      // No filter needed, check total pool
      if (catalog.totalCount >= minPool && catalog.totalCount <= maxPool) {
          return detail;
      }
      return null;
  }

  if (questionType.params.type === "genre") {
    const validGenres = Object.entries(catalog.genreCounts)
        .filter(([_, size]) => size >= minPool && size <= maxPool)
        .map(([genre, _]) => genre);

    const genre = getRandomNonRecentItem("genre", validGenres);
    if (!genre) return null;
    detail.questionText = detail.questionText.replace("{genre}", genre);
    detail.filters.genre = genre;
    detail.historyValue = genre;
  }

  if (questionType.params.type === "multiGenre") {
    const validMultiGenres = Object.entries(catalog.multiGenreCounts)
        .filter(([_, size]) => size >= minPool && size <= maxPool)
        .map(([key, _]) => key);

    const historyValue = getRandomNonRecentItem("multiGenre", validMultiGenres);
    if (!historyValue) return null;
    
    const [genre1, genre2] = historyValue.split("|");
    detail.questionText = detail.questionText
        .replace("{genre1}", genre1)
        .replace("{genre2}", genre2);
    detail.filters.genre1 = genre1;
    detail.filters.genre2 = genre2;
    detail.historyValue = historyValue;
  }

  if (questionType.params.type === "studio") {
    const validStudios = Object.entries(catalog.studioCounts)
        .filter(([_, size]) => size >= minPool && size <= maxPool)
        .map(([studio, _]) => studio);

    const studio = getRandomNonRecentItem("studio", validStudios);
    if (!studio) return null;
    detail.questionText = detail.questionText.replace("{studio}", studio);
    detail.filters.studio = studio;
    detail.historyValue = studio;
  }

  if (questionType.params.type === "year") {
    const validYears = Object.entries(catalog.yearCounts)
        .filter(([_, size]) => size >= minPool && size <= maxPool)
        .map(([year, _]) => year);

    const year = getRandomNonRecentItem("year", validYears);
    if (!year) return null;
    detail.questionText = detail.questionText.replace("{year}", String(year));
    detail.filters.year = Number(year);
    detail.historyValue = Number(year);
  }

  if (questionType.params.type === "decade") {
    const validDecades = Object.entries(catalog.decadeCounts)
        .filter(([_, size]) => size >= minPool && size <= maxPool)
        .map(([decade, _]) => decade);

    const decade = getRandomNonRecentItem("decade", validDecades);
    if (!decade) return null;
    detail.questionText = detail.questionText.replace(
      "{decade}",
      String(decade)
    );
    detail.filters.decade = Number(decade);
    detail.historyValue = Number(decade);
  }

  return detail;
}

export function matchesQuestion(row, questionType, filters) {
  if (!filters || !questionType || !questionType.params) return false;

  if (questionType.params.type === "genre") {
    return filters.genre && row.genres.includes(filters.genre);
  }
  if (questionType.params.type === "multiGenre") {
    return (
      filters.genre1 &&
      filters.genre2 &&
      row.genres.includes(filters.genre1) &&
      row.genres.includes(filters.genre2)
    );
  }
  if (questionType.params.type === "studio") {
    return filters.studio && row.studios.includes(filters.studio);
  }
  if (questionType.params.type === "year") {
    return filters.year && Number(row.year) === Number(filters.year);
  }
  if (questionType.params.type === "decade") {
    const year = Number(row.year);
    return (
      filters.decade &&
      year >= filters.decade &&
      year <= filters.decade + 9
    );
  }
  return true; // For questions with no specific filter criteria like TOP_VIEWS_ALL
}

export function buildRequirementText(questionType, count, orderDir) {
  const highestLowestStr = orderDir === "ASC" ? "thấp nhất" : "cao nhất";

  const rankingTemplates = [
    `Yêu cầu: Hãy kể tên ${count} anime nằm trong danh sách top lượt xem ${highestLowestStr} (không bắt buộc nhập đúng thứ tự).`,
    `Thử thách: Điền chính xác tên của ${count} bộ anime tương ứng với mô tả.`,
    `Nhiệm vụ của bạn: Đoán đúng tên ${count} anime có thứ hạng ${highestLowestStr} theo yêu cầu.`,
    `Yêu cầu: Nhập chính xác tên ${count} bộ anime đạt lượt xem ${highestLowestStr} (không cần theo thứ tự).`
  ];

  const findTemplates = [
    `Yêu cầu: Nhập đúng ${count} tên anime thỏa mãn toàn bộ điều kiện câu hỏi.`,
    `Thử thách: Kể tên ${count} bộ anime tương ứng với các tiêu chí trên.`,
    `Nhiệm vụ: Truy tìm chính xác ${count} tên anime khớp với yêu cầu của trò chơi.`
  ];

  function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (questionType.type === "ranking") {
    return randomPick(rankingTemplates);
  }
  return randomPick(findTemplates);
}

export function buildHintText(questionType, orderDir) {
  if (orderDir === "ASC") {
    return "Hãy thử nhớ đến những bộ anime ít tiếng tăm, kén người xem hoặc ít phổ biến nhất trong nhóm này.";
  }
  return "Hãy nghĩ ngay đến những siêu phẩm đình đám, có độ phủ sóng rộng và lượt xem cao trót vót trong nhóm này.";
}
