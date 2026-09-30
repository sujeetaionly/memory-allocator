'use client';

import React, { useState } from 'react';
import { ModuleId } from '@/types';
import { useLearner } from '@/stores/LearnerStore';
import { COURSE_TIERS, CourseTierId } from '@/data/allocatorCurriculum';

interface HeaderProps {
  activeModule: ModuleId;
  setActiveModule: (id: ModuleId, sectionId?: string) => void;
  onOpenGlossary: () => void;
  sections?: { id: string; title: string }[];
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AllocatorLogoSvg: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <svg
    className={`inline-block shrink-0 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="none"
  >
    <rect x="16" y="16" width="68" height="68" rx="12" className="fill-blue-600 dark:fill-blue-500" />
    <rect x="26" y="26" width="48" height="48" rx="7" className="fill-blue-950 dark:fill-[#121212]" />
    {/* RAM / Silicon bank cells */}
    <rect x="33" y="33" width="14" height="14" rx="2.5" className="fill-blue-400" />
    <rect x="53" y="33" width="14" height="14" rx="2.5" className="fill-emerald-400" />
    <rect x="33" y="53" width="14" height="14" rx="2.5" className="fill-amber-400" />
    <rect x="53" y="53" width="14" height="14" rx="2.5" className="fill-purple-400" />
    {/* Memory bus pin traces */}
    <line x1="6" y1="36" x2="16" y2="36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-blue-500 dark:text-blue-400" />
    <line x1="6" y1="50" x2="16" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-blue-500 dark:text-blue-400" />
    <line x1="6" y1="64" x2="16" y2="64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-blue-500 dark:text-blue-400" />
    <line x1="84" y1="36" x2="94" y2="36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-blue-500 dark:text-blue-400" />
    <line x1="84" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-blue-500 dark:text-blue-400" />
    <line x1="84" y1="64" x2="94" y2="64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-blue-500 dark:text-blue-400" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  onOpenGlossary,
  isDark,
  onToggleTheme,
}) => {
  const [tierDropdownOpen, setTierDropdownOpen] = useState(false);
  const [resDropdownOpen, setResDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { progress, setSelectedTier } = useLearner();

  // On individual module pages (stage-0..stage-7, sandbox), the 3-column layout
  // with the fixed left sidebar and top breadcrumb bar is rendered inside DualPaneLayout.
  if (activeModule !== 'index') {
    return null;
  }

  const currentTier = COURSE_TIERS[progress.selectedTier || 'foundations'];
  const tierList: { id: CourseTierId; label: string; dotColor: string }[] = [
    { id: 'foundations', label: 'Foundations · Physical RAM', dotColor: 'bg-blue-500' },
    { id: 'machine-model', label: 'The C++ Machine & Heap', dotColor: 'bg-amber-500' },
    { id: 'allocator-engines', label: 'Custom Allocator Engines', dotColor: 'bg-slate-400' },
    { id: 'hardware-sympathy', label: 'Hardware Sympathy & Caches', dotColor: 'bg-emerald-500' },
    { id: 'quant-capstone', label: 'Quant Systems & Capstone', dotColor: 'bg-purple-500' },
  ];

  return (
    <header className="w-full shrink-0">
      {/* Top Announcement Banner - Sleek, authentic, mobile-responsive */}
      <div className="bg-[#111827] text-white border-b border-gray-800/80 px-3 py-2 sm:py-2.5 text-center">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm">
          <span className="text-gray-300">
            Interactive 64-Byte RAM Simulator &amp; C++20 Allocator Lab is live.
          </span>
          <button
            onClick={() => setActiveModule('sandbox')}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-3 py-0.5 text-xs font-semibold text-white transition cursor-pointer"
          >
            Launch RAM Studio <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* Main Top Navigation Bar */}
      <nav className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 shadow-xs relative z-30">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Brand Logo + Title */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveModule('index')}
                className="flex items-center gap-2.5 cursor-pointer focus:outline-none"
              >
                <AllocatorLogoSvg className="h-8 w-8" />
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  Allocator Guide
                </span>
              </button>
            </div>

            {/* Center: Desktop Navigation Links (Never wrap, hidden on tablet/mobile) */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {/* Curriculum Tier Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setTierDropdownOpen(true)}
                onMouseLeave={() => setTierDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition whitespace-nowrap cursor-pointer"
                >
                  <span>Curriculum</span>
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {tierDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 w-72 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black/5 dark:bg-[#1a1d24] dark:ring-gray-700">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Learning Tiers
                    </div>
                    {tierList.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => {
                          setSelectedTier(tier.id);
                          setTierDropdownOpen(false);
                        }}
                        className={`flex w-full items-center px-4 py-2 text-xs sm:text-sm transition cursor-pointer ${
                          progress.selectedTier === tier.id
                            ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-gray-800 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/60'
                        }`}
                      >
                        <span className={`mr-2.5 h-2 w-2 rounded-full shrink-0 ${tier.dotColor}`} />
                        <span className="truncate">{tier.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveModule('stage-0')}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition whitespace-nowrap cursor-pointer"
              >
                Using This Guide
              </button>

              <button
                onClick={() => setActiveModule('sandbox')}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition whitespace-nowrap cursor-pointer"
              >
                RAM Sandbox
              </button>

              {/* Resources Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setResDropdownOpen(true)}
                onMouseLeave={() => setResDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition whitespace-nowrap cursor-pointer"
                >
                  <span>Resources</span>
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {resDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 w-64 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black/5 dark:bg-[#1a1d24] dark:ring-gray-700">
                    <button
                      onClick={() => {
                        onOpenGlossary();
                        setResDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      📖 Systems Concept Dictionary
                    </button>
                    <button
                      onClick={() => {
                        setActiveModule('stage-6');
                        setResDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      ⚡ Bitwise Alignment Calculator
                    </button>
                    <button
                      onClick={() => {
                        setActiveModule('stage-7');
                        setResDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      📊 1M Ops Benchmarks &amp; War Room
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={onOpenGlossary}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition whitespace-nowrap cursor-pointer"
              >
                Glossary
              </button>
            </div>

            {/* Right: Search, XP Counter, Theme Toggle, Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenGlossary}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>

              <span className="hidden md:inline-flex items-center text-xs font-semibold text-gray-600 dark:text-gray-300 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                {progress.xp} XP
              </span>

              <button
                onClick={onToggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark/light mode"
              >
                {isDark ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Mobile Hamburger Button */}
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Optimized for Android / Mobile screens) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161922] px-4 py-4 space-y-4">
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Curriculum Tiers
              </div>
              <div className="grid grid-cols-1 gap-1">
                {tierList.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setSelectedTier(tier.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center px-3 py-2 rounded-md text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                      progress.selectedTier === tier.id
                        ? 'bg-blue-50 dark:bg-gray-800 font-semibold text-blue-700 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`mr-2.5 h-2 w-2 rounded-full shrink-0 ${tier.dotColor}`} />
                    <span className="truncate">{tier.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveModule('stage-0');
                  setMobileMenuOpen(false);
                }}
                className="rounded-md bg-blue-600 px-3 py-2.5 text-center text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-500 cursor-pointer"
              >
                Using This Guide
              </button>
              <button
                onClick={() => {
                  setActiveModule('sandbox');
                  setMobileMenuOpen(false);
                }}
                className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-center text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                RAM Sandbox
              </button>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
              <button
                onClick={() => {
                  onOpenGlossary();
                  setMobileMenuOpen(false);
                }}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                📖 Concept Dictionary
              </button>
              <span>{progress.xp} XP</span>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
