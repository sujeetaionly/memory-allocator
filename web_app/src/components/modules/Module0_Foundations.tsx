'use client';

import React from 'react';
import { ConceptPill } from '@/components/common/ConceptPill';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { QuantNote } from '@/components/common/QuantNote';

interface Module0Props {
  onSelectConcept: (id: string) => void;
  onNextModule: () => void;
}

export const Module0_Foundations: React.FC<Module0Props> = ({
  onSelectConcept,
  onNextModule,
}) => {
  return (
    <article className="lesson-article">
      <header className="article-header" id="sec-0-head">
        <h1 className="article-title">0.1 — Systems Foundations: RAM, Pointers &amp; Threads</h1>
      </header>

      <div className="article-body">
        <p className="prose">
          In standard competitive programming or application-level C++, memory is usually something the compiler and operating system manage for you behind the scenes via <code className="code-pill">std::vector</code>, <code className="code-pill">new</code>, or <code className="code-pill">std::malloc</code>.
        </p>
        <p className="prose">
          In low-latency systems programming and quantitative finance, <strong>we take away the magic</strong>. We look directly at how physical RAM, bytes, memory addresses, CPU caches, and multi-core threads actually execute instructions in hardware.
        </p>

        <AnalogyCard title="The Giant Street of Numbered Houses">
          Imagine a street with billions of houses numbered 0, 1, 2, ... all the way up. Every house holds exactly 1 byte.
          A <ConceptPill id="pointer" onSelectConcept={onSelectConcept} /> is simply a slip of paper with a house address written on it (such as <code className="code-pill">0x7FFE20</code>).
          When you dereference a pointer in C++, you are simply walking up to that house and opening the front door.
        </AnalogyCard>

        {/* Section 0.2 */}
        <section id="sec-0-ram" className="lesson-section">
          <h2>0.2 — Deconstructing Physical RAM &amp; Raw Byte Memory</h2>
          <p className="prose">
            At the hardware interface, physical memory is an unformatted sequence of bytes. 1 byte equals exactly 8 bits of physical RAM.
            Because 1 byte is the smallest addressable unit of memory in hardware, an array of raw bytes (<code className="code-pill">std::byte[]</code>) is the universal container for raw, untyped memory.
          </p>

          <div className="code-block-wrapper">
            <div className="code-block-header">
              <span className="cb-filename">pointers_demo.cpp</span>
            </div>
            <div className="lcpp-code-box">
              <div className="code-row">
                <div className="code-line"><span className="ln">1</span><span className="tok-type">int</span> order_id = <span className="tok-number">42</span>; <span className="tok-comment">// 4 bytes of RAM</span></div>
              </div>
              <div className="code-row">
                <div className="code-line"><span className="ln">2</span><span className="tok-type">int</span>* ptr = &amp;order_id; <span className="tok-comment">// Holds memory address (e.g. 0x7FFE40)</span></div>
              </div>
              <div className="code-row">
                <div className="code-line"><span className="ln">3</span>*ptr = <span className="tok-number">100</span>; <span className="tok-comment">// Dereference: updates value at that memory address</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 0.3 */}
        <section id="sec-0-stack" className="lesson-section">
          <h2>0.3 — The Two Realms of Memory: Stack vs. Heap</h2>
          <p className="prose">
            Every user-space program divides its memory into two primary regions:
          </p>
          <ul className="list-disc list-inside prose pl-4 space-y-2">
            <li>
              <strong>The Stack</strong>: Stores local function variables. Fast and automatic (1 CPU cycle to adjust the stack pointer register <code className="code-pill">RSP</code>). However, it has a fixed size (~1MB to 8MB).
            </li>
            <li>
              <strong>The Heap</strong>: Stores dynamic, long-lived data. Managed by the operating system heap manager. It is 50x–150x slower than stack allocation because it must search for free slots and acquire mutex locks.
            </li>
          </ul>

          <AnalogyCard title="Stack of Plates vs. Open Rental Warehouse">
            The Stack is like a neat stack of plates on a kitchen counter: you push a plate on top, use it, and pop it off immediately.
            The Heap is like an open rental warehouse down the street: you must ask the warehouse clerk for a storage unit, sign forms, and remember to return the key when you are finished.
          </AnalogyCard>
        </section>

        {/* Section 0.4 */}
        <section id="sec-0-threads" className="lesson-section">
          <h2>0.4 — Processes, Multi-Threading &amp; The Mutex Contention Trap</h2>
          <p className="prose">
            Modern CPUs contain multiple hardware cores. To execute multiple instructions in parallel, operating systems provide <strong>Processes</strong> and <strong>Threads</strong>.
          </p>

          <AnalogyCard title="The Restaurant Kitchen &amp; The Padlock">
            A <strong>Process</strong> is an entire restaurant building with its own private pantry.
            A <strong>Thread</strong> is an individual chef working inside that kitchen. If you have 4 chefs (4 threads), they prepare 4 dishes simultaneously, but they all share the exact same pantry and spice rack (the Heap).
            If two chefs try to grab the same spice bottle at the same millisecond, they collide. To prevent corruption, standard <code className="code-pill">malloc</code> puts a padlock called a <ConceptPill id="mutex" onSelectConcept={onSelectConcept} /> on the heap.
          </AnalogyCard>

          <QuantNote type="warning" title="THE HFT MUTEX BOTTLENECK">
            When Thread 1 calls <code className="code-pill">malloc()</code>, it locks the padlock. If Thread 2 calls <code className="code-pill">malloc()</code> at the same time, Thread 2 is forced to <strong>freeze and sleep</strong> until Thread 1 releases the lock.
            In electronic trading, sleeping for 2 microseconds causes your order to miss the market price. Quantitative systems eliminate locks by giving <strong>each thread its own private memory allocator</strong>!
          </QuantNote>
        </section>

        {/* Section 0.5 */}
        <section id="sec-0-cache" className="lesson-section">
          <h2>0.5 — Mechanical Sympathy: The 64-Byte CPU Cache Line</h2>
          <p className="prose">
            CPUs execute clock cycles in ~0.2 nanoseconds, but fetching data from physical RAM chips takes 60 to 100 nanoseconds (~200+ clock cycles).
            To bridge this speed gap, CPUs load memory into high-speed on-chip caches (L1/L2). Crucially, the CPU <strong>never loads a single byte</strong> from RAM; it always fetches a contiguous <strong>64-byte block known as a Cache Line</strong>.
          </p>

          <div className="aside-card">
            <div className="aside-title">Hardware Latency Hierarchy Every Quant Knows</div>
            <div className="aside-body font-mono text-[12px] space-y-1">
              <div>&bull; CPU Register / L1 Cache Hit: <strong>~1 ns (~3-4 clock cycles)</strong></div>
              <div>&bull; L2 Cache Hit: <strong>~4 ns (~12 clock cycles)</strong></div>
              <div>&bull; Main RAM Fetch (Cache Miss): <strong>~60–100 ns (~200+ clock cycles)</strong></div>
              <div>&bull; OS Kernel Syscall / Mutex Lock Stall: <strong>~1,000–10,000 ns (10,000+ clock cycles!)</strong></div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e9ecef] flex justify-between items-center">
            <span className="text-[#6c757d] text-xs">Next Lesson: Phase 1 Linear Arena Allocator</span>
            <button
              onClick={onNextModule}
              className="lcpp-btn primary"
            >
              Continue to Lesson 1.1 &rarr;
            </button>
          </div>
        </section>
      </div>
    </article>
  );
};
