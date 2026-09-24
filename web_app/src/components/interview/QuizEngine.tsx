'use client';

import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '@/data/quizQuestions';
import { useLearner } from '@/stores/LearnerStore';

export const QuizEngine: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const { addXp } = useLearner();

  const currentQ = QUIZ_QUESTIONS[currentIndex];
  const hasAnswered = selectedAnswers[currentIndex] !== undefined;
  const isCorrect = selectedAnswers[currentIndex] === currentQ.correctIndex;

  const handleSelectOption = (optIdx: number) => {
    if (hasAnswered) return;

    const newAnswers = { ...selectedAnswers, [currentIndex]: optIdx };
    setSelectedAnswers(newAnswers);

    if (optIdx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      addXp(50);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm space-y-6 transition-all">
      {/* Header with Progress Bar */}
      <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
              🎯
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Interactive Systems &amp; Quant Interview Drill
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {currentQ.difficulty}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            className="h-full bg-blue-600 transition-all duration-300"
          />
        </div>
      </div>

      {!quizFinished ? (
        <div className="space-y-5">
          {/* Question Prompt */}
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {currentQ.question}
          </div>

          {/* Options with Letter Badges */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              const isOptionCorrect = idx === currentQ.correctIndex;

              let optionStyles = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-850';
              let badgeStyles = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

              if (hasAnswered) {
                if (isOptionCorrect) {
                  optionStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-medium ring-1 ring-emerald-500';
                  badgeStyles = 'bg-emerald-600 text-white border-emerald-600';
                } else if (isSelected) {
                  optionStyles = 'border-red-400 bg-red-50 dark:bg-red-950/60 text-red-950 dark:text-red-100 ring-1 ring-red-400';
                  badgeStyles = 'bg-red-500 text-white border-red-500';
                } else {
                  optionStyles = 'border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer shadow-xs ${optionStyles}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg border text-xs font-mono font-bold flex items-center justify-center shrink-0 ${badgeStyles}`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Drawer */}
          {hasAnswered && (
            <div
              className={`p-4 rounded-xl text-xs sm:text-sm space-y-1.5 animate-fadeIn border ${
                isCorrect
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                <span>{isCorrect ? '✓ Correct Answer!' : '✗ Not Quite Right.'}</span>
              </div>
              <p className="leading-relaxed opacity-95 text-xs sm:text-[13px]">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>{currentIndex + 1 < QUIZ_QUESTIONS.length ? 'Next Question' : 'View Results'}</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center text-3xl shadow-sm">
            🏆
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Interview Drill Completed!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            You scored <strong className="text-blue-600 dark:text-blue-400 text-base">{score}</strong> out of{' '}
            <strong className="text-base">{QUIZ_QUESTIONS.length}</strong>!
          </p>
          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              Retake Interview Drill ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
