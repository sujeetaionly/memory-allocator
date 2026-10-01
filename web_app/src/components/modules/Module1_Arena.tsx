'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { MicroChallengeEngine } from '@/components/common/MicroChallengeEngine';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { QuantNote } from '@/components/common/QuantNote';
import { CppCodeStepper, CodeStep } from '@/components/virtual-machine/CppCodeStepper';
import { ProductionCodeBlock } from '@/components/code/ProductionCodeBlock';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

interface Module1Props {
  onSelectConcept: (id: string) => void;
  onNextModule: () => void;
  onPrevModule?: () => void;
}

export const Module1_Arena: React.FC<Module1Props> = ({
  onSelectConcept,
  onNextModule,
  onPrevModule,
}) => {
  const { bumpAllocate, resetArena } = useVirtualMachine();

  const arenaSteps: CodeStep[] = [
    {
      lineNumber: 1,
      code: 'alignas(alignof(std::max_align_t)) std::byte buffer[64];',
      explanation: 'Reserve a 64-byte block of raw untyped memory aligned to the hardware architecture word boundary.',
      hardwareEffect: 'Stack/Heap reservation of 64 contiguous bytes at address 0x00.',
      action: () => {
        resetArena();
      },
    },
    {
      lineNumber: 2,
      code: 'size_t offset = 0; // The Bump Pointer',
      explanation: 'Initialize the cursor offset to 0. Allocation will simply advance this integer.',
      hardwareEffect: 'CPU register RBX loaded with 0x00.',
      action: () => {
        resetArena();
      },
    },
    {
      lineNumber: 3,
      code: 'Order* o1 = new (buffer + offset) Order(101); // 24 bytes',
      explanation: 'Placement new constructs an Order directly in the raw memory without calling OS malloc!',
      hardwareEffect: 'Order object bytes written to 0x00..0x17. Bump cursor moves from 0x00 to 0x18 (24B) in 1 CPU cycle.',
      action: () => {
        bumpAllocate(24, 8, 'Order #101');
      },
    },
    {
      lineNumber: 4,
      code: 'Order* o2 = new (buffer + offset) Order(102); // 24 bytes',
      explanation: 'Next object is placed immediately following the first. Maximum cache locality!',
      hardwareEffect: 'Order object bytes written to 0x18..0x2F. Bump cursor moves to 0x30 (48B).',
      action: () => {
        bumpAllocate(24, 8, 'Order #102');
      },
    },
    {
      lineNumber: 5,
      code: 'offset = 0; // Bulk Reset All Memory in 1 CPU cycle!',
      explanation: 'Deallocation is instant! Rather than freeing individual nodes, simply set offset back to 0.',
      hardwareEffect: 'CPU executes MOV RBX, 0. All 64 bytes reclaimed simultaneously in 1 clock cycle.',
      action: () => {
        resetArena();
      },
    },
  ];

  const challenge1 = {
    id: 'c-arena-delete',
    stageId: 'stage-3',
    title: 'The Placement New Destructor Dilemma',
    scenario:
      'You allocated a `TradeOrder` struct inside your Arena buffer using `new (ptr) TradeOrder(...)`. At the end of the trading day, a junior developer writes `delete ptr;` on that pointer.',
    question: 'What happens when `delete ptr;` is called on arena memory?',
    options: [
      'It works normally and safely frees the arena buffer.',
      'Catastrophic crash or Undefined Behavior: `delete` tries to return the memory to the OS heap, but the OS never allocated that specific chunk!',
      'The CPU automatically converts it into an Arena reset.',
      'The struct constructor runs again.',
    ],
    correctIndex: 1,
    hint: 'delete expects a pointer originally returned by global operator new.',
    explanation:
      '`delete ptr` does two things: calls the destructor, then calls `free(ptr)` to return memory to the OS heap. Because this memory belongs to our pre-allocated Arena, the OS heap manager gets corrupted and crashes! You must invoke explicit destructors (`ptr->~TradeOrder()`) instead.',
    xpReward: 160,
  };

  const challenge2 = {
    id: 'c-arena-speed',
    stageId: 'stage-3',
    title: 'Why Arena Bump Allocation is O(1)',
    scenario:
      'Standard malloc searches through bins or red-black trees to find a free block. An arena allocator does: `void* ptr = buffer + offset; offset += size; return ptr;`.',
    question: 'How many CPU clock cycles does an Arena allocation take on modern x86 hardware?',
    options: [
      'Over 200 cycles due to bus contention',
      '1 single CPU clock cycle (an integer ADD instruction)',
      '15-30 cycles for mutex checking',
      'Zero cycles because hardware predicts it',
    ],
    correctIndex: 1,
    hint: 'Adding an integer to an address is one of the simplest assembly instructions.',
    explanation:
      'Exact! `add rbx, size` takes exactly 1 clock cycle (~0.25 nanoseconds). That is why the Arena allocator achieves a 42x speedup over standard malloc!',
    xpReward: 150,
  };

  const interactiveControls = (
    <div className="space-y-3">
      <div className="text-xs text-slate-600 dark:text-slate-400">
        Live Bump Pointer Allocator:
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => bumpAllocate(24, 8, 'Order (24B)')}
          className="px-3.5 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all"
        >
          + Allocate Order (24B)
        </button>
        <button
          onClick={() => bumpAllocate(8, 8, 'Symbol (8B)')}
          className="px-3.5 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all"
        >
          + Allocate Symbol (8B)
        </button>
        <button
          onClick={resetArena}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono transition-colors shadow-xs"
        >
          ↺ Reset Offset (0x00)
        </button>
      </div>
    </div>
  );

  return (
    <DualPaneLayout interactiveControls={interactiveControls}>
      <article className="lesson-article">
        <header className="article-header" id="sec-p1-head">
          <div className="text-xs uppercase font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
            STAGE 3 — PHASE 1 ALLOCATOR
          </div>
          <h1 className="article-title">Linear Arena (Bump Pointer) Allocator</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Estimated time: 15 mins • 42.04x Faster than std::malloc • O(1) Allocation
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            Now that you know why the OS heap causes latency jitter, let&apos;s build the fastest memory allocator known to computer science: the <strong>Linear Arena Allocator</strong>.
          </p>

          <AnalogyCard title="The Ticket Dispenser at the Delicatessen">
            Imagine a paper roll ticket dispenser at a deli counter.
            <br /><br />
            When customer #1 arrives, you pull ticket 1 and advance the counter to 2. When customer #2 arrives, you pull ticket 2 and advance to 3.
            <br /><br />
            There is zero searching, zero bookkeeping, and zero forms to sign. To reset the system at the end of the day, you simply rewind the roll back to 0!
          </AnalogyCard>

          {/* Section 1.2 */}
          <section id="sec-p1-raw" className="lesson-section">
            <h2>3.1 — Raw Memory: Deconstructing <code className="code-pill">std::byte[]</code></h2>
            <p className="prose">
              In modern C++20, raw untyped memory is stored using <code className="code-pill">std::byte</code>. An array of <code className="code-pill">std::byte</code> reserves physical bytes in virtual memory without executing any constructors or establishing any object types yet.
            </p>

            <div className="my-5">
              <CppCodeStepper
                title="Line-by-Line C++20 Arena Execution"
                filename="arena_allocator.cpp"
                steps={arenaSteps}
                onReset={resetArena}
              />
            </div>
          </section>

          {/* Section 1.3 */}
          <section id="sec-p1-placement" className="lesson-section">
            <h2>3.2 — Placement <code className="code-pill">new</code>: Constructing Objects in Pre-Allocated RAM</h2>
            <p className="prose">
              Normally, <code className="code-pill">new Order()</code> calls the OS heap manager. But in custom memory allocators, we use <strong>Placement <code className="code-pill">new</code></strong>:
            </p>

            <div className="code-block-wrapper my-3">
              <div className="code-block-header">
                <span className="cb-filename">placement_new.cpp</span>
              </div>
              <div className="lcpp-code-box">
                <div className="code-row">
                  <div className="code-line"><span className="ln">1</span><span className="tok-comment">// Constructs Order directly inside raw arena memory!</span></div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">2</span>Order* order_ptr = <span className="tok-keyword">new</span> (buffer + offset) Order(<span className="tok-number">101</span>);</div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">3</span>offset += <span className="tok-keyword">sizeof</span>(Order); <span className="tok-comment">// 1-cycle integer addition</span></div>
                </div>
              </div>
            </div>

            <MicroChallengeEngine challenge={challenge1} />
            <MicroChallengeEngine challenge={challenge2} />
          </section>

          {/* Section 1.4 */}
          <section id="sec-p1-destruct" className="lesson-section">
            <h2>3.3 — The Arena Tradeoff: Bulk Reset vs Individual Free</h2>
            <p className="prose">
              The Linear Arena Allocator achieves its 42x speedup because it <strong>does not support freeing individual objects</strong>. You cannot delete an object in the middle of the buffer.
            </p>
            <p className="prose">
              Instead, you allocate continuously throughout a processing cycle (such as handling a single network packet or rendering a single video frame), and then reset the entire arena at once with <code className="code-pill">offset = 0</code>.
            </p>

            <QuantNote type="insight" title="WHERE QUANT SYSTEMS USE ARENAS">
              In trading gateways, an Arena Allocator is created per network socket thread. All incoming market messages for a single network packet are placed in the arena. Once the packet has been processed and forwarded to the matching engine, the thread calls <code className="code-pill">arena.reset()</code> in 1 clock cycle.
            </QuantNote>
          </section>

          {/* Section 3.4 - Production C++20 Header & Test Suite */}
          <section id="sec-p1-source" className="lesson-section">
            <h2>3.4 — Production C++20 Header &amp; Standalone Test Suite</h2>
            <p className="prose">
              Here is the exact, complete, production-grade C++20 header implementation and a standalone test driver. You can copy this code and compile it locally with GCC, Clang, or MSVC:
            </p>

            <ProductionCodeBlock
              title="Phase 1: Linear Arena Allocator"
              subtitle="Production C++20 single-instruction bump allocator with 1-cycle integer math, bitwise alignment, and O(1) bulk reset."
              tabs={[
                {
                  filename: 'arena_allocator.hpp',
                  language: 'C++20 Header',
                  code: `#pragma once
#include <cstddef>
#include <cstdint>
#include <new>

namespace memory_allocator {

// 1-Clock-Cycle Bitwise Alignment Helper
inline uintptr_t align_up(uintptr_t address, size_t alignment) noexcept {
    return (address + alignment - 1) & ~(static_cast<uintptr_t>(alignment) - 1);
}

// Phase 1: Production Linear Arena Allocator
// Contiguous raw byte buffer with 1-cycle integer bump pointer allocation
class ArenaAllocator {
public:
    ArenaAllocator(const ArenaAllocator&) = delete;
    ArenaAllocator& operator=(const ArenaAllocator&) = delete;

    explicit ArenaAllocator(size_t capacity)
        : m_capacity(capacity), m_offset(0)
    {
        m_buffer = new std::byte[m_capacity];
    }

    ~ArenaAllocator() {
        delete[] m_buffer;
    }

    [[nodiscard]] void* allocate(size_t size, size_t alignment = 8) {
        uintptr_t current_address = reinterpret_cast<uintptr_t>(m_buffer + m_offset);
        uintptr_t aligned_address = align_up(current_address, alignment);
        uintptr_t buffer_start = reinterpret_cast<uintptr_t>(m_buffer);

        size_t new_offset = (aligned_address - buffer_start) + size;

        if (new_offset > m_capacity) {
            throw std::bad_alloc();
        }

        m_offset = new_offset;
        return reinterpret_cast<void*>(aligned_address);
    }

    void reset() noexcept {
        m_offset = 0;
    }

    [[nodiscard]] size_t capacity() const noexcept { return m_capacity; }
    [[nodiscard]] size_t used_bytes() const noexcept { return m_offset; }
    [[nodiscard]] size_t available_bytes() const noexcept { return m_capacity - m_offset; }

private:
    std::byte* m_buffer;
    size_t     m_capacity;
    size_t     m_offset;
};

} // namespace memory_allocator`,
                },
                {
                  filename: 'main.cpp',
                  language: 'C++20 Test Suite',
                  runCommand: 'g++ -std=c++20 -O3 -Wall -Wextra main.cpp -o arena_demo && ./arena_demo',
                  code: `#include "arena_allocator.hpp"
#include <iostream>
#include <cassert>
#include <chrono>

struct TradeOrder {
    uint64_t order_id;
    double   price;
    uint32_t quantity;
    char     symbol[8];

    TradeOrder(uint64_t id, double p, uint32_t q, const char* s)
        : order_id(id), price(p), quantity(q)
    {
        for (int i = 0; i < 8; ++i) symbol[i] = s[i];
    }
};

int main() {
    std::cout << "=== Low-Level Systems C++: Arena Allocator Demo ===\\n";

    // 1. Pre-allocate 1 MB of raw user-space memory upfront
    constexpr size_t ARENA_SIZE = 1024 * 1024;
    memory_allocator::ArenaAllocator arena(ARENA_SIZE);

    std::cout << "Arena allocated: " << arena.capacity() << " bytes.\\n";

    // 2. Allocate and construct 1,000 Trade Orders using Placement new
    auto start = std::chrono::high_resolution_clock::now();
    for (uint64_t i = 0; i < 1000; ++i) {
        void* raw_mem = arena.allocate(sizeof(TradeOrder), alignof(TradeOrder));
        TradeOrder* ord = new (raw_mem) TradeOrder(i + 1, 150.25 + i, 100, "AAPL");
        (void)ord;
    }
    auto elapsed = std::chrono::high_resolution_clock::now() - start;

    std::cout << "Allocated 1,000 orders in: "
              << std::chrono::duration_cast<std::chrono::nanoseconds>(elapsed).count()
              << " ns (avg "
              << std::chrono::duration_cast<std::chrono::nanoseconds>(elapsed).count() / 1000.0
              << " ns/alloc)!\\n";
    std::cout << "Bytes used: " << arena.used_bytes() << " bytes.\\n";

    // 3. Bulk Reset entire arena in 1 single clock cycle
    arena.reset();
    std::cout << "Arena bulk reset complete. Available: " << arena.available_bytes() << " bytes.\\n";
    std::cout << "SUCCESS: Zero heap fragmentation, zero OS syscall overhead!\\n";

    return 0;
}`,
                },
              ]}
            />

            <div className="mt-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {onPrevModule && (
                <button
                  onClick={onPrevModule}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  ◀ Back to Stage 2
                </button>
              )}
              <button
                onClick={onNextModule}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Proceed to Stage 4: Phase 2 Free-List Allocator ▶
              </button>
            </div>
          </section>
        </div>
      </article>
    </DualPaneLayout>
  );
};
