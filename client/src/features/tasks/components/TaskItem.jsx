import React, { useState, useRef } from 'react';
import { Trash2, Edit3, Check, Calendar, AlertCircle } from 'lucide-react';
import { formatTaskTime } from '../utils/dateTime.js';

export const TaskItem = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartXRef = useRef(0);
  const isCompleted = task.status === 'COMPLETED';

  // Handle Touch Swipe (Swipe left to reveal Delete)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const diff = touchStartXRef.current - currentX;
    // Allow dragging up to 80px to the left
    if (diff > 0 && diff < 120) {
      setSwipeOffset(-diff);
    } else if (diff <= 0) {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset < -40) {
      setSwipeOffset(-80); // Keep open
    } else {
      setSwipeOffset(0); // Snap closed
    }
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;
    const styles = {
      LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
      HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${styles[priority] || 'bg-slate-100 text-slate-600'}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-150 hover:shadow-card hover:border-slate-200">
      {/* Hidden Swipe Action Background (Visible on swipe-left on touch devices) */}
      <div className="absolute inset-y-0 right-0 w-24 bg-red-600 flex items-center justify-center text-white">
        <button
          type="button"
          onClick={() => {
            setSwipeOffset(0);
            onDelete(task);
          }}
          className="w-full h-full flex flex-col items-center justify-center gap-1 text-xs font-semibold"
          aria-label="Delete task via swipe"
        >
          <Trash2 className="w-5 h-5" />
          <span>Delete</span>
        </button>
      </div>

      {/* Main Task Foreground Container */}
      <div
        className="relative bg-white px-4 py-3.5 flex items-center justify-between gap-3 transition-transform duration-150"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left: Checkbox & Task Title */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onToggleStatus(task)}
            role="checkbox"
            aria-checked={isCompleted}
            aria-label={`Mark "${task.title}" as ${isCompleted ? 'in progress' : 'completed'}`}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
              isCompleted
                ? 'bg-brand-600 text-white shadow-sm'
                : 'border-2 border-slate-300 hover:border-brand-500 bg-white'
            }`}
          >
            {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm sm:text-base font-semibold truncate transition-colors duration-150 ${
                  isCompleted
                    ? 'line-through text-slate-400'
                    : 'text-slate-800'
                }`}
              >
                {task.title}
              </span>
              {getPriorityBadge(task.priority)}
            </div>

            <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {formatTaskTime(task.scheduledAt)}
              </span>

              {task.description && (
                <span className="truncate max-w-[140px] sm:max-w-xs text-slate-500">
                  {task.description}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions matching Figma (Trash icon & Pencil edit icon) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete task"
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="Edit task"
            aria-label={`Edit ${task.title}`}
          >
            <Edit3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
