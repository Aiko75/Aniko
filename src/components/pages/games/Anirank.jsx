"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api/baseJsonApi";
import AniRankMenu from "@/components/game/anirank/AniRankMenu";
import AniRankQuestion from "@/components/game/anirank/AniRankQuestion";
import AniRankResult from "@/components/game/anirank/AniRankResult";
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Paper,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MAX_ROUNDS = 5;

export default function Anirank() {
  const [gameState, setGameState] = useState("menu");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Mechanics
  const [targetCount, setTargetCount] = useState(10);
  const [lives, setLives] = useState(3);
  const [isRevealed, setIsRevealed] = useState(false);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setSubmittedAnswers([]);
    setHintUsed(false);
    setIsRevealed(false);
    setLives(3);

    // Flexible Target Count between 5 and 20
    const count = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
    setTargetCount(count);

    try {
      const data = await api.get(`/api/games/anirank/question?count=${count}`);
      if (data.success) {
        setCurrentQuestion(data.data);
      }
    } catch (error) {
      console.error("Không thể tải câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const startGame = useCallback(() => {
    setRound(1);
    setScore(0);
    setRoundResults([]);
    setGameState("playing");
    fetchQuestion();
  }, [fetchQuestion]);

  const handleSubmitAnswer = useCallback(
    (answer) => {
      if (!currentQuestion || isRevealed) return;

      const answerPool = Array.isArray(currentQuestion.answers)
        ? currentQuestion.answers
        : [];
      if (!answerPool.length) return;

      const inputLower = answer.toLowerCase().trim();

      const exactMatch = answerPool.find(
        (a) => a.title.toLowerCase() === inputLower,
      );

      const alreadySubmitted = submittedAnswers.find(
        (a) => a.title.toLowerCase() === inputLower,
      );

      if (alreadySubmitted) {
        return;
      }

      if (exactMatch) {
        setScore((prev) => prev + 100);
        setSubmittedAnswers((prev) => [
          ...prev,
          { title: exactMatch.title, correct: true, anime: exactMatch },
        ]);

        // Check if won instantly
        const futureCorrectCount =
          submittedAnswers.filter((a) => a.correct).length + 1;
        if (futureCorrectCount >= targetCount) {
          setIsRevealed(true);
        }
      } else {
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setIsRevealed(true);
          }
          return newLives;
        });

        const partialMatch = answerPool.find((a) => {
          const titleLower = a.title.toLowerCase();
          return (
            titleLower.includes(inputLower) ||
            inputLower.includes(titleLower.substring(0, 5))
          );
        });

        setSubmittedAnswers((prev) => [
          ...prev,
          {
            title: answer,
            correct: false,
            partial: !!partialMatch,
          },
        ]);
      }
    },
    [currentQuestion, submittedAnswers, isRevealed, targetCount],
  );

  const handleHintUsed = useCallback(() => {
    setHintUsed(true);
    setScore((prev) => Math.max(0, prev - 50));
  }, []);

  const handleNextRound = useCallback(() => {
    const correctCount = submittedAnswers.filter((a) => a.correct).length;

    setRoundResults((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        correct: correctCount,
        total: currentQuestion.totalMatches,
      },
    ]);

    if (round >= MAX_ROUNDS) {
      setGameState("result");
    } else {
      setRound((prev) => prev + 1);
      fetchQuestion();
    }
  }, [submittedAnswers, round, currentQuestion, fetchQuestion]);

  const handlePlayAgain = useCallback(() => {
    setGameState("menu");
    setRound(1);
    setScore(0);
    setRoundResults([]);
    setCurrentQuestion(null);
    setSubmittedAnswers([]);
  }, []);

  const correctCount = submittedAnswers.filter((a) => a.correct).length;
  const isComplete = correctCount >= targetCount;
  const roundOver = isRevealed || isComplete;

  const currentAnswers = Array.isArray(currentQuestion?.answers)
    ? currentQuestion.answers
    : [];

  let dynamicHint = currentQuestion?.hint || "";
  if (hintUsed && currentQuestion && !roundOver) {
    const unguessed = currentAnswers
      .slice(0, targetCount)
      .map((anime, index) => ({ anime, idx: index + 1 }))
      .filter(
        (item) =>
          !submittedAnswers.some((a) => a.correct && a.anime?.id === item.anime.id)
      );

    if (unguessed.length > 0) {
      const target = unguessed[0];
      const { anime, idx } = target;

      const info = [];
      if (anime.year) info.push(`năm ${anime.year}`);
      if (anime.studios && anime.studios.length > 0)
        info.push(`studio ${anime.studios[0]}`);
      if (anime.genres && anime.genres.length > 0)
        info.push(`kèm thể loại ${anime.genres[0]}`);

      const titleLen = anime.title.length;
      const firstLetter = anime.title.charAt(0).toUpperCase();

      dynamicHint = `Ví dụ đáp án ở Vị trí số ${idx}: Bắt đầu bằng chữ cái "${firstLetter}" và có độ dài ${titleLen} ký tự. ${
        info.length > 0
          ? "Thông tin thêm là tác phẩm ra mắt " + info.join(", ") + "."
          : ""
      }`;
    }
  }

  if (gameState === "menu") {
    // We keep AniRankMenu until it is refactored
    return <AniRankMenu onStart={startGame} />;
  }

  if (gameState === "result") {
    const totalCorrect = roundResults.reduce((sum, r) => sum + r.correct, 0);
    const totalPossible = roundResults.reduce((sum, r) => sum + r.total, 0);

    return (
      <AniRankResult
        score={score}
        totalCorrect={totalCorrect}
        totalPossible={totalPossible}
        roundResults={roundResults}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  const accentColor = "#4fc3f7";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Button
            component={Link}
            href="/game"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: "20px", textTransform: "none" }}
          >
            Thoát
          </Button>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={`Vòng ${round}/${MAX_ROUNDS}`}
              sx={{ bgcolor: "#f1f5f9", fontWeight: 600, color: "#0f172a" }}
            />
            <Chip
              label={`${score} điểm`}
              sx={{
                background: `linear-gradient(135deg, ${accentColor} 0%, #29b6f6 100%)`,
                color: "white",
                fontWeight: 600,
                border: "none",
              }}
            />
          </Stack>
        </Paper>

        {loading ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CircularProgress size={48} sx={{ color: accentColor, mb: 2 }} />
            <Typography color="text.secondary">Đang tải câu hỏi...</Typography>
          </Paper>
        ) : currentQuestion ? (
          <Box mx="auto" maxWidth="600px">
            {/* Health / Lives Bar */}
            <Box textAlign="center" mb={4} fontSize="2rem">
              {"❤️".repeat(Math.max(0, lives))}
              <span style={{ opacity: 0.3 }}>
                {"❤️".repeat(Math.max(0, 3 - lives))}
              </span>
            </Box>

            {/* Answer Blocks Stack */}
            <Stack spacing={1} mb={4}>
              {currentAnswers.slice(0, targetCount).map((anime, index) => {
                const isFound = submittedAnswers.some(
                  (a) => a.correct && a.anime?.id === anime.id
                );

                let bg = "#ffffff";
                let textColor = "#64748b";
                let borderColor = "#e2e8f0";
                let content = `${index + 1}`;

                if (isFound) {
                  bg = "#1e293b";
                  textColor = "#ffffff";
                  borderColor = "#0f172a";
                  content = anime.title;
                } else if (roundOver) {
                  bg = "#fee2e2";
                  textColor = "#dc2626";
                  borderColor = "#fca5a5";
                  content = anime.title;
                }

                return (
                  <Paper
                    key={index}
                    elevation={isFound ? 2 : 0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      fontWeight: 700,
                      background: bg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      fontSize: "1.05rem",
                      transition: "all 0.3s ease",
                      letterSpacing: isFound || roundOver ? "normal" : "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {content}
                  </Paper>
                );
              })}
            </Stack>

            {/* Question Display */}
            <Box textAlign="center" mt={5} mb={4}>
              <Typography
                variant="h5"
                fontWeight={700}
                color="text.primary"
                px={2}
                gutterBottom
              >
                {currentQuestion.question}
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                {currentQuestion.requirement ||
                  `Yêu cầu: tìm đúng ${targetCount} đáp án.`}
              </Typography>
            </Box>

            {/* Search Box */}
            {!roundOver && (
              <Box mb={4}>
                <AniRankQuestion
                  onSubmitAnswer={handleSubmitAnswer}
                  onHintUsed={handleHintUsed}
                  hintUsed={hintUsed}
                  hint={dynamicHint}
                />
              </Box>
            )}

            {/* Bottom Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
              {!roundOver ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setIsRevealed(true)}
                  sx={{
                    px: 4,
                    py: 1,
                    fontWeight: 700,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Bỏ cuộc
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleNextRound}
                  sx={{
                    px: 5,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${accentColor} 0%, #29b6f6 100%)`,
                    boxShadow: `0 4px 20px rgba(79, 195, 247, 0.4)`,
                  }}
                >
                  {round >= MAX_ROUNDS ? "📊 Xem kết quả" : "Trận tiếp theo →"}
                </Button>
              )}
            </Box>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
