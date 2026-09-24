'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { MicroChallengeEngine } from '@/components/common/MicroChallengeEngine';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { QuantNote } from '@/components/common/QuantNote';
import { BitwiseAlignmentLab } from '@/components/simulators/BitwiseAlignmentLab';
import { CacheLineVisualizer } from '@/components/simulators/CacheLineVisualizer';

interface Module4Props {
  onSelectConcept: (id: string) => void;
  onNextModule: () => void;
  onPrevModule?: () => void;
}

export const Module4_BitwiseCache: React.FC<Module4Props> = ({
  onSelectConcept,
  onNextModule,
  onPrevModule,
}) => {
  const challenge1 = {
    id: 'c-bitwise-align',
    stageId: 'stage-6',
    title: 'Bitwise Alignment Math Intuition',
    scenario:
      'A pointer currently rests at offset 0x05 (decimal 5). You need to allocate an 8-byte aligned object (align = 8).',
    question: 'What is the next 8-byte aligned address?',
    options: ['0x06', '0x08', '0x10', '0x00'],
    correctIndex: 1,
    hint: '8-byte aligned means the address must be divisible by 8 (0, 8, 16, 24...).',
    explanation:
      'Starting at 5, the next multiple of 8 is 8 (0x08 in hex). The allocator must insert 3 padding bytes (at offsets 5, 6, 7) so the object begins cleanly at 8!',
    xpReward: 140,
  };

  const challenge2 = {
    id: 'c-bitwise-false-sharing',
    stageId: 'stage-6',
    title: 'The Hidden False Sharing Trap',
    scenario:
      'Thread A on Core 0 constantly updates variable `x`. Thread B on Core 1 constantly updates variable `y`. Both variables sit right next to each other in the same 64-byte chunk of RAM.',
    question: 'Why does this cause massive performance slowdown across both CPU cores?',
    options: [
      'The CPU switches into single-core mode.',
      'False Sharing: Whenever Core 0 writes to `x`, the hardware cache coherency protocol (MESI) invalidates Core 1\'s entire 64B cache line, forcing Core 1 to constantly stall and re-fetch!',
      'The memory short-circuits.',
      'The variables overwrite each other.',
    ],
    correctIndex: 1,
    hint: 'Remember that CPUs never load individual bytes; they load 64 bytes at a time into cache.',
    explanation:
      'Because `x` and `y` share the same 64-byte line, writing to `x` marks the whole line dirty in hardware! Core 1 is forced to evict its L1 cache and reload from RAM. The fix is `alignas(64)` to put each variable on its own private cache line!',
    xpReward: 160,
  };

  return (
    <DualPaneLayout>
      <article className="lesson-article">
        <header className="article-header" id="sec-p4-head">
          <div className="text-xs uppercase font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
            STAGE 6 — HARDWARE REALITY
          </div>
          <h1 className="article-title">Bitwise Alignment Math &amp; The 64-Byte Cache Line</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Estimated time: 15 mins • Mechanical Sympathy • 1-Cycle Alignment Formula
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            In ultra-low latency systems, mechanical sympathy with CPU architecture separates ordinary software from sub-microsecond engines.
          </p>
          <p className="prose">
            CPUs do not read individual bytes; they load <strong>aligned 64-byte blocks into cache lines</strong>. Misaligned memory causes split bus transactions and CPU pipeline stalls.
          </p>

          {/* Section 4.2 */}
          <section id="sec-p4-formula" className="lesson-section">
            <h2>6.1 — 1-Clock-Cycle Bitwise Alignment Formula</h2>
            <p className="prose">
              CPUs require pointers to be aligned to multiples of their type size (e.g. 8-byte integers must sit at addresses divisible by 8).
              Standard code uses modulo division (<code className="code-pill">addr % align</code>). But hardware integer division (<code className="code-pill">idiv</code>) takes <strong>15 to 25 CPU clock cycles</strong>!
            </p>

            <div className="aside-card formula-aside my-4">
              <div className="aside-title">The Standard 1-Cycle Bitwise Alignment Formula</div>
              <div className="formula-text font-mono text-sm py-2 text-blue-700 dark:text-blue-300 font-bold">
                aligned_address = (address + align - 1) &amp; ~(align - 1);
              </div>
              <p className="prose mt-2 text-xs">
                Because <code className="code-pill">align</code> is a power of 2, subtracting 1 produces a mask of all 1s in lower bits. Inverting with bitwise NOT (<code className="code-pill">~</code>) zeroes those bits out.
                This executes in <strong>1 single CPU clock cycle</strong> via <code className="code-pill">LEA</code> and <code className="code-pill">AND</code> instructions!
              </p>
            </div>

            <MicroChallengeEngine challenge={challenge1} />
          </section>

          {/* Section 4.3 Calculator */}
          <section id="sec-p4-calc" className="lesson-section">
            <h2>6.2 — Interactive Bitwise Alignment Calculator</h2>
            <BitwiseAlignmentLab />
          </section>

          {/* Section 4.4 Cache Line & False Sharing */}
          <section id="sec-p4-cache" className="lesson-section">
            <h2>6.3 — 64-Byte CPU Cache Lines &amp; Multi-Core False Sharing</h2>
            <p className="prose">
              The CPU always loads 64 contiguous bytes into an L1 cache line.
              If two independent variables accessed by different threads on different CPU cores sit on the same 64-byte cache line, the CPU hardware cache coherency protocol (MESI) constantly invalidates both L1 caches back and forth.
              This phenomenon is known as <strong>False Sharing</strong>.
            </p>
            <CacheLineVisualizer />

            <MicroChallengeEngine challenge={challenge2} />
          </section>

          {/* Section 4.5 Struct Padding */}
          <section id="sec-p4-padding" className="lesson-section">
            <h2>6.4 — Struct Padding &amp; Reordering Optimization</h2>
            <p className="prose">
              Compilers insert hidden padding bytes between struct members to enforce natural alignment boundaries. Reordering struct members from largest to smallest eliminates wasted padding bytes:
            </p>

            <div className="code-block-wrapper my-3">
              <div className="code-block-header">
                <span className="cb-filename">order_struct_optimization.cpp</span>
              </div>
              <div className="lcpp-code-box">
                <div className="code-row">
                  <div className="code-line"><span className="ln">1</span><span className="tok-comment">// Naive Layout: 24 Bytes (Wastes 11 Bytes on Padding!)</span></div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">2</span><span className="tok-keyword">struct</span> NaiveOrder &#123; <span className="tok-type">char</span> side; <span className="tok-type">double</span> price; <span className="tok-type">int</span> shares; &#125;;</div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">3</span><span className="tok-comment">// Quant Optimized Layout: 16 Bytes (Zero waste; exactly 4 orders per Cache Line!)</span></div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">4</span><span className="tok-keyword">struct</span> OptimizedOrder &#123; <span className="tok-type">double</span> price; <span className="tok-type">int</span> shares; <span className="tok-type">char</span> side; &#125;;</div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {onPrevModule && (
                <button
                  onClick={onPrevModule}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  ◀ Back to Stage 5
                </button>
              )}
              <button
                onClick={onNextModule}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Proceed to Stage 7: Systems &amp; Quant Capstone ▶
              </button>
            </div>
          </section>
        </div>
      </article>
    </DualPaneLayout>
  );
};
