'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { MicroChallengeEngine } from '@/components/common/MicroChallengeEngine';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { QuantNote } from '@/components/common/QuantNote';
import { CppCodeStepper, CodeStep } from '@/components/virtual-machine/CppCodeStepper';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

interface Module3Props {
  onSelectConcept: (id: string) => void;
  onNextModule: () => void;
  onPrevModule?: () => void;
}

export const Module3_Variable: React.FC<Module3Props> = ({
  onSelectConcept,
  onNextModule,
  onPrevModule,
}) => {
  const { initVariableAllocator, variableAlloc, variableFree } = useVirtualMachine();

  const variableSteps: CodeStep[] = [
    {
      lineNumber: 1,
      code: 'BoundaryTagAllocator arena(64); // 1 large 64B free block',
      explanation: 'Initialize the buffer with one initial free block. It has a header at 0x00 and footer at 0x3E.',
      hardwareEffect: 'RAM initialized with 1 free block spanning all 64 bytes.',
      action: () => {
        initVariableAllocator();
      },
    },
    {
      lineNumber: 2,
      code: 'void* p1 = arena.allocate(12); // Allocate 12B payload',
      explanation: 'Finds free block, splits it into 16B (12B payload + 4B tags), leaving the remainder as a new free block.',
      hardwareEffect: 'Header written at 0x00, payload at 0x02..0x0D, footer at 0x0E. Remainder free block begins at 0x10.',
      action: () => {
        variableAlloc(12, 'Packet A (12B)');
      },
    },
    {
      lineNumber: 3,
      code: 'void* p2 = arena.allocate(16); // Allocate 16B payload',
      explanation: 'Next request takes 20B from the remainder free block.',
      hardwareEffect: 'Header at 0x10, payload at 0x12..0x21, footer at 0x22.',
      action: () => {
        variableAlloc(16, 'Packet B (16B)');
      },
    },
    {
      lineNumber: 4,
      code: 'arena.deallocate(p1); // Free Packet A and inspect neighbors',
      explanation: 'O(1) Boundary Tag Check: Checks left and right boundary tags to merge adjacent free memory in constant time.',
      hardwareEffect: 'Block at 0x00 marked free. Ready for instant bidirectional coalescing.',
      action: () => {
        variableFree(0x00);
      },
    },
  ];

  const challenge1 = {
    id: 'c-variable-knuth',
    stageId: 'stage-5',
    title: 'Knuth Boundary Tag Mechanics',
    scenario:
      'In a variable-size memory buffer, you free a memory block at address 0x20. How do you find out if the block immediately to the LEFT (at lower memory addresses) is also free?',
    question: 'Without Knuth boundary footers, what would you have to do?',
    options: [
      'Iterate through the entire memory heap from address 0x00 to find the preceding block, an expensive O(N) linear search!',
      'Check the CPU hardware register called `LEFT_BLOCK`.',
      'The left block is always free by definition.',
      'Call the operating system kernel via a syscall.',
    ],
    correctIndex: 0,
    hint: 'Singly-linked pointers can only look forward, never backward.',
    explanation:
      'Exactly! Standard forward-linked blocks cannot look backward. You would have to scan from byte 0 through every preceding block (O(N) search). Donald Knuth solved this by putting a duplicate Footer tag at the end of each block, letting us look left in exactly 1 instruction (O(1))!',
    xpReward: 160,
  };

  const challenge2 = {
    id: 'c-variable-coalesce',
    stageId: 'stage-5',
    title: 'The Purpose of Coalescing',
    scenario:
      'Two adjacent 16-byte memory blocks are freed. Coalescing merges them into one single 32-byte free block.',
    question: 'Why is coalescing critical for long-running systems?',
    options: [
      'It speeds up the CPU clock frequency.',
      'It prevents external fragmentation: small adjacent holes merge into large spaces capable of satisfying big allocation requests!',
      'It encrypts memory against hackers.',
      'It converts C++ code into assembly.',
    ],
    correctIndex: 1,
    hint: 'Think about external fragmentation (the Swiss cheese problem).',
    explanation:
      'Without coalescing, memory gets chopped into tiny 8-byte or 16-byte slivers that can never satisfy a 64-byte allocation. Merging neighbors restores large contiguous memory blocks!',
    xpReward: 150,
  };

  const interactiveControls = (
    <div className="space-y-3">
      <div className="text-xs text-slate-600 dark:text-slate-400">
        Variable-Size Allocator &amp; Coalescing:
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => variableAlloc(12, 'Packet A')}
          className="px-3.5 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all"
        >
          + Alloc 12B Block
        </button>
        <button
          onClick={() => variableAlloc(16, 'Packet B')}
          className="px-3.5 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all"
        >
          + Alloc 16B Block
        </button>
        <button
          onClick={() => variableFree(0x00)}
          className="px-3.5 py-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-xs transition-all"
        >
          - Free &amp; Coalesce @ 0x00
        </button>
        <button
          onClick={initVariableAllocator}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono transition-colors shadow-xs"
        >
          ↺ Reset Arena
        </button>
      </div>
    </div>
  );

  return (
    <DualPaneLayout interactiveControls={interactiveControls}>
      <article className="lesson-article">
        <header className="article-header" id="sec-p3-head">
          <div className="text-xs uppercase font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
            STAGE 5 — PHASE 3 ALLOCATOR
          </div>
          <h1 className="article-title">Variable-Size Boundary-Tag Allocator &amp; Coalescing</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Estimated time: 15 mins • 15.02x Faster than std::malloc • Donald Knuth Boundary Tags
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            What happens when incoming network messages vary dynamically in size (e.g. 12-byte price ticks, 48-byte order cancellations, 120-byte snapshot book updates)?
          </p>
          <p className="prose">
            A fixed-size pool cannot handle different sizes. We need a general-purpose allocator that can dynamically split large blocks and merge adjacent free memory.
          </p>

          <AnalogyCard title="The Scattered Bookshelf">
            Imagine a bookshelf with 3 empty slots, but each empty slot is separated by books.
            <br /><br />
            You want to insert a 3-volume encyclopedia set, but no 3 slots are touching! You have plenty of free space, but it is unusable because it is fragmented.
            <br /><br />
            <strong>Coalescing</strong> is the act of merging neighboring empty slots together so larger objects can fit!
          </AnalogyCard>

          {/* Section 3.2 */}
          <section id="sec-p3-tags" className="lesson-section">
            <h2>5.1 — Donald Knuth&apos;s Boundary Tag Invention</h2>
            <p className="prose">
              When you free a memory block, how do you know if the block immediately to your left in RAM is also free?
            </p>
            <p className="prose">
              In 1962, computer science pioneer Donald Knuth solved this by placing a <strong>Footer tag</strong> at the end of every block that mirrors the <strong>Header tag</strong>:
            </p>

            <div className="code-block-wrapper my-3">
              <div className="code-block-header">
                <span className="cb-filename">boundary_tags.hpp</span>
              </div>
              <div className="lcpp-code-box">
                <div className="code-row">
                  <div className="code-line"><span className="ln">1</span><span className="tok-keyword">struct</span> Header &#123; <span className="tok-type">size_t</span> size; <span className="tok-type">bool</span> is_free; &#125;; <span className="tok-comment">// Precedes payload</span></div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">2</span><span className="tok-comment">// ... [User Payload Data] ...</span></div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">3</span><span className="tok-keyword">struct</span> Footer &#123; <span className="tok-type">size_t</span> size; <span className="tok-type">bool</span> is_free; &#125;; <span className="tok-comment">// Mirrors header at end!</span></div>
                </div>
              </div>
            </div>

            <p className="prose">
              Step through the interactive stepper below to see how blocks split and coalesce:
            </p>

            <div className="my-5">
              <CppCodeStepper
                title="Variable Allocator & Coalescing Execution"
                filename="variable_stepper.cpp"
                steps={variableSteps}
                onReset={initVariableAllocator}
              />
            </div>

            <MicroChallengeEngine challenge={challenge1} />
            <MicroChallengeEngine challenge={challenge2} />
          </section>

          {/* Section 3.4 */}
          <section id="sec-p3-coalesce" className="lesson-section">
            <h2>5.2 — Instant O(1) Left &amp; Right Neighbor Merging</h2>
            <p className="prose">
              When block <code className="code-pill">B</code> is freed:
            </p>
            <ol className="list-decimal list-inside prose pl-4 space-y-1.5">
              <li><strong>Check Right:</strong> Jump forward by <code className="code-pill">B.size</code> bytes to inspect the right neighbor&apos;s header.</li>
              <li><strong>Check Left:</strong> Step backward by 1 footer size (<code className="code-pill">sizeof(Footer)</code>) to inspect the left neighbor&apos;s footer!</li>
            </ol>
            <p className="prose mt-2">
              If either neighbor is free, merge their sizes in <strong>1 CPU cycle (O(1))</strong> with zero searching!
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {onPrevModule && (
                <button
                  onClick={onPrevModule}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  ◀ Back to Stage 4
                </button>
              )}
              <button
                onClick={onNextModule}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Proceed to Stage 6: Bitwise Math &amp; CPU Caches ▶
              </button>
            </div>
          </section>
        </div>
      </article>
    </DualPaneLayout>
  );
};
