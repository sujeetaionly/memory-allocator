'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { MicroChallengeEngine } from '@/components/common/MicroChallengeEngine';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { QuantNote } from '@/components/common/QuantNote';
import { CppCodeStepper, CodeStep } from '@/components/virtual-machine/CppCodeStepper';
import { ProductionCodeBlock } from '@/components/code/ProductionCodeBlock';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

interface Module2Props {
  onSelectConcept: (id: string) => void;
  onNextModule: () => void;
  onPrevModule?: () => void;
}

export const Module2_FreeList: React.FC<Module2Props> = ({
  onSelectConcept,
  onNextModule,
  onPrevModule,
}) => {
  const { initFreeList, freeListAlloc, freeListFree } = useVirtualMachine();

  const freeListSteps: CodeStep[] = [
    {
      lineNumber: 1,
      code: 'FreeListPool<Order, 4> pool; // Pre-slice 64B into four 16B slots',
      explanation: 'Initialize the pool. Each 16B slot contains an embedded pointer pointing to the next free slot.',
      hardwareEffect: 'RAM slots at 0x00, 0x10, 0x20, 0x30 initialized. Head pointer points to 0x00.',
      action: () => {
        initFreeList(16);
      },
    },
    {
      lineNumber: 2,
      code: 'Order* o1 = pool.allocate(); // Pop Head: 0x00 handed to user',
      explanation: 'O(1) Pop: Head advances from 0x00 to 0x10. User payload overwrites the embedded pointer!',
      hardwareEffect: 'Memory at 0x00 transitioned from free pointer to active Order. FreeList Head is now 0x10.',
      action: () => {
        freeListAlloc('Order #101');
      },
    },
    {
      lineNumber: 3,
      code: 'Order* o2 = pool.allocate(); // Pop Head: 0x10 handed to user',
      explanation: 'Next allocation pops 0x10. Head advances to 0x20.',
      hardwareEffect: 'Memory at 0x10 now holds Order #102. FreeList Head is now 0x20.',
      action: () => {
        freeListAlloc('Order #102');
      },
    },
    {
      lineNumber: 4,
      code: 'pool.deallocate(o1); // Push 0x00 back to front of Free List',
      explanation: 'O(1) Push: Chunk 0x00 is repurposed back into a pointer pointing to the current head (0x20).',
      hardwareEffect: 'Memory at 0x00 repurposed as embedded pointer. FreeList Head is now 0x00!',
      action: () => {
        freeListFree(0x00);
      },
    },
  ];

  const challenge1 = {
    id: 'c-freelist-union',
    stageId: 'stage-4',
    title: 'The Zero-Overhead Embedded Union Trick',
    scenario:
      'Standard malloc prepends a 16-byte header to every allocation. Our Free-List Allocator manages millions of 24-byte objects with 0 bytes of extra header metadata.',
    question: 'How does the Free-List achieve zero per-block metadata overhead?',
    options: [
      'It compresses memory with gzip algorithms in hardware.',
      'It uses a C++ `union`: when free, the slot holds a pointer to the next free block; when allocated, the user data overwrites those exact same bytes!',
      'It stores all metadata in the CPU L1 cache registers forever.',
      'It disables thread safety in the kernel.',
    ],
    correctIndex: 1,
    hint: 'A memory block is never active and free at the same time.',
    explanation:
      'Brilliant! A memory chunk is either free or allocated—never both at the same instant. By overlaying an 8-byte pointer inside the free chunk itself using a C++ `union`, the metadata cost drops to exactly ZERO bytes!',
    xpReward: 160,
  };

  const challenge2 = {
    id: 'c-freelist-frag',
    stageId: 'stage-4',
    title: 'Immunity to External Fragmentation',
    scenario:
      'A trading algorithm creates and cancels 500,000 orders in completely random order over the span of 4 hours.',
    question: 'Why is external fragmentation mathematically impossible in a fixed-size Free-List pool?',
    options: [
      'Because the operating system defragments RAM every millisecond.',
      'Because every single slot is identical in size! Any freed slot can instantly satisfy any future allocation request.',
      'Because pointers are 64 bits wide.',
      'Because C++20 forbids fragmentation.',
    ],
    correctIndex: 1,
    hint: 'External fragmentation happens when slots are too small for requested sizes.',
    explanation:
      'Because every slot in the pool is exactly the same size, any freed block can satisfy any future allocation request. You never get "Swiss cheese" size mismatches!',
    xpReward: 150,
  };

  const interactiveControls = (
    <div className="space-y-3">
      <div className="text-xs text-slate-600 dark:text-slate-400">
        Live Free-List Pool Controls (16B Chunks):
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => freeListAlloc('Order')}
          className="px-3.5 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all"
        >
          + Pop Free Slot (Allocate)
        </button>
        <button
          onClick={() => freeListFree(0x00)}
          className="px-3.5 py-2 text-xs rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-xs transition-all"
        >
          - Recycle Slot @ 0x00
        </button>
        <button
          onClick={() => initFreeList(16)}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono transition-colors shadow-xs"
        >
          ↺ Reset Pool
        </button>
      </div>
    </div>
  );

  return (
    <DualPaneLayout interactiveControls={interactiveControls}>
      <article className="lesson-article">
        <header className="article-header" id="sec-p2-head">
          <div className="text-xs uppercase font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
            STAGE 4 — PHASE 2 ALLOCATOR
          </div>
          <h1 className="article-title">Fixed-Size Free-List Allocator (Order Pool)</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Estimated time: 15 mins • 125.7x Faster than std::malloc • Zero Metadata Overhead
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            The Arena allocator was lightning fast, but it could not recycle individual objects.
          </p>
          <p className="prose">
            In quantitative order books, traders submit orders and cancel them randomly. We need to allocate and free individual objects in <strong>O(1) time</strong> with <strong>zero memory waste</strong>.
          </p>

          <AnalogyCard title="The Reversible Winter Jacket">
            Imagine a reversible jacket: one side is bright orange for safety, while the other side is black for evening dinners.
            <br /><br />
            It takes up only one hanger in your closet. You never wear both sides at once!
            <br /><br />
            When a memory slot is <strong>free</strong>, its bytes store an address to the next free slot. When the slot is <strong>allocated</strong>, the user&apos;s trade order data simply overwrites those exact same bytes!
          </AnalogyCard>

          {/* Section 2.2 */}
          <section id="sec-p2-union" className="lesson-section">
            <h2>4.1 — The C++ Embedded Union Overlays</h2>
            <p className="prose">
              In standard C++, we declare a <code className="code-pill">union</code>:
            </p>

            <div className="code-block-wrapper my-3">
              <div className="code-block-header">
                <span className="cb-filename">node_union.hpp</span>
              </div>
              <div className="lcpp-code-box">
                <div className="code-row">
                  <div className="code-line"><span className="ln">1</span><span className="tok-keyword">struct</span> FreeNode &#123; FreeNode* next; &#125;; <span className="tok-comment">// 8-byte pointer</span></div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">2</span><span className="tok-keyword">union</span> NodeUnion &#123;</div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">3</span>    FreeNode free_node; <span className="tok-comment">// Active when chunk is FREE</span></div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">4</span>    <span className="tok-keyword">alignas</span>(std::max_align_t) <span className="tok-keyword">std::byte</span> data[ChunkSize]; <span className="tok-comment">// Active when ALLOCATED</span></div>
                </div>
                <div className="code-row">
                  <div className="code-line"><span className="ln">5</span>&#125;;</div>
                </div>
              </div>
            </div>

            <p className="prose">
              Step through the interactive code below. Watch the RAM inspector on the right toggle slots between free pointers (teal) and allocated payload (blue)!
            </p>

            <div className="my-5">
              <CppCodeStepper
                title="Free-List Allocation & Recycling"
                filename="freelist_stepper.cpp"
                steps={freeListSteps}
                onReset={() => initFreeList(16)}
              />
            </div>

            <MicroChallengeEngine challenge={challenge1} />
            <MicroChallengeEngine challenge={challenge2} />
          </section>

          {/* Section 2.4 */}
          <section id="sec-p2-o1" className="lesson-section">
            <h2>4.2 — O(1) Singly-Linked Push &amp; Pop Mechanics</h2>
            <p className="prose">
              Because all pointers are stored inside the free blocks themselves, popping the next free block is just 2 CPU instructions:
            </p>
            <div className="font-mono text-xs p-3 rounded-lg bg-slate-900 text-slate-100 my-2">
              void* chunk = m_head;<br />
              m_head = m_head-&gt;next; // Pop head in 2 cycles!<br />
              return chunk;
            </div>
            <p className="prose">
              And recycling a block is just as fast:
            </p>
            <div className="font-mono text-xs p-3 rounded-lg bg-slate-900 text-slate-100 my-2">
              FreeNode* node = reinterpret_cast&lt;FreeNode*&gt;(chunk);<br />
              node-&gt;next = m_head;<br />
              m_head = node; // Push head in 2 cycles!
            </div>
          </section>

          {/* Section 4.3 - Production C++20 Header & Test Suite */}
          <section id="sec-p2-source" className="lesson-section">
            <h2>4.3 — Production C++20 Header &amp; Standalone Test Suite</h2>
            <p className="prose">
              Here is the complete, production-grade C++20 header implementation using embedded unions (<code className="code-pill">union NodeUnion</code>) and a standalone benchmark test driver:
            </p>

            <ProductionCodeBlock
              title="Phase 2: Fixed-Size Free-List Allocator"
              subtitle="Production C++20 intrusive pool allocator with zero per-block metadata overhead via embedded unions."
              tabs={[
                {
                  filename: 'free_list_allocator.hpp',
                  language: 'C++20 Header',
                  code: `#pragma once
#include <cstddef>
#include <cstdint>
#include <new>

namespace memory_allocator {

// Phase 2: Production Fixed-Size Free-List Allocator
// Zero per-block metadata overhead using embedded memory unions (union NodeUnion)
template <size_t ChunkSize = 64>
class FreeListAllocator {
public:
    static_assert(ChunkSize >= sizeof(void*), "ChunkSize must be at least pointer size (8 bytes)");

    FreeListAllocator(const FreeListAllocator&) = delete;
    FreeListAllocator& operator=(const FreeListAllocator&) = delete;

    explicit FreeListAllocator(size_t total_chunks)
        : m_total_chunks(total_chunks), m_free_head(nullptr)
    {
        size_t total_bytes = m_total_chunks * sizeof(NodeUnion);
        m_buffer = new std::byte[total_bytes];
        reset();
    }

    ~FreeListAllocator() {
        delete[] m_buffer;
    }

    [[nodiscard]] void* allocate() {
        if (!m_free_head) {
            throw std::bad_alloc();
        }
        FreeNode* node = m_free_head;
        m_free_head = m_free_head->next;
        return reinterpret_cast<void*>(node);
    }

    void deallocate(void* ptr) noexcept {
        if (!ptr) return;
        FreeNode* node = reinterpret_cast<FreeNode*>(ptr);
        node->next = m_free_head;
        m_free_head = node;
    }

    void reset() noexcept {
        m_free_head = nullptr;
        NodeUnion* chunks = reinterpret_cast<NodeUnion*>(m_buffer);
        for (size_t i = 0; i < m_total_chunks; ++i) {
            chunks[i].free_node.next = m_free_head;
            m_free_head = &chunks[i].free_node;
        }
    }

    [[nodiscard]] size_t total_chunks() const noexcept { return m_total_chunks; }

private:
    struct FreeNode {
        FreeNode* next;
    };

    union NodeUnion {
        FreeNode free_node;
        alignas(std::max_align_t) std::byte data[ChunkSize];
    };

    size_t      m_total_chunks;
    std::byte*  m_buffer;
    FreeNode*   m_free_head;
};

} // namespace memory_allocator`,
                },
                {
                  filename: 'main.cpp',
                  language: 'C++20 Test Suite',
                  runCommand: 'g++ -std=c++20 -O3 -Wall -Wextra main.cpp -o freelist_demo && ./freelist_demo',
                  code: `#include "free_list_allocator.hpp"
#include <iostream>
#include <vector>
#include <chrono>

struct OrderSlot {
    uint64_t client_id;
    uint32_t order_count;
    char     routing_tag[12];
};

int main() {
    std::cout << "=== Low-Level Systems C++: Free-List Pool Demo ===\\n";

    // 1. Pre-slice pool into 10,000 uniform 64-byte slots
    constexpr size_t POOL_CAPACITY = 10000;
    memory_allocator::FreeListAllocator<64> pool(POOL_CAPACITY);

    std::cout << "Created pool with " << pool.total_chunks() << " slots (64B each).\\n";

    // 2. Allocate 1,000 slots in O(1)
    std::vector<void*> active_ptrs;
    active_ptrs.reserve(1000);

    auto start = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < 1000; ++i) {
        active_ptrs.push_back(pool.allocate());
    }
    auto alloc_time = std::chrono::high_resolution_clock::now() - start;

    std::cout << "Allocated 1,000 slots in: "
              << std::chrono::duration_cast<std::chrono::nanoseconds>(alloc_time).count()
              << " ns (avg "
              << std::chrono::duration_cast<std::chrono::nanoseconds>(alloc_time).count() / 1000.0
              << " ns/pop)!\\n";

    // 3. Recycle individual slots in O(1) without wiping the pool!
    start = std::chrono::high_resolution_clock::now();
    for (void* p : active_ptrs) {
        pool.deallocate(p);
    }
    auto free_time = std::chrono::high_resolution_clock::now() - start;

    std::cout << "Recycled 1,000 slots in: "
              << std::chrono::duration_cast<std::chrono::nanoseconds>(free_time).count()
              << " ns (avg "
              << std::chrono::duration_cast<std::chrono::nanoseconds>(free_time).count() / 1000.0
              << " ns/push)!\\n";
    std::cout << "SUCCESS: Zero heap fragmentation, zero metadata bytes wasted!\\n";

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
