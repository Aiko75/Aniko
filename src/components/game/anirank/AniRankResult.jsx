"use client";

import Link from "next/link";

export default function AniRankResult({ score, totalCorrect, totalPossible, roundResults, onPlayAgain }) {
  const bgTheme = "linear-gradient(135deg, #0f1923 0%, #1a2744 100%)";
  const accentColor = "#4fc3f7";

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ background: bgTheme }}
    >
      <div className="text-center text-white p-4">
        <h1 className="display-4 fw-bold mb-4">Game Over!</h1>
        
        <div className="display-2 fw-bold mb-4" style={{ color: accentColor }}>
          {score} pts
        </div>
        
        <p className="lead mb-4">
          Total: <strong>{totalCorrect}</strong> / {totalPossible} correct answers
        </p>

        <div className="card mx-auto mb-4 border-0" style={{ maxWidth: "400px", backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div className="card-body">
            <h5 className="mb-3">Round Results</h5>
            {roundResults.map((result, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-50">Round {index + 1}:</span>
                <span className="badge bg-success">
                  {result.correct} / {result.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button
            className="btn btn-lg px-4"
            style={{ backgroundColor: accentColor, color: "white" }}
            onClick={onPlayAgain}
          >
            Play Again
          </button>
          <Link href="/game" className="btn btn-lg btn-outline-light px-4">
            Back to Games
          </Link>
        </div>
      </div>
    </div>
  );
}
