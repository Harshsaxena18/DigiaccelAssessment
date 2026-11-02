import React from 'react';
import { motion } from 'framer-motion';
import { isSameDay } from 'date-fns';

export const DaySelector = ({ days = [], selectedDay, onSelectDay }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
        {days.map((day) => {
          const isSelected = selectedDay && isSameDay(day.date, selectedDay);

          return (
            <motion.button
              key={day.isoString}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDay(isSelected ? null : day.date)}
              className={`relative flex-1 min-w-[42px] sm:min-w-[48px] py-2.5 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 select-none ${
                isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeDayPill"
                  className="absolute inset-0 bg-brand-600 rounded-2xl shadow-md -z-0"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}

              <span
                className={`relative z-10 text-[11px] font-medium leading-none mb-1.5 transition-colors ${
                  isSelected ? 'text-white/80' : 'text-slate-400'
                }`}
              >
                {day.dayName}
              </span>
              <span
                className={`relative z-10 text-sm sm:text-base font-bold leading-none transition-colors ${
                  isSelected ? 'text-white' : 'text-slate-700'
                }`}
              >
                {day.dayNumber}
              </span>
              {isSelected && (
                <span className="relative z-10 w-1.5 h-1.5 bg-white rounded-full mt-1.5" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
