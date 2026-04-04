"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { useMode } from "@/context/ModeContext";
import { Box, Container, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
  "Enter",
];

export default function Homepage() {
  const router = useRouter();
  const { mode, setMode } = useMode();
  const [hoveredCard, setHoveredCard] = useState(null);

  const [konamiIndex, setKonamiIndex] = useState(0);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const switchToHanime = () => {
    Cookies.set("app_mode", "hanime", { expires: 365 });
    setMode("hanime");
    router.refresh();
    alert("🔓 SECRET UNLOCKED: Welcome to the dark side!");
  };

  const switchToAnime = () => {
    Cookies.set("app_mode", "anime", { expires: 365 });
    setMode("anime");
    router.refresh();
    alert("🛡️ PANIC MODE: Đã quay về giao diện an toàn!");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mode === "hanime") {
        switchToAnime();
        return;
      }

      if (mode === "anime") {
        const requiredKey = KONAMI_CODE[konamiIndex];
        if (e.key.toLowerCase() === requiredKey.toLowerCase()) {
          const nextIndex = konamiIndex + 1;
          if (nextIndex === KONAMI_CODE.length) {
            switchToHanime();
            setKonamiIndex(0);
          } else {
            setKonamiIndex(nextIndex);
          }
        } else {
          setKonamiIndex(e.key === "ArrowUp" ? 1 : 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex, mode, setMode]);

  const handleTitleClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    if (clickCountRef.current === 3) {
      if (mode === "anime") {
        switchToHanime();
      } else {
        switchToAnime();
      }
      clickCountRef.current = 0;
    }
  };

  const isHanime = mode === "hanime";
  const theme = {
    background: isHanime
      ? "linear-gradient(135deg, #1a0505 0%, #4c0519 50%, #2d0606 100%)"
      : "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
    accent: isHanime ? "#ec4899" : "#3b82f6",
    accentGlow: isHanime
      ? "rgba(236, 72, 153, 0.5)"
      : "rgba(59, 130, 246, 0.5)",
    cardHoverBorder: isHanime
      ? "rgba(236, 72, 153, 0.8)"
      : "rgba(59, 130, 246, 0.8)",
  };

  return (
    <Box
      sx={{
        transition: "all 0.7s ease",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: theme.background,
        color: "white",
        py: 6
      }}
    >
      {/* Header Section */}
      <Box textAlign="center" mb={6} sx={{ animation: "fade-in 0.8s ease" }}>
        <Box position="relative" display="inline-block">
          <Typography
            variant="h2"
            fontWeight="bold"
            onClick={handleTitleClick}
            sx={{
              mb: 2,
              cursor: "pointer",
              userSelect: "none",
              textShadow: `0 0 20px ${theme.accentGlow}`,
              transition: "transform 0.1s",
              "&:active": {
                transform: "scale(0.95)"
              }
            }}
            title={isHanime ? "Click 3 lần để thoát" : "Hmm... có gì đó bí ẩn ở đây?"}
          >
            Aniko!
          </Typography>

          {!isHanime && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: -16,
                width: 8,
                height: 8,
                bgcolor: "white",
                borderRadius: "50%",
                opacity: 0.5,
                animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
                "@keyframes ping": {
                  "75%, 100%": {
                    transform: "scale(2.5)",
                    opacity: 0
                  }
                }
              }}
            />
          )}
        </Box>

        <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}>
          Cổng thông tin giải trí & Thư viện {isHanime ? "HAnime" : "Anime"} tối thượng
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
          Dữ liệu cập nhật: 09/12/2025
        </Typography>
      </Box>

      {/* Navigation Cards */}
      <Container maxWidth="md">
        <Grid container spacing={4} justifyContent="center">
          {/* Card 1: Library */}
          <Grid item xs={12} sm={6}>
            <Card
              onClick={() => router.push("/list")}
              onMouseEnter={() => setHoveredCard("library")}
              onMouseLeave={() => setHoveredCard(null)}
              elevation={0}
              sx={{
                height: "100%",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform: hoveredCard === "library" ? "translateY(-12px)" : "none",
                border: `1px solid ${
                  hoveredCard === "library" ? theme.cardHoverBorder : "rgba(255,255,255,0.1)"
                }`,
                boxShadow: hoveredCard === "library" ? `0 10px 30px ${theme.accentGlow}` : "none",
                color: "white"
              }}
            >
              <CardContent sx={{ p: 5, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                <Box
                  sx={{
                    mb: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "50%",
                    width: 80,
                    height: 80,
                    backgroundColor: theme.accent,
                    boxShadow: `0 0 20px ${theme.accentGlow}`,
                    opacity: 0.9,
                  }}
                >
                  <LibraryBooksIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                  {isHanime ? "Thư viện HAnime" : "Thư viện Anime"}
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 4, flexGrow: 1 }}>
                  Tra cứu, lọc và tìm kiếm hàng ngàn bộ {isHanime ? "haiten" : "anime"} với dữ liệu chi tiết từ Database.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    borderRadius: "20px",
                    fontWeight: "bold",
                    bgcolor: isHanime ? "error.main" : "primary.main",
                    "&:hover": {
                      bgcolor: isHanime ? "error.dark" : "primary.dark",
                    }
                  }}
                >
                  Truy cập ngay &rarr;
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Mini Games */}
          <Grid item xs={12} sm={6}>
            <Card
              onClick={() => router.push("/game")}
              onMouseEnter={() => setHoveredCard("game")}
              onMouseLeave={() => setHoveredCard(null)}
              elevation={0}
              sx={{
                height: "100%",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform: hoveredCard === "game" ? "translateY(-12px)" : "none",
                border: `1px solid ${
                  hoveredCard === "game" ? "rgba(25, 135, 84, 0.8)" : "rgba(255,255,255,0.1)"
                }`,
                boxShadow: hoveredCard === "game" ? "0 10px 30px rgba(25, 135, 84, 0.4)" : "none",
                color: "white"
              }}
            >
              <CardContent sx={{ p: 5, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                <Box
                  sx={{
                    mb: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "50%",
                    width: 80,
                    height: 80,
                    bgcolor: "success.main",
                    boxShadow: "0 0 20px rgba(25, 135, 84, 0.5)",
                  }}
                >
                  <SportsEsportsIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                  Mini Games
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 4, flexGrow: 1 }}>
                  Thử thách kiến thức của bạn với Wordle, Bingo và các trò chơi giải trí khác.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ borderRadius: "20px", fontWeight: "bold" }}
                >
                  Chơi ngay &rarr;
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Typography variant="caption" sx={{ mt: 8, opacity: 0.5, color: "rgba(255,255,255,0.7)" }}>
        © 2026 Aniko Project. IT Engineer Edition.
      </Typography>
    </Box>
  );
}
