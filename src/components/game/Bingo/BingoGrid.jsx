"use client";

export default function BingoGrid({
  grid,
  selectedCells,
  activeHintIds,
  gameStatus,
  bingoCount,
  targetGoal,
  onCellClick,
}) {
  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <h5 className="mb-0 font-bold text-slate-700">Bảng Bingo 4x4</h5>
        <div className="text-sm font-bold text-blue-600">
          Đã đạt: {bingoCount} / {targetGoal} lines
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 aspect-square">
        {grid.map((cell) => {
          const isSelected = selectedCells.includes(cell.id);
          const isHinted = activeHintIds.includes(cell.id);

          return (
            <button
              key={cell.id}
              onClick={() => onCellClick(cell)}
              disabled={isSelected || gameStatus !== "playing"}
              className={`
                p-1 rounded-xl border-2 shadow-sm flex flex-col items-center justify-center text-center text-xs font-bold transition-all h-full
                ${
                  isSelected
                    ? "bg-green-500 text-white border-green-600 scale-95 shadow-none"
                    : "bg-white hover:bg-blue-50 text-slate-600"
                }
                ${
                  isHinted && !isSelected
                    ? "border-warning border-4 animate-pulse ring ring-warning ring-opacity-20"
                    : "border-slate-100"
                }
              `}
            >
              <span
                className={`mb-1 opacity-50 text-[9px] uppercase tracking-tighter ${
                  isSelected ? "text-white" : ""
                }`}
              >
                {cell.type.replace("_", " ")}
              </span>
              <div className="line-clamp-3">{cell.label}</div>
              {isHinted && !isSelected && (
                <div className="text-[8px] mt-1 bg-warning text-dark px-1 rounded">
                  HINT
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
