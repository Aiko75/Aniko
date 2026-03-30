"use client";

export default function AniRankAnswerList({ answers, submittedAnswers }) {
  const correctCount = submittedAnswers.filter(a => a.correct).length;
  const isComplete = correctCount >= 10;

  return (
    <div className="card border-0" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Your Answers ({correctCount}/10)</h5>
          {isComplete && (
            <span className="badge bg-success">Complete!</span>
          )}
        </div>

        <div className="progress mb-3" style={{ height: "20px" }}>
          <div 
            className="progress-bar bg-success" 
            role="progressbar"
            style={{ width: `${Math.min(correctCount / 10 * 100, 100)}%` }}
          >
            {correctCount} / 10
          </div>
        </div>

        {submittedAnswers.length === 0 ? (
          <p className="text-white-50 mb-0">Start typing to submit answers!</p>
        ) : (
          <div className="list-group list-group-flush" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {submittedAnswers.map((answer, index) => (
              <div
                key={index}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  answer.correct 
                    ? "list-group-item-success bg-success bg-opacity-25" 
                    : answer.partial 
                    ? "list-group-item-warning bg-warning bg-opacity-25"
                    : "list-group-item-danger bg-danger bg-opacity-25"
                }`}
                style={{ color: "white" }}
              >
                <span>
                  {answer.correct && <span className="me-2">✓</span>}
                  {!answer.correct && <span className="me-2">✗</span>}
                  {answer.title}
                </span>
                {answer.correct && answer.anime && (
                  <small className="text-white-50">{answer.anime.year}</small>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
