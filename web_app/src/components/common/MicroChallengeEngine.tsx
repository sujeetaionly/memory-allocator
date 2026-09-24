'use client';

import React, { useState } from 'react';
import { MicroChallenge } from '@/types';
import { useLearner } from '@/stores/LearnerStore';

interface MicroChallengeProps {
  challenge: MicroChallenge;
  onSuccess?: () => void;
}

export const MicroChallengeEngine: React.FC<MicroChallengeProps> = ({
  challenge,
  onSuccess,
}) => {
  const { progress, completeChallenge } = useLearner();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const isAlreadyCompleted = progress.completedChallenges.includes(challenge.id);
  const isCorrect = selectedIdx === challenge.correctIndex;

  const handleSubmit = (idx: number) => {
    setSelectedIdx(idx);
    setShowFeedback(true);
    if (idx === challenge.correctIndex) {
      completeChallenge(challenge.id, challenge.xpReward);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="my-8 rounded-2xl border border-blue-200/90 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-6 sm:p-7 shadow-sm space-y-4 transition-all">
      {/* Header with Title and XP */}
      <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs">
            ?
          </span>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-blue-700 dark:text-blue-400 block">
              Active Recall Challenge
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {challenge.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAlreadyCompleted && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
              ✓ Solved
            </span>
          )}
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
            +{challenge.xpReward} XP
          </span>
        </div>
      </div>

      {/* Scenario & Question Prompt */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {challenge.scenario}
        </p>
        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
          {challenge.question}
        </p>
      </div>

      {/* Options List with Standardized Letter Badges */}
      <div className="space-y-2.5 pt-1">
        {challenge.options.map((opt, idx) => {
          let optionStyles = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50/80 dark:hover:bg-slate-850';
          let badgeStyles = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

          if (showFeedback) {
            if (idx === challenge.correctIndex) {
              optionStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-medium ring-1 ring-emerald-500 shadow-xs';
              badgeStyles = 'bg-emerald-600 text-white border-emerald-600';
            } else if (idx === selectedIdx) {
              optionStyles = 'border-red-400 bg-red-50 dark:bg-red-950/60 text-red-950 dark:text-red-100 ring-1 ring-red-400';
              badgeStyles = 'bg-red-500 text-white border-red-500';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSubmit(idx)}
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

      {/* Hint Drawer */}
      {!showFeedback && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
          >
            <span>{showHint ? 'Hide Hint' : '💡 Need a Hint?'}</span>
          </button>
        </div>
      )}

      {showHint && !showFeedback && (
        <div className="text-xs p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 animate-fadeIn leading-relaxed">
          💡 <strong>Hint:</strong> {challenge.hint}
        </div>
      )}

      {/* Immediate Explanatory Feedback Card */}
      {showFeedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm space-y-1.5 animate-fadeIn border ${
            isCorrect
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-xs'
              : 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 shadow-xs'
          }`}
        >
          <div className="font-bold flex items-center gap-2">
            {isCorrect ? (
              <>
                <span className="text-base">🎯</span>
                <span>Correct! Intuition verified.</span>
              </>
            ) : (
              <>
                <span className="text-base">⚠️</span>
                <span>Not quite right. Let&apos;s analyze why:</span>
              </>
            )}
          </div>
          <p className="leading-relaxed opacity-95 pl-6">{challenge.explanation}</p>
        </div>
      )}
    </div>
  );
};
