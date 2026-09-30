'use client';

import React, { useState } from 'react';
import { ModuleId } from '@/types';

interface ArchitectureFlowDiagramProps {
  stageId: ModuleId | string;
}

export const ArchitectureFlowDiagram: React.FC<ArchitectureFlowDiagramProps> = ({ stageId }) => {
  const [activeNode, setActiveNode] = useState<number>(0);

  const diagrams: Record<
    string,
    {
      title: string;
      subtitle: string;
      busWidth: string;
      nodes: {
        layer: string;
        spec: string;
        latency: string;
        cycles: string;
        impact: string;
        architectureDetail: string;
      }[];
    }
  > = {
    'stage-0': {
      title: 'Memory Subsystem & Latency Wall',
      subtitle: 'Physical distance and bus clock penalties across the memory hierarchy',
      busWidth: '64-bit Core Bus · 64-Byte Cache Line Line-Fill',
      nodes: [
        {
          layer: 'CPU Core Registers',
          spec: 'RAX, RBX, RSP (64-bit)',
          latency: '0.25 ns',
          cycles: '1 cycle',
          impact: 'Instantaneous ALU execution',
          architectureDetail: 'Direct flip-flops inside the execution unit. Zero bus traversal penalty. Capacity limited to ~16 general-purpose 64-bit registers.',
        },
        {
          layer: 'L1 Data Cache',
          spec: '32 KB SRAM · 8-way Assoc',
          latency: '1.0 ns',
          cycles: '4 cycles',
          impact: 'Optimal hot allocator working set',
          architectureDetail: 'Hardware line-fill loads 64 contiguous bytes at a time. All pointer operations and bump-allocation pointers remain pinned here.',
        },
        {
          layer: 'L2 / L3 Unified Cache',
          spec: '512 KB – 32 MB SRAM',
          latency: '4 – 14 ns',
          cycles: '14 – 40 cycles',
          impact: 'Shared inter-core mesh boundary',
          architectureDetail: 'Shared across CPU cores via ring/mesh interconnect. Subject to MESI/MOESI cache invalidation traffic and core contention.',
        },
        {
          layer: 'Main Physical DRAM',
          spec: 'Capacitive Matrix (DDR4/5)',
          latency: '80 – 100 ns',
          cycles: '300 – 400 cycles',
          impact: 'The Memory Wall (CPU stall)',
          architectureDetail: 'DRAM access requires electrical row precharge, RAS-to-CAS delay, and memory bus arbitration. Stalls the out-of-order CPU pipeline.',
        },
      ],
    },
    'stage-1': {
      title: 'C++ Machine Model: Pointer Address Envelope',
      subtitle: 'Contiguous byte span mapping and 64-bit indirect address resolution',
      busWidth: '64-bit Flat Virtual Address Space · LP64 Architecture Model',
      nodes: [
        {
          layer: 'Payload Variable',
          spec: 'int price = 105 (4 Bytes)',
          latency: 'Locker 0x00..0x03',
          cycles: 'Direct Value',
          impact: 'Little-Endian: 69 00 00 00',
          architectureDetail: 'Data types in C++ are raw contiguous byte ranges. An int on 64-bit x86 occupies 4 consecutive addresses starting at offset 0x00.',
        },
        {
          layer: 'Address-Of (&)',
          spec: 'uintptr_t = 0x00000000',
          latency: 'Physical Offset',
          cycles: 'LEA instruction',
          impact: 'Extracts memory locker index',
          architectureDetail: 'The & operator queries the memory management unit for the base hexadecimal address where the variable starts.',
        },
        {
          layer: 'Pointer Variable',
          spec: 'int* ptr = &price (8 Bytes)',
          latency: 'Locker 0x08..0x0F',
          cycles: 'Stores 0x00',
          impact: 'Pointer is an 8-byte envelope',
          architectureDetail: 'A pointer is itself a normal variable stored in RAM or registers. Its value happens to be the memory address of another object.',
        },
        {
          layer: 'Dereference (*)',
          spec: '*ptr = 250 (MOV [0x00], 0xFA)',
          latency: '0.25 ns',
          cycles: '1 Indirection',
          impact: 'Direct byte locker mutation',
          architectureDetail: 'The CPU reads the address stored inside ptr (0x00), navigates to that locker, and overwrites the contents with 250 (hex 0xFA).',
        },
      ],
    },
    'stage-2': {
      title: 'The Heap Problem: OS Syscall vs Custom Allocator',
      subtitle: 'Why general-purpose heap allocators destroy high-throughput latency predictability',
      busWidth: 'System Call Context Switch Boundary & Global Thread Arena Mutex',
      nodes: [
        {
          layer: 'Global Mutex Lock',
          spec: 'pthread_mutex_lock()',
          latency: '+40 – 120 ns',
          cycles: 'Thread Stall',
          impact: 'Serialization of concurrent threads',
          architectureDetail: 'Standard std::malloc uses multi-threaded arena mutexes. Thread contention creates unpredictable P99 tail latency spikes.',
        },
        {
          layer: 'Kernel Syscall',
          spec: 'mmap() / sbrk() OS traps',
          latency: '+800 – 2500 ns',
          cycles: 'Ring 3 → Ring 0',
          impact: 'Flushes CPU TLB & caches',
          architectureDetail: 'When the heap runs out of virtual pages, the OS kernel must service page faults, modifying page tables and dropping cache lines.',
        },
        {
          layer: 'Metadata Overhead',
          spec: '8B–16B Header per chunk',
          latency: 'Heap Bloat',
          cycles: 'Internal Frac',
          impact: 'Destroys cache line locality',
          architectureDetail: 'Every malloc chunk prefixes a size header and boundary tags. Thousands of small allocations fragment memory and thrash L1 caches.',
        },
        {
          layer: 'Custom Allocator',
          spec: '1-Cycle User-Space Pointer',
          latency: '< 1.5 ns',
          cycles: '1 – 3 cycles',
          impact: 'Predictable P99.99 execution',
          architectureDetail: 'Pre-allocates a contiguous memory pool. Allocations require only a single pointer increment without locks or system calls.',
        },
      ],
    },
    'stage-3': {
      title: 'Phase 1: Linear Bump Allocator Architecture',
      subtitle: 'Sequential pointer increment inside a pre-reserved contiguous std::byte span',
      busWidth: '1-Cycle Bump Arithmetic · Zero Metadata Headers per Object',
      nodes: [
        {
          layer: 'Raw Buffer Pool',
          spec: 'alignas(64) std::byte[64]',
          latency: 'Static Memory',
          cycles: 'Pre-reserved',
          impact: 'Zero runtime OS allocation',
          architectureDetail: 'Contiguous buffer pre-allocated on stack or static memory. Guarantees 100% spatial locality for all sequential objects.',
        },
        {
          layer: 'Alignment Offset',
          spec: '(offset + align - 1) & ~(align - 1)',
          latency: '1 cycle',
          cycles: 'Bitwise AND',
          impact: 'Zero branching alignment math',
          architectureDetail: 'Calculates the next natural hardware boundary in 1 clock cycle using power-of-two bitwise logic without division instructions.',
        },
        {
          layer: 'Bump Pointer',
          spec: 'offset += requested_bytes',
          latency: '0.25 ns',
          cycles: '1 cycle',
          impact: '42.04x faster than std::malloc',
          architectureDetail: 'Returns old offset as void*, moves cursor forward. No headers, no free-lists, no fragmentation checks.',
        },
        {
          layer: 'Bulk Arena Reset',
          spec: 'offset = 0',
          latency: '0.25 ns',
          cycles: '1 cycle',
          impact: 'Reclaims all bytes instantly',
          architectureDetail: 'Individual frees are no-ops. After processing a packet or frame, resetting the single integer cursor frees every allocated object.',
        },
      ],
    },
    'stage-4': {
      title: 'Phase 2: Intrusive Free-List Architecture',
      subtitle: 'Reusing unallocated payload memory as singly-linked pointer nodes',
      busWidth: 'Zero Memory Overhead per Free Node · O(1) Push and Pop',
      nodes: [
        {
          layer: 'Embedded Node Union',
          spec: 'union { Node* next; byte data[N]; }',
          latency: '0 Bytes Overhead',
          cycles: 'Dual Representation',
          impact: 'Zero metadata memory tax',
          architectureDetail: 'When free, the chunk stores an 8-byte pointer to the next free cell. When allocated, user data safely overwrites the pointer.',
        },
        {
          layer: 'Allocate Pop O(1)',
          spec: 'head = head->next',
          latency: '0.87 ns',
          cycles: '2 – 3 cycles',
          impact: '125.7x faster than std::malloc',
          architectureDetail: 'Pops top node from free list, updates head pointer to next node, and returns the chunk pointer immediately.',
        },
        {
          layer: 'Recycle Push O(1)',
          spec: 'node->next = head; head = node;',
          latency: '0.87 ns',
          cycles: '2 – 3 cycles',
          impact: 'Instant chunk reuse',
          architectureDetail: 'Freeing prepends the chunk back to the top of the stack. Requires zero scanning, zero table lookups, and zero OS intervention.',
        },
        {
          layer: 'L1 Cache Warmth',
          spec: 'LIFO Cache Reuse',
          latency: '1.0 ns',
          cycles: 'Cache Hit',
          impact: 'Highest IPC (instructions/cycle)',
          architectureDetail: 'Because recently freed chunks are allocated first (LIFO order), recycled chunks remain hot in L1 data cache lines.',
        },
      ],
    },
    'stage-5': {
      title: 'Phase 3: Donald Knuth Boundary-Tag Coalescing',
      subtitle: 'Bidirectional chunk headers and footers enabling O(1) physical neighbor coalescing',
      busWidth: 'Knuth 1968 Boundary-Tag Architecture · Anti-Fragmentation Engine',
      nodes: [
        {
          layer: 'Leading Header Tag',
          spec: 'struct Header { size_t size; bool is_free; }',
          latency: '4 Bytes',
          cycles: 'Pre-Payload',
          impact: 'Records chunk span & state',
          architectureDetail: 'Stored immediately before user data. Stores chunk byte length and allocation flag.',
        },
        {
          layer: 'Trailing Footer Tag',
          spec: 'struct Footer { size_t size; bool is_free; }',
          latency: '4 Bytes',
          cycles: 'Post-Payload',
          impact: 'Enables backward neighbor inspection',
          architectureDetail: 'Mirror copy of the header placed at the very end of the chunk. Allows the allocator to inspect the previous chunk in O(1).',
        },
        {
          layer: 'O(1) Left Coalesce',
          spec: 'Footer* prev = (Footer*)((byte*)hdr - 4)',
          latency: '1.2 ns',
          cycles: '4 cycles',
          impact: 'Instant leftward merge',
          architectureDetail: 'If previous chunk footer has is_free == true, merge current chunk with previous chunk by increasing previous chunk size.',
        },
        {
          layer: 'O(1) Right Coalesce',
          spec: 'Header* next = (Header*)((byte*)hdr + size)',
          latency: '1.2 ns',
          cycles: '4 cycles',
          impact: 'Eliminates external fragmentation',
          architectureDetail: 'If next chunk header has is_free == true, combine forward into one larger contiguous free block.',
        },
      ],
    },
    'stage-6': {
      title: 'Microarchitecture: Cache Line Alignment & False Sharing',
      subtitle: 'Hardware alignment math, 64-byte L1 cache boundaries, and struct packing',
      busWidth: '64-Byte Cache Line · 64-bit Hardware Memory Bus Interconnect',
      nodes: [
        {
          layer: 'Bitwise Masking',
          spec: '(addr + 7) & ~7',
          latency: '0.25 ns',
          cycles: '1 cycle',
          impact: 'Eliminates division / modulo',
          architectureDetail: 'Power-of-two alignment arithmetic executed in a single clock cycle using bitwise two’s complement masking.',
        },
        {
          layer: '64-Byte Line Spanning',
          spec: 'Single Cache Line Hit',
          latency: '1.0 ns',
          cycles: '1 L1 Access',
          impact: 'Eliminates split-read penalties',
          architectureDetail: 'An unaligned 8-byte double crossing a 64B cache line boundary requires 2 separate bus cycles to assemble a single value.',
        },
        {
          layer: 'Struct Field Reorder',
          spec: 'Sort members descending by size',
          latency: 'Memory Compact',
          cycles: '32B → 16B',
          impact: '50% memory compression',
          architectureDetail: 'Placing 8-byte pointers first, followed by 4-byte ints and 1-byte chars eliminates compiler alignment padding gaps.',
        },
        {
          layer: 'False Sharing Guard',
          spec: 'alignas(64) std::atomic<T>',
          latency: 'Cache Isolation',
          cycles: 'Core Independence',
          impact: 'Prevents MESI bus invalidation storms',
          architectureDetail: 'Ensures variables updated by different CPU cores reside on separate 64-byte cache lines, stopping cross-core cache invalidation.',
        },
      ],
    },
    'stage-7': {
      title: 'Quant Systems Capstone: Critical Path Allocator Dispatch',
      subtitle: 'Architecture mapping for high-frequency trading and low-latency engines',
      busWidth: 'Sub-Microsecond P99.99 Critical Path Execution Profile',
      nodes: [
        {
          layer: 'Packet Parsing',
          spec: 'Phase 1: Linear Bump Arena',
          latency: '1.48 ms (42x)',
          cycles: '1 cycle / alloc',
          impact: 'Scratchpad UDP market data processing',
          architectureDetail: 'Zero allocations inside parser loops. Process network packets and execute a single 1-cycle bulk arena reset.',
        },
        {
          layer: 'Limit Order Book',
          spec: 'Phase 2: Intrusive Free-List',
          latency: '0.87 ms (125x)',
          cycles: '2 cycles / alloc',
          impact: 'Millions of 24B Order nodes / sec',
          architectureDetail: 'LIFO order keeps recently canceled orders hot in L1 cache lines. Eliminates OS mutex stalls on trading core.',
        },
        {
          layer: 'Execution Reports',
          spec: 'Phase 3: Boundary-Tag Pool',
          latency: '8.00 ms (15x)',
          cycles: 'Knuth Coalesce',
          impact: 'Variable-length FIX payloads',
          architectureDetail: 'Handles arbitrary sized message strings without heap fragmentation through bidirectional O(1) neighbor coalescing.',
        },
        {
          layer: 'Telemetry & P99.99',
          spec: 'Tail Latency Profile',
          latency: '1.5ns vs 220ns',
          cycles: 'Zero Jitter',
          impact: 'Deterministic trading response times',
          architectureDetail: 'Eliminates the 500-cycle malloc tail latency outliers that cause market quote drops and exchange timeouts.',
        },
      ],
    },
  };

  const config = diagrams[stageId] || diagrams['stage-0'];
  const activeStage = config.nodes[activeNode] || config.nodes[0];

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#13171f] p-4 sm:p-5 shadow-xs">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Interactive Hardware Architecture Pipeline
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
            {config.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {config.subtitle}
          </p>
        </div>

        <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-[#181c25] px-2.5 py-1 rounded border border-gray-200 dark:border-gray-800 shrink-0 self-start sm:self-auto max-w-full truncate">
          {config.busWidth}
        </div>
      </div>

      {/* Hardware Bus Sequence Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-3">
        {config.nodes.map((node, idx) => {
          const isSelected = idx === activeNode;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveNode(idx)}
              className={`min-w-0 relative text-left rounded-lg p-3 transition-all cursor-pointer border ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500 shadow-xs'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181c26] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 opacity-70">
                <span className="font-semibold uppercase tracking-wider">LAYER {idx + 1}</span>
                <span className="font-bold">{node.cycles}</span>
              </div>
              <div className="font-bold text-xs sm:text-sm leading-tight text-gray-900 dark:text-white">
                {node.layer}
              </div>
              <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-1 truncate">
                {node.spec}
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {node.latency}
                </span>
                <span className="text-gray-400">
                  {isSelected ? '● ACTIVE' : 'Select'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hardware Telemetry Spec Sheet (Terminal style) */}
      <div className="mt-4 rounded-lg bg-gray-900 text-gray-100 p-3.5 font-mono text-xs border border-gray-800">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-2 mb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white text-[11px] uppercase tracking-wider">
              {activeStage.layer}
            </span>
            <span className="text-gray-400 text-[11px]">· {activeStage.spec}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-blue-400 font-semibold">Latency: {activeStage.latency}</span>
            <span className="text-amber-400">Cycles: {activeStage.cycles}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-gray-300">
          <div className="text-emerald-400 font-medium">
            → Consequence: {activeStage.impact}
          </div>
          <div className="text-gray-400 leading-relaxed text-[11.5px]">
            {activeStage.architectureDetail}
          </div>
        </div>
      </div>
    </div>
  );
};
