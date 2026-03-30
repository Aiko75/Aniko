"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api/baseJsonApi";
import AniRankMenu from "@/components/game/anirank/AniRankMenu";
import AniRankQuestion from "@/components/game/anirank/AniRankQuestion";
import AniRankAnswerList from "@/components/game/anirank/AniRankAnswerList";
import AniRankResult from "@/components/game/anirank/AniRankResult";

const MAX_ROUNDS = 5;
const MAX_ANSWERS = 10;

export default function Anirank() {
  const [gameState, setGameState] = useState("menu");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setSubmittedAnswers([]);
    setHintUsed(false);
    try {
      const data = await api.get("/api/games/anirank/question?count=10");
      if (data.success) {
        setCurrentQuestion(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch question:", error);
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

  const handleSubmitAnswer = useCallback((answer) => {
    if (!currentQuestion) return;

    const inputLower = answer.toLowerCase().trim();
    
    const exactMatch = currentQuestion.answers.find(
      a => a.title.toLowerCase() === inputLower
    );

    const alreadySubmitted = submittedAnswers.find(
      a => a.title.toLowerCase() === inputLower
    );

    if (alreadySubmitted) {
      return;
    }

    if (exactMatch) {
      setScore(prev => prev + 100);
      setSubmittedAnswers(prev => [
        ...prev,
        { title: exactMatch.title, correct: true, anime: exactMatch }
      ]);
    } else {
      const partialMatch = currentQuestion.answers.find(a => {
        const titleLower = a.title.toLowerCase();
        return titleLower.includes(inputLower) || 
               inputLower.includes(titleLower.substring(0, 5));
      });

      setSubmittedAnswers(prev => [
        ...prev,
        { 
          title: answer, 
          correct: false, 
          partial: !!partialMatch 
        }
      ]);
    }
  }, [currentQuestion, submittedAnswers]);

  const handleHintUsed = useCallback(() => {
    setHintUsed(true);
    setScore(prev => Math.max(0, prev - 50));
  }, []);

  const handleNextRound = useCallback(() => {
    const correctCount = submittedAnswers.filter(a => a.correct).length;
    
    setRoundResults(prev => [
      ...prev,
      {
        question: currentQuestion.question,
        correct: correctCount,
        total: currentQuestion.totalMatches
      }
    ]);

    if (round >= MAX_ROUNDS) {
      setGameState("result");
    } else {
      setRound(prev => prev + 1);
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

  const correctCount = submittedAnswers.filter(a => a.correct).length;
  const canProceed = submittedAnswers.length >= 3 || correctCount >= MAX_ANSWERS;
  const isComplete = correctCount >= MAX_ANSWERS;

  if (gameState === "menu") {
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

  const bgTheme = "linear-gradient(135deg, #0f1923 0%, #1a2744 100%)";
  const accentColor = "#4fc3f7";

  return (
    <div className="min-vh-100" style={{ background: bgTheme }}>
      <div className="container py-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link 
            href="/game" 
            className="btn btn-sm btn-outline-light rounded-pill"
          >
            ← Exit
          </Link>
          <div className="d-flex gap-2 align-items-center">
            <span className="badge bg-secondary px-3 py-2">
              Round {round}/{MAX_ROUNDS}
            </span>
            <span 
              className="badge px-3 py-2"
              style={{ backgroundColor: accentColor }}
            >
              Score: {score}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading question...</p>
          </div>
        ) : currentQuestion ? (
          <>
            <AniRankQuestion
              question={currentQuestion.question}
              type={currentQuestion.type}
              targetCount={currentQuestion.targetCount}
              onSubmitAnswer={handleSubmitAnswer}
              onHintUsed={handleHintUsed}
              hintUsed={hintUsed}
            />

            <div className="row">
              <div className="col-md-6">
                <AniRankAnswerList
                  answers={currentQuestion.answers}
                  submittedAnswers={submittedAnswers}
                />
              </div>

              <div className="col-md-6">
                <div className="card border-0" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <div className="card-body">
                    <h5 className="mb-3">Preview</h5>
                    {submittedAnswers.length === 0 ? (
                      <p className="text-white-50 mb-0">Submit answers to see progress</p>
                    ) : (
                      <div className="row g-2">
                        {currentQuestion.answers.slice(0, 10).map((anime, index) => {
                          const isFound = submittedAnswers.some(
                            a => a.correct && a.anime?.id === anime.id
                          );
                          return (
                            <div key={index} className="col-6">
                              <div 
                                className={`p-2 rounded text-center ${
                                  isFound 
                                    ? "bg-success bg-opacity-50" 
                                    : "bg-dark bg-opacity-50"
                                }`}
                                style={{ fontSize: "0.85rem" }}
                              >
                                {isFound ? "✓" : "?"} {anime.title.substring(0, 20)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {isComplete && (
                  <div className="alert alert-success mt-3">
                    <strong>Round Complete!</strong> You found {correctCount} anime!
                  </div>
                )}
              </div>
            </div>

            {canProceed && (
              <button
                className="btn btn-lg w-100 mt-4 fw-bold"
                style={{ backgroundColor: accentColor, color: "white" }}
                onClick={handleNextRound}
              >
                {round >= MAX_ROUNDS ? "See Results" : `Next Round (${correctCount}/10)`}
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
