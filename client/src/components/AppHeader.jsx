import React from 'react';
import { Search, Settings, Bell, Sparkles } from 'lucide-react';

export const AppHeader = ({ onOpenSearch, onOpenOnboarding }) => {
  return (
    <header className="w-full">
      {/* Top Mobile/Desktop Bar */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              To-Do List
            </h1>
            <p className="text-xs font-medium text-slate-400 hidden sm:block">
              Organize, track & accomplish weekly tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenOnboarding}
            title="View Figma Welcome Screen"
            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
            aria-label="View Onboarding"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-600 rounded-full ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Search Input Bar matching Figma */}
      <div className="mt-1">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-slate-400 hover:border-brand-500 hover:text-slate-600 transition-all text-left group"
        >
          <span className="text-sm font-medium text-slate-400 group-hover:text-slate-600">
            Search for a task
          </span>
          <Search className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" />
        </button>
      </div>
    </header>
  );
};
