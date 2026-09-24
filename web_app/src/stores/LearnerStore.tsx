'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModuleId, AppMode } from '@/types';

export interface LearnerProgress {
  unlockedStages: string[];
  completedChallenges: string[];
  xp: number;
  mode: AppMode;
  currentStageId: ModuleId;
}

interface LearnerContextType {
  progress: LearnerProgress;
  unlockStage: (stageId: string) => void;
  completeChallenge: (challengeId: string, xpReward: number) => boolean;
  addXp: (amount: number) => void;
  setMode: (mode: AppMode) => void;
  setCurrentStageId: (stageId: ModuleId) => void;
  resetProgress: () => void;
}

const DEFAULT_STAGES = [
  'stage-0',
  'stage-1',
  'stage-2',
  'stage-3',
  'stage-4',
  'stage-5',
  'stage-6',
  'stage-7',
  'sandbox',
];

const INITIAL_PROGRESS: LearnerProgress = {
  unlockedStages: ['stage-0', 'stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5', 'stage-6', 'stage-7', 'sandbox'], // All accessible by default to prevent blocking, with progress badge
  completedChallenges: [],
  xp: 0,
  mode: 'story',
  currentStageId: 'stage-0',
};

const LearnerContext = createContext<LearnerContextType | null>(null);

export const LearnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<LearnerProgress>(INITIAL_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lcpp-learner-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProgress((prev) => ({
          ...prev,
          ...parsed,
          unlockedStages: parsed.unlockedStages || DEFAULT_STAGES,
        }));
      }
    } catch {
      // ignore JSON parse error
    }
    setIsLoaded(true);
  }, []);

  const saveProgress = (newProg: LearnerProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem('lcpp-learner-v2', JSON.stringify(newProg));
    } catch {
      // ignore
    }
  };

  const unlockStage = (stageId: string) => {
    if (!progress.unlockedStages.includes(stageId)) {
      saveProgress({
        ...progress,
        unlockedStages: [...progress.unlockedStages, stageId],
      });
    }
  };

  const completeChallenge = (challengeId: string, xpReward: number): boolean => {
    if (progress.completedChallenges.includes(challengeId)) {
      return false; // already completed
    }
    saveProgress({
      ...progress,
      completedChallenges: [...progress.completedChallenges, challengeId],
      xp: progress.xp + xpReward,
    });
    return true;
  };

  const addXp = (amount: number) => {
    saveProgress({
      ...progress,
      xp: progress.xp + amount,
    });
  };

  const setMode = (mode: AppMode) => {
    saveProgress({ ...progress, mode });
  };

  const setCurrentStageId = (stageId: ModuleId) => {
    saveProgress({ ...progress, currentStageId: stageId });
  };

  const resetProgress = () => {
    saveProgress(INITIAL_PROGRESS);
  };

  return (
    <LearnerContext.Provider
      value={{
        progress,
        unlockStage,
        completeChallenge,
        addXp,
        setMode,
        setCurrentStageId,
        resetProgress,
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export const useLearner = () => {
  const ctx = useContext(LearnerContext);
  if (!ctx) {
    return {
      progress: INITIAL_PROGRESS,
      unlockStage: () => {},
      completeChallenge: () => false,
      addXp: () => {},
      setMode: () => {},
      setCurrentStageId: () => {},
      resetProgress: () => {},
    };
  }
  return ctx;
};
