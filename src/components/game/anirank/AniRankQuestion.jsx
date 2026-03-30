"use client";

import { useState } from "react";

export default function AniRankQuestion({ question, type, targetCount, onSubmitAnswer }) {
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmitAnswer(input.trim());
    setInput("");
  };

  const handleHint = () => {
    setShowHint(true);
    setHintUsed(true);
  };

  return (
    <div className="card border-0 mb-4" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h4 className="mb-0" style={{ color: "#4fc3f7" }}>
            {question}
          </h4>
          <span className={`badge ${type === "ranking" ? "bg-warning" : "bg-info"}`}>
            {type === "ranking" ? "🏆 Ranking" : "🔍 Find"}
          </span>
        </div>
        
        <form onSubmit={handleSubmit} className="input-group input-group-lg mb-3">
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Type anime title..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!input.trim()}
          >
            Submit
          </button>
          {!hintUsed && (
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleHint}
            >
              Hint (-50)
            </button>
          )}
        </form>

        {showHint && (
          <div className="alert alert-warning mb-0">
            <small>
              <strong>Hint:</strong> Think about anime from your knowledge of this category!
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
