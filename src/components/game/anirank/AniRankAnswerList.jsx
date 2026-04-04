"use client";

export default function AniRankAnswerList({ answers, submittedAnswers }) {
  const correctCount = submittedAnswers.filter((a) => a.correct).length;
  const isComplete = correctCount >= 10;

  const scoreBadgeClass = isComplete
    ? "bg-gradient-to-br from-green-500 to-green-400 text-white"
    : "bg-sky-100 text-sky-700";

  const progressClass = isComplete
    ? "bg-gradient-to-r from-green-500 to-green-300"
    : "bg-gradient-to-r from-sky-400 to-sky-200";

  const getAnswerItemClasses = (answer) => {
    let base =
      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ease-in-out";
    if (answer.correct) {
      return `${base} bg-green-500/20 border border-green-500/30`;
    }
    if (answer.partial) {
      return `${base} bg-amber-400/15 border border-amber-400/25`;
    }
    return `${base} bg-red-500/15 border border-red-500/25`;
  };

  const getAnswerIconClasses = (answer) => {
    let base =
      "flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-sm";
    if (answer.correct) {
      return `${base} bg-green-500/30`;
    }
    if (answer.partial) {
      return `${base} bg-amber-400/30`;
    }
    return `${base} bg-red-500/30`;
  };

  return (
    <div className="text-slate-900 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h5 className="mb-0 font-semibold">
            <span className="mr-2">📝</span>Đáp án của bạn
          </h5>
          <span className={`px-3 py-2 rounded-full text-sm ${scoreBadgeClass}`}>
            {correctCount}/10 đúng
          </span>
        </div>

        <div className="mb-4 h-3 rounded-full overflow-hidden bg-slate-200">
          <div
            className={`h-full rounded-full transition-[width,background] duration-400 ease-in-out ${progressClass}`}
            role="progressbar"
            style={{
              width: `${Math.min((correctCount / 10) * 100, 100)}%`,
            }}
          />
        </div>

        {submittedAnswers.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-sm">
            <div className="mb-2 text-3xl opacity-50">✏️</div>
            Bắt đầu nhập để gửi đáp án!
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-500/40 scrollbar-track-slate-200">
            <div className="flex flex-col gap-2">
              {submittedAnswers.map((answer, index) => (
                <div key={index} className={getAnswerItemClasses(answer)}>
                  <div className={getAnswerIconClasses(answer)}>
                    {answer.correct ? "✓" : answer.partial ? "~" : "✗"}
                  </div>
                  <span className="grow truncate text-sm">{answer.title}</span>
                  {answer.correct && answer.anime && (
                    <small className="text-slate-500 shrink-0">
                      {answer.anime.year}
                    </small>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
