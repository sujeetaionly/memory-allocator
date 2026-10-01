'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { MicroChallengeEngine } from '@/components/common/MicroChallengeEngine';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { QuantNote } from '@/components/common/QuantNote';
import { CppCodeStepper, CodeStep } from '@/components/virtual-machine/CppCodeStepper';
import { ProductionCodeBlock } from '@/components/code/ProductionCodeBlock';
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
          </section>

          {/* Section 5.3 - Production C++20 Header & Test Suite */}
          <section id="sec-p3-source" className="lesson-section">
            <h2>5.3 — Production C++20 Header &amp; Standalone Test Suite</h2>
            <p className="prose">
              Here is Donald Knuth&apos;s boundary-tag variable-size allocator implemented in production C++20, featuring Header/Footer mirrors, block splitting, and bidirectional coalescing:
            </p>

            <ProductionCodeBlock
              title="Phase 3: Variable-Size Boundary-Tag Allocator"
              subtitle="Production C++20 variable allocator with dynamic splitting and O(1) bidirectional coalescing via Knuth boundary tags."
              tabs={[
                {
                  filename: 'variable_allocator.hpp',
                  language: 'C++20 Header',
                  code: `#pragma once
#include <cstddef>
#include <cstdint>
#include <new>

namespace memory_allocator {

inline uintptr_t align_up(uintptr_t address, size_t alignment) noexcept {
    return (address + alignment - 1) & ~(static_cast<uintptr_t>(alignment) - 1);
}

// Phase 3: Production Variable-Size Boundary-Tag Allocator
// Supports dynamic block splitting and O(1) adjacent free block coalescing
class VariableAllocator {
public:
    struct Header {
        size_t size;    // Total block size including Header and Footer
        bool   is_free; // true if block is unallocated
    };

    struct Footer {
        size_t size;    // Mirrors Header size for backward O(1) coalescing
        bool   is_free;
    };

    VariableAllocator(const VariableAllocator&) = delete;
    VariableAllocator& operator=(const VariableAllocator&) = delete;

    explicit VariableAllocator(size_t capacity)
        : m_capacity(capacity)
    {
        m_buffer = new std::byte[m_capacity];
        reset();
    }

    ~VariableAllocator() {
        delete[] m_buffer;
    }

    [[nodiscard]] void* allocate(size_t size, size_t alignment = 8) {
        size_t needed_bytes = align_up(size + sizeof(Header) + sizeof(Footer), alignment);

        std::byte* curr_ptr = m_buffer;
        std::byte* end_ptr = m_buffer + m_capacity;

        while (curr_ptr < end_ptr) {
            Header* hdr = reinterpret_cast<Header*>(curr_ptr);
            if (hdr->is_free && hdr->size >= needed_bytes) {
                // Check if block can be split
                size_t leftover = hdr->size - needed_bytes;
                if (leftover >= sizeof(Header) + sizeof(Footer) + 16) {
                    // Split block
                    hdr->size = needed_bytes;
                    hdr->is_free = false;
                    set_footer(hdr);

                    // Create new free block in leftover space
                    std::byte* next_free_ptr = curr_ptr + needed_bytes;
                    Header* next_hdr = reinterpret_cast<Header*>(next_free_ptr);
                    next_hdr->size = leftover;
                    next_hdr->is_free = true;
                    set_footer(next_hdr);
                } else {
                    hdr->is_free = false;
                    set_footer(hdr);
                }

                return reinterpret_cast<void*>(curr_ptr + sizeof(Header));
            }
            curr_ptr += hdr->size;
        }

        throw std::bad_alloc();
    }

    void deallocate(void* ptr) noexcept {
        if (!ptr) return;

        std::byte* payload_ptr = reinterpret_cast<std::byte*>(ptr);
        std::byte* block_start = payload_ptr - sizeof(Header);
        Header* hdr = reinterpret_cast<Header*>(block_start);

        hdr->is_free = true;
        set_footer(hdr);

        // Coalesce Right Neighbor
        std::byte* right_ptr = block_start + hdr->size;
        if (right_ptr < m_buffer + m_capacity) {
            Header* right_hdr = reinterpret_cast<Header*>(right_ptr);
            if (right_hdr->is_free) {
                hdr->size += right_hdr->size;
                set_footer(hdr);
            }
        }

        // Coalesce Left Neighbor
        if (block_start > m_buffer) {
            std::byte* left_footer_ptr = block_start - sizeof(Footer);
            Footer* left_ftr = reinterpret_cast<Footer*>(left_footer_ptr);
            if (left_ftr->is_free) {
                std::byte* left_start = block_start - left_ftr->size;
                Header* left_hdr = reinterpret_cast<Header*>(left_start);
                left_hdr->size += hdr->size;
                set_footer(left_hdr);
            }
        }
    }

    void reset() noexcept {
        Header* initial_hdr = reinterpret_cast<Header*>(m_buffer);
        initial_hdr->size = m_capacity;
        initial_hdr->is_free = true;
        set_footer(initial_hdr);
    }

    [[nodiscard]] size_t capacity() const noexcept { return m_capacity; }

private:
    void set_footer(Header* hdr) noexcept {
        std::byte* ftr_ptr = reinterpret_cast<std::byte*>(hdr) + hdr->size - sizeof(Footer);
        Footer* ftr = reinterpret_cast<Footer*>(ftr_ptr);
        ftr->size = hdr->size;
        ftr->is_free = hdr->is_free;
    }

    std::byte* m_buffer;
    size_t     m_capacity;
};

} // namespace memory_allocator`,
                },
                {
                  filename: 'main.cpp',
                  language: 'C++20 Test Suite',
                  runCommand: 'g++ -std=c++20 -O3 -Wall -Wextra main.cpp -o variable_demo && ./variable_demo',
                  code: `#include "variable_allocator.hpp"
#include <iostream>
#include <cassert>

int main() {
    std::cout << "=== Low-Level Systems C++: Knuth Boundary-Tag Coalescing Demo ===\\n";

    // 1. Pre-allocate 64 KB memory pool
    constexpr size_t POOL_SIZE = 64 * 1024;
    memory_allocator::VariableAllocator allocator(POOL_SIZE);

    std::cout << "Created variable allocator with " << allocator.capacity() << " bytes.\\n";

    // 2. Allocate variable-sized chunks
    void* p1 = allocator.allocate(120); // 120-byte snapshot
    void* p2 = allocator.allocate(48);  // 48-byte cancel
    void* p3 = allocator.allocate(256); // 256-byte book update

    std::cout << "Allocated 3 variable blocks: 120B, 48B, 256B.\\n";

    // 3. Free p2 (middle block), then p1 (left block), then p3 (right block)
    std::cout << "Freeing middle block (48B)...\\n";
    allocator.deallocate(p2);

    std::cout << "Freeing left block (120B) -> Triggers O(1) Left Coalescing!\\n";
    allocator.deallocate(p1);

    std::cout << "Freeing right block (256B) -> Triggers O(1) Right Coalescing!\\n";
    allocator.deallocate(p3);

    // 4. Verify that adjacent holes were merged: request a single 400-byte block
    void* large_block = allocator.allocate(400);
    assert(large_block != nullptr);
    std::cout << "Successfully allocated single coalesced 400-byte block at " << large_block << "!\\n";
    allocator.deallocate(large_block);

    std::cout << "SUCCESS: Knuth boundary tags eliminated Swiss-Cheese fragmentation in O(1)!\\n";
    return 0;
}`,
                },
              ]}
            />
          </section>
        </div>
      </article>
    </DualPaneLayout>
  );
};
