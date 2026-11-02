import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useSearchTasks } from '../hooks/useTasks.js';
import { TaskItem } from './TaskItem.jsx';

export const SearchView = ({ onClose, onToggleStatus, onEditTask, onDeleteTask }) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useSearchTasks(debouncedQuery, debouncedQuery.length > 0);
  const tasks = data?.data || [];

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50 animate-in fade-in duration-200">
      {/* Top Search Bar Header matching Figma Frame 9 */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3.5 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Back to tasks"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-transparent focus:border-brand-500 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
              autoFocus
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Searching tasks...</span>
          </div>
        ) : debouncedQuery && tasks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No tasks found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              We couldn't find any task matching "{debouncedQuery}". Try checking for typos or searching a different keyword.
            </p>
          </div>
        ) : !debouncedQuery ? (
          <div className="py-16 text-center text-xs text-slate-400 font-medium">
            Type keywords above to search across all your scheduled tasks.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Found {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </div>
            <div className="flex flex-col gap-2.5">
              {tasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
