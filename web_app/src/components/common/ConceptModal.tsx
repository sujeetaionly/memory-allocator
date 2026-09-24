'use client';

import React, { useState, useEffect } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { ConceptDefinition } from '@/types';

interface ConceptModalProps {
  conceptId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectConcept: (id: string) => void;
}

export const ConceptModal: React.FC<ConceptModalProps> = ({
  conceptId,
  isOpen,
  onClose,
  onSelectConcept,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeConcept: ConceptDefinition =
    (conceptId && CONCEPTS[conceptId]) || CONCEPTS['thread'];

  const allConceptList = Object.values(CONCEPTS).filter(
    (c) =>
      c.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white font-mono font-bold text-xs px-2 py-0.5 rounded-md shadow-xs">
              c++
            </div>
            <span className="font-extrabold text-xs sm:text-sm tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              SYSTEMS CONCEPT DICTIONARY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {Object.keys(CONCEPTS).length} Terms
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-base transition-colors"
            title="Close dictionary (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Split view */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Search & Concept Selector */}
          <div className="md:col-span-4 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col p-3.5 overflow-hidden">
            <div className="relative mb-2.5">
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
              />
              <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 select-none">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {allConceptList.map((item) => {
                const isSelected = item.id === activeConcept.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectConcept(item.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all block ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.term}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div
                      className={`text-[10.5px] truncate mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Concept Card */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-4 text-xs sm:text-sm bg-white dark:bg-slate-900 scrollbar-thin">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {activeConcept.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {activeConcept.term}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {activeConcept.tagline}
              </p>
            </div>

            {/* Mental Model Analogy */}
            <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase font-mono tracking-wider">
                <span>💡</span>
                <span>Real-World Intuitive Analogy:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-[13px] pl-5">
                {activeConcept.analogy}
              </p>
            </div>

            {/* Plain English */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm block">
                In Plain English:
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeConcept.inPlainEnglish}
              </p>
            </div>

            {/* How Hardware Works */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1.5 font-mono text-xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                <span>⚡</span>
                <span>How Computer Hardware Runs This:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-sans text-xs sm:text-[12.5px] leading-relaxed pl-5">
                {activeConcept.howHardwareWorks}
              </p>
            </div>

            {/* Why Quant Developers Care */}
            <div className="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold uppercase font-mono tracking-wider text-[11px]">
                <span>📊</span>
                <span>Why Quant Developers &amp; Systems Engineers Care:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-[12.5px] pl-5">
                {activeConcept.whyQuantsCare}
              </p>
            </div>

            {/* Code Snippet */}
            {activeConcept.codeSnippet && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs shadow-md">
                <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>code_example.cpp</span>
                  <span className="text-[10px] text-blue-400">C++20</span>
                </div>
                <pre className="p-3.5 text-blue-300 overflow-x-auto leading-relaxed">
                  {activeConcept.codeSnippet}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold">Esc</kbd> anytime to exit
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-xs"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  );
};
