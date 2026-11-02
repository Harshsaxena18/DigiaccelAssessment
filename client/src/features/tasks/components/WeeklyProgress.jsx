import React from 'react';

export const WeeklyProgress = ({ completedCount = 0, totalCount = 0 }) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Weekly Progress
        </h2>
        <span className="text-xs sm:text-sm font-semibold text-brand-600">
          {percentage}%
        </span>
      </div>

      <div className="w-full h-3 sm:h-3.5 bg-brand-100/60 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};
