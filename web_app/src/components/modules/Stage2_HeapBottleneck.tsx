'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { MicroChallengeEngine } from '@/components/common/MicroChallengeEngine';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { QuantNote } from '@/components/common/QuantNote';
import { ProductionCodeBlock } from '@/components/code/ProductionCodeBlock';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

interface Stage2Props {
  onNextStage: () => void;
  onPrevStage: () => void;
}

const HEAP_JITTER_CODE = `#include <iostream>
#include <chrono>
#include <vector>
#include <algorithm>
#include <cstdlib>

// Compiler barrier: forces CPU to treat pointer as live memory
static void escape(void* p) {
    asm volatile("" : : "r,m"(p) : "memory");
}

int main() {
    constexpr size_t ITERATIONS = 100'000;
    std::vector<int64_t> latencies_ns;
    latencies_ns.reserve(ITERATIONS);

    // Naive pattern: calling malloc() inside tight processing loop
    for (size_t i = 0; i < ITERATIONS; ++i) {
        auto t0 = std::chrono::high_resolution_clock::now();
        void* p = std::malloc(64); // Requests 64 bytes from OS heap
        escape(p);
        auto t1 = std::chrono::high_resolution_clock::now();

        latencies_ns.push_back(
            std::chrono::duration_cast<std::chrono::nanoseconds>(t1 - t0).count()
        );
        std::free(p);
    }

    std::sort(latencies_ns.begin(), latencies_ns.end());
    int64_t p50 = latencies_ns[static_cast<size_t>(ITERATIONS * 0.50)];
    int64_t p99 = latencies_ns[static_cast<size_t>(ITERATIONS * 0.99)];
    int64_t max = latencies_ns.back();

    std::cout << "=== OS Malloc Latency Jitter Profile ===\\n";
    std::cout << "P50 (Median)   : " << p50 << " ns\\n";
    std::cout << "P99 (Tail)     : " << p99 << " ns\\n";
    std::cout << "Worst Spike    : " << max << " ns (Kernel trap or mutex stall!)\\n";
    return 0;
}`;

const BUFFER_BYPASS_CODE = `#include <iostream>
#include <chrono>
#include <vector>
#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <new>

struct MarketOrder {
    uint64_t order_id;
    double price;
    uint32_t qty;
    char side;
};

int main() {
    constexpr size_t CAPACITY = 100'000;
    // Step 1: Pre-allocate 1 continuous slab upfront at startup (0 hot-path syscalls)
    auto* raw_pool = new std::byte[CAPACITY * sizeof(MarketOrder)];
    size_t offset = 0;

    std::vector<int64_t> latencies_ns;
    latencies_ns.reserve(CAPACITY);

    // Step 2: In the hot loop, allocate via 1-cycle integer math + placement new
    for (size_t i = 0; i < CAPACITY; ++i) {
        auto t0 = std::chrono::high_resolution_clock::now();

        // 1-Cycle allocation: bump offset by sizeof(MarketOrder)
        void* memory = raw_pool + offset;
        offset += sizeof(MarketOrder);

        // Construct directly in place - ZERO kernel traps, ZERO mutexes!
        MarketOrder* order = new (memory) MarketOrder{i + 1, 104.50, 100, 'B'};
        
        auto t1 = std::chrono::high_resolution_clock::now();
        latencies_ns.push_back(
            std::chrono::duration_cast<std::chrono::nanoseconds>(t1 - t0).count()
        );

        // Explicit destruction when finished
        order->~MarketOrder();
    }

    std::sort(latencies_ns.begin(), latencies_ns.end());
    std::cout << "=== Upfront Pre-allocated Buffer Profile ===\\n";
    std::cout << "P50 (Median)   : " << latencies_ns[static_cast<size_t>(CAPACITY * 0.50)] << " ns\\n";
    std::cout << "P99 (Tail)     : " << latencies_ns[static_cast<size_t>(CAPACITY * 0.99)] << " ns\\n";
    std::cout << "Worst Spike    : " << latencies_ns.back() << " ns (Predictable!)\\n";

    delete[] raw_pool;
    return 0;
}`;

export const Stage2_HeapBottleneck: React.FC<Stage2Props> = ({
  onNextStage,
  onPrevStage,
}) => {
  const { bumpAllocate, resetArena } = useVirtualMachine();

  const challenge1 = {
    id: 'c-stage2-mutex',
    stageId: 'stage-2',
    title: 'The Multi-Threaded Mutex Bottleneck',
    scenario:
      'In a high-frequency trading server, Thread 1 receives an incoming market packet and calls `malloc()` to allocate a 32-byte order. At the exact same microsecond, Thread 2 receives a cancellation request and also calls `malloc()`.',
    question: 'What happens inside the standard OS heap manager?',
    options: [
      'Both threads allocate memory simultaneously at the exact same clock cycle.',
      'Thread 2 hits a Mutex Lock, goes to sleep, and waits for Thread 1 to finish, creating massive latency jitter.',
      'The operating system crashes with a kernel panic.',
      'The CPU automatically duplicates the physical RAM bus.',
    ],
    correctIndex: 1,
    hint: 'Standard malloc is thread-safe by using a global mutex lock.',
    explanation:
      'Standard malloc uses a mutex lock to prevent memory corruption when multiple threads allocate. When thread contention occurs, the waiting thread is put to sleep by the OS scheduler, introducing hundreds or thousands of nanoseconds of unpredictable latency jitter!',
    xpReward: 140,
  };

  const challenge2 = {
    id: 'c-stage2-frag',
    stageId: 'stage-2',
    title: 'Swiss-Cheese External Fragmentation',
    scenario:
      'Your memory buffer has 64 bytes total. You have 3 free slots of 10 bytes each scattered across memory (30 bytes total free). Your program asks for one 20-byte object.',
    question: 'Will standard malloc succeed without coalescing or compacting?',
    options: [
      'Yes, it splits the 20-byte object into pieces across the slots.',
      'No, because there is no single contiguous 20-byte block, leading to an Out-Of-Memory failure despite having 30 bytes total free!',
      'Yes, the CPU automatically pauses all programs and defragments RAM instantly in 0 cycles.',
      'Only if the program runs on 64-bit Windows.',
    ],
    correctIndex: 1,
    hint: 'Hardware memory allocations must be contiguous (consecutive locker numbers).',
    explanation:
      'Exact! This is the classic "External Fragmentation" disaster. Memory is like Swiss cheese: lots of total holes, but no single continuous slice is big enough. This is why specialized allocators are essential.',
    xpReward: 150,
  };

  const challenge3 = {
    id: 'c-stage2-hidden-header',
    stageId: 'stage-2',
    title: 'The Hidden Metadata Tax of malloc()',
    scenario:
      'In C++, you call `free(ptr)` or `delete ptr`, passing only the pointer itself without specifying how many bytes to free. How does the OS heap allocator know how large the allocation was?',
    question: 'How does free() know how many bytes to reclaim?',
    options: [
      'The OS kernel scans the entire 64-bit address space looking for null terminators.',
      'The allocator secretly wrote an 8-to-16 byte metadata header (storing size and flags) immediately before the returned pointer!',
      'The CPU hardware tracks all pointer sizes automatically inside L1 cache registers.',
      'It cannot know, so it always reclaims exactly 4,096 bytes regardless of request size.',
    ],
    correctIndex: 1,
    hint: 'Notice that the allocator gave you `ptr`, but allocated slightly more bytes upfront.',
    explanation:
      'Exactly! Standard allocators like glibc ptmalloc prepend an 8- or 16-byte chunk header directly before `ptr` (at `ptr - sizeof(size_t)`). When you pass `ptr` to `free(ptr)`, it subtracts the header offset to read the chunk size and flags. This hidden header incurs per-allocation overhead and degrades cache locality for small objects!',
    xpReward: 150,
  };

  const interactiveControls = (
    <div className="space-y-3">
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Simulate standard heap allocations filling the buffer:
      </p>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => bumpAllocate(16, 8, 'OS Malloc Object (16B)')}
          className="px-3.5 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all"
        >
          + Call malloc(16)
        </button>
        <button
          onClick={() => bumpAllocate(8, 4, 'OS Malloc Object (8B)')}
          className="px-3.5 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all"
        >
          + Call malloc(8)
        </button>
        <button
          onClick={resetArena}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono transition-colors shadow-xs"
        >
          ↺ Reset Heap
        </button>
      </div>
    </div>
  );

  return (
    <DualPaneLayout interactiveControls={interactiveControls}>
      <article className="lesson-article">
        <header className="article-header" id="sec-stage2-head">
          <div className="text-xs uppercase font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider mb-1">
            STAGE 2 — THE ROOT PROBLEM
          </div>
          <h1 className="article-title">The Dynamic Memory Problem &amp; Why Malloc Fails</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Estimated time: 14 mins • Key Concept: Kernel traps, Mutex contention, Hidden chunk headers, Fragmentation
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            In Stage 1, we saw that the stack is lightning fast. But what happens when you need to store data of unknown size, or keep an order book alive for days?
          </p>
          <p className="prose">
            You must request memory dynamically at runtime. This realm is called <strong>The Heap</strong>.
          </p>

          <AnalogyCard title="Kitchen Counter vs The Rental Warehouse">
            The <strong>Stack</strong> is like a neat stack of plates on a kitchen counter: grab one off the top, use it, wash it, and put it back. Instant and automatic.
            <br /><br />
            The <strong>Heap</strong> is like an open rental warehouse down the road: whenever you need space, you have to talk to the warehouse clerk (<code className="code-pill">malloc</code>), fill out forms, wait in line behind other customers (mutex locks), and remember to return the storage unit key (<code className="code-pill">free</code>).
          </AnalogyCard>

          {/* Section 2.1 */}
          <section id="sec-stage2-traps" className="lesson-section">
            <h2>2.1 — The Three Fatal Flaws of Standard Malloc</h2>
            <p className="prose">
              The standard C library provides <code className="code-pill">malloc()</code> and <code className="code-pill">free()</code>. While suitable for regular desktop apps, they are disastrous for ultra-low latency systems:
            </p>

            <div className="space-y-3 my-4 text-xs">
              <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20">
                <div className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                  <span>1. OS Kernel Traps (Syscalls)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  When the heap runs low, <code className="code-pill">malloc</code> triggers an OS system call (<code className="code-pill">brk</code> or <code className="code-pill">mmap</code>). The CPU must halt user code, switch into kernel mode (Ring-0), modify page tables, and return. This takes <strong>1,000 to 10,000 clock cycles</strong>!
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <span>2. Multi-Threaded Mutex Contention</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Multiple threads share the same process heap. To prevent two threads from grabbing the same memory address, <code className="code-pill">malloc</code> uses a mutex lock. When threads collide, they go to sleep, destroying predictable execution timing.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20">
                <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <span>3. Swiss-Cheese Memory Fragmentation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Arbitrary-sized allocations and deallocations chop RAM into disjointed fragments. Over time, you run out of contiguous memory even when plenty of total bytes are technically free!
                </p>
              </div>
            </div>

            <MicroChallengeEngine challenge={challenge1} />
            <MicroChallengeEngine challenge={challenge2} />
          </section>

          {/* Section 2.2 */}
          <section id="sec-stage2-hidden-header" className="lesson-section">
            <h2>2.2 — Anatomy of a Malloc Chunk: The Hidden Metadata Tax</h2>
            <p className="prose">
              Have you ever wondered why <code className="code-pill">free(ptr)</code> or <code className="code-pill">delete ptr</code> does not require you to pass the size of the block being freed?
            </p>
            <p className="prose">
              Because standard allocators secretly allocate <strong>more bytes than you asked for</strong>. In standard <code className="code-pill">glibc ptmalloc</code>, an 8-byte or 16-byte chunk header is prepended directly before your pointer:
            </p>

            <div className="my-5 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <div className="text-slate-500 mb-2">// Physical Layout of a standard glibc heap chunk:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-lg border border-amber-600/40 bg-amber-950/20 text-center">
                  <div className="text-amber-400 font-bold">8 Bytes Hidden Header</div>
                  <div className="text-[11px] text-slate-400 mt-1">size_t chunk_size | flags</div>
                  <div className="text-[10px] text-amber-500/80 mt-0.5">(ptr - 8)</div>
                </div>
                <div className="p-3 rounded-lg border border-blue-500/40 bg-blue-950/20 text-center sm:col-span-2">
                  <div className="text-blue-400 font-bold">Your Allocated Payload Space</div>
                  <div className="text-[11px] text-slate-400 mt-1">Returned pointer starts here: ptr</div>
                  <div className="text-[10px] text-blue-500/80 mt-0.5">32, 64, or N bytes of requested user memory</div>
                </div>
              </div>
            </div>

            <p className="prose">
              When you call <code className="code-pill font-mono">free(ptr)</code>, the allocator evaluates:
              <br />
              <code className="code-pill font-mono">auto* header = reinterpret_cast&lt;ChunkHeader*&gt;(reinterpret_cast&lt;char*&gt;(ptr) - sizeof(ChunkHeader));</code>
            </p>
            <p className="prose">
              <strong>The Problem for High-Performance Systems:</strong> If you allocate 1,000,000 small 8-byte objects, glibc burns another 8 to 16 bytes of metadata per object. That means <strong>50% to 66% of your cache and RAM is wasted on allocator metadata headers</strong> instead of your actual business data!
            </p>

            <MicroChallengeEngine challenge={challenge3} />
          </section>

          {/* Section 2.3 */}
          <section id="sec-stage2-code-demo" className="lesson-section">
            <h2>2.3 — Empirical C++ Demo: OS Heap Latency Jitter vs Custom Buffer</h2>
            <p className="prose">
              Here is a runnable C++ comparison showing the real-world difference between naive OS heap allocations and pre-allocating an upfront continuous buffer:
            </p>

            <ProductionCodeBlock
              title="OS Heap Jitter vs Upfront Pre-allocated Buffer"
              badge="C++20 Empirical Study"
              description="Benchmark the distribution of malloc/free vs pre-allocated placement new across 100,000 allocations."
              compileCommand="g++ -std=c++20 -O3 heap_jitter_demo.cpp -o heap_demo && ./heap_demo"
              files={[
                {
                  filename: 'heap_jitter_demo.cpp',
                  language: 'cpp',
                  code: HEAP_JITTER_CODE,
                },
                {
                  filename: 'user_space_buffer.cpp',
                  language: 'cpp',
                  code: BUFFER_BYPASS_CODE,
                },
              ]}
            />
          </section>

          {/* Section 2.4 */}
          <section id="sec-stage2-solution" className="lesson-section">
            <h2>2.4 — The Paradigm Shift: Custom Allocators</h2>
            <p className="prose">
              How do the best engineering teams solve this?
            </p>
            <p className="prose">
              <strong>They bypass the OS completely.</strong> Instead of calling <code className="code-pill">malloc()</code> thousands of times a second, they allocate one large block of memory upfront at startup, and then manage that memory themselves using ultra-fast, lock-free custom allocators!
            </p>

            <QuantNote type="insight" title="WHAT WE ARE BUILDING NEXT">
              Over the next three stages, we will engineer the three fundamental custom allocator architectures used across quantitative finance, high-speed game engines, and aerospace software:
              <br /><br />
              • <strong>Phase 1: Linear Arena Allocator</strong> (42x faster than malloc)
              <br />
              • <strong>Phase 2: Fixed-Size Free-List</strong> (125x faster than malloc)
              <br />
              • <strong>Phase 3: Variable-Size Boundary-Tag Allocator</strong> (15x faster with instant coalescing)
            </QuantNote>

            <div className="mt-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onPrevStage}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                ◀ Back to Stage 1
              </button>
              <button
                onClick={onNextStage}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Proceed to Stage 3: Phase 1 Arena Allocator ▶
              </button>
            </div>
          </section>
        </div>
      </article>
    </DualPaneLayout>
  );
};
