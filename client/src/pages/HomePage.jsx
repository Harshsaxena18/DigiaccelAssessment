import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { AppHeader } from '../components/AppHeader.jsx';
import { OnboardingModal } from '../components/OnboardingModal.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { DaySelector } from '../features/tasks/components/DaySelector.jsx';
import { SummaryCards } from '../features/tasks/components/SummaryCards.jsx';
import { WeeklyProgress } from '../features/tasks/components/WeeklyProgress.jsx';
import { WeekCard } from '../features/tasks/components/WeekCard.jsx';
import { TaskModal } from '../features/tasks/components/TaskModal.jsx';
import { SearchView } from '../features/tasks/components/SearchView.jsx';
import { useWeeklySummary, useTaskMutations } from '../features/tasks/hooks/useTasks.js';
import {
  startOfWeekMonday,
  getDaysOfWeek,
} from '../features/tasks/utils/dateTime.js';

export const HomePage = () => {
  // Navigation & Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Calendar & Filter States
  const [currentWeekMonday] = useState(() => startOfWeekMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const [expandedWeekStart, setExpandedWeekStart] = useState(() => currentWeekMonday.toISOString());

  // Data Queries & Mutations
  const { data: weeklySummaries = [], isLoading, refetch } = useWeeklySummary();
  const { createTask, updateTask, updateTaskStatus, deleteTask } = useTaskMutations();

  // Days of current week for DaySelector
  const weekDays = useMemo(() => getDaysOfWeek(currentWeekMonday), [currentWeekMonday]);

  // Active or Current Week Summary
  const currentWeekSummary = useMemo(() => {
    const mondayIso = currentWeekMonday.toISOString();
    const found = weeklySummaries.find(
      (s) => new Date(s.weekStart).getTime() === currentWeekMonday.getTime()
    );
    return found || {
      weekStart: mondayIso,
      openCount: 0,
      completedCount: 0,
      totalCount: 0,
    };
  }, [weeklySummaries, currentWeekMonday]);

  // Ensure current week is in the list of weeks displayed
  const displayedWeeks = useMemo(() => {
    const map = new Map();
    // Always include current week
    map.set(currentWeekMonday.getTime(), {
      weekStart: currentWeekMonday.toISOString(),
      openCount: 0,
      completedCount: 0,
      totalCount: 0,
    });

    weeklySummaries.forEach((summary) => {
      const start = new Date(summary.weekStart);
      map.set(start.getTime(), summary);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );
  }, [weeklySummaries, currentWeekMonday]);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (formData) => {
    try {
      if (editingTask && editingTask._id) {
        await updateTask.mutateAsync({ id: editingTask._id, data: formData });
      } else {
        await createTask.mutateAsync(formData);
      }
      handleCloseTaskModal();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleToggleStatus = (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    updateTaskStatus.mutate({ id: task._id, status: nextStatus });
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask.mutateAsync(deletingTask._id);
      setDeletingTask(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // If Search View is open, render Frame 9 Search Experience
  if (isSearchOpen) {
    return (
      <SearchView
        onClose={() => setIsSearchOpen(false)}
        onToggleStatus={handleToggleStatus}
        onEditTask={handleOpenEditModal}
        onDeleteTask={(task) => setDeletingTask(task)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 sm:py-6 sm:px-4 flex justify-center">
      <div className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl bg-white sm:rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col min-h-screen sm:min-h-[880px] relative">
        <main className="flex-1 px-5 pt-6 pb-28 sm:pb-12 flex flex-col gap-6">
          <AppHeader
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />

          <DaySelector
            days={weekDays}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          <SummaryCards
            completedCount={currentWeekSummary.completedCount}
            openCount={currentWeekSummary.openCount}
            label={selectedDay ? 'For Date' : 'This Week'}
          />

          <WeeklyProgress
            completedCount={currentWeekSummary.completedCount}
            totalCount={currentWeekSummary.totalCount}
          />

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {selectedDay ? 'Filtered Tasks' : 'Weekly Organization'}
                </h2>
                {selectedDay && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-xs text-brand-600 font-semibold hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  whileTap={{ rotate: 180 }}
                  onClick={() => refetch()}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Refresh tasks"
                  aria-label="Refresh tasks"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleOpenCreateModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Task</span>
                </motion.button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {displayedWeeks.map((week) => (
                <WeekCard
                  key={week.weekStart}
                  weekSummary={week}
                  isExpanded={expandedWeekStart === week.weekStart}
                  onToggleExpand={() =>
                    setExpandedWeekStart((prev) =>
                      prev === week.weekStart ? null : week.weekStart
                    )
                  }
                  selectedDay={selectedDay}
                  onToggleStatus={handleToggleStatus}
                  onEditTask={handleOpenEditModal}
                  onDeleteTask={(task) => setDeletingTask(task)}
                />
              ))}
            </div>
          </div>
        </main>

        <div className="fixed sm:absolute bottom-6 inset-x-0 flex justify-center pointer-events-none z-30">
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', damping: 15, stiffness: 400 }}
            onClick={handleOpenCreateModal}
            className="pointer-events-auto w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-floating flex items-center justify-center transition-colors"
            aria-label="Add new task"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </motion.button>
        </div>

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          onSubmit={handleSaveTask}
          initialTask={editingTask}
          isSubmitting={createTask.isPending || updateTask.isPending}
        />

        <ConfirmDialog
          isOpen={Boolean(deletingTask)}
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTask(null)}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />
      </div>
    </div>
  );
};
