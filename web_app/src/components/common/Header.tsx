'use client';

import React, { useState } from 'react';
import { ModuleId } from '@/types';
import { useLearner } from '@/stores/LearnerStore';

interface HeaderProps {
  activeModule: ModuleId;
  setActiveModule: (id: ModuleId) => void;
  onOpenGlossary: () => void;
  sections?: { id: string; title: string }[];
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  onOpenGlossary,
  sections = [],
  isDark,
  onToggleTheme,
}) => {
  const [navOpen, setNavOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const { progress } = useLearner();

  const lessons: { id: ModuleId; title: string; num: string }[] = [
    { id: 'index', title: '📋 Course Hub (Roadmap & Checkpoints)', num: 'Hub' },
    { id: 'sandbox', title: '🎮 Interactive Allocator Sandbox', num: 'Lab' },
    { id: 'stage-0', title: 'Stage 0 — The Physical Machine & RAM', num: '0' },
    { id: 'stage-1', title: 'Stage 1 — The C++ Model, Pointers & Stack', num: '1' },
    { id: 'stage-2', title: 'Stage 2 — Dynamic Memory & The Heap Bottleneck', num: '2' },
    { id: 'stage-3', title: 'Stage 3 — Phase 1: Linear Arena Allocator', num: '3' },
    { id: 'stage-4', title: 'Stage 4 — Phase 2: Fixed-Size Free-List', num: '4' },
    { id: 'stage-5', title: 'Stage 5 — Phase 3: Variable-Size Boundary Tags', num: '5' },
    { id: 'stage-6', title: 'Stage 6 — Hardware Reality: Alignment & Caches', num: '6' },
    { id: 'stage-7', title: 'Stage 7 — Systems Capstone & Quant Interview', num: '7' },
  ];

  const handleScrollTo = (id: string) => {
    setNavOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="lcpp-header sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800">
      <div className="lcpp-header-inner flex items-center justify-between px-3 sm:px-6 h-[52px] max-w-[1440px] mx-auto w-full">
        {/* Extreme Left: Brand Logo */}
        <div
          className="lcpp-brand cursor-pointer select-none flex items-center gap-2"
          onClick={() => {
            setActiveModule('index');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Return to Course Index (All Topics)"
        >
          <div className="bg-blue-600 text-white font-mono font-bold text-xs px-2 py-0.5 rounded-md shadow-xs shrink-0">
            c++
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs sm:text-sm tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              <span className="hidden sm:inline">LOW-LEVEL </span>ACADEMY
            </span>
            <span className="hidden md:inline-block text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
              Zero-to-Hero
            </span>
          </div>
        </div>

        {/* Center / Right: Navigation & Actions */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs">
          {/* Quick Mode Switches */}
          <button
            onClick={() => {
              setActiveModule('stage-0');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule.startsWith('stage-')
                ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="hidden sm:inline">📖 Story Quest</span>
            <span className="sm:hidden">📖 Quest</span>
          </button>

          <button
            onClick={() => {
              setActiveModule('sandbox');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'sandbox'
                ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="hidden sm:inline">🎮 Sandbox Lab</span>
            <span className="sm:hidden">🎮 Lab</span>
          </button>

          {/* Dynamic SECTIONS Dropdown for active module */}
          {sections.length > 0 && (
            <div
              className="relative hidden lg:block"
              onMouseEnter={() => setNavOpen(true)}
              onMouseLeave={() => setNavOpen(false)}
            >
              <button className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">
                SECTIONS ▾
              </button>
              {navOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-fadeIn">
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => handleScrollTo(sec.id)}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {sec.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dynamic LESSON INDEX Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIndexOpen(true)}
            onMouseLeave={() => setIndexOpen(false)}
          >
            <button className="px-2 sm:px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">
              <span className="hidden sm:inline">CURRICULUM ▾</span>
              <span className="sm:hidden">MENU ▾</span>
            </button>
            {indexOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-fadeIn max-h-[80vh] overflow-y-auto">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveModule(lesson.id);
                      setIndexOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      activeModule === lesson.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate pr-2">{lesson.title}</span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{lesson.num}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Concept Dictionary Modal Trigger */}
          <button
            onClick={onOpenGlossary}
            className="px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hidden md:inline-block"
            title="Open Systems Concept Dictionary"
          >
            GLOSSARY 📖
          </button>

          {/* XP Pill */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold">
            <span>⚡</span>
            <span>{progress.xp} XP</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark Theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
};
