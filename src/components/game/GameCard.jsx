"use client";

import { useState } from "react";

export default function GameCard({
  gameCommon,
  gameData,
  currentMode,
  onNavigate,
}) {
  // State hover chuyển vào trong component để tự quản lý
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="col">
      <div
        onClick={() => onNavigate(gameCommon, gameData)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`card h-100 border-0 shadow-lg text-white ${
          gameCommon.status === "active" ? "cursor-pointer" : ""
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: "15px",
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          // Logic transform và border dựa trên state isHovered nội bộ
          transform:
            isHovered && gameCommon.status === "active"
              ? "translateY(-10px)"
              : "none",
          border: isHovered
            ? `1px solid var(--bs-${gameCommon.color})`
            : "1px solid rgba(255,255,255,0.1)",
          cursor: gameCommon.status === "active" ? "pointer" : "default",
          opacity: gameCommon.status === "coming_soon" ? 0.6 : 1,
        }}
      >
        <div className="p-4 card-body d-flex flex-column">
          <div className="mb-3 d-flex justify-content-between align-items-start">
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle bg-${gameCommon.color} bg-opacity-25`}
              style={{
                width: "60px",
                height: "60px",
                fontSize: "30px",
              }}
            >
              {/* Render Icon trực tiếp từ JSON */}
              {gameData.icon}
            </div>
            <span
              className={`badge rounded-pill ${
                currentMode === "hanime" ? "bg-danger" : "bg-success"
              }`}
            >
              Playable
            </span>
          </div>

          <h4 className="mb-2 card-title fw-bold">{gameData.name}</h4>
          <p className="card-text text-white-50 small flex-grow-1">
            {gameData.description}
          </p>

          <div className="mt-auto">
            <button
              className={`btn btn-${gameCommon.color} w-100 fw-bold rounded-pill`}
            >
              {currentMode === "hanime" ? "Start Game" : "Chơi Ngay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
