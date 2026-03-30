"use client";

export default function AniRankMenu({ onStart }) {
  const bgTheme = "linear-gradient(135deg, #0f1923 0%, #1a2744 100%)";
  const accentColor = "#4fc3f7";

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: bgTheme }}
    >
      <div className="text-center text-white p-5">
        <h1 className="display-3 fw-bold mb-4">
          <span style={{ color: accentColor }}>Ani</span>Rank
        </h1>
        <p className="lead mb-4 text-white-50">
          Test your anime knowledge! Answer questions about top anime, studios, genres, and more.
        </p>
        
        <div className="mb-5 text-start d-inline-block">
          <h5 className="text-white-50 mb-3 text-center">How to Play:</h5>
          <ul className="list-unstyled">
            <li className="mb-2">
              <span className="badge bg-primary me-2">1</span>
              Read the question carefully
            </li>
            <li className="mb-2">
              <span className="badge bg-primary me-2">2</span>
              Type anime titles that match the question
            </li>
            <li className="mb-2">
              <span className="badge bg-primary me-2">3</span>
              Find 10 correct answers per round
            </li>
            <li className="mb-2">
              <span className="badge bg-warning me-2">?</span>
              Use hints if you&apos;re stuck (costs 50 points)
            </li>
          </ul>
        </div>

        <button
          className="btn btn-lg px-5 py-3 fw-bold"
          style={{ backgroundColor: accentColor, color: "white" }}
          onClick={onStart}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
