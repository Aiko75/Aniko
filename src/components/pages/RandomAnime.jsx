"use client";

import { useState } from "react";
import Link from "next/link";
import AnimeCard from "@/components/ui/AnimeCard";
import AnimeCardSkeleton from "@/components/ui/AnimeCardSkeleton";
import { api } from "@/lib/api/baseJsonApi";
import { Box, Container, Stack, Button, Typography, Chip, Grid, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function Random() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRandomAnime = async () => {
    setLoading(true);
    setAnimes([]);
    try {
      const json = await api.get("/api/data/random", { cache: "no-store" });

      if (json.success) {
        // Giữ delay 800ms để người dùng kịp nhìn thấy hiệu ứng skeleton đẹp mắt
        setTimeout(() => {
          setAnimes(json.data);
          setLoading(false);
        }, 800);
      }
    } catch (err) {
      console.error("Failed to fetch random anime", err);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6, minHeight: "100vh" }}>
      {/* Navigation Back */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Button
          component={Link}
          href="/list"
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: "20px", textTransform: "none", borderColor: "divider", color: "text.secondary" }}
        >
          Quay lại thư viện
        </Button>
        <Chip label="Mode: Batch Summon x20" variant="outlined" sx={{ fontWeight: "bold" }} />
      </Stack>

      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight="bold" color="primary" mb={2}>
          🎰 Gacha 210 Time
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Nhân phẩm của bạn thế nào? Quay thử 20 bộ nhé!
        </Typography>

        {/* Button Random */}
        <Button
          onClick={fetchRandomAnime}
          disabled={loading}
          variant="contained"
          size="large"
          startIcon={!loading && <AutoAwesomeIcon />}
          sx={{
            px: 6,
            py: 2,
            borderRadius: "50px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            textTransform: "none",
            background: loading ? "grey.500" : "linear-gradient(45deg, #6f42c1, #0d6efd)",
            transition: "all 0.3s ease",
            boxShadow: loading ? 0 : 4,
            "&:hover": {
              boxShadow: 6,
              transform: "translateY(-2px)"
            }
          }}
        >
          {loading ? "Đang triệu hồi..." : "Triệu hồi x20 ngay!"}
        </Button>
      </Box>

      {/* --- KHU VỰC HIỂN THỊ KẾT QUẢ --- */}

      <Box sx={{ animation: "fade-in 0.5s ease" }}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
          {/* CASE 1: ĐANG LOADING -> HIỂN THỊ SKELETON */}
          {loading &&
            Array.from({ length: 20 }).map((_, index) => (
              <div key={`skeleton-${index}`}>
                <AnimeCardSkeleton />
              </div>
            ))}

          {/* CASE 2: CÓ DATA -> HIỂN THỊ CARD THẬT */}
          {!loading &&
            animes.length > 0 &&
            animes.map((anime, index) => (
              <div key={anime.id || index}>
                <AnimeCard item={anime} />
              </div>
            ))}
        </div>
      </Box>

      {/* CASE 3: CHƯA CÓ GÌ (INITIAL STATE) */}
      {!loading && animes.length === 0 && (
        <Box py={8} display="flex" justifyContent="center">
          <Alert
            severity="info"
            icon={<Box fontSize={30}>👇</Box>}
            sx={{
              px: { xs: 3, md: 6 },
              py: 3,
              alignItems: "center",
              borderRadius: 3,
              boxShadow: 1
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Bấm nút phía trên để quay 20 bộ ngẫu nhiên!
            </Typography>
          </Alert>
        </Box>
      )}
    </Container>
  );
}
