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
      nodes: { label: string; sub: string; latency: string; color: string; detail: string }[];
    }
  > = {
    'stage-0': {
      title: 'Architecture Flow: The CPU Cache Hierarchy & Memory Wall',
      subtitle: 'Click any hardware tier in the pipeline to inspect access latency and bandwidth.',
      nodes: [
        {
          label: 'CPU Core Registers',
          sub: 'RAX, RBX, RSP (64-bit)',
          latency: '0.25 ns (1 cycle)',
          color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
          detail: 'Zero bus traversal. Immediate ALU execution inside the silicon core.',
        },
        {
          label: 'L1 Data Cache',
          sub: '32 KB — 64B Cache Lines',
          latency: '1.0 ns (4 cycles)',
          color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
          detail: 'Hardware prefetcher loads 64 contiguous bytes at a time into L1 SRAM.',
        },
        {
          label: 'L2 / L3 Shared Cache',
          sub: '512 KB – 32 MB SRAM',
          latency: '4 – 14 ns (16-50 cycles)',
          color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200',
          detail: 'Shared across cores via ring/mesh interconnect; subject to MESI cache coherency.',
        },
        {
          label: 'Main Physical DRAM',
          sub: 'Capacitor Array (0x00..0xFFFFFFFF)',
          latency: '80 – 100 ns (350+ cycles)',
          color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200',
          detail: 'The Memory Wall: A cache miss stalls the CPU for ratusan of instruction opportunities.',
        },
      ],
    },
    'stage-1': {
      title: 'Architecture Flow: C++ Pointer Indirection & Stack Frame Layout',
      subtitle: 'How a 64-bit pointer variable stores the hexadecimal address of target payload bytes.',
      nodes: [
        {
          label: 'int price = 105;',
          sub: 'Address 0x00..0x03 (4 Bytes)',
          latency: 'Little-Endian: 69 00 00 00',
          color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
          detail: 'Occupies 4 contiguous byte lockers starting at base address 0x00.',
        },
        {
          label: 'int* ptr = &price;',
          sub: 'Address 0x08..0x0F (8 Bytes)',
          latency: 'Stores Value: 0x00',
          color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200',
          detail: 'The pointer itself is an 8-byte variable holding the target address (0x00).',
        },
        {
          label: '*ptr = 250;',
          sub: 'Dereference Operator (*)',
          latency: 'MOV [RAX], 250',
          color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
          detail: 'CPU reads address 0x00 from ptr, jumps to locker 0x00, and overwrites it with 0xFA.',
        },
      ],
    },
    'stage-2': {
      title: 'Architecture Flow: Standard std::malloc vs Custom User-Space Allocator',
      subtitle: 'Comparing the 500-cycle OS Heap Path against the 1-cycle Custom Pool Path.',
      nodes: [
        {
          label: 'Application Request',
          sub: 'new Order(101)',
          latency: 'Entry Point',
          color: 'border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
          detail: 'Trading strategy requests 24 bytes for a new limit order.',
        },
        {
          label: 'Global Heap Mutex',
          sub: 'pthread_mutex_lock',
          latency: '+40–120 cycles',
          color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200',
          detail: 'Threads stall waiting for global arena lock in multi-threaded execution.',
        },
        {
          label: 'Free-Bin Tree Search',
          sub: 'Best-Fit / Red-Black Walk',
          latency: '+80–250 cycles',
          color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200',
          detail: 'Chasing scattered pointers across fragmented heap pages triggers L3 cache misses.',
        },
        {
          label: 'Ring-0 Kernel Syscall',
          sub: 'brk() / mmap()',
          latency: '+1,000+ cycles',
          color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200',
          detail: 'Context switch into OS kernel flushes TLB and stalls instruction pipeline.',
        },
      ],
    },
    'stage-3': {
      title: 'Architecture Flow: Phase 1 Linear Arena (Bump Pointer) Engine',
      subtitle: '42.04x Faster than std::malloc — 1 CPU Clock Cycle Allocation.',
      nodes: [
        {
          label: 'Pre-Allocate Arena',
          sub: 'std::byte buf[64]',
          latency: 'Startup Only',
          color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
          detail: 'Reserve contiguous aligned buffer once at startup; zero runtime syscalls.',
        },
        {
          label: 'Bitwise Align Offset',
          sub: '(offset + A - 1) & ~(A - 1)',
          latency: '1 ALU Cycle',
          color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200',
          detail: 'Round bump pointer up to 8-byte or 64-byte hardware boundary without division.',
        },
        {
          label: 'Bump Cursor & Placement new',
          sub: 'offset += sizeof(T)',
          latency: '0.25 ns (add rbx, 24)',
          color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
          detail: 'Construct object in-place at (buf + offset) and advance integer offset.',
        },
        {
          label: 'O(1) Bulk Reset',
          sub: 'offset = 0;',
          latency: '1 Cycle Reclaim',
          color: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200',
          detail: 'Reclaim the entire arena simultaneously at end of packet/frame.',
        },
      ],
    },
    'stage-4': {
      title: 'Architecture Flow: Phase 2 Intrusive Free-List (Zero Metadata Overhead)',
      subtitle: '125.7x Faster than std::malloc — O(1) Pop to Allocate, O(1) Push to Recycle.',
      nodes: [
        {
          label: 'Union Slot (When Free)',
          sub: 'Node* next @ 0x00..0x07',
          latency: '0 Bytes Overhead',
          color: 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200',
          detail: 'While unallocated, the first 8 bytes of the slot store the pointer to the next free slot.',
        },
        {
          label: 'allocate() -> O(1) Pop',
          sub: 'head = head->next',
          latency: '0.87 ms / 1M ops',
          color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
          detail: 'Pop the top slot from free_head in 2 assembly instructions.',
        },
        {
          label: 'Union Slot (When Live)',
          sub: 'Order payload overwrites next*',
          latency: '100% Payload Density',
          color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
          detail: 'Constructed Order object uses all 16/24 bytes of the slot with zero header waste.',
        },
        {
          label: 'deallocate() -> O(1) Push',
          sub: 'node->next = head; head = node',
          latency: 'Instant Reuse',
          color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200',
          detail: 'Returned slot becomes the new free_head, staying hot in L1 cache!',
        },
      ],
    },
    'stage-5': {
      title: 'Architecture Flow: Phase 3 Knuth Boundary-Tag Coalescing',
      subtitle: '15.02x Faster than std::malloc — O(1) Bidirectional Merge of Adjacent Free Blocks.',
      nodes: [
        {
          label: 'Left Block Footer',
          sub: 'ptr - 4 Bytes',
          latency: 'O(1) Backward Lookup',
          color: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200',
          detail: 'Inspect the 4 bytes immediately preceding our header to check if Left Neighbor is free.',
        },
        {
          label: 'Current Block Freed',
          sub: 'Header [Size | Free=1] Footer',
          latency: 'Target Span',
          color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
          detail: 'Deallocate current variable-sized payload and mark boundary tags as free.',
        },
        {
          label: 'Right Block Header',
          sub: 'ptr + curr_size',
          latency: 'O(1) Forward Lookup',
          color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200',
          detail: 'Jump forward by current block size to inspect Right Neighbor header in O(1).',
        },
        {
          label: 'Coalesced Super-Block',
          sub: 'Total Size = L + Curr + R',
          latency: 'Zero Fragmentation',
          color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
          detail: 'Fuse adjacent free blocks into one unified block ready for large allocations.',
        },
      ],
    },
    'stage-6': {
      title: 'Architecture Flow: 1-Cycle Bitwise Alignment & 64B Cache Line Isolation',
      subtitle: 'Eliminating CPU split-loads and multi-coreMESI invalidation storms.',
      nodes: [
        {
          label: 'Add Mask: size + (A - 1)',
          sub: 'Pushes non-aligned bits up',
          latency: 'ADD Instruction',
          color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
          detail: 'If size is not already a multiple of A, carries into the next power-of-two bit.',
        },
        {
          label: 'Bitwise AND: & ~(A - 1)',
          sub: 'Clears lower log2(A) bits',
          latency: 'AND Instruction',
          color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
          detail: 'Zeroes out remainder bits in 1 clock cycle (vs 30 cycles for % modulo).',
        },
        {
          label: 'alignas(64) Cache Line',
          sub: '1 Core = 1 Dedicated 64B Line',
          latency: 'Zero False Sharing',
          color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200',
          detail: 'Prevents Core 0 and Core 1 from invalidating each other’s L1 cache lines.',
        },
      ],
    },
    'stage-7': {
      title: 'Architecture Flow: Quantitative Trading Engine Memory Dispatch',
      subtitle: 'Choosing the optimal custom allocator for every subsystem on the critical path.',
      nodes: [
        {
          label: 'NIC Packet Buffer',
          sub: 'Phase 1: Linear Arena',
          latency: '42.04x Speedup (1.48ms)',
          color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
          detail: 'Scratchpad parsing of UDP market data frames; bulk-reset after every packet.',
        },
        {
          label: 'Limit Order Book',
          sub: 'Phase 2: Intrusive Free-List',
          latency: '125.7x Speedup (0.87ms)',
          color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
          detail: 'Fixed-size 24B Order nodes allocated and canceled millions of times per second.',
        },
        {
          label: 'FIX / Variable Payloads',
          sub: 'Phase 3: Boundary-Tag Pool',
          latency: '15.02x Speedup (8.00ms)',
          color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200',
          detail: 'Arbitrary-length execution reports with O(1) neighbor coalescing.',
        },
      ],
    },
  };

  const config = diagrams[stageId] || diagrams['stage-0'];
  const selected = config.nodes[activeNode] || config.nodes[0];

  return (
    <div className="my-6 rounded-md border border-gray-200 bg-gray-50/70 p-4 sm:p-5 dark:border-gray-800 dark:bg-[#16191f]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Interactive Architecture Diagram
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-dark-high-emphasis mt-0.5">
            {config.title}
          </h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-dark-med-emphasis">
          {config.subtitle}
        </span>
      </div>

      {/* Flowchart Nodes with SVG Arrows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch my-3">
        {config.nodes.map((node, idx) => {
          const isSelected = idx === activeNode;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveNode(idx)}
              className={`relative text-left rounded-md border-l-4 p-3 transition-all cursor-pointer ${
                node.color
              } ${
                isSelected
                  ? 'ring-2 ring-blue-500 shadow-sm'
                  : 'opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono opacity-75 mb-1">
                <span>STEP {idx + 1}</span>
                <span>{idx < config.nodes.length - 1 ? '→' : '✓'}</span>
              </div>
              <div className="font-bold text-sm leading-snug">{node.label}</div>
              <div className="text-xs font-mono mt-1 opacity-90">{node.sub}</div>
              <div className="mt-2 inline-block rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold">
                {node.latency}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Node Hardware Inspection Callout */}
      <div className="mt-3 flex items-center justify-between rounded bg-white px-3.5 py-2.5 text-xs border border-gray-200 dark:border-gray-800 dark:bg-[#121212]">
        <div>
          <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">
            [{selected.label}]:
          </span>
          <span className="text-gray-700 dark:text-dark-high-emphasis">
            {selected.detail}
          </span>
        </div>
        <span className="font-mono text-[11px] text-gray-500 dark:text-dark-med-emphasis shrink-0 ml-3 hidden sm:inline">
          {selected.latency}
        </span>
      </div>
    </div>
  );
};
