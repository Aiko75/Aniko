"use client";

import { Box, Typography, ButtonBase } from "@mui/material";

export default function BingoGrid({
  grid,
  selectedCells,
  activeHintIds,
  gameStatus,
  bingoCount,
  targetGoal,
  onCellClick,
}) {
  return (
    <Box sx={{ width: "100%", maxWidth: 500, mx: "auto" }}>
      <Box display="flex" alignItems="flex-end" justifyContent="space-between" mb={2} px={1}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Bảng Bingo 4x4
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          Đã đạt: {bingoCount} / {targetGoal} lines
        </Typography>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
        gap={1}
        sx={{
          width: "100%",
          aspectRatio: "1 / 1",
          margin: "0 auto",
        }}
      >
        {grid.map((cell) => {
          const isSelected = selectedCells.includes(cell.id);
          const isHinted = activeHintIds.includes(cell.id);

          return (
            <ButtonBase
              key={cell.id}
              onClick={() => onCellClick(cell)}
              disabled={isSelected || gameStatus !== "playing"}
              sx={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                p: 1,
                borderRadius: 2,
                border: "2px solid",
                borderColor: isSelected ? "success.main" : isHinted ? "warning.main" : "divider",
                bgcolor: isSelected ? "success.main" : "background.paper",
                color: isSelected ? "white" : "text.primary",
                boxShadow: isSelected ? "none" : 1,
                transform: isSelected ? "scale(0.95)" : "none",
                transition: "all 0.2s ease-in-out",
                width: "100%",
                height: "100%",
                "&:hover": {
                  bgcolor: isSelected ? "success.main" : "primary.50",
                },
                ...(isHinted && !isSelected && {
                  bgcolor: "warning.50",
                  animation: "pulse 1.5s infinite",
                }),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.6,
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                  mb: 0.5,
                  fontWeight: "bold"
                }}
              >
                {cell.type.replace("_", " ")}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  lineHeight: 1.2,
                }}
              >
                {cell.label}
              </Typography>
              {isHinted && !isSelected && (
                <Box
                  sx={{
                    fontSize: "0.5rem",
                    mt: 1,
                    bgcolor: "warning.main",
                    color: "warning.contrastText",
                    px: 0.5,
                    borderRadius: 0.5,
                    fontWeight: "bold",
                  }}
                >
                  HINT
                </Box>
              )}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
