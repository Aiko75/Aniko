"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import GameSearch from "@/components/ui/GameSearch";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import { api } from "@/lib/api/baseJsonApi";
import TicTacToeGrid from "@/components/game/TicTacToe/TicTacToeGrid"; // [UPDATE] Import Component mới
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Chip,
  Paper,
  Stack,
  CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function TicTacToe() {
  const [board, setBoard] = useState(null);
  const [gridState, setGridState] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  );
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lives, setLives] = useState(9);

  const isInitialized = useRef(false);
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.TICTACTOE.PROGRESS;

  const fetchNewBoard = async () => {
    const res = await api.get("/api/games/tictactoe/new");
    if (res.success) setBoard(res.board);
    setLoading(false);
    isInitialized.current = true;
  };

  // --- 1. LOGIC KHÔI PHỤC TIẾN TRÌNH ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const progress = JSON.parse(savedData);
        setBoard(progress.board);
        setGridState(progress.gridState);
        setLives(progress.lives);
        setLoading(false);
        isInitialized.current = true;
      } catch (e) {
        console.error("❌ Lỗi phục hồi PROGRESS:", e);
        fetchNewBoard();
      }
    } else {
      fetchNewBoard();
    }
  }, [STORAGE_KEY]);

  // --- 2. LOGIC LƯU TIẾN TRÌNH ---
  useEffect(() => {
    if (!isInitialized.current || !board) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ board, gridState, lives })
    );
  }, [gridState, lives, board, STORAGE_KEY]);

  // --- 3. LOGIC GAME ---
  const handleNewGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const handleGuess = async (anime) => {
    if (!selectedCell || !board) return;
    const { r, c } = selectedCell;
    if (gridState[r][c]) return;

    const json = await api.post(
      "/api/games/tictactoe/check",
      JSON.stringify({
        animeId: anime.id,
        rowAttr: board.rows[r],
        colAttr: board.cols[c],
      })
    );

    if (json.correct) {
      const newGrid = [...gridState];
      newGrid[r][c] = anime;
      setGridState(newGrid);
      setSelectedCell(null);
    } else {
      alert(json.message);
      setLives((prev) => prev - 1);
    }
  };

  // Wrapper Style cho Main Page
  const wrapperStyle = {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  if (loading)
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f8f9fa">
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary" fontWeight="bold">
          Đang thiết lập bàn cờ...
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ minHeight: "100vh", pb: 6, bgcolor: "#f8f9fa" }}>
      {/* Navbar */}
      <AppBar position="sticky" color="inherit" elevation={1} sx={{ zIndex: 40 }}>
        <Toolbar sx={{ justifyContent: "space-between", maxWidth: 1200, width: "100%", mx: "auto" }}>
          <Button
            component={Link}
            href="/game"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: "20px", textTransform: "none", fontWeight: "bold" }}
          >
            Back
          </Button>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={`LIVES: ${lives}`}
              color="error"
              variant="outlined"
              sx={{ fontWeight: "bold", fontFamily: "monospace", borderRadius: "16px", px: 1, bgcolor: "error.light", color: "error.dark" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleNewGame}
              sx={{ borderRadius: "20px", fontWeight: "bold", textTransform: "none" }}
            >
              Ván mới
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Search Overlay & Input Box */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            position: "sticky",
            top: 80,
            zIndex: 30,
            mb: 4,
          }}
        >
          <Paper elevation={4} sx={{ p: 3, mx: 2, borderRadius: 4 }}>
            {selectedCell ? (
              <Box mb={2} textAlign="center" sx={{ animation: "fade-in 0.3s ease" }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                  Mục tiêu:
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" mt={1}>
                  <Chip
                    label={board.rows[selectedCell.r].value}
                    color="success"
                    size="small"
                    sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
                  />
                  <Typography variant="body2" color="text.secondary">+</Typography>
                  <Chip
                    label={board.cols[selectedCell.c].value}
                    color="primary"
                    size="small"
                    sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
                  />
                </Stack>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" fontStyle="italic" mb={1}>
                Bấm chọn ô trống bên dưới
              </Typography>
            )}
            <Box sx={{ opacity: selectedCell ? 1 : 0.4, transition: "opacity 0.3s ease" }}>
              <GameSearch onGuess={handleGuess} disabled={!selectedCell} />
            </Box>
          </Paper>
        </Box>

        {/* Gọi Component Grid đã tách */}
        <Box width="100%" display="flex" justifyContent="center">
          <TicTacToeGrid
            board={board}
            gridState={gridState}
            selectedCell={selectedCell}
            onSelectCell={(r, c) => setSelectedCell({ r, c })}
          />
        </Box>
      </Container>
    </Box>
  );
}
