"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import GuessLog from "@/components/game/Contexto/GuessLog";
import GameSearch from "@/components/ui/GameSearch";
import AnimeCard from "@/components/ui/AnimeCard";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import { api } from "@/lib/api/baseJsonApi";

export default function Contexto() {
  const [guesses, setGuesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [secretAnime, setSecretAnime] = useState(null);
  const [winItem, setWinItem] = useState(null);
  const [lastGuess, setLastGuess] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const isInitialized = useRef(false);
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.CONTEXTO.PROGRESS;

  // --- 1. KHÔI PHỤC TIẾN TRÌNH (Mount) ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      try {
        const progress = JSON.parse(savedData);
        setGuesses(progress.guesses || []);
        setSecretAnime(progress.secretAnime || null);
        setWinItem(progress.winItem || null);
        setLastGuess(progress.lastGuess || null);
        setHintsUsed(progress.hintsUsed || 0);
        isInitialized.current = true;
      } catch (e) {
        console.error("❌ Lỗi phục hồi PROGRESS contexto:", e);
        initNewGame();
      }
    } else {
      initNewGame();
    }
  }, [STORAGE_KEY]);

  const initNewGame = async () => {
    try {
      const res = await api.get("/api/games/contexto/new");
      if (res.success) {
        setSecretAnime(res.data);
        isInitialized.current = true;
      }
    } catch (err) {
      // Error ở đây đã được catch từ request() của BaseJsonApi
      console.error("Lỗi khởi tạo game:", err.message);
    }
  };

  // --- 2. LƯU TIẾN TRÌNH TỰ ĐỘNG (Watcher) ---
  useEffect(() => {
    // Chỉ lưu khi đã khởi tạo xong và có anime bí mật
    if (!isInitialized.current || !secretAnime) return;

    const progressToSave = {
      guesses,
      secretAnime,
      winItem,
      lastGuess,
      hintsUsed,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressToSave));
  }, [guesses, secretAnime, winItem, lastGuess, hintsUsed, STORAGE_KEY]);

  // --- 3. RESET GAME ---
  const handleResetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  // --- LOGIC GỢI Ý & ĐOÁN (Giữ nguyên) ---
  const hintLogic = useMemo(() => {
    const guessCount = guesses.length;
    let earned = 0;
    if (guessCount >= 4) {
      earned = 1;
      earned += Math.floor((guessCount - 4) / 2);
    }
    const available = earned - hintsUsed;
    let revealList = [];
    if (secretAnime) {
      if (secretAnime.genres) {
        revealList.push(
          ...secretAnime.genres.map((g) => ({
            type: "Genre",
            value: g.name,
            color: "bg-info bg-opacity-10 text-info border-info",
          }))
        );
      }
      if (secretAnime.studios) {
        revealList.push(
          ...secretAnime.studios.map((s) => ({
            type: "Studio",
            value: s.name,
            color: "bg-warning bg-opacity-10 text-warning border-warning",
          }))
        );
      }
      if (secretAnime.releaseYear?.name) {
        // Fix nhẹ path dữ liệu theo cấu trúc chuẩn của bạn
        revealList.push({
          type: "Year",
          value: secretAnime.releaseYear.name,
          color: "bg-secondary bg-opacity-10 text-secondary border-secondary",
        });
      }
    }
    return {
      available,
      nextUnlock: guessCount < 4 ? 4 - guessCount : 2 - ((guessCount - 4) % 2),
      revealList,
      isMaxed: hintsUsed >= revealList.length,
    };
  }, [guesses.length, hintsUsed, secretAnime]);

  const handleUseHint = () => {
    if (hintLogic.available > 0 && !hintLogic.isMaxed) {
      setHintsUsed((prev) => prev + 1);
    }
  };

  const handleGuess = async (anime) => {
    if (!secretAnime || winItem) return;
    if (guesses.some((g) => g.id === anime.id)) return;

    setLoading(true);
    try {
      const json = await api.post(
        "/api/games/contexto/guess",
        JSON.stringify({ guestId: anime.id, secretId: secretAnime.id }),
        { "Content-Type": "application/json" }
      );
      if (json.success) {
        const rank = json.rank;
        const newGuess = { ...anime, rank: rank };
        setLastGuess(newGuess);
        const updatedGuesses = [newGuess, ...guesses].sort(
          (a, b) => a.rank - b.rank
        );
        setGuesses(updatedGuesses);
        if (rank === 1) setWinItem(anime);
      }
    } catch (error) {
      console.error("Lỗi đoán:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!secretAnime)
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div className="mb-3 spinner-border text-primary"></div>
        <h5 className="text-muted fw-bold">Đang thiết lập dữ liệu bí mật...</h5>
      </div>
    );

  return (
    <div className="pb-5 min-vh-100 bg-light">
      <nav className="mb-4 bg-white shadow-sm navbar navbar-expand-lg navbar-light sticky-top">
        <div className="container">
          <div className="gap-3 d-flex align-items-center">
            <Link
              href="/game"
              className="px-3 btn btn-outline-secondary rounded-pill fw-bold btn-sm"
            >
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            <span className="mb-0 navbar-brand h1 fw-bold text-primary d-none d-sm-block">
              HenTexto
            </span>
          </div>
          <div className="gap-3 d-flex align-items-center">
            <div className="text-muted fw-bold font-monospace small">
              Guesses:{" "}
              <span className="badge bg-dark rounded-pill">
                {guesses.length}
              </span>
            </div>
            <button
              className="btn btn-sm btn-outline-danger rounded-pill fw-bold"
              onClick={handleResetGame}
            >
              Reset
            </button>
          </div>
        </div>
      </nav>

      <div className="container d-flex flex-column align-items-center animate-in fade-in">
        {!winItem && (
          <div className="mb-4 text-center">
            <h2 className="fw-bold text-dark">Truy tìm Anime</h2>
            <p className="text-muted">
              Đoán tên Haiten và xem bạn đang ở "gần" hay "xa" đáp án!
            </p>
          </div>
        )}

        {winItem && (
          <div
            className="mb-5 w-100 animate-in zoom-in"
            style={{ maxWidth: "500px" }}
          >
            <div className="overflow-hidden text-center border-0 shadow-lg card rounded-4">
              <div className="py-3 text-white card-header bg-success">
                <h3 className="mb-0 fw-bold">🎉 CHÍNH XÁC!</h3>
              </div>
              <div className="p-4 bg-white card-body">
                <p className="mb-3 text-muted">Đáp án bí mật chính là:</p>
                <div className="mb-4 d-flex justify-content-center">
                  <div style={{ maxWidth: "240px", width: "100%" }}>
                    <AnimeCard item={winItem} />
                  </div>
                </div>
                <button
                  className="px-5 shadow-sm btn btn-success btn-lg rounded-pill fw-bold"
                  onClick={handleResetGame}
                >
                  Chơi ván mới 🔄
                </button>
              </div>
            </div>
          </div>
        )}

        {!winItem && (
          <div
            className="w-100 d-flex flex-column align-items-center"
            style={{ maxWidth: "600px" }}
          >
            {lastGuess && (
              <div className="mb-3 w-100 animate-in slide-in-from-top">
                <div className="gap-3 p-3 bg-white border border-opacity-25 shadow-sm rounded-4 border-primary d-flex align-items-center">
                  <div style={{ width: "60px", height: "80px", flexShrink: 0 }}>
                    <img
                      src={lastGuess.thumbnail}
                      alt={lastGuess.title}
                      className="shadow-sm w-100 h-100 object-fit-cover rounded-3"
                    />
                  </div>
                  <div className="overflow-hidden flex-grow-1">
                    <div className="mb-1 d-flex justify-content-between align-items-start">
                      <small
                        className="text-muted text-uppercase fw-bold"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Vừa đoán:
                      </small>
                      <span
                        className={`badge rounded-pill ${
                          lastGuess.rank === 1
                            ? "bg-success"
                            : lastGuess.rank <= 10
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        #{lastGuess.rank}
                      </span>
                    </div>
                    <h6 className="mb-0 fw-bold text-dark text-truncate">
                      {lastGuess.title}
                    </h6>
                  </div>
                </div>
              </div>
            )}

            <div className="p-1 mb-3 bg-white border shadow-sm w-100 rounded-4">
              <GameSearch onGuess={handleGuess} disabled={loading} />
            </div>

            <div className="px-2 mb-3 w-100 d-flex justify-content-between align-items-center">
              <div className="text-muted fst-italic small">
                {hintLogic.nextUnlock > 0 && !hintLogic.isMaxed ? (
                  <span>
                    <i className="bi bi-clock-history me-1"></i> Hint mới sau{" "}
                    <strong>{hintLogic.nextUnlock}</strong> lượt
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-check-circle-fill text-success me-1"></i>{" "}
                    Sẵn sàng
                  </span>
                )}
              </div>
              <button
                onClick={handleUseHint}
                disabled={hintLogic.available <= 0 || hintLogic.isMaxed}
                className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 shadow-sm border ${
                  hintLogic.available > 0
                    ? "btn-white text-primary border-primary fw-bold"
                    : "btn-light text-muted border-0"
                }`}
              >
                <span>💡 Gợi ý</span>
                {hintLogic.available > 0 && (
                  <span className="text-white badge bg-danger rounded-circle">
                    {hintLogic.available}
                  </span>
                )}
              </button>
            </div>

            {hintsUsed > 0 && (
              <div className="p-3 mb-4 bg-white border shadow-sm w-100 rounded-4 border-light animate-in fade-in">
                <h6
                  className="mb-3 text-muted text-uppercase fw-bold"
                  style={{ fontSize: "0.75rem" }}
                >
                  <i className="bi bi-unlock-fill me-2"></i>Thông tin đã giải
                  mã:
                </h6>
                <div className="flex-wrap gap-2 d-flex">
                  {hintLogic.revealList.slice(0, hintsUsed).map((hint, idx) => (
                    <span
                      key={idx}
                      className={`badge ${hint.color} border px-3 py-2 text-dark fw-normal`}
                    >
                      <span className="opacity-50 me-1">{hint.type}:</span>
                      <span className="fw-bold">{hint.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="w-100">
              <GuessLog guesses={guesses} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
