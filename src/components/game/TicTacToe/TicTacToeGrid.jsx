"use client";

import React from "react";

export default function TicTacToeGrid({
  board,
  gridState,
  selectedCell,
  onSelectCell,
}) {
  // --- STYLES (Được cô lập trong component này) ---
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(4px, 1.5vw, 12px)",
      padding: "clamp(10px, 3vw, 25px)",
      backgroundColor: "white",
      borderRadius: "24px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
      width: "100%",
      maxWidth: "fit-content",
    },
    row: { display: "flex", gap: "clamp(4px, 1.5vw, 12px)" },
    cellBase: {
      width: "clamp(75px, 20vw, 150px)",
      height: "clamp(75px, 20vw, 150px)",
      borderRadius: "clamp(8px, 2vw, 16px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      fontSize: "clamp(0.6rem, 1.5vw, 0.9rem)",
    },
    headerCell: (isRow) => ({
      backgroundColor: isRow ? "#f0fdf4" : "#f0f9ff", // Xanh lá nhạt (Row) vs Xanh dương nhạt (Col)
      border: "1px solid rgba(0,0,0,0.05)",
      textAlign: "center",
      padding: "5px",
    }),
    playableCell: (isSelected, hasData) => ({
      backgroundColor: "#ffffff",
      cursor: hasData ? "default" : "pointer",
      border: isSelected
        ? "3px solid #fd7e14" // Cam đậm khi chọn
        : hasData
        ? "none"
        : "1.5px dashed #cbd5e1", // Nét đứt khi trống
      transform: isSelected ? "scale(1.05)" : "scale(1)",
      boxShadow: isSelected ? "0 10px 20px rgba(253, 126, 20, 0.2)" : "none",
      zIndex: isSelected ? 10 : 1,
    }),
  };

  return (
    <div style={styles.container}>
      {/* Hàng Tiêu đề Cột (Column Headers) */}
      <div style={styles.row}>
        {/* Ô góc trên cùng bên trái (Trống) */}
        <div style={styles.cellBase}></div>
        {board?.cols?.map((col, i) => (
          <div
            key={i}
            style={{ ...styles.cellBase, ...styles.headerCell(false) }}
          >
            <b
              className="text-primary text-uppercase"
              style={{ fontSize: "0.55rem", opacity: 0.6 }}
            >
              {col.type}
            </b>
            <div className="px-1 mt-1 fw-bold line-clamp-2">{col.value}</div>
          </div>
        ))}
      </div>

      {/* Các hàng dữ liệu (Rows) */}
      {board?.rows?.map((row, r) => (
        <div key={r} style={styles.row}>
          {/* Tiêu đề Hàng (Row Header) */}
          <div style={{ ...styles.cellBase, ...styles.headerCell(true) }}>
            <b
              className="text-success text-uppercase"
              style={{ fontSize: "0.55rem", opacity: 0.6 }}
            >
              {row.type}
            </b>
            <div className="px-1 mt-1 fw-bold line-clamp-2">{row.value}</div>
          </div>

          {/* Các ô chơi (Playable Cells) */}
          {gridState[r].map((cellData, c) => {
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;

            return (
              <div
                key={c}
                onClick={() => !cellData && onSelectCell(r, c)}
                style={{
                  ...styles.cellBase,
                  ...styles.playableCell(isSelected, !!cellData),
                }}
              >
                {cellData ? (
                  // Trạng thái: Đã điền
                  <img
                    src={cellData.thumbnail}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt="poster"
                  />
                ) : isSelected ? (
                  // Trạng thái: Đang chọn (Loading spinner chờ input)
                  <div
                    className="spinner-border text-warning border-3"
                    style={{ width: "30%", height: "30%" }}
                  />
                ) : (
                  // Trạng thái: Trống
                  <span className="opacity-25" style={{ fontSize: "2rem" }}>
                    +
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
