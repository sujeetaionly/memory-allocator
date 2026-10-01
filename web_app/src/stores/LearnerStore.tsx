'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ModuleId, AppMode } from '@/types';
import { ModuleProgressStatus, CourseTierId, ALLOCATOR_MODULES } from '@/data/allocatorCurriculum';

export interface LearnerProgress {
  unlockedStages: string[];
  completedChallenges: string[];
  moduleStatuses: Record<string, ModuleProgressStatus>;
  bookmarkedStages: string[];
  completedResources: string[];
  xp: number;
  mode: AppMode;
  currentStageId: ModuleId;
  selectedTier: CourseTierId;
}

interface LearnerContextType {
  progress: LearnerProgress;
  unlockStage: (stageId: string) => void;
  completeChallenge: (challengeId: string, xpReward: number) => boolean;
  setModuleStatus: (moduleId: string, status: ModuleProgressStatus) => void;
  toggleBookmark: (stageId: string) => void;
  isBookmarked: (stageId: string) => boolean;
  toggleResource: (resourceId: string) => void;
  addXp: (amount: number) => void;
  setMode: (mode: AppMode) => void;
  setCurrentStageId: (stageId: ModuleId) => void;
  setSelectedTier: (tier: CourseTierId) => void;
  resetProgress: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  navigateToModule: (moduleId: ModuleId, sectionId?: string) => void;
  registerNavigator: (fn: (moduleId: ModuleId, sectionId?: string) => void) => void;
  openGlossary: (conceptId?: string) => void;
  registerGlossaryOpener: (fn: (conceptId?: string) => void) => void;
  isDark: boolean;
  toggleTheme: () => void;
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
  unlockedStages: DEFAULT_STAGES,
  completedChallenges: [],
  moduleStatuses: {
    'stage-0': 'reading',
  },
  bookmarkedStages: [],
  completedResources: [],
  xp: 0,
  mode: 'story',
  currentStageId: 'index',
  selectedTier: 'foundations',
};

const LearnerContext = createContext<LearnerContextType | null>(null);

export const LearnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<LearnerProgress>(INITIAL_PROGRESS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(true);
  const navigatorRef = useRef<((moduleId: ModuleId, sectionId?: string) => void) | null>(null);
  const glossaryOpenerRef = useRef<((conceptId?: string) => void) | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('allocator-guide-progress-v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProgress((prev) => ({
          ...prev,
          ...parsed,
          unlockedStages: parsed.unlockedStages || DEFAULT_STAGES,
          moduleStatuses: parsed.moduleStatuses || { 'stage-0': 'reading' },
          bookmarkedStages: parsed.bookmarkedStages || [],
          completedResources: parsed.completedResources || [],
          selectedTier: parsed.selectedTier || 'foundations',
        }));
      }
      const savedTheme = localStorage.getItem('allocator-guide-theme');
      const useDark = savedTheme ? savedTheme === 'dark' : true;
      setIsDark(useDark);
      if (useDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      const themeStr = next ? 'dark' : 'light';
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.setAttribute('data-theme', themeStr);
      try {
        localStorage.setItem('allocator-guide-theme', themeStr);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const saveProgress = (newProg: LearnerProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem('allocator-guide-progress-v1', JSON.stringify(newProg));
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

  const setModuleStatus = (moduleId: string, status: ModuleProgressStatus) => {
    saveProgress({
      ...progress,
      moduleStatuses: {
        ...progress.moduleStatuses,
        [moduleId]: status,
      },
    });
  };

  const toggleBookmark = (stageId: string) => {
    const current = progress.bookmarkedStages || [];
    const exists = current.includes(stageId);
    const updated = exists ? current.filter((id) => id !== stageId) : [...current, stageId];
    saveProgress({
      ...progress,
      bookmarkedStages: updated,
    });
  };

  const isBookmarked = (stageId: string) => {
    return (progress.bookmarkedStages || []).includes(stageId);
  };

  const toggleResource = (resourceId: string) => {
    const exists = progress.completedResources.includes(resourceId);
    const updated = exists
      ? progress.completedResources.filter((r) => r !== resourceId)
      : [...progress.completedResources, resourceId];
    saveProgress({
      ...progress,
      completedResources: updated,
    });
  };

  const completeChallenge = (challengeId: string, xpReward: number): boolean => {
    if (progress.completedChallenges.includes(challengeId)) {
      return false;
    }
    const currentMod = progress.currentStageId;
    const currentStatus = progress.moduleStatuses[currentMod] || 'not_started';
    const nextStatus =
      currentStatus === 'not_started' || currentStatus === 'reading'
        ? 'practicing'
        : currentStatus;
    saveProgress({
      ...progress,
      completedChallenges: [...progress.completedChallenges, challengeId],
      moduleStatuses: {
        ...progress.moduleStatuses,
        [currentMod]: nextStatus,
      },
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
    const meta = ALLOCATOR_MODULES[stageId];
    const nextTier = meta ? meta.tier : progress.selectedTier;
    saveProgress({
      ...progress,
      currentStageId: stageId,
      selectedTier: nextTier,
    });
  };

  const setSelectedTier = (tier: CourseTierId) => {
    saveProgress({
      ...progress,
      selectedTier: tier,
    });
  };

  const resetProgress = () => {
    saveProgress(INITIAL_PROGRESS);
  };

  const registerNavigator = useCallback((fn: (moduleId: ModuleId, sectionId?: string) => void) => {
    navigatorRef.current = fn;
  }, []);

  const navigateToModule = useCallback((moduleId: ModuleId, sectionId?: string) => {
    if (navigatorRef.current) {
      navigatorRef.current(moduleId, sectionId);
    }
  }, []);

  const registerGlossaryOpener = useCallback((fn: (conceptId?: string) => void) => {
    glossaryOpenerRef.current = fn;
  }, []);

  const openGlossary = useCallback((conceptId?: string) => {
    if (glossaryOpenerRef.current) {
      glossaryOpenerRef.current(conceptId);
    }
  }, []);

  return (
    <LearnerContext.Provider
      value={{
        progress,
        unlockStage,
        completeChallenge,
        setModuleStatus,
        toggleBookmark,
        isBookmarked,
        toggleResource,
        addXp,
        setMode,
        setCurrentStageId,
        setSelectedTier,
        resetProgress,
        sidebarCollapsed,
        setSidebarCollapsed,
        navigateToModule,
        registerNavigator,
        openGlossary,
        registerGlossaryOpener,
        isDark,
        toggleTheme,
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
      setModuleStatus: () => {},
      toggleBookmark: () => {},
      isBookmarked: () => false,
      toggleResource: () => {},
      addXp: () => {},
      setMode: () => {},
      setCurrentStageId: () => {},
      setSelectedTier: () => {},
      resetProgress: () => {},
      sidebarCollapsed: false,
      setSidebarCollapsed: () => {},
      navigateToModule: () => {},
      registerNavigator: () => {},
      openGlossary: () => {},
      registerGlossaryOpener: () => {},
      isDark: true,
      toggleTheme: () => {},
    };
  }
  return ctx;
};
