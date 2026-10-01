'use client';

import React, { useState, useEffect } from 'react';
import { ModuleId } from '@/types';
import { useLearner } from '@/stores/LearnerStore';
import { UniversalRamInspector } from '@/components/virtual-machine/UniversalRamInspector';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';
import { AllocatorLogoSvg } from '@/components/common/Header';
import { ArchitectureFlowDiagram } from '@/components/common/ArchitectureFlowDiagram';
import {
  ALLOCATOR_MODULES,
  COURSE_TIERS,
  COURSE_ROADMAP,
  CourseTierId,
  ModuleProgressStatus,
} from '@/data/allocatorCurriculum';

interface DualPaneLayoutProps {
  children: React.ReactNode;
  interactiveControls?: React.ReactNode;
  customStageId?: ModuleId;
}

export const DualPaneLayout: React.FC<DualPaneLayoutProps> = ({
  children,
  interactiveControls,
  customStageId,
}) => {
  const {
    progress,
    navigateToModule,
    setModuleStatus,
    toggleBookmark,
    isBookmarked,
    addXp,
    toggleResource,
    setSelectedTier,
    sidebarCollapsed,
    setSidebarCollapsed,
    openGlossary,
    isDark,
    toggleTheme,
  } = useLearner();

  const { logs, resetMachine } = useVirtualMachine();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [ramDrawerOpen, setRamDrawerOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Foundations · Physical RAM': true,
    'The C++ Machine & Heap': true,
    'Custom Allocator Engines': true,
    'Hardware Sympathy & Caches': true,
    'Quant Systems & Capstone': true,
  });

  const activeStageId: ModuleId = (customStageId || progress.currentStageId || 'stage-0') as ModuleId;
  const currentMeta = ALLOCATOR_MODULES[activeStageId] || ALLOCATOR_MODULES['stage-0'];
  const currentTierId: CourseTierId = currentMeta.tier || 'foundations';
  const tierMeta = COURSE_TIERS[currentTierId];

  // Auto-expand category containing current active stage
  useEffect(() => {
    if (currentMeta?.category) {
      setExpandedCategories((prev) => ({ ...prev, [currentMeta.category]: true }));
    }
  }, [currentMeta?.category]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSelectModule = (modId: ModuleId, sectionId?: string) => {
    setMobileSidebarOpen(false);
    navigateToModule(modId, sectionId);
  };

  const currentStatus: ModuleProgressStatus =
    progress.moduleStatuses?.[activeStageId] || 'not_started';

  const statusOptions: { id: ModuleProgressStatus; label: string; badgeClass: string }[] = [
    { id: 'not_started', label: 'Not Started', badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
    { id: 'reading', label: 'Reading', badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300' },
    { id: 'practicing', label: 'Practicing', badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300' },
    { id: 'complete', label: 'Complete', badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300' },
    { id: 'skipped', label: 'Skipped', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' },
  ];

  const currentStatusBadge =
    statusOptions.find((s) => s.id === currentStatus) || statusOptions[0];

  const sidebarCategories = COURSE_ROADMAP.map((r) => ({
    category: r.categoryTitle,
    moduleIds: r.moduleIds,
    tier: r.tier,
  }));

  const renderSidebarContent = () => (
    <div className="flex h-screen flex-col bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-800 w-80 select-none">
      {/* Top Brand Header */}
      <div className="flex shrink-0 items-center justify-between pt-5 px-4 pb-2 border-b border-transparent">
        <button
          onClick={() => handleSelectModule('index')}
          className="flex items-center space-x-2 text-left cursor-pointer focus:outline-none"
        >
          <AllocatorLogoSvg className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight text-black dark:text-gray-200">
            Allocator Guide
          </span>
        </button>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition cursor-pointer"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Course Index Quick Link & Roadmap Overview Row */}
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between gap-2 bg-gray-50/70 dark:bg-gray-900/40">
        <button
          onClick={() => handleSelectModule('index')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Course Overview</span>
        </button>

        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
          5 Tiers · 9 Modules
        </span>
      </div>

      {/* Accordion Categories & Module Items */}
      <nav className="flex-1 overflow-y-auto">
        {sidebarCategories.map((group, gIdx) => {
          const isExpanded = expandedCategories[group.category] ?? true;
          const hasActiveModule = group.moduleIds.includes(activeStageId);

          return (
            <div
              key={gIdx}
              className={`border-b border-gray-200 last:border-b-0 dark:border-gray-800 ${
                hasActiveModule ? 'bg-[#f7faff] dark:bg-[#16191f]' : ''
              }`}
            >
              <div
                onClick={() => toggleCategory(group.category)}
                className="relative flex cursor-pointer items-center px-4 py-3 text-sm leading-5 font-semibold transition hover:bg-blue-50 dark:hover:bg-gray-900"
              >
                <span className="flex-1 text-gray-800 dark:text-dark-high-emphasis">
                  {group.category}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {isExpanded && (
                <div className="pb-2">
                  {group.moduleIds.map((mId) => {
                    const mMeta = ALLOCATOR_MODULES[mId];
                    if (!mMeta) return null;
                    const isActive = mId === activeStageId;
                    const st = progress.moduleStatuses?.[mId] || 'not_started';

                    let progressClass = 'link-with-progress-container--default';
                    if (isActive) progressClass = 'link-with-progress-container--active';
                    else if (st === 'complete') progressClass = 'link-with-progress-container--complete';
                    else if (st === 'reading') progressClass = 'link-with-progress-container--reading';
                    else if (st === 'practicing') progressClass = 'link-with-progress-container--practicing';
                    else if (st === 'skipped') progressClass = 'link-with-progress-container--skipped';

                    return (
                      <div
                        key={mId}
                        onClick={() => handleSelectModule(mId)}
                        className={`link-with-progress-container cursor-pointer transition ${progressClass}`}
                      >
                        <div
                          className={`link-with-progress-link py-2 pr-4 pl-12 text-sm leading-snug flex items-center justify-between gap-1.5 ${
                            isActive
                              ? 'link-with-progress-link--active font-semibold'
                              : ''
                          }`}
                        >
                          <span className="truncate">{mMeta.shortTitle || mMeta.title}</span>
                          <span className="text-[10px] shrink-0">
                            {st === 'complete' ? '🟢' : st === 'reading' || st === 'practicing' ? '🟡' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Pinned Footer Rows */}
      <div className="flex shrink-0 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="group flex flex-1 items-center p-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-dark-med-emphasis dark:hover:bg-gray-900 cursor-pointer"
        >
          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{isDark ? 'Theme: Dark' : 'Theme: Light'}</span>
        </button>
      </div>

      <div className="flex shrink-0 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => openGlossary()}
          className="group flex flex-1 items-center p-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-dark-med-emphasis dark:hover:bg-gray-900 cursor-pointer"
        >
          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Concept Glossary</span>
        </button>
      </div>

      <div className="flex shrink-0 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setRamDrawerOpen(true)}
          className="group flex flex-1 items-center p-3.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-900 cursor-pointer"
        >
          <span className="mr-3 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live RAM Studio (64B)</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-high-emphasis">
      {/* Desktop Fixed Left Sidebar */}
      {!sidebarCollapsed && (
        <aside
          className="fixed top-0 bottom-0 left-0 z-20 hidden lg:block w-80"
          style={{ width: '20rem' }}
        >
          {renderSidebarContent()}
        </aside>
      )}

      {/* Floating Reopen Button if Sidebar is Collapsed on Desktop */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="fixed bottom-6 left-6 z-40 hidden lg:flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition cursor-pointer"
          title="Open sidebar"
        >
          <AllocatorLogoSvg className="h-5 w-5 text-white" />
          <span>Open Guide Sidebar</span>
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-dark-surface shadow-2xl">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Mobile Sticky Top Header - Matched to USACO Guide Android layout */}
      <div className="sticky inset-x-0 top-0 z-30 flex items-center justify-between bg-white dark:bg-[#121212] px-2 py-1.5 shadow-xs border-b border-gray-200 dark:border-gray-800 lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Open sidebar navigation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 px-2 truncate text-center">
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
            {currentMeta.shortTitle || currentMeta.title}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {currentMeta.prevModule && (
            <button
              onClick={() => handleSelectModule(currentMeta.prevModule!)}
              className="p-1.5 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Previous module"
            >
              ◀ Prev
            </button>
          )}
          {currentMeta.nextModule && (
            <button
              onClick={() => handleSelectModule(currentMeta.nextModule!)}
              className="p-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-white rounded hover:bg-blue-50 dark:hover:bg-gray-800"
              title="Next module"
            >
              Next ▶
            </button>
          )}
          <button
            onClick={() => setRamDrawerOpen(true)}
            className="ml-1 px-2 py-1 text-[11px] font-semibold rounded bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 cursor-pointer"
            title="Open RAM Studio"
          >
            RAM
          </button>
        </div>
      </div>

      {/* Main Content Flow - Uses lg:pl-80 to offset fixed sidebar perfectly without overflow */}
      <main
        className={`relative min-h-screen pt-6 focus:outline-none lg:pt-4 transition-[padding] duration-200 ${
          sidebarCollapsed ? 'lg:pl-0' : 'lg:pl-80'
        }`}
      >
        <div className="mx-auto flex justify-center px-4 sm:px-6 lg:px-8">
          {/* Column 3: Right Sticky Column (2xl screens: Table of Contents + Mini RAM Telemetry) */}
          <div className="order-last mt-10 ml-8 hidden w-72 shrink-0 2xl:block">
            <div className="sticky top-6 space-y-6">
              {/* Table of Contents */}
              <div>
                <h2 className="dark:text-dark-med-emphasis mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Table of Contents
                </h2>
                <div className="space-y-1">
                  {currentMeta.sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block text-sm text-gray-600 hover:underline hover:text-blue-600 dark:text-dark-med-emphasis dark:hover:text-dark-high-emphasis transition"
                    >
                      {sec.title}
                    </a>
                  ))}
                </div>
              </div>

              <hr className="dark:border-gray-800" />

              {/* Sticky Mini RAM Studio Widget */}
              <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3 bg-gray-50/60 dark:bg-[#16191f]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live RAM State
                  </span>
                  <button
                    onClick={() => setRamDrawerOpen(true)}
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400 font-semibold cursor-pointer"
                  >
                    Expand ↗
                  </button>
                </div>
                <UniversalRamInspector />
              </div>
            </div>
          </div>

          {/* Center Content Column (max-w-4xl) */}
          <div className="w-full min-w-0 flex-1 max-w-4xl">
              {/* Top Desktop Breadcrumb & Prev/Next Bar */}
              <div className="hidden lg:block mb-6">
                <div className="flex sm:justify-between items-center">
                  {/* Prev Button */}
                  {currentMeta.prevModule ? (
                    <button
                      onClick={() => handleSelectModule(currentMeta.prevModule!)}
                      className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-dark-med-emphasis dark:hover:text-dark-high-emphasis transition cursor-pointer"
                    >
                      <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Prev
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-300 dark:text-dark-disabled-emphasis pointer-events-none">
                      <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Prev
                    </span>
                  )}

                  {/* Breadcrumb Links */}
                  <nav className="flex flex-wrap items-center text-sm font-medium text-gray-500 dark:text-dark-med-emphasis">
                    <button
                      onClick={() => handleSelectModule('index')}
                      className="hover:text-gray-700 dark:hover:text-dark-high-emphasis transition cursor-pointer"
                    >
                      Home
                    </button>
                    <svg className="mx-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <button
                      onClick={() => {
                        setSelectedTier(currentTierId);
                        handleSelectModule('index');
                      }}
                      className="hover:text-gray-700 dark:hover:text-dark-high-emphasis transition cursor-pointer"
                    >
                      {tierMeta.name}
                    </button>
                    <svg className="mx-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-900 dark:text-dark-high-emphasis font-semibold">
                      {currentMeta.shortTitle || currentMeta.title}
                    </span>
                  </nav>

                  {/* Next Button */}
                  {currentMeta.nextModule ? (
                    <button
                      onClick={() => handleSelectModule(currentMeta.nextModule!)}
                      className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-dark-med-emphasis dark:hover:text-dark-high-emphasis transition cursor-pointer"
                    >
                      Next
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-300 dark:text-dark-disabled-emphasis pointer-events-none">
                      Next
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              {/* Module Title Header Block */}
              <div className="mb-8 sm:mb-10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-dark-high-emphasis leading-tight break-words">
                      {currentMeta.title}
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-dark-med-emphasis">
                      Authors: {currentMeta.authors}
                      {currentMeta.contributors ? ` · ${currentMeta.contributors}` : ''}
                    </p>
                    <p className="mt-2.5 text-xs sm:text-sm italic text-gray-600 dark:text-gray-300 leading-relaxed">
                      {currentMeta.subtitle}
                    </p>
                  </div>

                  {/* Module Status Dropdown */}
                  <div className="relative shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                      className={`inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition cursor-pointer ${currentStatusBadge.badgeClass}`}
                    >
                      <span>{currentStatusBadge.label}</span>
                      <svg className="ml-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {statusDropdownOpen && (
                      <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-gray-700">
                        {statusOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setModuleStatus(activeStageId, opt.id);
                              setStatusDropdownOpen(false);
                            }}
                            className={`flex w-full items-center px-4 py-2 text-left text-sm cursor-pointer ${
                              currentStatus === opt.id
                                ? 'bg-blue-50 font-bold text-blue-700 dark:bg-gray-700 dark:text-white'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/60'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dark Navy Action Bar */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-gray-100 px-4 py-2.5 text-xs text-gray-700 dark:bg-[#111827] dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Language:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">C++20</span>
                  </div>

                  <button
                    onClick={() => setRamDrawerOpen(true)}
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                  >
                    <span>⚡ Live 64-Byte RAM Studio</span>
                    <span className="text-[10px]">↗</span>
                  </button>
                </div>
              </div>

              {/* Inline Table of Contents on < 2xl screens */}
              <div className="2xl:hidden mb-8">
                <h2 className="dark:text-dark-high-emphasis mt-6 mb-2.5 font-bold tracking-wider text-gray-500 uppercase text-xs">
                  Table of Contents
                </h2>
                <div className="space-y-1.5">
                  {currentMeta.sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block text-sm text-gray-600 hover:underline hover:text-blue-600 dark:text-dark-med-emphasis dark:hover:text-dark-high-emphasis transition"
                    >
                      {sec.title}
                    </a>
                  ))}
                </div>
                <hr className="my-6 dark:border-gray-700" />
              </div>

              {/* Purple Resources Table */}
              {currentMeta.resources?.length > 0 && (
                <div className="mb-10 sm:mb-12 overflow-x-auto rounded-lg border border-gray-200 shadow-xs dark:border-gray-800">
                  <table className="min-w-[480px] sm:min-w-full text-sm">
                    <thead>
                      <tr>
                        <th
                          colSpan={4}
                          className="border-b border-gray-200 bg-purple-50 px-4 py-3 text-left text-xs font-semibold tracking-wider text-purple-700 uppercase dark:border-gray-800 dark:bg-purple-700/25 dark:text-purple-200"
                        >
                          Resources &amp; Core Prerequisites
                        </th>
                      </tr>
                    </thead>
                    <tbody className="table-alternating-stripes divide-y divide-gray-200 dark:divide-gray-800">
                      {currentMeta.resources.map((res) => {
                        const isDone = progress.completedResources?.includes(res.id);
                        return (
                          <tr key={res.id} className="transition-colors">
                            {/* Checkbox */}
                            <td className="w-10 px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => toggleResource(res.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                title="Mark resource complete"
                              />
                            </td>

                            {/* Source Tag Badge */}
                            <td className="px-3 py-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-dark-med-emphasis">
                              <span
                                className="cursor-pointer border-b border-dashed border-gray-400 dark:border-gray-600"
                                title={res.sourceTooltip}
                              >
                                {res.source}
                              </span>
                            </td>

                            {/* Title Link */}
                            <td className="px-3 py-3 font-medium text-gray-900 dark:text-dark-high-emphasis">
                              {res.sectionId ? (
                                <a
                                  href={`#${res.sectionId}`}
                                  className="text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {res.title}
                                </a>
                              ) : (
                                <span>{res.title}</span>
                              )}
                            </td>

                            {/* Description */}
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-dark-med-emphasis hidden sm:table-cell">
                              {res.description}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Interactive Architecture Flow Diagram */}
              <div id={`sec-${activeStageId}-flow`} className="my-8 sm:my-10">
                <ArchitectureFlowDiagram stageId={activeStageId} />
              </div>

              {/* Main Markdown Article Content */}
              <div className="markdown">{children}</div>

              {/* Inline Interactive RAM Studio & Controls Card (Only rendered on stages that provide active controls like Stage 0) */}
              {interactiveControls && (
                <div className="my-10 sm:my-12 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-7 bg-gray-50/70 dark:bg-[#16191f] shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Interactive 64-Byte RAM Studio &amp; Hardware Telemetry
                      </h3>
                    </div>
                    <button
                      onClick={resetMachine}
                      className="text-xs font-mono text-gray-500 hover:text-red-500 transition cursor-pointer"
                    >
                      ↺ Reset RAM Buffer
                    </button>
                  </div>

                  <div className="space-y-4">
                    <UniversalRamInspector />

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Module Laboratory Controls:
                      </div>
                      {interactiveControls}
                    </div>

                    {/* Hardware Bus Event Log */}
                    <div className="rounded bg-black p-3 font-mono text-xs text-slate-300">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 mb-2 text-[11px] text-gray-400">
                        <span>HARDWARE BUS TELEMETRY</span>
                        <span className="text-emerald-400 text-[10px]">● ACTIVE</span>
                      </div>
                      <div className="h-28 overflow-y-auto space-y-1">
                        {logs.slice(0, 8).map((lg, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-gray-500 select-none shrink-0">{lg.time}</span>
                            <span
                              className={
                                lg.type === 'alloc'
                                  ? 'text-emerald-400'
                                  : lg.type === 'free'
                                  ? 'text-cyan-400'
                                  : lg.type === 'warn'
                                  ? 'text-amber-400'
                                  : 'text-gray-300'
                              }
                            >
                              {lg.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Unified Lesson Completion, Bookmarking & Navigation Bar */}
              <div className="my-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16191f] shadow-sm p-5 sm:p-6 space-y-5">
                {/* Top Row: Module Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Stage Progress:
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${currentStatusBadge.badgeClass}`}>
                        {currentStatus === 'complete'
                          ? 'Completed'
                          : currentStatus === 'reading' || currentStatus === 'practicing'
                          ? 'In Progress'
                          : 'Not Started'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Update your milestone as you read and complete the challenges.
                    </p>
                  </div>

                  {/* Clean Status Switcher */}
                  <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800 text-xs font-medium">
                    <button
                      onClick={() => setModuleStatus(activeStageId, 'not_started')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentStatus === 'not_started'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs font-semibold'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      ⚪ Not Started
                    </button>
                    <button
                      onClick={() => setModuleStatus(activeStageId, 'reading')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentStatus === 'reading' || currentStatus === 'practicing'
                          ? 'bg-amber-500 text-white shadow-xs font-semibold'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      🟡 In Progress
                    </button>
                    <button
                      onClick={() => {
                        setModuleStatus(activeStageId, 'complete');
                        addXp(100);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentStatus === 'complete'
                          ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      🟢 Completed (+100 XP)
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Navigation between stages */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  {currentMeta.prevModule ? (
                    <button
                      onClick={() => handleSelectModule(currentMeta.prevModule!)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-xs transition cursor-pointer"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="truncate">Previous: {currentMeta.prevLabel || 'Previous Module'}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentMeta.nextModule ? (
                    <button
                      onClick={() => {
                        if (currentStatus === 'not_started') {
                          setModuleStatus(activeStageId, 'reading');
                        }
                        handleSelectModule(currentMeta.nextModule!);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs sm:text-sm font-semibold text-white shadow-sm transition cursor-pointer"
                    >
                      <span>Proceed to Next: {currentMeta.nextLabel || 'Next Stage'}</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectModule('index')}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-semibold text-white shadow-sm transition cursor-pointer"
                    >
                      <span>Return to Course Syllabus ✓</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

      {/* Slide-Over RAM Studio Drawer (available on all viewports) */}
      {ramDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setRamDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-dark-surface border-l border-gray-200 dark:border-gray-800 shadow-2xl p-6 flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Live 64-Byte Hardware RAM Studio
                  </h2>
                </div>
                <button
                  onClick={() => setRamDrawerOpen(false)}
                  className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                <UniversalRamInspector />

                {interactiveControls && (
                  <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#16191f]">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Interactive Controls
                    </div>
                    {interactiveControls}
                  </div>
                )}

                <div className="rounded-md bg-black p-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-1 mb-2 text-[10px] text-gray-400">
                    <span>BUS EVENT LOG</span>
                    <button
                      onClick={resetMachine}
                      className="text-gray-400 hover:text-red-400 text-[10px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="h-36 overflow-y-auto space-y-1">
                    {logs.map((lg, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-gray-500">{lg.time}</span>
                        <span
                          className={
                            lg.type === 'alloc'
                              ? 'text-emerald-400'
                              : lg.type === 'free'
                              ? 'text-cyan-400'
                              : lg.type === 'warn'
                              ? 'text-amber-400'
                              : 'text-gray-300'
                          }
                        >
                          {lg.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
