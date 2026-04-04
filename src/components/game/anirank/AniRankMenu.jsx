"use client";

import Link from "next/link";
import { Box, Container, Typography, Button, Paper, Stack, Avatar } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AniRankMenu({ onStart }) {
  const instructionSteps = [
    { num: "1", icon: "📖", text: "Đọc kỹ câu hỏi và điều kiện" },
    { num: "2", icon: "⌨️", text: "Nhập tên anime đúng với yêu cầu" },
    { num: "3", icon: "🎯", text: "Mỗi vòng cần tìm đủ các đáp án đúng" },
    {
      num: "?",
      icon: "💡",
      text: "Dùng gợi ý khi bí (trừ 50 điểm)",
      warning: true,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Box mb={4} textAlign="left">
          <Button
            component={Link}
            href="/game"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: "20px" }}
          >
            Quay lại
          </Button>
        </Box>

        <Box mb={4}>
          <Typography
            variant="h2"
            fontWeight={800}
            gutterBottom
            sx={{
              background: "linear-gradient(to right, #0ea5e9, #38bdf8, #0284c7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AniRank
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 420, mx: "auto" }}>
            Thử thách kiến thức anime của bạn với các câu hỏi xếp hạng theo
            views, thể loại, studio và năm phát hành.
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 5,
            borderRadius: 4,
            bgcolor: "background.paper",
            textAlign: "left",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            mb={3}
            pb={2}
            borderBottom={1}
            borderColor="divider"
          >
            <span style={{ color: "#38bdf8", marginRight: 8 }}>🎮</span> Cách chơi
          </Typography>
          <Stack spacing={2}>
            {instructionSteps.map((step, index) => (
              <Box key={index} display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: step.warning ? "warning.light" : "info.light",
                    color: "text.primary",
                    width: 40,
                    height: 40,
                  }}
                >
                  {step.icon}
                </Avatar>
                <Typography
                  variant="body1"
                  color={step.warning ? "warning.dark" : "text.secondary"}
                  fontWeight={500}
                >
                  {step.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{
            px: 6,
            py: 2,
            fontSize: "1.2rem",
            fontWeight: 700,
            background: "linear-gradient(to bottom right, #38bdf8, #0ea5e9)",
            boxShadow: "0 4px 20px rgba(56, 189, 248, 0.4)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 25px rgba(56, 189, 248, 0.5)",
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          🚀 Bắt đầu chơi
        </Button>
      </Container>
    </Box>
  );
}
