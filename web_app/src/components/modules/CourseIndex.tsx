'use client';

import React, { useState } from 'react';
import { ModuleId } from '@/types';
import { useLearner } from '@/stores/LearnerStore';
import {
  COURSE_TIERS,
  ALLOCATOR_MODULES,
  CourseTierId,
  ModuleProgressStatus,
} from '@/data/allocatorCurriculum';

interface CourseIndexProps {
  onSelectTopic: (moduleId: ModuleId, sectionId?: string) => void;
}

export const CourseIndex: React.FC<CourseIndexProps> = ({ onSelectTopic }) => {
  const { progress, setSelectedTier } = useLearner();
  const [filterMode, setFilterMode] = useState<'all' | CourseTierId>('all');

  const activeTier = COURSE_TIERS[progress.selectedTier || 'foundations'];

  const allModulesList = [
    ALLOCATOR_MODULES['stage-0'],
    ALLOCATOR_MODULES['stage-1'],
    ALLOCATOR_MODULES['stage-2'],
    ALLOCATOR_MODULES['stage-3'],
    ALLOCATOR_MODULES['stage-4'],
    ALLOCATOR_MODULES['stage-5'],
    ALLOCATOR_MODULES['stage-6'],
    ALLOCATOR_MODULES['stage-7'],
    ALLOCATOR_MODULES['sandbox'],
  ];

  // Calculate module status counts
  const totalModules = allModulesList.length;
  let completedMods = 0;
  let inProgressMods = 0;
  let skippedMods = 0;
  let notStartedMods = 0;

  allModulesList.forEach((m) => {
    const st: ModuleProgressStatus = progress.moduleStatuses?.[m.id] || 'not_started';
    if (st === 'complete') completedMods++;
    else if (st === 'reading' || st === 'practicing') inProgressMods++;
    else if (st === 'skipped') skippedMods++;
    else notStartedMods++;
  });

  // Calculate problems / interactive challenges progress
  const totalProblems = 18;
  const completedProblems = progress.completedChallenges.length;
  const inProgressProblems = completedProblems > 0 && completedProblems < totalProblems ? 2 : 0;
  const notStartedProblems = Math.max(0, totalProblems - completedProblems - inProgressProblems);

  const syllabusCategories: {
    categoryTitle: string;
    tier: CourseTierId;
    subtitle: string;
    moduleIds: ModuleId[];
  }[] = [
    {
      categoryTitle: 'Getting Started · Physical RAM',
      tier: 'foundations',
      subtitle: 'Physical silicon capacitors, 8-bit bytes, hexadecimal offsets, and the 64-byte hardware lab.',
      moduleIds: ['stage-0', 'sandbox'],
    },
    {
      categoryTitle: 'The C++ Machine & Heap',
      tier: 'machine-model',
      subtitle: 'How C++ types map to byte spans, pointers as address envelopes, stack frames, and the OS heap bottleneck.',
      moduleIds: ['stage-1', 'stage-2'],
    },
    {
      categoryTitle: 'Custom Allocator Engines',
      tier: 'allocator-engines',
      subtitle: 'Production C++20 memory allocators: Bump Arena (42x), Free-List (125x), and Knuth Boundary Tags.',
      moduleIds: ['stage-3', 'stage-4', 'stage-5'],
    },
    {
      categoryTitle: 'Hardware Sympathy & Caches',
      tier: 'hardware-sympathy',
      subtitle: '1-cycle bitwise alignment math, 64-byte L1 cache lines, struct padding elimination, and false sharing.',
      moduleIds: ['stage-6'],
    },
    {
      categoryTitle: 'Quant Systems & Capstone',
      tier: 'quant-capstone',
      subtitle: 'P99.99 tail latency, 1,000,000-op benchmarks, flashcards, quiz, and resume bullet generator.',
      moduleIds: ['stage-7'],
    },
  ];

  const visibleCategories =
    filterMode === 'all'
      ? syllabusCategories
      : syllabusCategories.filter((c) => c.tier === filterMode);

  const getProgressContainerClass = (modId: string) => {
    const st = progress.moduleStatuses?.[modId] || 'not_started';
    if (st === 'complete') return 'link-with-progress-container--complete';
    if (st === 'reading') return 'link-with-progress-container--reading';
    if (st === 'practicing') return 'link-with-progress-container--practicing';
    if (st === 'skipped') return 'link-with-progress-container--skipped';
    return 'link-with-progress-container--default';
  };

  const renderFrequencyDots = (freq: number, label?: string) => {
    if (!freq) return null;
    const isVery = freq >= 4;
    const activeDotClass = isVery
      ? 'text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400'
      : 'text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400';
    const labelHoverClass = isVery
      ? 'text-gray-500 group-hover:text-green-700 dark:group-hover:text-green-400'
      : 'text-gray-500 group-hover:text-teal-700 dark:group-hover:text-teal-400';

    return (
      <p className="mb-1 flex items-center text-sm leading-4">
        {[1, 2, 3, 4].map((dotIdx) => (
          <svg
            key={dotIdx}
            className={`mr-0.5 h-2.5 w-2.5 transition ${
              dotIdx <= freq ? activeDotClass : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx="4" cy="4" r="3" />
          </svg>
        ))}
        <span className={`ml-1 transition ${labelHoverClass}`}>
          {label || 'Essential Architecture'}
        </span>
      </p>
    );
  };

  return (
    <main className="w-full">
      {/* Tier Hero Banner */}
      <div className={`${activeTier.bannerBgClass} py-12 sm:py-16 transition-colors duration-200`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tier Switcher Pills inside Hero Banner */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {(
              [
                { id: 'all', label: 'All Tiers' },
                { id: 'foundations', label: 'Foundations' },
                { id: 'machine-model', label: 'C++ Machine' },
                { id: 'allocator-engines', label: 'Allocators' },
                { id: 'hardware-sympathy', label: 'Hardware Sympathy' },
                { id: 'quant-capstone', label: 'Quant Capstone' },
              ] as const
            ).map((tab) => {
              const isSelected =
                tab.id === 'all'
                  ? filterMode === 'all'
                  : filterMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterMode(tab.id);
                    if (tab.id !== 'all') {
                      setSelectedTier(tab.id);
                    }
                  }}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide uppercase transition cursor-pointer ${
                    isSelected
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'bg-black/25 text-white/85 hover:bg-black/40 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <h1 className="mb-6 text-center text-4xl leading-10 font-black tracking-tight text-white sm:leading-none sm:text-5xl md:text-6xl">
            {filterMode === 'all' ? 'Memory Allocator Guide' : activeTier.heroTitle}
          </h1>

          <p className={`${activeTier.bannerTextClass} mb-8 px-4 text-center sm:mb-12 max-w-3xl mx-auto leading-relaxed`}>
            {filterMode === 'all'
              ? 'From bare silicon capacitors and C++ pointer envelopes to high-performance Bump Arena, Intrusive Free-List, Knuth Boundary Tags, and P99.99 quant benchmarks.'
              : activeTier.heroSubtitle}
            <br />
            Every module includes an interactive 64-byte hardware RAM simulator, step-by-step C++20 code execution, and hands-on micro-challenges.{' '}
            <button
              onClick={() => onSelectTopic('stage-0')}
              className="underline font-semibold text-white hover:opacity-90 cursor-pointer"
            >
              Start with Stage 0 (Using This Guide) →
            </button>
          </p>

          {/* Two Progress Cards (Modules Progress & Problems Progress) */}
          <div className="mx-auto grid max-w-2xl gap-8 lg:max-w-full lg:grid-cols-2">
            {/* Card 1: Modules Progress */}
            <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-900">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="dark:text-dark-high-emphasis text-lg leading-6 font-medium text-gray-900">
                  Modules Progress
                </h3>
                <div className="mt-6">
                  <div className="mb-4 grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-green-800 dark:text-green-100 bg-green-100 dark:bg-green-800 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        {completedMods}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-medium uppercase text-green-800 dark:text-green-100">
                        Completed
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-yellow-800 dark:text-yellow-100 bg-yellow-100 dark:bg-yellow-800 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        {inProgressMods}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-medium uppercase text-yellow-800 dark:text-yellow-100">
                        In Progress
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-blue-800 dark:text-blue-50 bg-blue-50 dark:bg-blue-800 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        {skippedMods}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-medium uppercase text-blue-800 dark:text-blue-50">
                        Skipped
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        {notStartedMods}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-medium uppercase text-gray-800 dark:text-gray-100">
                        Not Started
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="flex h-4 overflow-hidden bg-gray-200 text-xs dark:bg-gray-700 rounded">
                      <div
                        style={{ width: `${(completedMods / totalModules) * 100}%` }}
                        className="flex flex-col justify-center bg-green-500 text-center whitespace-nowrap text-white shadow-none dark:bg-green-700"
                      />
                      <div
                        style={{ width: `${(inProgressMods / totalModules) * 100}%` }}
                        className="flex flex-col justify-center bg-yellow-400 text-center whitespace-nowrap text-white shadow-none dark:bg-yellow-600"
                      />
                      <div
                        style={{ width: `${(skippedMods / totalModules) * 100}%` }}
                        className="flex flex-col justify-center bg-blue-500 text-center whitespace-nowrap text-white shadow-none dark:bg-blue-700"
                      />
                    </div>
                    <div className="text-right mt-1">
                      <span className="dark:text-dark-med-emphasis inline-block text-sm font-semibold text-gray-800">
                        {totalModules} total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Problems & Labs Progress */}
            <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-900">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="dark:text-dark-high-emphasis text-lg leading-6 font-medium text-gray-900">
                  Problems &amp; Labs Progress
                </h3>
                <div className="mt-6">
                  <div className="mb-4 grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-green-800 dark:text-green-100 bg-green-100 dark:bg-green-800 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        {completedProblems}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-medium uppercase text-green-800 dark:text-green-100">
                        Completed
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-yellow-800 dark:text-yellow-100 bg-yellow-100 dark:bg-yellow-800 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        {inProgressProblems}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-medium uppercase text-yellow-800 dark:text-yellow-100">
                        In Progress
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-blue-800 dark:text-blue-50 bg-blue-50 dark:bg-blue-800 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        0
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-medium uppercase text-blue-800 dark:text-blue-50">
                        Skipped
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        {notStartedProblems}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-medium uppercase text-gray-800 dark:text-gray-100">
                        Not Started
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="flex h-4 overflow-hidden bg-gray-200 text-xs dark:bg-gray-700 rounded">
                      <div
                        style={{ width: `${(completedProblems / totalProblems) * 100}%` }}
                        className="flex flex-col justify-center bg-green-500 text-center whitespace-nowrap text-white shadow-none dark:bg-green-700"
                      />
                      <div
                        style={{ width: `${(inProgressProblems / totalProblems) * 100}%` }}
                        className="flex flex-col justify-center bg-yellow-400 text-center whitespace-nowrap text-white shadow-none dark:bg-yellow-600"
                      />
                    </div>
                    <div className="text-right mt-1">
                      <span className="dark:text-dark-med-emphasis inline-block text-sm font-semibold text-gray-800">
                        {totalProblems} total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Dotted-Line Syllabus Tree */}
      <div
        id="sec-stages"
        className="syllabus-dotted-line-container mx-auto max-w-7xl space-y-8 px-4 py-12"
      >
        {visibleCategories.map((cat, idx) => {
          const catMods = cat.moduleIds.map((id) => ALLOCATOR_MODULES[id]).filter(Boolean);
          const doneInCat = catMods.filter(
            (m) => progress.moduleStatuses?.[m.id] === 'complete'
          ).length;

          return (
            <div key={idx} className="group/category flex flex-col md:flex-row">
              {/* Left Column: Category Title, Mini Progress Bar, Description */}
              <div className="flex-1 pr-12 md:text-right">
                <h2 className="dark:text-dark-med-emphasis dark:group-hover/category:text-dark-high-emphasis py-3 text-2xl leading-6 font-semibold text-gray-600 transition group-hover/category:text-gray-900">
                  {cat.categoryTitle}
                </h2>
                <div className="dark:text-dark-med-emphasis dark:group-hover/category:text-dark-high-emphasis py-2 leading-6 text-gray-500 transition group-hover/category:text-gray-800">
                  <div className="inline-block align-middle">
                    <div className="flex h-2 w-24 items-center overflow-hidden rounded-full bg-gray-200 text-xs dark:bg-gray-700">
                      <div
                        style={{
                          width: `${catMods.length ? (doneInCat / catMods.length) * 100 : 0}%`,
                        }}
                        className="h-2 bg-green-500 dark:bg-green-600"
                      />
                    </div>
                  </div>
                  <div className="ml-2 inline-block align-middle">
                    <span className="text-sm font-semibold">
                      {doneInCat}/{catMods.length}
                    </span>
                  </div>
                </div>
                <p className="dark:group-hover/category:text-dark-med-emphasis text-sm text-gray-400 transition group-hover/category:text-gray-600 md:ml-auto md:max-w-sm dark:text-gray-500">
                  {cat.subtitle}
                </p>
              </div>

              {/* Right Column: Module Nodes with Center Line Circles & Frequency Dots */}
              <div className="flex-1 pl-12 space-y-2">
                {catMods.map((mod) => (
                  <span
                    key={mod.id}
                    className={`link-with-progress-container link-with-progress-container--syllabus ${getProgressContainerClass(
                      mod.id
                    )}`}
                  >
                    <div
                      onClick={() => onSelectTopic(mod.id)}
                      className="link-with-progress-link link-with-progress-link--syllabus group py-3 text-xl leading-6 cursor-pointer"
                    >
                      <p className="text-gray-800 dark:text-gray-200 dark:group-hover:text-white mb-1 flex items-center transition group-hover:text-blue-700 font-medium">
                        <span className="mr-2 inline-flex items-end">{mod.title}</span>
                      </p>
                      {renderFrequencyDots(mod.frequency, mod.frequencyLabel)}
                      <p className="dark:group-hover:text-dark-high-emphasis block text-sm leading-5 text-gray-500 dark:text-gray-400 transition group-hover:text-blue-700">
                        {mod.subtitle}
                        <i>
                          <br />
                          Updated: {mod.updatedAgo}
                        </i>
                      </p>

                      {/* Quick Section Jump Pills */}
                      {mod.sections.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {mod.sections.map((sec) => (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTopic(mod.id, sec.id);
                              }}
                              className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-blue-100 hover:text-blue-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition cursor-pointer"
                            >
                              {sec.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
