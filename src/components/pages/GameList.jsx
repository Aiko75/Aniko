"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import { useMode } from "@/context/ModeContext";
import GameCard from "@/components/ui/GameCard";
import { Box, Container, Typography, Button, Grid, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function GameList() {
  const router = useRouter();
  const { mode } = useMode();

  // --- CẤU HÌNH DATA ---
  const gamesData = [
    {
      path: "/game/wordle",
      status: "active",
      color: "primary",
      localKey: LOCAL_STORAGE_KEYS.WORDLE.PROGRESS,
      modes: {
        hanime: {
          id: "hanidle",
          name: "H-Anidle",
          description: "Thử thách kiến thức văn hóa 'nhật bản'. Đoán tên phim dựa trên gợi ý.",
          icon: "🧩",
        },
        anime: {
          id: "anidle",
          name: "Anidle",
          description: "Thử thách fan cứng Anime. Đoán tên bộ Anime kinh điển.",
          icon: "🎬",
        },
      },
    },
    {
      path: "/game/tictactoe",
      status: "active",
      color: "success",
      localKey: LOCAL_STORAGE_KEYS.TICTACTOE.PROGRESS,
      modes: {
        hanime: {
          id: "hengrid",
          name: "HenGrid",
          description: "Immaculate Grid phiên bản người lớn. Điền vào ô trống theo tiêu chí.",
          icon: "👅",
        },
        anime: {
          id: "anigrid",
          name: "AniGrid",
          description: "Thử thách kiến thức tổng hợp. Tìm Anime thỏa mãn 2 điều kiện giao nhau.",
          icon: "🧠",
        },
      },
    },
    {
      path: "/game/bingo",
      status: "active",
      color: "error",
      localKey: LOCAL_STORAGE_KEYS.BINGO.PROGRESS,
      modes: {
        hanime: {
          id: "hengo",
          name: "Hengo",
          description: "Bingo phiên bản HAnime. Quay số và tìm vận may của bạn.",
          icon: "🥀",
        },
        anime: {
          id: "anibingo",
          name: "AniBingo",
          description: "Bingo Anime vui vẻ. Sưu tập các waifu/husbando để chiến thắng.",
          icon: "🍀",
        },
      },
    },
    {
      path: "/game/anirank",
      status: "active",
      color: "warning",
      localKey: null,
      modes: {
        anime: {
          id: "anirank",
          name: "AniRank",
          description: "Tenaball phiên bản Anime. Trả lời câu hỏi về top anime theo thể loại, studio, năm!",
          icon: "🏆",
        },
      },
    },
  ];

  // --- LOGIC ĐIỀU HƯỚNG ---
  const handleGameNavigation = (gameCommon, gameModeData) => {
    if (gameCommon.status !== "active") return;

    if (gameCommon.localKey) {
      localStorage.removeItem(gameCommon.localKey);
      console.log(`🧹 IT Ops: Đã dọn dẹp [${gameCommon.localKey}]`);
    }

    router.push(gameCommon.path);
  };

  // --- UI THEME ---
  const bgTheme =
    mode === "hanime"
      ? "linear-gradient(to bottom right, #2c001e, #53183b)"
      : "linear-gradient(to bottom right, #141E30, #243B55)";

  return (
    <Box
      sx={{
        py: 6,
        minHeight: "100vh",
        background: bgTheme,
        color: "white",
        transition: "background 0.5s ease",
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
          mb={6}
          sx={{ animation: "fade-in 0.5s ease" }}
        >
          <Box display="flex" alignItems="center" gap={3}>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: "20px", fontWeight: "bold", textTransform: "none" }}
            >
              Home
            </Button>
            <Box>
              <Typography variant="h3" fontWeight="bold">
                Game Center {mode === "hanime" ? "🔞" : "🎮"}
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {mode === "hanime"
                  ? "Khu vực giải trí dành cho người trên 18 tuổi."
                  : "Thử thách kiến thức Anime của bạn."}
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Game Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-8">
          {gamesData.map((game, index) => {
            const currentData = game.modes[mode];
            if (!currentData) return null; // Ẩn game nếu mode không hỗ trợ

            return (
              <div key={currentData.id || index} className="h-full">
                <GameCard
                  gameCommon={game}
                  gameData={currentData}
                  currentMode={mode}
                  onNavigate={handleGameNavigation}
                />
              </div>
            );
          })}
        </div>
      </Container>
    </Box>
  );
}
