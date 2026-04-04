"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import { api } from "@/lib/api/baseJsonApi";
import BingoDeck from "@/components/game/Bingo/BingoDeck";
import BingoGrid from "@/components/game/Bingo/BingoGrid";
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Chip,
  Stack,
  Grid,
  CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Bingo() {
  const [grid, setGrid] = useState([]);
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCells, setSelectedCells] = useState([]);
  const [bingoLines, setBingoLines] = useState([]);
  const [lives, setLives] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState("playing");
  const DEFAULT_GOAL = 1;
  const [targetBingoGoal, setTargetBingoGoal] = useState(DEFAULT_GOAL);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [activeHintIds, setActiveHintIds] = useState([]);

  const isInitialized = useRef(false);
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.BINGO.PROGRESS;

  // --- 1. LOGIC KHÔI PHỤC ---
  useEffect(() => {
    if (isInitialized.current) return;
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        if (data.gameStatus === "playing") {
          setGrid(data.grid);
          setDeck(data.deck);
          setCurrentIndex(data.currentIndex);
          setSelectedCells(data.selectedCells);
          setBingoLines(data.bingoLines);
          setLives(data.lives);
          setTargetBingoGoal(data.targetBingoGoal);
          setHintsLeft(data.hintsLeft);
          setGameStatus("playing");
          setLoading(false);
        } else {
          initGame(DEFAULT_GOAL);
        }
      } catch (e) {
        initGame(DEFAULT_GOAL);
      }
    } else {
      initGame(DEFAULT_GOAL);
    }
    isInitialized.current = true;
  }, [STORAGE_KEY]);

  // --- 2. LOGIC LƯU ---
  useEffect(() => {
    if (!isInitialized.current || loading) return;
    if (gameStatus === "playing") {
      const stateToSave = {
        grid,
        deck,
        currentIndex,
        selectedCells,
        bingoLines,
        lives,
        targetBingoGoal,
        hintsLeft,
        gameStatus,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [
    grid,
    deck,
    currentIndex,
    selectedCells,
    bingoLines,
    lives,
    gameStatus,
    hintsLeft,
    targetBingoGoal,
    loading,
    STORAGE_KEY,
  ]);

  // --- HELPER LOGIC ---
  const checkCondition = (anime, cell) => {
    if (!anime) return false;
    let isMatch = false;
    const val = cell.value;
    const year = anime.release_year || parseInt(anime.releaseYear?.name || 0);
    const views = anime.views || 0;
    const censorship = anime.censorship || "";
    const category = anime.category || "";
    console.log(censorship, val);
    console.log(category, val);

    switch (cell.type) {
      case "year_eq":
        isMatch = year === val;
        break;
      case "year_gt":
        isMatch = year > val;
        break;
      case "year_lt":
        isMatch = year < val;
        break;
      case "views_gt":
        isMatch = views > val;
        break;
      case "views_lt":
        isMatch = views < val;
        break;
      case "genre":
        if (Array.isArray(anime.genres)) {
          isMatch = anime.genres.some((g) =>
            typeof g === "string" ? g === val : g.name === val
          );
        }
        break;
      case "studio":
        if (Array.isArray(anime.studios)) {
          isMatch = anime.studios.some((s) =>
            typeof s === "string" ? s === val : s.name === val
          );
        }
        break;
      case "tag_match":
        if (Array.isArray(anime.tags)) {
          if (
            anime.tags.some((t) =>
              typeof t === "string" ? t === val : t.name === val
            )
          )
            isMatch = true;
        }
        if (!isMatch && anime.title)
          isMatch = anime.title.toLowerCase().includes(val.toLowerCase());
        break;
      case "censorship":
        isMatch = censorship === val;
        break;
      case "category":
        isMatch = category === val;
        break;
      default:
        isMatch = false;
    }
    if (!isMatch && anime.matchedCellIds)
      isMatch = anime.matchedCellIds.includes(cell.id);
    return isMatch;
  };

  const WIN_PATTERNS = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12],
  ];

  const initGame = async (goal = DEFAULT_GOAL) => {
    setLoading(true);
    localStorage.removeItem(STORAGE_KEY);
    setTargetBingoGoal(goal);
    setLives(10);
    setHintsLeft(5);
    setSelectedCells([]);
    setBingoLines([]);
    setCurrentIndex(0);
    setActiveHintIds([]);
    setGameStatus("playing");

    try {
      const gridData = await api.get("/api/games/bingo/grid");
      if (gridData.success) {
        setGrid(gridData.grid);
        const deckData = await api.post(
          "/api/games/bingo/deck",
          JSON.stringify({ grid: gridData.grid, goal: goal })
        );
        if (deckData.success) setDeck(deckData.deck);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUseHint = () => {
    if (hintsLeft <= 0 || gameStatus !== "playing") return;
    const currentAnime = deck[currentIndex];
    const correctIds = grid
      .filter((cell) => checkCondition(currentAnime, cell))
      .map((cell) => cell.id);
    const availableCorrectIds = correctIds.filter(
      (id) => !selectedCells.includes(id)
    );

    if (availableCorrectIds.length === 0) {
      alert("Lá bài này không khớp với ô trống nào trên bảng!");
      setHintsLeft((prev) => prev - 1);
      return;
    }

    const oneCorrect =
      availableCorrectIds[
        Math.floor(Math.random() * availableCorrectIds.length)
      ];
    const allIds = Array.from({ length: 16 }, (_, i) => i);
    const wrongIds = allIds.filter((id) => !correctIds.includes(id));
    const hintBatch = [
      oneCorrect,
      ...wrongIds.sort(() => 0.5 - Math.random()).slice(0, 3),
    ].sort(() => 0.5 - Math.random());

    setActiveHintIds(hintBatch);
    setHintsLeft((prev) => prev - 1);
  };

  const handleCellClick = (cell) => {
    if (gameStatus !== "playing" || selectedCells.includes(cell.id)) return;
    const currentAnime = deck[currentIndex];
    const isCorrect = checkCondition(currentAnime, cell);

    if (isCorrect) {
      const newSelected = [...selectedCells, cell.id];
      setSelectedCells(newSelected);
      checkBingo(newSelected);
      setActiveHintIds([]);
      nextCard();
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) setGameStatus("lost");
      setActiveHintIds([]);
      nextCard();
    }
  };

  const nextCard = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (bingoLines.length < targetBingoGoal) setGameStatus("lost");
    }
  };

  const checkBingo = (currentSelected) => {
    const newLines = [];
    WIN_PATTERNS.forEach((pattern, index) => {
      if (pattern.every((id) => currentSelected.includes(id))) {
        if (!bingoLines.includes(index)) newLines.push(index);
      }
    });
    if (newLines.length > 0) {
      const totalLines = [...bingoLines, ...newLines];
      setBingoLines(totalLines);
      if (totalLines.length >= targetBingoGoal) setGameStatus("won");
    }
  };

  if (loading)
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="#f8fafc">
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress color="primary" size={30} />
          <Typography fontWeight="bold" color="text.secondary">
            Đang chia bài...
          </Typography>
        </Stack>
      </Box>
    );

  return (
    <Box sx={{ minHeight: "100vh", pb: 10, bgcolor: "#f8fafc" }}>
      {/* HEADER */}
      <AppBar position="sticky" color="inherit" elevation={1} sx={{ zIndex: 40, mb: 4 }}>
        <Toolbar sx={{ justifyContent: "space-between", maxWidth: 1200, width: "100%", mx: "auto", px: { xs: 2, md: 4 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component={Link}
              href="/game"
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: "20px", textTransform: "none" }}
            >
              Back
            </Button>
            <Chip
              label={`Mục tiêu: ${targetBingoGoal} Dòng`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: "bold", bgcolor: "primary.50" }}
            />
          </Stack>

          <Typography
            variant="h6"
            fontWeight={900}
            color="primary.main"
            sx={{ display: { xs: "none", md: "block" }, letterSpacing: "-0.5px" }}
          >
            ANIME BINGO
          </Typography>

          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Card:{" "}
              <Box component="span" color="text.primary">
                {currentIndex + 1}/{deck.length}
              </Box>
            </Typography>
            <Chip
              label={`❤️ ${lives}`}
              color="error"
              sx={{ fontWeight: "bold", fontSize: "1rem" }}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ display: "flex", justifyContent: "center" }}>
        <Grid container spacing={{ xs: 4, md: 8 }} justifyContent="center" alignItems="flex-start" sx={{ maxWidth: 1000 }}>
          {/* LEFT COMPONENT: DECK */}
          <Grid item xs={12} md="auto" display="flex" justifyContent="center" width={{ xs: "100%", md: "auto" }}>
            <BingoDeck
              currentCard={deck[currentIndex]}
              gameStatus={gameStatus}
              bingoCount={bingoLines.length}
              targetGoal={targetBingoGoal}
              hintsLeft={hintsLeft}
              onNext={nextCard}
              onHint={handleUseHint}
              onRestart={() => initGame(DEFAULT_GOAL)}
            />
          </Grid>

          {/* RIGHT COMPONENT: GRID */}
          <Grid item xs={12} md="auto" display="flex" justifyContent="center" width={{ xs: "100%", md: "auto" }}>
            <BingoGrid
              grid={grid}
              selectedCells={selectedCells}
              activeHintIds={activeHintIds}
              gameStatus={gameStatus}
              bingoCount={bingoLines.length}
              targetGoal={targetBingoGoal}
              onCellClick={handleCellClick}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
