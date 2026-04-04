"use client";

import Link from "next/link";
import { Box, Container, Typography, Button, Paper, Stack, Grid } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import HomeIcon from "@mui/icons-material/Home";

export default function AniRankResult({
  score,
  totalCorrect,
  totalPossible,
  roundResults,
  onPlayAgain,
}) {
  const accuracy =
    totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0;

  const getRankEmoji = () => {
    if (accuracy >= 90)
      return {
        emoji: "🏆",
        label: "Xuất sắc!",
        colorClass: "warning.main",
      };
    if (accuracy >= 70)
      return {
        emoji: "🌟",
        label: "Tuyệt vời!",
        colorClass: "info.main",
      };
    if (accuracy >= 50)
      return {
        emoji: "👍",
        label: "Khá tốt!",
        colorClass: "success.main",
      };
    return {
      emoji: "💪",
      label: "Cố gắng thêm!",
      colorClass: "error.main",
    };
  };

  const getRoundBadgeColor = (correct) => {
    if (correct >= 8) return "success.light";
    if (correct >= 5) return "warning.light";
    return "error.light";
  };

  const rank = getRankEmoji();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Typography fontSize="5rem" lineHeight={1} mb={2}>
          {rank.emoji}
        </Typography>

        <Typography variant="h3" fontWeight={800} mb={1}>
          {rank.label}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Kết thúc trò chơi!
        </Typography>

        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              background: "linear-gradient(to right, #38bdf8, #7dd3fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {score}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            điểm
          </Typography>
        </Paper>

        <Grid container spacing={2} mb={4}>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {totalCorrect}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đúng
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h4" fontWeight={700} color="text.secondary">
                {totalPossible}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tổng
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h4" fontWeight={700} color={rank.colorClass}>
                {accuracy}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Chính xác
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: "1px solid", borderColor: "divider", textAlign: "left" }}>
          <Typography variant="h6" fontWeight={700} mb={2} textAlign="center">
            <span style={{ marginRight: 8 }}>📊</span> Kết quả từng vòng
          </Typography>
          <Stack spacing={1.5}>
            {roundResults.map((result, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body1" fontWeight={500} color="text.secondary">
                  Vòng {index + 1}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "16px",
                      bgcolor: getRoundBadgeColor(result.correct),
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {result.correct} / {result.total}
                  </Box>
                  <Typography>
                    {result.correct >= 8 ? "🟢" : result.correct >= 5 ? "🟡" : "🔴"}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={onPlayAgain}
            startIcon={<ReplayIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 700,
              background: "linear-gradient(to bottom right, #38bdf8, #0ea5e9)",
              boxShadow: "0 4px 20px rgba(56, 189, 248, 0.4)",
              "&:hover": { transform: "translateY(-2px)" },
              transition: "all 0.3s ease",
            }}
          >
            Chơi lại
          </Button>
          <Button
            component={Link}
            href="/game"
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 700,
              borderColor: "divider",
              color: "text.primary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Về danh sách
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
