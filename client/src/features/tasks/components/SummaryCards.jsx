import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';

export const SummaryCards = ({ completedCount = 0, openCount = 0, label = 'This Week' }) => {
  const formatCount = (count) => {
    return count < 10 ? `0${count}` : `${count}`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
      {/* Task Complete Card */}
      <div className="bg-[#EBF3FF] rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-blue-100/60 transition-transform duration-150 hover:scale-[1.01]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
            Task Complete
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCount(completedCount)}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-slate-500">
            {label}
          </span>
        </div>
      </div>

      {/* Task Pending Card */}
      <div className="bg-[#FFF0F0] rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-red-100/60 transition-transform duration-150 hover:scale-[1.01]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
            Task Pending
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCount(openCount)}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-slate-500">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
