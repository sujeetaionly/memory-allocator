'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { QuantNote } from '@/components/common/QuantNote';
import { LatencyComparisonChart } from '@/components/benchmark/LatencyComparisonChart';
import { QuizEngine } from '@/components/interview/QuizEngine';
import { FlashcardDeck } from '@/components/interview/FlashcardDeck';
import { ResumeBulletGenerator } from '@/components/interview/ResumeBulletGenerator';

interface Stage7Props {
  onPrevStage?: () => void;
  onSelectTopic: () => void;
}

export const Stage7_QuantCapstone: React.FC<Stage7Props> = ({
  onPrevStage,
  onSelectTopic,
}) => {
  return (
    <DualPaneLayout>
      <article className="lesson-article">
        <header className="article-header" id="sec-stage7-head">
          <div className="text-xs uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider mb-1">
            STAGE 7 — CAPSTONE &amp; CAREER WAR ROOM
          </div>
          <h1 className="article-title">Systems Capstone: Benchmarks &amp; Quant War Room</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Estimated time: 20 mins • P99 Tail Latency • Citadel &amp; Jane Street Interview Prep
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            Congratulations! You have journeyed from physical silicon transistors and numbered memory addresses all the way to engineering production-grade C++ memory allocators.
          </p>
          <p className="prose">
            Now, let&apos;s prove their performance with <strong>empirical benchmarks across 1,000,000 operations</strong> and prepare you to ace top-tier low-latency systems interviews.
          </p>

          {/* Section 7.1 */}
          <section id="sec-stage7-tail" className="lesson-section">
            <h2>7.1 — The Tyranny of Tail Latency (P99 / P99.9)</h2>
            <p className="prose">
              In low-latency systems, <strong>Average Latency is a dangerous lie</strong>. If an algorithm takes 1 microsecond on average, but 1 out of every 1,000 orders takes 500 microseconds due to a heap mutex stall, you will miss market fills and suffer catastrophic trading losses.
            </p>
            <p className="prose">
              Our custom allocators eliminate tail latency spikes completely by bounding every allocation to 1 to 2 CPU clock cycles.
            </p>
          </section>

          {/* Section 7.2 */}
          <section id="sec-stage7-matrix" className="lesson-section">
            <h2>7.2 — Standardized Benchmark Matrix (1,000,000 Operations)</h2>
            <div className="my-4">
              <LatencyComparisonChart />
            </div>

            <QuantNote type="speed" title="COMPILER ESCAPE BARRIERS">
              To prevent optimizing compilers (<code className="code-pill">g++ -O3</code>) from eliminating unused memory allocations as dead code during benchmarks, we inject an escape barrier:
              <br />
              <code className="code-pill font-mono">asm volatile(&quot;&quot; : : &quot;r,m&quot;(ptr) : &quot;memory&quot;);</code>
              <br />
              This forces the compiler to treat the pointer as externally visible, guaranteeing pure empirical latency measurements.
            </QuantNote>
          </section>

          {/* Section 7.3 */}
          <section id="sec-stage7-interview" className="lesson-section">
            <h2>7.3 — Technical Systems &amp; Quant Interview Drills</h2>
            <p className="prose">
              Test your mastery against authentic technical interview questions asked at firms like Citadel, Jane Street, and Optiver:
            </p>

            <div className="my-6">
              <QuizEngine />
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-8 mb-3">
              Spaced-Repetition Recall Flashcards
            </h3>
            <div className="my-4">
              <FlashcardDeck />
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-8 mb-3">
              Generate Portfolio &amp; Resume Bullets
            </h3>
            <div className="my-4">
              <ResumeBulletGenerator />
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {onPrevStage && (
                <button
                  onClick={onPrevStage}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  ◀ Back to Stage 6
                </button>
              )}
              <button
                onClick={onSelectTopic}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Return to Course Hub 🏠
              </button>
            </div>
          </section>
        </div>
      </article>
    </DualPaneLayout>
  );
};
