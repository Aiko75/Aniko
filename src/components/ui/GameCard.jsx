"use client";

import { useState } from "react";
import { Card, CardContent, Typography, Box, Button, Chip } from "@mui/material";

export default function GameCard({
  gameCommon,
  gameData,
  currentMode,
  onNavigate,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
        onClick={() => onNavigate(gameCommon, gameData)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        elevation={isHovered ? 8 : 2}
        sx={{
          height: "100%",
          bgcolor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: 4,
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          transform: isHovered && gameCommon.status === "active" ? "translateY(-10px)" : "none",
          border: isHovered ? `1px solid ${gameCommon.color}.main` : "1px solid rgba(255,255,255,0.1)",
          cursor: gameCommon.status === "active" ? "pointer" : "default",
          opacity: gameCommon.status === "coming_soon" ? 0.6 : 1,
          color: "white",
        }}
      >
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", "&:last-child": { pb: 3 } }}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                bgcolor: `${gameCommon.color}.light`,
                color: `${gameCommon.color}.dark`,
                width: 60,
                height: 60,
                fontSize: 30,
              }}
            >
              {gameData.icon}
            </Box>
            <Chip
              label="Playable"
              color={currentMode === "hanime" ? "error" : "success"}
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </Box>

          <Typography variant="h5" fontWeight="bold" mb={1}>
            {gameData.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", flexGrow: 1 }}>
            {gameData.description}
          </Typography>

          <Box mt={3}>
            <Button
              variant="contained"
              color={gameCommon.color}
              fullWidth
              sx={{ borderRadius: "20px", fontWeight: "bold" }}
            >
              {currentMode === "hanime" ? "Start Game" : "Chơi Ngay"}
            </Button>
          </Box>
        </CardContent>
      </Card>
  );
}
