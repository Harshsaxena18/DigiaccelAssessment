import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-modal border border-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="confirm-dialog-title" className="text-lg font-bold text-slate-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
