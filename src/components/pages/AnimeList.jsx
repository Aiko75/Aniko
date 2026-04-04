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
import { api } from "@/lib/api/baseJsonApi";
import { Box, Container, Typography, Stack, Button, TextField, InputAdornment, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CasinoIcon from "@mui/icons-material/Casino";

export default function AnimeList() {
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
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        py: 6,
        bgcolor: currentMode === "hanime" ? "grey.50" : "primary.50",
        transition: "background-color 0.5s ease",
      }}
    >
      <Container maxWidth="lg">
        {/* HEADER SECTION */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          mb={4}
        >
          <Box>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: "20px", mb: 2, textTransform: "none", fontWeight: "bold", color: "text.secondary", borderColor: "divider" }}
            >
              Back
            </Button>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={currentMode === "hanime" ? "error.main" : "primary.main"}
              mb={1}
            >
              {currentMode === "hanime" ? "Thư viện HAnime" : "Thư viện Anime"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tổng cộng: <b>{totalItems}</b> bộ
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/list/random"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CasinoIcon />}
            sx={{ borderRadius: "30px", fontWeight: "bold", textTransform: "none", boxShadow: 3, px: 4 }}
          >
            Gacha Time :D
          </Button>
        </Stack>

        {/* SEARCH INPUT */}
        <Box mb={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={`Tìm kiếm trong ${currentMode === "hanime" ? "H-Anime" : "Anime"}...`}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "background.paper",
                borderRadius: "20px",
                boxShadow: 1,
                fieldset: { border: "none" },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "2px solid", borderColor: "primary.main" },
              }
            }}
          />
        </Box>

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
          <Grid container spacing={3}>
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={index}>
                <AnimeCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : (
          <AnimeGrid
            data={activeData}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => updateQuery({ page: page.toString() })}
          />
        )}
      </Container>
    </Box>
  );
}
