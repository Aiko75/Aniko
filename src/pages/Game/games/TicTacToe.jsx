"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import GameSearch from "@/components/game/Contexto/GameSearch"; // Nhớ check lại đường dẫn import này
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import { api } from "@/app/api/baseJsonApi";
import TicTacToeGrid from "@/components/game/TicTacToe/TicTacToeGrid"; // [UPDATE] Import Component mới

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
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div className="mb-3 spinner-border text-primary"></div>
        <h5 className="text-muted fw-bold">Đang thiết lập bàn cờ...</h5>
      </div>
    );

  return (
    <div className="pb-5 min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="mb-4 bg-white shadow-sm navbar navbar-light sticky-top">
        <div className="container">
          <Link
            href="/game"
            className="px-3 btn btn-sm btn-outline-secondary rounded-pill fw-bold"
          >
            &larr; Back
          </Link>
          <div className="gap-3 d-flex align-items-center">
            <div className="px-3 py-2 border badge bg-danger bg-opacity-10 text-danger border-danger rounded-pill font-monospace">
              LIVES: {lives}
            </div>
            <button
              className="px-3 shadow-sm btn btn-sm btn-primary rounded-pill fw-bold"
              onClick={handleNewGame}
            >
              Ván mới
            </button>
          </div>
        </div>
      </nav>

      <div style={wrapperStyle}>
        {/* Search Overlay & Input Box */}
        <div
          className="mb-4 w-100 sticky-top"
          style={{ maxWidth: "600px", top: "75px", zIndex: 100 }}
        >
          <div className="p-3 mx-2 bg-white border shadow-lg rounded-4">
            {selectedCell ? (
              <div className="mb-2 text-center animate-in fade-in">
                <small
                  className="text-muted fw-bold"
                  style={{ fontSize: "0.65rem" }}
                >
                  Mục tiêu:
                </small>
                <div className="gap-1 mt-1 d-flex justify-content-center align-items-center">
                  <span className="badge bg-success truncate-text">
                    {board.rows[selectedCell.r].value}
                  </span>
                  <span className="text-muted">+</span>
                  <span className="badge bg-primary truncate-text">
                    {board.cols[selectedCell.c].value}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mb-1 text-center text-muted small fst-italic">
                Bấm chọn ô trống bên dưới
              </p>
            )}
            <div style={{ opacity: selectedCell ? 1 : 0.4 }}>
              <GameSearch onGuess={handleGuess} disabled={!selectedCell} />
            </div>
          </div>
        </div>

        {/* [UPDATE] Gọi Component Grid đã tách */}
        <TicTacToeGrid
          board={board}
          gridState={gridState}
          selectedCell={selectedCell}
          onSelectCell={(r, c) => setSelectedCell({ r, c })}
        />
      </div>
    </div>
  );
}
