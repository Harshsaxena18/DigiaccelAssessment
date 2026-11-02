import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { formatWeekRange, startOfNextWeekMonday } from '../utils/dateTime.js';
import { useTasksByDateRange } from '../hooks/useTasks.js';
import { TaskItem } from './TaskItem.jsx';

export const WeekCard = ({
  weekSummary,
  isExpanded,
  onToggleExpand,
  selectedDay,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}) => {
  const weekStart = new Date(weekSummary.weekStart);
  const nextMonday = startOfNextWeekMonday(weekStart);

  // Query tasks for this week only when expanded
  const { data, isLoading } = useTasksByDateRange(
    weekStart.toISOString(),
    nextMonday.toISOString(),
    isExpanded
  );

  const tasks = data?.data || [];

  // Filter tasks if a specific day is selected in the DaySelector
  const filteredTasks = selectedDay
    ? tasks.filter((t) => {
        const taskDate = new Date(t.scheduledAt);
        return (
          taskDate.getFullYear() === selectedDay.getFullYear() &&
          taskDate.getMonth() === selectedDay.getMonth() &&
          taskDate.getDate() === selectedDay.getDate()
        );
      })
    : tasks;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full px-4 sm:px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {formatWeekRange(weekStart)}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1 text-blue-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {weekSummary.completedCount} completed
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {weekSummary.openCount} open
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
            {weekSummary.totalCount} {weekSummary.totalCount === 1 ? 'task' : 'tasks'}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-500" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40">
              {isLoading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Loading tasks...</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-6 text-center text-xs font-medium text-slate-400">
                  {selectedDay
                    ? 'No tasks scheduled for the selected day in this week.'
                    : 'No tasks scheduled in this week.'}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 mt-1">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task) => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        onToggleStatus={onToggleStatus}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
