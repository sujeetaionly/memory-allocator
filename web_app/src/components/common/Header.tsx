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

export const AllocatorLogoSvg: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
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
    <div className="w-full">
      {/* Top Announcement Banner */}
      <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 dark:bg-[rgb(17_24_39)] border-b border-gray-200/60 dark:border-gray-800/80">
        <div
          className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#38bdf8] to-[#818cf8] opacity-25"
            style={{
              clipPath:
                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
            }}
          />
        </div>
        <div
          className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#38bdf8] to-[#818cf8] opacity-25"
            style={{
              clipPath:
                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm leading-6 text-gray-900 dark:text-white">
            Interactive 64-Byte Hardware RAM Simulator &amp; C++20 Custom Allocator Lab is live.
          </p>
          <svg viewBox="0 0 2 2" className="inline h-0.5 w-0.5 fill-current" aria-hidden="true">
            <circle cx="1" cy="1" r="1" />
          </svg>
          <button
            onClick={() => setActiveModule('sandbox')}
            className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer"
          >
            Launch RAM Studio <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="flex flex-1 justify-end" />
      </div>

      {/* Main Top Navigation Bar */}
      <nav className="bg-white shadow-sm dark:bg-[#121212] relative border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex px-2 lg:px-0">
              <button
                onClick={() => setActiveModule('index')}
                className="flex shrink-0 items-center cursor-pointer focus:outline-none"
              >
                <div className="flex flex-nowrap items-center space-x-2.5 whitespace-nowrap">
                  <AllocatorLogoSvg className="h-9 w-9" />
                  <span className="text-xl font-bold tracking-tight text-black dark:text-gray-200">
                    Memory Allocator Guide{' '}
                    <span className="font-normal text-xs text-gray-500 dark:text-gray-400 hidden sm:inline border-l border-gray-300 dark:border-gray-700 pl-2 ml-1">
                      Low-Level C++
                    </span>
                  </span>
                </div>
              </button>

              {/* Desktop Nav Links */}
              <div className="hidden space-x-8 lg:ml-8 lg:flex items-center">
                {/* Course Tier Dropdown */}
                <div
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setTierDropdownOpen(true)}
                  onMouseLeave={() => setTierDropdownOpen(false)}
                >
                  <button
                    type="button"
                    className="text-gray-600 dark:text-dark-high-emphasis inline-flex h-full items-center space-x-1.5 border-b-2 border-transparent pt-0.5 text-base leading-6 font-medium transition hover:border-gray-300 hover:text-gray-900 dark:hover:border-gray-500 cursor-pointer"
                  >
                    <span>{currentTier.name}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400 dark:text-dark-med-emphasis h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {tierDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 w-72 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5 dark:bg-[#1a1d24] dark:ring-gray-700">
                      {tierList.map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => {
                            setSelectedTier(tier.id);
                            setTierDropdownOpen(false);
                          }}
                          className={`flex w-full items-center px-4 py-2.5 text-sm transition cursor-pointer ${
                            progress.selectedTier === tier.id
                              ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-gray-800 dark:text-white'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/60'
                          }`}
                        >
                          <span className={`mr-2.5 h-2.5 w-2.5 rounded-full ${tier.dotColor}`} />
                          <span>{tier.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveModule('stage-0')}
                  className="dark:text-dark-high-emphasis inline-flex h-full items-center border-b-2 border-transparent px-1 pt-0.5 text-base leading-6 font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-900 dark:hover:border-gray-500 cursor-pointer"
                >
                  Using This Guide
                </button>

                <button
                  onClick={() => setActiveModule('sandbox')}
                  className="dark:text-dark-high-emphasis inline-flex h-full items-center border-b-2 border-transparent px-1 pt-0.5 text-base leading-6 font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-900 dark:hover:border-gray-500 cursor-pointer"
                >
                  RAM Sandbox
                </button>

                {/* Resources Dropdown */}
                <div
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setResDropdownOpen(true)}
                  onMouseLeave={() => setResDropdownOpen(false)}
                >
                  <button
                    type="button"
                    className="text-gray-500 dark:text-dark-high-emphasis inline-flex h-full items-center space-x-1.5 border-b-2 border-transparent pt-0.5 text-base leading-6 font-medium transition hover:border-gray-300 hover:text-gray-900 dark:hover:border-gray-500 cursor-pointer"
                  >
                    <span>Resources</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400 dark:text-dark-med-emphasis h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {resDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 w-64 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5 dark:bg-[#1a1d24] dark:ring-gray-700">
                      <button
                        onClick={() => {
                          onOpenGlossary();
                          setResDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        Systems Concept Dictionary
                      </button>
                      <button
                        onClick={() => {
                          setActiveModule('stage-6');
                          setResDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        Bitwise Alignment Calculator
                      </button>
                      <button
                        onClick={() => {
                          setActiveModule('stage-7');
                          setResDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        1M Ops Benchmarks &amp; War Room
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={onOpenGlossary}
                  className="dark:text-dark-high-emphasis inline-flex h-full items-center border-b-2 border-transparent px-1 pt-0.5 text-base leading-6 font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-900 dark:hover:border-gray-500 cursor-pointer"
                >
                  Glossary
                </button>
              </div>
            </div>

            {/* Right Search + XP + Theme Gear */}
            <div className="flex flex-1 items-center justify-end px-2 lg:ml-6 lg:px-0 space-x-3">
              <button
                type="button"
                onClick={onOpenGlossary}
                className="dark:text-dark-high-emphasis inline-flex items-center rounded-md border border-transparent px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-gray-400 dark:text-gray-300"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-2 font-medium">Search</span>
              </button>

              <div className="hidden h-6 self-center border-l border-gray-200 lg:mx-2 lg:block dark:border-gray-700" />

              <span className="hidden sm:inline-flex items-center text-sm font-medium text-gray-600 dark:text-dark-high-emphasis">
                {progress.xp} XP
              </span>

              <button
                onClick={onToggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* Mobile Hamburger */}
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="mobile-menu-button-container inline-flex items-center justify-center p-2 cursor-pointer"
                  aria-label="Main menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] px-4 py-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tierList.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    setSelectedTier(tier.id);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center rounded-md p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <span className={`mr-2 h-2.5 w-2.5 rounded-full ${tier.dotColor}`} />
                  <span>{tier.label}</span>
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => {
                  setActiveModule('stage-0');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white cursor-pointer"
              >
                Start Guide
              </button>
              <button
                onClick={() => {
                  setActiveModule('sandbox');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-sm font-medium cursor-pointer"
              >
                RAM Sandbox
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
