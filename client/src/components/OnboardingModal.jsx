import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const OnboardingModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col"
          >
            <div className="relative h-72 bg-gradient-to-b from-brand-600 to-brand-700 flex items-center justify-center overflow-hidden p-6">
              <div className="absolute top-6 left-6 opacity-30">
                <svg width="80" height="60" viewBox="0 0 100 80" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round">
                  <path d="M5 20 L25 5 L45 20 L65 5 L85 20" />
                  <path d="M5 45 L25 30 L45 45 L65 30 L85 45" />
                  <path d="M5 70 L25 55 L45 70 L65 55 L85 70" />
                </svg>
              </div>
              <div className="absolute bottom-6 right-6 opacity-30">
                <svg width="80" height="60" viewBox="0 0 100 80" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round">
                  <path d="M5 20 L25 5 L45 20 L65 5 L85 20" />
                  <path d="M5 45 L25 30 L45 45 L65 30 L85 45" />
                  <path d="M5 70 L25 55 L45 70 L65 55 L85 70" />
                </svg>
              </div>
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full" />

              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                className="relative z-10 w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg"
              >
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </motion.div>
            </div>

            <div className="p-8 text-center flex flex-col items-center">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage What To Do
              </h2>
              <p className="mt-3 text-sm text-slate-500 max-w-xs leading-relaxed">
                The best way to manage what you have to do, don't forget your plans
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="mt-8 w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold rounded-xl shadow-floating hover:shadow-lg transition-all duration-150"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
