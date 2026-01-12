"use client";

import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import AnimeGrid from "@/components/list/AnimeGrid";
import FilterBar from "@/components/list/FilterBar";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useGetFilters } from "@/hooks/useGetFilters";
import AnimeCardSkeleton from "@/components/ui/AnimeCardSkeleton";
import { api } from "@/app/api/baseJsonApi";

export default function List() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const itemsPerPage = 20;
  const isInitialized = useRef(false);

  // --- STATE ---
  const [activeData, setActiveData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // State Mode (Lấy từ Cookie)
  const [currentMode, setCurrentMode] = useState(() => {
    return Cookies.get("app_mode") || "anime";
  });

  useEffect(() => {
    const savedMode = Cookies.get("app_mode");
    if (savedMode && savedMode !== currentMode) {
      setCurrentMode(savedMode);
    }
  }, [currentMode]);

  // Hook Filter
  const { filterOptions, loading: loadingFilters } = useGetFilters(currentMode);

  // UI State
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Filters Memo
  const filters = useMemo(
    () => ({
      genre: searchParams.get("genre") || "All",
      studio: searchParams.get("studio") || "All",
      sortBy: searchParams.get("sortBy") || "newest",
      minYear: searchParams.get("minYear") || "",
      maxYear: searchParams.get("maxYear") || "",
      minView: searchParams.get("minView") || "",
      maxView: searchParams.get("maxView") || "",
    }),
    [searchParams]
  );

  // --- FETCH DATA ---
  const fetchLibraryData = useCallback(async () => {
    setIsLoading(true);
    try {
      const mode = Cookies.get("app_mode") || "anime";
      setCurrentMode(mode);

      const params = new URLSearchParams(searchParams.toString());
      if (!params.has("limit")) params.set("limit", itemsPerPage.toString());

      const filterBody = {
        genre: filters.genre,
        studio: filters.studio,
        tag: filters.tag,
        minYear: filters.minYear,
        maxYear: filters.maxYear,
        minView: filters.minView,
        maxView: filters.maxView,
      };

      const result = await api.post(`/api/data?${params.toString()}`, {
        page: currentPage,
        limit: itemsPerPage,
        search: localSearch,
        mode: mode,
        sortBy: filters.sortBy,
        filters: filterBody,
      });

      if (result.success) {
        setActiveData(result.data);
        setTotalItems(result.pagination.totalItems);
      }
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, filters, currentPage, localSearch]);

  useEffect(() => {
    fetchLibraryData();
  }, [fetchLibraryData]);

  // --- PERSISTENCE (Giữ nguyên) ---
  useEffect(() => {
    const savedPage = localStorage.getItem(LOCAL_STORAGE_KEYS.LIST.PAGE);
    const urlPage = searchParams.get("page");

    if (!urlPage && savedPage) {
      const p = new URLSearchParams(searchParams.toString());
      p.set("page", savedPage);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }
    isInitialized.current = true;
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.LIST.PAGE,
        currentPage.toString()
      );
    }
  }, [currentPage]);

  // --- HELPER: UPDATE QUERY ---
  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "All") params.set(key, value);
        else params.delete(key);
      });
      // Nếu không phải là chuyển trang thì reset về trang 1
      if (!updates.page) params.set("page", "1");

      router.replace(`${pathname}?${params.toString()}`, { scroll: true });
    },
    [searchParams, pathname, router]
  );

  // --- DEBOUNCE SEARCH (Giữ nguyên) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (searchParams.get("q") || "")) {
        updateQuery({ q: localSearch });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, updateQuery, searchParams]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div
      className={`flex justify-center w-full min-h-screen py-10 transition-colors duration-500 ${
        currentMode === "hanime" ? "bg-zinc-50" : "bg-blue-50"
      }`}
    >
      <main className="w-full max-w-6xl px-4 sm:px-10">
        {/* HEADER SECTION */}
        <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
          <div>
            <Link
              href="/"
              className="px-3 mb-2 btn btn-outline-secondary rounded-pill fw-bold btn-sm d-inline-block"
            >
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            <h1
              className={`mb-1 text-3xl font-semibold ${
                currentMode === "hanime" ? "text-pink-600" : "text-blue-700"
              }`}
            >
              {currentMode === "hanime" ? "Thư viện HAnime" : "Thư viện Anime"}
            </h1>
            <p className="text-zinc-500">
              Tổng cộng: <b>{totalItems}</b> bộ
            </p>
          </div>
          <Link
            href="/list/random"
            className="gap-2 shadow btn btn-primary btn-lg d-flex align-items-center fw-bold rounded-pill"
          >
            Gacha Time :D
          </Link>
        </div>

        {/* SEARCH INPUT */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <i className="bi bi-search text-zinc-400"></i>
            </div>
            <input
              type="text"
              className="w-full py-3 pl-12 pr-4 transition-all bg-white border shadow-sm outline-none border-zinc-200 rounded-2xl focus:ring-2 focus:ring-primary"
              placeholder={`Tìm kiếm trong ${
                currentMode === "hanime" ? "H-Anime" : "Anime"
              }...`}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        {/* FILTER BAR */}
        <FilterBar
          filters={filters}
          options={filterOptions}
          loading={loadingFilters}
          onUpdate={(key, val) => updateQuery({ [key]: val })}
          onReset={() => {
            setLocalSearch("");
            localStorage.removeItem(LOCAL_STORAGE_KEYS.LIST.PAGE);
            router.push(pathname);
          }}
        />

        {/* CONTENT GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <AnimeCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          /* [UPDATE] Truyền props Pagination vào AnimeGrid */
          <AnimeGrid
            data={activeData}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => updateQuery({ page: page.toString() })}
          />
        )}
      </main>
    </div>
  );
}
