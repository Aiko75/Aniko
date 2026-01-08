"use client";

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
    <div
      className="flex flex-col items-center sticky-md-top"
      style={{ top: "80px" }}
    >
      {gameStatus === "playing" ? (
        // --- TRẠNG THÁI ĐANG CHƠI ---
        <div className="w-full max-w-md p-6 text-center transition-all bg-white border shadow-lg rounded-2xl">
          {currentCard ? (
            <>
              <img
                src={currentCard.thumbnail}
                className="object-cover w-48 h-64 mx-auto mb-4 border shadow-md rounded-xl"
                alt="cover"
              />
              <h3 className="mb-4 text-lg font-bold leading-tight wrap-break-words text-slate-800">
                {currentCard.title}
              </h3>
            </>
          ) : (
            <div className="flex items-center justify-center w-48 h-64 mx-auto mb-4 bg-gray-100 rounded-xl">
              Loading...
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onNext}
              className="py-2 border btn btn-light rounded-pill fw-bold text-muted"
            >
              Bỏ qua (Skip)
            </button>
            <button
              onClick={onHint}
              disabled={hintsLeft <= 0}
              className={`btn rounded-pill fw-bold py-2 ${
                hintsLeft > 0 ? "btn-warning shadow" : "btn-light text-muted"
              }`}
            >
              💡 Gợi ý ({hintsLeft})
            </button>
          </div>
        </div>
      ) : (
        // --- TRẠNG THÁI KẾT THÚC (THẮNG/THUA) ---
        <div className="w-full max-w-md p-8 text-center bg-white border shadow-lg rounded-2xl animate-in zoom-in">
          <div
            className={`display-1 mb-4 ${
              gameStatus === "won" ? "text-success" : "text-danger"
            }`}
          >
            {gameStatus === "won" ? "🏆" : "💀"}
          </div>
          <h2
            className={`font-bold text-3xl mb-2 ${
              gameStatus === "won" ? "text-success" : "text-danger"
            }`}
          >
            {gameStatus === "won" ? "BINGO MASTER!" : "GAME OVER"}
          </h2>
          <p className="mb-6 text-muted">
            Bạn đã đạt {bingoCount}/{targetGoal} đường Bingo.
          </p>
          <button
            onClick={onRestart}
            className="px-5 shadow-lg btn btn-primary btn-lg rounded-pill"
          >
            Chơi lại
          </button>
        </div>
      )}
    </div>
  );
}
