"use client";
import AnimeCard from "./AnimeCard";

export default function AnimeGrid({
  data,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}) {
  // --- UI KHI KHÔNG CÓ DỮ LIỆU ---
  if (!isLoading && data.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed text-zinc-500 border-zinc-200 dark:border-zinc-800 rounded-xl">
        Không tìm thấy bộ nào phù hợp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* --- GRID LIST --- */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.map((item, index) => (
          <AnimeCard key={item.id || index} item={item} />
        ))}
      </div>

      {/* --- PAGINATION (SIMPLE STYLE) --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10 mb-20">
          {/* Nút Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`px-4 py-2 text-sm font-bold border rounded-full transition-all ${
              currentPage <= 1
                ? "bg-zinc-100 text-zinc-300 border-zinc-100 cursor-not-allowed"
                : "bg-white text-zinc-600 hover:bg-zinc-50 hover:shadow-md border-zinc-200"
            }`}
          >
            &larr; Prev
          </button>

          {/* Indicator Trang Hiện Tại */}
          <span className="px-4 py-2 text-sm font-bold text-white shadow-md bg-primary rounded-xl">
            Page {currentPage} / {totalPages}
          </span>

          {/* Nút Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`px-4 py-2 text-sm font-bold border rounded-full transition-all ${
              currentPage >= totalPages
                ? "bg-zinc-100 text-zinc-300 border-zinc-100 cursor-not-allowed"
                : "bg-white text-zinc-600 hover:bg-zinc-50 hover:shadow-md border-zinc-200"
            }`}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
