"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { useMode } from "@/context/ModeContext";

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

  // State cho Konami Code
  const [konamiIndex, setKonamiIndex] = useState(0);

  // State cho Triple Tap (Mobile)
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  // --- HÀM XỬ LÝ CHUYỂN ĐỔI CHẾ ĐỘ (CORE LOGIC) ---
  const switchToHanime = () => {
    Cookies.set("app_mode", "hanime", { expires: 365 }); // Lưu Cookie 1 năm
    setMode("hanime"); // Cập nhật State Context
    router.refresh(); // Refresh để Server Component cập nhật theo Cookie mới
    alert("🔓 SECRET UNLOCKED: Welcome to the dark side!");
  };

  const switchToAnime = () => {
    Cookies.set("app_mode", "anime", { expires: 365 }); // Lưu Cookie 1 năm
    setMode("anime"); // Cập nhật State Context
    router.refresh();
    alert("🛡️ PANIC MODE: Đã quay về giao diện an toàn!");
  };

  // --- 1. LOGIC KONAMI CODE & ESCAPE KEY (DESKTOP) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Thoát chế độ Hanime bằng phím Esc
      if (e.key === "Escape" && mode === "hanime") {
        switchToAnime();
        return;
      }

      // Kích hoạt chế độ Hanime bằng Konami Code
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
          // Reset nếu gõ sai (Trừ khi gõ lại từ đầu bằng ArrowUp)
          setKonamiIndex(e.key === "ArrowUp" ? 1 : 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex, mode, setMode]); // Dependency array đầy đủ

  // --- 2. LOGIC TRIPLE TAP (MOBILE/DESKTOP CLICK) ---
  const handleTitleClick = () => {
    clickCountRef.current += 1;

    // Reset bộ đếm sau 1 giây nếu không bấm tiếp
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    // Nếu bấm đủ 3 lần
    if (clickCountRef.current === 3) {
      if (mode === "anime") {
        switchToHanime();
      } else {
        switchToAnime();
      }
      clickCountRef.current = 0; // Reset ngay sau khi kích hoạt
    }
  };

  // --- UI THEME ---
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
    buttonClass: isHanime ? "btn-danger" : "btn-primary",
  };

  return (
    <div
      className="transition-all duration-700 min-vh-100 w-100 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: theme.background,
        color: "white",
      }}
    >
      {/* Header Section */}
      <div className="mb-5 text-center animate-in fade-in">
        {/* LOGIC HINT: Tooltip ẩn và hiệu ứng cursor pointer */}
        <div className="relative group d-inline-block">
          <h1
            onClick={handleTitleClick}
            className="mb-3 cursor-pointer display-3 fw-bold user-select-none"
            style={{
              textShadow: `0 0 20px ${theme.accentGlow}`,
              transition: "transform 0.1s",
            }}
            title={
              isHanime ? "Click 3 lần để thoát" : "Hmm... có gì đó bí ẩn ở đây?"
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span className="text-white">Aniko!</span>
          </h1>

          {/* Hint nâng cao: Dấu chấm nhỏ nhấp nháy */}
          {!isHanime && (
            <span
              className="absolute top-0 w-2 h-2 bg-white rounded-full opacity-50 -right-4 animate-ping"
              style={{ animationDuration: "3s" }}
            ></span>
          )}
        </div>

        <p className="lead text-white-50">
          Cổng thông tin giải trí & Thư viện {isHanime ? "HAnime" : "Anime"} tối
          thượng
        </p>
        <p className="opacity-75 small text-white-50">
          Dữ liệu cập nhật: 09/12/2025
        </p>
      </div>

      {/* Navigation Cards */}
      <main className="container">
        <div className="row justify-content-center g-4">
          {/* Card 1: Library */}
          <div className="col-md-5 col-lg-4">
            <div
              onClick={() => router.push("/list")}
              onMouseEnter={() => setHoveredCard("library")}
              onMouseLeave={() => setHoveredCard(null)}
              className="border-0 shadow-lg cursor-pointer card h-100"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                borderRadius: "24px",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform:
                  hoveredCard === "library" ? "translateY(-12px)" : "none",
                border: `1px solid ${
                  hoveredCard === "library"
                    ? theme.cardHoverBorder
                    : "rgba(255,255,255,0.1)"
                }`,
                boxShadow:
                  hoveredCard === "library"
                    ? `0 10px 30px ${theme.accentGlow}`
                    : "none",
              }}
            >
              <div className="p-5 text-center card-body d-flex flex-column align-items-center">
                <div
                  className="mb-4 d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: theme.accent,
                    boxShadow: `0 0 20px ${theme.accentGlow}`,
                    opacity: 0.9,
                  }}
                >
                  <span style={{ fontSize: "40px" }}>📚</span>
                </div>
                <h3 className="mb-2 text-white card-title fw-bold">
                  {isHanime ? "Thư viện HAnime" : "Thư viện Anime"}
                </h3>
                <p className="mb-4 card-text text-white-50">
                  Tra cứu, lọc và tìm kiếm hàng ngàn bộ{" "}
                  {isHanime ? "haiten" : "anime"} với dữ liệu chi tiết từ
                  Database.
                </p>
                <button
                  className={`px-4 mt-auto btn ${theme.buttonClass} rounded-pill fw-bold w-100 shadow-sm`}
                >
                  Truy cập ngay &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Mini Games */}
          <div className="col-md-5 col-lg-4">
            <div
              onClick={() => router.push("/game")}
              onMouseEnter={() => setHoveredCard("game")}
              onMouseLeave={() => setHoveredCard(null)}
              className="border-0 shadow-lg cursor-pointer card h-100"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                borderRadius: "24px",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform:
                  hoveredCard === "game" ? "translateY(-12px)" : "none",
                border: `1px solid ${
                  hoveredCard === "game"
                    ? "rgba(25, 135, 84, 0.8)"
                    : "rgba(255,255,255,0.1)"
                }`,
                boxShadow:
                  hoveredCard === "game"
                    ? "0 10px 30px rgba(25, 135, 84, 0.4)"
                    : "none",
              }}
            >
              <div className="p-5 text-center card-body d-flex flex-column align-items-center">
                <div
                  className="mb-4 d-flex justify-content-center align-items-center bg-success rounded-circle"
                  style={{
                    width: "80px",
                    height: "80px",
                    boxShadow: "0 0 20px rgba(25, 135, 84, 0.5)",
                  }}
                >
                  <span style={{ fontSize: "40px", marginBottom: "10px" }}>
                    🎮
                  </span>
                </div>
                <h3 className="mb-2 text-white card-title fw-bold">
                  Mini Games
                </h3>
                <p className="mb-4 card-text text-white-50">
                  Thử thách kiến thức của bạn với Wordle, Bingo và các trò chơi
                  giải trí khác.
                </p>
                <button className="px-4 mt-auto shadow-sm btn btn-success rounded-pill fw-bold w-100">
                  Chơi ngay &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-5 opacity-50 text-white-50 small">
        © 2026 Aniko Project. IT Engineer Edition.
      </footer>
    </div>
  );
}
