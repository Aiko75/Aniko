"use client";

import { Box, Paper, Typography, Button, Stack } from "@mui/material";

export default function BingoDeck({
  currentCard,
  gameStatus,
  bingoCount,
  targetGoal,
  hintsLeft,
  onNext,
  onHint,
  onRestart,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: { md: "sticky" },
        top: 80,
      }}
    >
      {gameStatus === "playing" ? (
        // --- TRẠNG THÁI ĐANG CHƠI ---
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 400,
            p: 4,
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          {currentCard ? (
            <Box mb={3}>
              <Box
                component="img"
                src={currentCard.thumbnail}
                alt="cover"
                sx={{
                  width: 192,
                  height: 256,
                  objectFit: "cover",
                  mx: "auto",
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              />
              <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ wordWrap: "break-word", lineHeight: 1.2 }}>
                {currentCard.title}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                width: 192,
                height: 256,
                mx: "auto",
                mb: 4,
                bgcolor: "grey.100",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          )}

          <Stack direction="row" spacing={2} justifyContent="center" width="100%">
            <Button
              variant="outlined"
              color="inherit"
              onClick={onNext}
              fullWidth
              sx={{ py: 1.5, fontWeight: "bold", borderRadius: "30px", textTransform: "none", color: "text.secondary" }}
            >
              Bỏ qua (Skip)
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={onHint}
              disabled={hintsLeft <= 0}
              fullWidth
              sx={{ py: 1.5, fontWeight: "bold", borderRadius: "30px", textTransform: "none" }}
            >
              💡 Gợi ý ({hintsLeft})
            </Button>
          </Stack>
        </Paper>
      ) : (
        // --- TRẠNG THÁI KẾT THÚC (THẮNG/THUA) ---
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 400,
            p: 5,
            textAlign: "center",
            borderRadius: 4,
            animation: "zoom-in 0.3s ease",
          }}
        >
          <Typography fontSize="5rem" mb={2}>
            {gameStatus === "won" ? "🏆" : "💀"}
          </Typography>
          <Typography
            variant="h4"
            fontWeight="bold"
            color={gameStatus === "won" ? "success.main" : "error.main"}
            mb={1}
          >
            {gameStatus === "won" ? "BINGO MASTER!" : "GAME OVER"}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Bạn đã đạt {bingoCount}/{targetGoal} đường Bingo.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onRestart}
            size="large"
            sx={{ px: 5, py: 1.5, borderRadius: "30px", fontWeight: "bold" }}
          >
            Chơi lại
          </Button>
        </Paper>
      )}
    </Box>
  );
}
