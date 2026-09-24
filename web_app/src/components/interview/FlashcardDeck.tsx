'use client';

import React, { useState } from 'react';
import { FLASHCARDS } from '@/data/quizQuestions';

export const FlashcardDeck: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const card = FLASHCARDS[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % FLASHCARDS.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length);
  };

  return (
    <div className="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm space-y-5 transition-all">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            🧠
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Active Recall Flashcards
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">
            {currentIndex + 1} / {FLASHCARDS.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 text-[10.5px]">
            {card.category}
          </span>
        </div>
      </div>

      {/* Interactive Card Canvas */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`p-6 sm:p-7 rounded-2xl border cursor-pointer min-h-[160px] flex flex-col justify-between transition-all select-none ${
          isFlipped
            ? 'border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/30 dark:to-slate-900 shadow-sm'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs'
        }`}
      >
        <div>
          <span className="text-[10.5px] font-mono uppercase font-bold tracking-wider text-slate-400 block mb-2">
            {isFlipped ? '🔑 Answer (Click card to flip back):' : '❓ Question (Click card to reveal answer):'}
          </span>
          <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
            {card.question}
          </p>

          {isFlipped && (
            <div className="mt-4 pt-3 border-t border-indigo-200/60 dark:border-indigo-900/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed animate-fadeIn">
              {card.answer}
            </div>
          )}
        </div>

        {isFlipped && (
          <div className="mt-4 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-200/80 dark:border-indigo-900/60 text-[11.5px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-2">
            <span>⚡ Key Takeaway:</span>
            <span>{card.keyTakeaway}</span>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handlePrev}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>◀</span>
          <span>Previous</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition-colors"
        >
          {isFlipped ? 'Show Question' : 'Reveal Answer 👁️'}
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
        >
          <span>Next</span>
          <span>▶</span>
        </button>
      </div>
    </div>
  );
};
