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
  const { progress, setSelectedTier, setModuleStatus, toggleBookmark, isBookmarked, addXp } = useLearner();
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
      <p className="mb-1 flex items-center text-xs sm:text-sm leading-4">
        {[1, 2, 3, 4].map((dotIdx) => (
          <svg
            key={dotIdx}
            className={`mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 transition ${
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
    <main className="w-full overflow-x-hidden">
      {/* Tier Hero Banner */}
      <div className={`${activeTier.bannerBgClass} py-8 sm:py-14 transition-colors duration-200`}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          {/* Tier Switcher Pills inside Hero Banner - Horizontal Scroll on Android */}
          <div className="mb-5 flex overflow-x-auto no-scrollbar gap-1.5 py-1 px-1 justify-start sm:justify-center">
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
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-wide uppercase transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'bg-black/25 text-white/90 hover:bg-black/40 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <h1 className="mb-4 text-center text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight break-words">
            {filterMode === 'all' ? 'Memory Allocator Guide' : activeTier.heroTitle}
          </h1>

          <p className={`${activeTier.bannerTextClass} mb-6 sm:mb-10 px-2 text-center text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed`}>
            {filterMode === 'all'
              ? 'From bare silicon capacitors and C++ pointer envelopes to high-performance Bump Arena, Intrusive Free-List, Knuth Boundary Tags, and P99.99 quant benchmarks.'
              : activeTier.heroSubtitle}
            <br className="hidden sm:inline" />
            {' '}Every module includes an interactive 64-byte RAM simulator and C++20 code execution.{' '}
            <button
              onClick={() => onSelectTopic('stage-0')}
              className="underline font-semibold text-white hover:opacity-90 cursor-pointer whitespace-nowrap"
            >
              Start Stage 0 →
            </button>
          </p>

          {/* Two Progress Cards (Responsive on Mobile and Desktop) */}
          <div className="mx-auto grid max-w-2xl gap-4 sm:gap-6 lg:max-w-full lg:grid-cols-2">
            {/* Card 1: Modules Progress */}
            <div className="bg-white shadow-xs rounded-lg dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="p-4 sm:p-6">
                <h3 className="dark:text-dark-high-emphasis text-sm sm:text-base font-semibold text-gray-900">
                  Modules Progress
                </h3>
                <div className="mt-4">
                  <div className="mb-3 grid grid-cols-4 gap-1.5 sm:gap-2">
                    <div className="text-center">
                      <span className="text-xl sm:text-3xl font-bold text-green-800 dark:text-green-100 bg-green-100 dark:bg-green-800 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full">
                        {completedMods}
                      </span>
                      <span className="mt-1 block text-[10px] sm:text-xs font-semibold uppercase text-green-800 dark:text-green-100 truncate">
                        Completed
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl sm:text-3xl font-bold text-yellow-800 dark:text-yellow-100 bg-yellow-100 dark:bg-yellow-800 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full">
                        {inProgressMods}
                      </span>
                      <span className="mt-1 block text-[10px] sm:text-xs font-semibold uppercase text-yellow-800 dark:text-yellow-100 truncate">
                        In Progress
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl sm:text-3xl font-bold text-blue-800 dark:text-blue-50 bg-blue-50 dark:bg-blue-800 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full">
                        {skippedMods}
                      </span>
                      <span className="mt-1 block text-[10px] sm:text-xs font-semibold uppercase text-blue-800 dark:text-blue-50 truncate">
                        Skipped
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl sm:text-3xl font-bold text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full">
                        {notStartedMods}
                      </span>
                      <span className="mt-1 block text-[10px] sm:text-xs font-semibold uppercase text-gray-800 dark:text-gray-100 truncate">
                        Not Started
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="flex h-3 overflow-hidden bg-gray-200 text-xs dark:bg-gray-700 rounded-full">
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
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {totalModules} modules total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Problems & Labs Progress */}
            <div className="bg-white shadow-xs rounded-lg dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="p-4 sm:p-6">
                <h3 className="dark:text-dark-high-emphasis text-sm sm:text-base font-semibold text-gray-900">
                  Problems &amp; Labs Progress
                </h3>
                <div className="mt-4">
                  <div className="mb-3 grid grid-cols-4 gap-1.5 sm:gap-2">
                    <div className="text-center">
                      <span className="text-xl sm:text-3xl font-bold text-green-800 dark:text-green-100 bg-green-100 dark:bg-green-800 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full">
                        {completedProblems}
                      </span>
                      <span className="mt-1 block text-[10px] sm:text-xs font-semibold uppercase text-green-800 dark:text-green-100 truncate">
                        Completed
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl sm:text-3xl font-bold text-yellow-800 dark:text-yellow-100 bg-yellow-100 dark:bg-yellow-800 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full">
                        {inProgressProblems}
                      </span>
                      <span className="mt-1 block text-[10px] sm:text-xs font-semibold uppercase text-yellow-800 dark:text-yellow-100 truncate">
                        In Progress
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl sm:text-3xl font-bold text-blue-800 dark:text-blue-50 bg-blue-50 dark:bg-blue-800 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full">
                        0
                      </span>
                      <span className="mt-1 block text-[10px] sm:text-xs font-semibold uppercase text-blue-800 dark:text-blue-50 truncate">
                        Skipped
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl sm:text-3xl font-bold text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full">
                        {notStartedProblems}
                      </span>
                      <span className="mt-1 block text-[10px] sm:text-xs font-semibold uppercase text-gray-800 dark:text-gray-100 truncate">
                        Not Started
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="flex h-3 overflow-hidden bg-gray-200 text-xs dark:bg-gray-700 rounded-full">
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
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {totalProblems} challenges total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Dotted-Line Syllabus Tree - Mobile Stacked, Desktop Centered */}
      <div
        id="sec-stages"
        className="syllabus-dotted-line-container mx-auto max-w-7xl space-y-8 sm:space-y-12 px-3 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        {visibleCategories.map((cat, idx) => {
          const catMods = cat.moduleIds.map((id) => ALLOCATOR_MODULES[id]).filter(Boolean);
          const doneInCat = catMods.filter(
            (m) => progress.moduleStatuses?.[m.id] === 'complete'
          ).length;

          return (
            <div key={idx} className="group/category flex flex-col md:flex-row gap-4 md:gap-0">
              {/* Left Column / Mobile Category Header */}
              <div className="flex-1 md:pr-12 md:text-right">
                <h2 className="py-1 md:py-3 text-lg sm:text-2xl font-bold text-gray-800 dark:text-white transition group-hover/category:text-blue-600">
                  {cat.categoryTitle}
                </h2>
                <div className="py-1 md:py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <div className="inline-block align-middle">
                    <div className="flex h-2 w-20 sm:w-24 items-center overflow-hidden rounded-full bg-gray-200 text-xs dark:bg-gray-700">
                      <div
                        style={{
                          width: `${catMods.length ? (doneInCat / catMods.length) * 100 : 0}%`,
                        }}
                        className="h-2 bg-green-500 dark:bg-green-600"
                      />
                    </div>
                  </div>
                  <div className="ml-2 inline-block align-middle font-semibold">
                    {doneInCat}/{catMods.length}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 md:ml-auto md:max-w-sm mt-1">
                  {cat.subtitle}
                </p>
              </div>

              {/* Right Column / Module Nodes */}
              <div className="flex-1 md:pl-12 space-y-3">
                {catMods.map((mod) => {
                  const modStatus = progress.moduleStatuses?.[mod.id] || 'not_started';
                  const bookmarked = isBookmarked(mod.id);

                  return (
                    <span
                      key={mod.id}
                      className={`link-with-progress-container link-with-progress-container--syllabus ${getProgressContainerClass(
                        mod.id
                      )}`}
                    >
                      <div
                        onClick={() => onSelectTopic(mod.id)}
                        className="link-with-progress-link link-with-progress-link--syllabus group py-2.5 sm:py-3 text-base sm:text-lg leading-snug cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 dark:group-hover:text-white flex items-center transition group-hover:text-blue-600 font-semibold text-base sm:text-lg">
                            <span className="mr-2">{mod.title}</span>
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Quick Status Pill */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextSt: ModuleProgressStatus =
                                  modStatus === 'not_started'
                                    ? 'reading'
                                    : modStatus === 'reading' || modStatus === 'practicing'
                                    ? 'complete'
                                    : 'not_started';
                                setModuleStatus(mod.id, nextSt);
                                if (nextSt === 'complete') addXp(100);
                              }}
                              className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full border transition cursor-pointer ${
                                modStatus === 'complete'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-semibold'
                                  : modStatus === 'reading' || modStatus === 'practicing'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-semibold'
                                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400'
                              }`}
                              title="Click to update status: Not Started → In Progress → Complete"
                            >
                              {modStatus === 'complete'
                                ? '🟢 Complete'
                                : modStatus === 'reading' || modStatus === 'practicing'
                                ? '🟡 In Progress'
                                : '⚪ Not Started'}
                            </button>
                          </div>
                        </div>

                        {renderFrequencyDots(mod.frequency, mod.frequencyLabel)}
                        <p className="text-xs sm:text-sm leading-relaxed text-gray-500 dark:text-gray-400 transition group-hover:text-blue-700">
                          {mod.subtitle}
                          <i className="block text-[11px] mt-0.5 text-gray-400 dark:text-gray-500">
                            Updated: {mod.updatedAgo}
                          </i>
                        </p>

                      {/* Quick Section Jump Pills */}
                      {mod.sections.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {mod.sections.map((sec) => (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTopic(mod.id, sec.id);
                              }}
                              className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-blue-100 hover:text-blue-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition cursor-pointer"
                            >
                              {sec.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </span>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
