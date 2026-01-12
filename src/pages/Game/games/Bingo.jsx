"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import { api } from "@/app/api/baseJsonApi";
import BingoDeck from "@/components/game/Bingo/BingoDeck";
import BingoGrid from "@/components/game/Bingo/BingoGrid";

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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="spinner-border text-primary"></div>
        <div className="ms-3 fw-bold text-muted">Đang chia bài...</div>
      </div>
    );

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* HEADER */}
      <div className="sticky top-0 z-40 flex items-center justify-between max-w-6xl p-3 mx-auto mb-6 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/game"
            className="px-3 btn btn-sm btn-outline-secondary rounded-pill"
          >
            Back
          </Link>
          <div className="px-3 py-2 font-bold border badge bg-primary bg-opacity-10 text-primary border-primary rounded-pill">
            Mục tiêu: {targetBingoGoal} Dòng
          </div>
        </div>
        <h1 className="hidden text-xl font-black tracking-tighter text-blue-600 md:block">
          ANIME BINGO
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-slate-500">
            Card:{" "}
            <span className="text-dark">
              {currentIndex + 1}/{deck.length}
            </span>
          </div>
          <div className="px-3 py-2 shadow-sm badge bg-danger rounded-pill fs-6">
            ❤️ {lives}
          </div>
        </div>
      </div>

      <div className="grid items-start max-w-6xl grid-cols-1 gap-8 px-4 mx-auto md:grid-cols-2">
        {/* LEFT COMPONENT: DECK */}
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

        {/* RIGHT COMPONENT: GRID */}
        <BingoGrid
          grid={grid}
          selectedCells={selectedCells}
          activeHintIds={activeHintIds}
          gameStatus={gameStatus}
          bingoCount={bingoLines.length}
          targetGoal={targetBingoGoal}
          onCellClick={handleCellClick}
        />
      </div>
    </div>
  );
}
