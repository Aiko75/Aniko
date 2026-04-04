"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import Cookies from "js-cookie";
import ResultRow from "@/components/game/Wordle/ResultRow";
import { api } from "@/lib/api/baseJsonApi";
import GameSearch from "@/components/ui/GameSearch";
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Chip,
  Paper,
  CircularProgress,
  Stack,
  IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplayIcon from "@mui/icons-material/Replay";

export default function Wordle() {
  // --- STATE ---
  const [currentMode, setCurrentMode] = useState("anime");
  const [targetAnime, setTargetAnime] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [loading, setLoading] = useState(false);

  const isInitialized = useRef(false);
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.WORDLE.PROGRESS;

  // --- 1. KHỞI TẠO MODE ---
  useEffect(() => {
    const mode = Cookies.get("app_mode") || "anime";
    setCurrentMode(mode);
  }, []);

  // --- HELPER: Fetch Target Mới từ API ---
  const fetchNewTarget = async () => {
    setLoading(true);
    try {
      const json = await api.get("/api/games/wordle/new");
      if (json.success) {
        setTargetAnime(json.data);
        setGuesses([]);
        setIsWon(false);
      }
    } catch (error) {
      console.error("Lỗi lấy đề bài:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. KHÔI PHỤC TIẾN TRÌNH ---
  useEffect(() => {
    if (isInitialized.current) return;

    const mode = Cookies.get("app_mode") || "anime";
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (rawData) {
      try {
        const fullProgress = JSON.parse(rawData);
        const modeProgress = fullProgress[mode];

        if (modeProgress && modeProgress.targetAnime) {
          setTargetAnime(modeProgress.targetAnime);
          setGuesses(modeProgress.guesses || []);
          setIsWon(modeProgress.isWon || false);
        } else {
          fetchNewTarget();
        }
      } catch {
        fetchNewTarget();
      }
    } else {
      fetchNewTarget();
    }
    isInitialized.current = true;
  }, [STORAGE_KEY]);

  // --- 3. LƯU TIẾN TRÌNH ---
  useEffect(() => {
    if (!targetAnime) return;

    const prevRaw = localStorage.getItem(STORAGE_KEY);
    let fullStorage = {};
    try {
      fullStorage = prevRaw ? JSON.parse(prevRaw) : {};
    } catch {}

    fullStorage[currentMode] = {
      targetAnime,
      guesses,
      isWon,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStorage));
  }, [guesses, targetAnime, isWon, currentMode, STORAGE_KEY]);

  // --- 4. RESET VÁN MỚI ---
  const handleNewGame = () => {
    const prevRaw = localStorage.getItem(STORAGE_KEY);
    let fullStorage = {};
    try {
      fullStorage = JSON.parse(prevRaw);
    } catch {}

    delete fullStorage[currentMode];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStorage));
    fetchNewTarget();
  };

  // --- 6. CHỌN ANIME (GỌI API CHECK) ---
  const handleSelectAnime = async (anime) => {
    if (!targetAnime) return;
    setLoading(true);

    try {
      // Gọi API Check
      const json = await api.post(
        "/api/games/wordle/check",
        JSON.stringify({
          guessId: anime.id,
          targetId: targetAnime.id,
        })
      );

      if (json.success) {
        const newGuess = json.guess;
        setGuesses([newGuess, ...guesses]);

        if (json.guess.result.isCorrect) {
          setIsWon(true);
        }
      }
    } catch (err) {
      console.error("Lỗi kiểm tra đáp án:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- UI CONFIG ---
  const themeColor = currentMode === "hanime" ? "secondary" : "primary";
  const themeBgColor = currentMode === "hanime" ? "#fdf2f8" : "#f8fafc";
  
  // --- LOADING UI KHI KHỞI TẠO ---
  if (!targetAnime && loading)
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor={themeBgColor}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color={themeColor} />
          <Typography fontWeight={500} color="text.secondary">
            Đang khởi tạo màn chơi...
          </Typography>
        </Stack>
      </Box>
    );

  return (
    <Box sx={{ minHeight: "100vh", pb: 10, bgcolor: themeBgColor, transition: "background-color 0.5s ease" }}>
      {/* HEADER */}
      <AppBar position="sticky" color="inherit" elevation={1} sx={{ zIndex: 40 }}>
        <Toolbar sx={{ justifyContent: "space-between", maxWidth: 1200, width: "100%", mx: "auto" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component={Link}
              href="/game"
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: "20px", textTransform: "none", display: { xs: "none", sm: "flex" } }}
            >
              Back
            </Button>
            <IconButton
              component={Link}
              href="/game"
              color="inherit"
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={800} color={`${themeColor}.main`} sx={{ display: { xs: "none", sm: "block" } }}>
              {currentMode === "hanime" ? "H-Anidle 🔞" : "Anidle 🎬"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={
                <Typography variant="body2" fontWeight="bold">
                  <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, mr: 1 }}>
                    Guesses:
                  </Box>
                  <Box component="span" color={`${themeColor}.main`}>{guesses.length}</Box>
                </Typography>
              }
              variant="outlined"
              sx={{ bgcolor: "background.paper" }}
            />
            <Button
              variant="contained"
              color={themeColor}
              onClick={handleNewGame}
              sx={{ borderRadius: "20px", fontWeight: "bold", textTransform: "none" }}
            >
              Ván mới
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT */}
      <Container maxWidth="md" sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            {currentMode === "hanime" ? "Đoán bộ H-Anime bí ẩn" : "Đoán bộ Anime bí ẩn"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Nhập tên bất kỳ để tìm ra manh mối...
          </Typography>
        </Box>

        {!isWon ? (
          <Box position="relative" zIndex={30} width="100%" maxWidth="sm" mb={6}>
            <GameSearch onGuess={handleSelectAnime} disabled={loading} />
          </Box>
        ) : (
          <Box width="100%" maxWidth="sm" mb={5} sx={{ animation: "zoom-in 0.5s ease" }}>
            <Paper
              elevation={4}
              sx={{
                p: 0.5,
                borderRadius: "24px",
                background: "linear-gradient(to bottom right, #22c55e, #059669)",
              }}
            >
              <Box bgcolor="white" p={4} borderRadius="20px" textAlign="center">
                <Typography variant="h4" fontWeight={800} color="success.main" gutterBottom>
                  CHÍNH XÁC!
                </Typography>
                <Typography color="text.secondary" mb={3}>
                  Đáp án là: <Box component="span" fontWeight={800} color="text.primary">{targetAnime.title}</Box>
                </Typography>
                <Box display="flex" justifyContent="center" mb={4}>
                  <Box
                    component="img"
                    src={targetAnime.thumbnail}
                    sx={{ width: 128, borderRadius: 2, boxShadow: 3 }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleNewGame}
                  startIcon={<ReplayIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: "30px",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                  }}
                >
                  Chơi lại
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* LIST GUESSES */}
        <Stack spacing={1.5} width="100%">
          {guesses.map((guess, index) => (
            <Box key={`${guess.id}-${index}`}>
              <ResultRow guess={guess} target={targetAnime} />
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
