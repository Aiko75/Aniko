export const QUESTION_TYPES = [
  {
    id: "TOP_VIEWS_ALL",
    type: "ranking",
    questionTemplate:
      "Kể tên {count} bộ anime sở hữu lượt xem {highest_lowest} trên toàn hệ thống.",
    params: {},
    orderBy: "views",
    orderDir: ["DESC", "ASC"],
  },
  {
    id: "TOP_VIEWS_GENRE",
    type: "ranking",
    questionTemplate:
      "Kể tên {count} tác phẩm anime thuộc thể loại {genre} có lượt xem {highest_lowest}.",
    params: { type: "genre" },
    orderBy: "views",
    orderDir: ["DESC", "ASC"],
  },
  {
    id: "TOP_VIEWS_STUDIO",
    type: "ranking",
    questionTemplate:
      "Hãy điểm mặt {count} bộ anime {most_least_popular} do xưởng phim {studio} sản xuất.",
    params: { type: "studio" },
    orderBy: "views",
    orderDir: ["DESC", "ASC"],
  },
  {
    id: "TOP_VIEWS_YEAR",
    type: "ranking",
    questionTemplate:
      "{count} bộ anime phát hành vào năm {year} có lượt xem {highest_lowest} là những cái tên nào?",
    params: { type: "year" },
    orderBy: "views",
    orderDir: ["DESC", "ASC"],
  },
  {
    id: "TOP_VIEWS_DECADE",
    type: "ranking",
    questionTemplate:
      "Kể tên {count} tác phẩm anime sở hữu lượt xem {highest_lowest} ra mắt trong kỷ nguyên {decade}.",
    params: { type: "decade" },
    orderBy: "views",
    orderDir: ["DESC", "ASC"],
  },
  {
    id: "FIND_GENRES_COMBO",
    type: "find",
    questionTemplate:
      "Thử thách trí nhớ: Liệt kê {count} bộ anime mang đồng thời 2 thể loại {genre1} và {genre2}.",
    params: { type: "multiGenre" },
    orderBy: "views",
    orderDir: ["DESC", "ASC"],
  },
  {
    id: "FIND_STUDIO",
    type: "find",
    questionTemplate: "Gọi tên thật chính xác {count} bộ anime từng được sản xuất bởi studio {studio}.",
    params: { type: "studio" },
    orderBy: "views",
    orderDir: ["DESC", "ASC"],
  },
  {
    id: "FIND_GENRE",
    type: "find",
    questionTemplate: "Câu hỏi khởi động: Điền chính xác {count} bộ anime mang thể loại {genre}.",
    params: { type: "genre" },
    orderBy: "views",
    orderDir: ["DESC", "ASC"],
  },
];

export const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
export const HISTORY_LIMIT = 10;
