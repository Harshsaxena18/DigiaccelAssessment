import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../utils/dateTime.js';

export const TaskModal = ({ isOpen, onClose, onSubmit, initialTask = null, isSubmitting = false }) => {
  const isEditing = Boolean(initialTask && initialTask._id);

  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [priority, setPriority] = useState(null);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || '');
        setScheduledAt(toDateTimeLocalValue(initialTask.scheduledAt));
        setPriority(initialTask.priority || null);
        setDescription(initialTask.description || '');
      } else {
        const defaultDate = new Date();
        defaultDate.setMinutes(0, 0, 0);
        defaultDate.setHours(defaultDate.getHours() + 1);

        setTitle('');
        setScheduledAt(toDateTimeLocalValue(defaultDate));
        setPriority(null);
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, initialTask]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Task title is required';
    } else if (title.trim().length > 120) {
      errs.title = 'Title cannot exceed 120 characters';
    }

    if (!scheduledAt) {
      errs.scheduledAt = 'Scheduled date and time is required';
    } else {
      const parsed = new Date(scheduledAt);
      if (isNaN(parsed.getTime())) {
        errs.scheduledAt = 'Please select a valid date and time';
      }
    }

    if (description && description.length > 2000) {
      errs.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const isoDate = fromDateTimeLocalValue(scheduledAt);

    onSubmit({
      title: title.trim(),
      scheduledAt: isoDate,
      priority: priority || null,
      description: description.trim(),
    });
  };

  const priorityOptions = [
    { label: 'Low', value: 'LOW', color: 'hover:border-emerald-500 hover:text-emerald-600', active: 'bg-emerald-600 text-white border-emerald-600' },
    { label: 'Medium', value: 'MEDIUM', color: 'hover:border-amber-500 hover:text-amber-600', active: 'bg-amber-600 text-white border-amber-600' },
    { label: 'High', value: 'HIGH', color: 'hover:border-rose-500 hover:text-rose-600', active: 'bg-rose-600 text-white border-rose-600' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h2 id="task-modal-title" className="text-lg font-extrabold text-slate-900">
                {isEditing ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 overflow-y-auto space-y-4">
              <div>
                <label htmlFor="task-title" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Task title <span className="text-red-500">*</span>
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                  }}
                  placeholder="e.g. Doing Homework"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                  maxLength={120}
                  autoFocus
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="task-datetime" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="task-datetime"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    if (errors.scheduledAt) setErrors((prev) => ({ ...prev, scheduledAt: null }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.scheduledAt
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
                {errors.scheduledAt && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.scheduledAt}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Priority (Optional)
                </label>
                <div className="flex items-center gap-2">
                  {priorityOptions.map((opt) => {
                    const isSelected = priority === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPriority(isSelected ? null : opt.value)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? opt.active
                            : `border-slate-200 text-slate-600 bg-white ${opt.color}`
                        }`}
                      >
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="task-description" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  id="task-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, notes or steps..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none transition-all"
                  maxLength={2000}
                />
              </div>

              <div className="pt-2">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-white font-semibold rounded-xl shadow-floating transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving task...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Save Changes' : 'Create task'}</span>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
