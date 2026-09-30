import { ModuleId } from '@/types';

export type CourseTierId =
  | 'foundations'
  | 'machine-model'
  | 'allocator-engines'
  | 'hardware-sympathy'
  | 'quant-capstone';

export type ModuleProgressStatus =
  | 'not_started'
  | 'reading'
  | 'practicing'
  | 'complete'
  | 'skipped';

export interface ResourceItem {
  id: string;
  source: string;
  sourceTooltip: string;
  title: string;
  description: string;
  sectionId?: string;
}

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  shortTitle: string;
  tier: CourseTierId;
  tierLabel: string;
  category: string;
  authors: string;
  contributors?: string;
  subtitle: string;
  frequency: 0 | 1 | 2 | 3 | 4; // 0 = N/A, 1 = Optional, 2 = Useful, 3 = Core, 4 = Essential Architecture
  frequencyLabel?: string;
  updatedAgo: string;
  prevModule?: ModuleId;
  prevLabel?: string;
  nextModule?: ModuleId;
  nextLabel?: string;
  sections: { id: string; title: string }[];
  resources: ResourceItem[];
}

export interface CourseTierMeta {
  id: CourseTierId;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  bannerBgClass: string;
  bannerTextClass: string;
  description: string;
}

export const COURSE_TIERS: Record<CourseTierId, CourseTierMeta> = {
  foundations: {
    id: 'foundations',
    name: 'Foundations · Physical RAM',
    heroTitle: 'Foundations · Physical RAM',
    heroSubtitle:
      'Start from bare silicon capacitors, 8-bit bytes, hexadecimal address lockers, and the CPU-to-DRAM memory wall.',
    bannerBgClass: 'bg-blue-800 dark:bg-blue-900',
    bannerTextClass: 'text-blue-100',
    description: 'Physical Silicon, 8-Bit Bytes, Hexadecimal Addressing & Virtual RAM Studio',
  },
  'machine-model': {
    id: 'machine-model',
    name: 'The C++ Machine & Heap',
    heroTitle: 'The C++ Machine & The Heap Problem',
    heroSubtitle:
      'Master how C++ types map to contiguous byte spans, pointers as memory envelopes, stack frames, and why standard OS heap allocation destroys low-latency performance.',
    bannerBgClass: 'bg-amber-800 dark:bg-amber-900',
    bannerTextClass: 'text-amber-100',
    description: 'C++ Memory Model, Pointers, Stack Lifetimes & The OS Heap Bottleneck',
  },
  'allocator-engines': {
    id: 'allocator-engines',
    name: 'Custom Allocator Engines',
    heroTitle: 'Custom Allocator Engines',
    heroSubtitle:
      'Design and implement production C++20 custom memory allocators: 1-Cycle Linear Arena (42x speedup), Zero-Overhead Free-List (125x speedup), and Knuth Boundary Tags.',
    bannerBgClass: 'bg-slate-700 dark:bg-slate-800',
    bannerTextClass: 'text-slate-200',
    description: 'Linear Arena Bump Allocator, Intrusive Free-List & Variable-Size Coalescing',
  },
  'hardware-sympathy': {
    id: 'hardware-sympathy',
    name: 'Hardware Sympathy & Caches',
    heroTitle: 'Hardware Sympathy & Microarchitecture',
    heroSubtitle:
      'Bitwise power-of-two alignment math in 1 CPU clock cycle, 64-byte L1 cache lines, struct padding elimination, and multi-core false sharing.',
    bannerBgClass: 'bg-emerald-800 dark:bg-emerald-900',
    bannerTextClass: 'text-emerald-100',
    description: '1-Cycle Bitwise Alignment, 64B Cache Lines & False Sharing',
  },
  'quant-capstone': {
    id: 'quant-capstone',
    name: 'Quant Systems & Capstone',
    heroTitle: 'Quant Engineering Capstone',
    heroSubtitle:
      'Analyze P99.99 tail latency in high-frequency trading engines, benchmark 1,000,000 allocations, and master low-latency C++ systems interviews.',
    bannerBgClass: 'bg-purple-900 dark:bg-purple-950',
    bannerTextClass: 'text-purple-100',
    description: 'P99.99 Tail Latency, 1M Ops Benchmarks, Flashcards, Quiz & Resume Bullets',
  },
};

export const ALLOCATOR_MODULES: Record<string, ModuleMeta> = {
  'stage-0': {
    id: 'stage-0',
    title: 'The Physical Machine & The Illusion of Memory',
    shortTitle: 'The Physical Machine',
    tier: 'foundations',
    tierLabel: 'Foundations',
    category: 'Getting Started',
    authors: 'Low-Level Systems Architecture Group',
    contributors: 'Hardware Telemetry Lab',
    subtitle: 'Understanding bare silicon capacitors, 8-bit bytes, hexadecimal addresses, and the CPU memory wall.',
    frequency: 4,
    frequencyLabel: 'Essential Architecture',
    updatedAgo: '2 days ago',
    nextModule: 'stage-1',
    nextLabel: 'The C++ Machine Model',
    sections: [
      { id: 'sec-stage0-bits', title: 'What is a Byte, Really?' },
      { id: 'sec-stage0-hex', title: 'Hexadecimal Memory Addresses' },
      { id: 'sec-stage0-wall', title: 'The Memory Wall (CPU vs RAM)' },
      { id: 'sec-stage0-flow', title: 'Hardware Architecture Diagram' },
    ],
    resources: [
      {
        id: 'res-s0-1',
        source: 'HW-SPEC',
        sourceTooltip: 'x86-64 Physical Memory Architecture',
        title: '1 - Capacitive DRAM Cells & 8-Bit Byte Addressing',
        description: 'How physical voltage states map to hexadecimal offsets 0x00..0x3F',
        sectionId: 'sec-stage0-bits',
      },
      {
        id: 'res-s0-2',
        source: 'ULRICH',
        sourceTooltip: 'Ulrich Drepper — What Every Programmer Should Know About Memory',
        title: '2 - The CPU Cache Hierarchy & Memory Wall',
        description: 'Why L1 cache takes 1ns while main DRAM takes 100ns (~400 clock cycles)',
        sectionId: 'sec-stage0-wall',
      },
      {
        id: 'res-s0-3',
        source: 'SIMULATOR',
        sourceTooltip: 'Interactive 64-Byte Hardware RAM Inspector',
        title: '3 - Live 64-Byte Virtual Machine Inspector',
        description: 'Click any byte cell to inspect live hexadecimal addresses in real time',
        sectionId: 'sec-stage0-hex',
      },
    ],
  },
  'stage-1': {
    id: 'stage-1',
    title: 'The C++ Machine Model, Pointers & The Stack',
    shortTitle: 'C++ Model, Pointers & Stack',
    tier: 'machine-model',
    tierLabel: 'The C++ Machine',
    category: 'Memory Fundamentals',
    authors: 'Low-Level Systems Architecture Group',
    contributors: 'Compiler & ABI Lab',
    subtitle: 'Demystifying C++ data types as raw byte spans, pointers as address envelopes, and RSP stack frames.',
    frequency: 4,
    frequencyLabel: 'Essential Architecture',
    updatedAgo: '4 days ago',
    prevModule: 'stage-0',
    prevLabel: 'The Physical Machine',
    nextModule: 'stage-2',
    nextLabel: 'The OS Heap Bottleneck',
    sections: [
      { id: 'sec-stage1-types', title: 'Data Types are Byte Spans' },
      { id: 'sec-stage1-pointers', title: 'Pointers Demystified (& and *)' },
      { id: 'sec-stage1-stack', title: 'The Stack: Instant Speed with Limits' },
      { id: 'sec-stage1-flow', title: 'Pointer & Stack Memory Diagram' },
    ],
    resources: [
      {
        id: 'res-s1-1',
        source: 'CPP-ABI',
        sourceTooltip: 'Itanium C++ ABI & x86-64 Data Model (LP64)',
        title: '1 - Fundamental Type Sizes & Little-Endian Layout',
        description: 'Why char=1B, int=4B, double=8B, and pointers=8B on 64-bit hardware',
        sectionId: 'sec-stage1-types',
      },
      {
        id: 'res-s1-2',
        source: 'STEPPER',
        sourceTooltip: 'Interactive C++20 Code Stepper',
        title: '2 - Address-Of (&) and Dereference (*) Step-by-Step',
        description: 'Execute C++ pointer mutations line-by-line on the 64-byte RAM grid',
        sectionId: 'sec-stage1-pointers',
      },
      {
        id: 'res-s1-3',
        source: 'ASM',
        sourceTooltip: 'x86-64 Hardware Stack Pointer (RSP)',
        title: '3 - Stack Frame Lifetimes & Dangling Pointer Hazards',
        description: 'Why returning a pointer to a local stack variable causes UB',
        sectionId: 'sec-stage1-stack',
      },
    ],
  },
  'stage-2': {
    id: 'stage-2',
    title: 'Dynamic Memory & The OS Heap Bottleneck',
    shortTitle: 'The OS Heap Bottleneck',
    tier: 'machine-model',
    tierLabel: 'The C++ Machine',
    category: 'The Heap Problem',
    authors: 'Low-Level Systems Architecture Group',
    contributors: 'Low-Latency Systems Engineering',
    subtitle: 'Why standard std::malloc and operator new fail in microsecond-critical loops: syscalls, mutex locks, and fragmentation.',
    frequency: 3,
    frequencyLabel: 'Core Principle',
    updatedAgo: '1 week ago',
    prevModule: 'stage-1',
    prevLabel: 'C++ Model, Pointers & Stack',
    nextModule: 'stage-3',
    nextLabel: 'Phase 1: Linear Arena',
    sections: [
      { id: 'sec-stage2-traps', title: 'The Three Fatal Sins of Malloc' },
      { id: 'sec-stage2-solution', title: 'Why We Build Custom Allocators' },
      { id: 'sec-stage2-flow', title: 'OS Kernel Trap vs User-Space Bypass' },
    ],
    resources: [
      {
        id: 'res-s2-1',
        source: 'GLIBC',
        sourceTooltip: 'ptmalloc2 / glibc malloc Internals',
        title: '1 - Ring-0 Syscalls (mmap / brk) & Arena Mutex Contention',
        description: 'How OS heap allocation stalls CPU instruction pipelines for 500+ clock cycles',
        sectionId: 'sec-stage2-traps',
      },
      {
        id: 'res-s2-2',
        source: 'HFT-ARCH',
        sourceTooltip: 'High-Frequency Trading Memory Design',
        title: '2 - Swiss-Cheese Heap Fragmentation & Cache Misses',
        description: 'Interactive simulation of variable-size heap holes and allocation failure',
        sectionId: 'sec-stage2-solution',
      },
    ],
  },
  'stage-3': {
    id: 'stage-3',
    title: 'Phase 1: Linear Arena (Bump Pointer) Allocator',
    shortTitle: 'Phase 1: Linear Arena',
    tier: 'allocator-engines',
    tierLabel: 'Custom Allocators',
    category: 'Custom Allocator Engines',
    authors: 'Low-Level Systems Architecture Group',
    contributors: 'Quant Execution Engine Lab',
    subtitle: 'Achieving a 42.04x speedup over std::malloc using a single-instruction bump pointer, std::byte[], and placement new.',
    frequency: 4,
    frequencyLabel: 'Essential Architecture',
    updatedAgo: '3 days ago',
    prevModule: 'stage-2',
    prevLabel: 'The OS Heap Bottleneck',
    nextModule: 'stage-4',
    nextLabel: 'Phase 2: Free-List Pool',
    sections: [
      { id: 'sec-p1-raw', title: 'Raw Memory: std::byte[]' },
      { id: 'sec-p1-placement', title: 'Placement new Objects' },
      { id: 'sec-p1-destruct', title: 'Bulk Reset vs Individual Free' },
      { id: 'sec-p1-flow', title: 'Arena Bump Pointer State Machine' },
    ],
    resources: [
      {
        id: 'res-s3-1',
        source: 'CPP20',
        sourceTooltip: 'ISO C++20 <cstddef> & <new> Standard',
        title: '1 - alignas(std::max_align_t) & Placement new Syntax',
        description: 'Constructing C++ objects directly inside pre-allocated user-space buffers',
        sectionId: 'sec-p1-placement',
      },
      {
        id: 'res-s3-2',
        source: 'BENCH',
        sourceTooltip: '1,000,000 Allocations Benchmark',
        title: '2 - 1.48ms vs 62.13ms: Why Bump Allocation Takes 1 Clock Cycle',
        description: 'Reducing allocation to a single x86 ADD instruction and bulk O(1) reset',
        sectionId: 'sec-p1-destruct',
      },
    ],
  },
  'stage-4': {
    id: 'stage-4',
    title: 'Phase 2: Fixed-Size Free-List (Order Pool)',
    shortTitle: 'Phase 2: Free-List Pool',
    tier: 'allocator-engines',
    tierLabel: 'Custom Allocators',
    category: 'Custom Allocator Engines',
    authors: 'Low-Level Systems Architecture Group',
    contributors: 'Order Matching Engine Team',
    subtitle: 'Achieving a 125.7x speedup with O(1) individual slot recycling and zero bytes of metadata overhead via embedded unions.',
    frequency: 4,
    frequencyLabel: 'Essential Architecture',
    updatedAgo: '2 days ago',
    prevModule: 'stage-3',
    prevLabel: 'Phase 1: Linear Arena',
    nextModule: 'stage-5',
    nextLabel: 'Phase 3: Variable Allocator',
    sections: [
      { id: 'sec-p2-union', title: 'Zero-Overhead Embedded Union' },
      { id: 'sec-p2-o1', title: 'O(1) Singly-Linked Push & Pop' },
      { id: 'sec-p2-flow', title: 'Intrusive Free-List Pointer Diagram' },
    ],
    resources: [
      {
        id: 'res-s4-1',
        source: 'PATTERN',
        sourceTooltip: 'Intrusive Free-List Union Pattern',
        title: '1 - union Node { T data; Node* next; }',
        description: 'Storing the next-free pointer inside the unallocated payload bytes themselves',
        sectionId: 'sec-p2-union',
      },
      {
        id: 'res-s4-2',
        source: 'LOB-ENG',
        sourceTooltip: 'Limit Order Book (NASDAQ ITCH) Pool',
        title: '2 - O(1) Head Pop (Alloc) & Head Push (Dealloc) in 0.87ms',
        description: 'Deterministic memory recycling for millions of live market orders',
        sectionId: 'sec-p2-o1',
      },
    ],
  },
  'stage-5': {
    id: 'stage-5',
    title: 'Phase 3: Variable-Size Boundary-Tag Allocator',
    shortTitle: 'Phase 3: Variable Allocator',
    tier: 'allocator-engines',
    tierLabel: 'Custom Allocators',
    category: 'Custom Allocator Engines',
    authors: 'Low-Level Systems Architecture Group',
    contributors: 'Donald Knuth TAOCP Vol. 1 Analysis',
    subtitle: 'Supporting arbitrary payload sizes with Header/Footer boundary tags, block splitting, and O(1) bidirectional coalescing.',
    frequency: 3,
    frequencyLabel: 'Core Principle',
    updatedAgo: '5 days ago',
    prevModule: 'stage-4',
    prevLabel: 'Phase 2: Free-List Pool',
    nextModule: 'stage-6',
    nextLabel: 'Hardware Sympathy & Caches',
    sections: [
      { id: 'sec-p3-tags', title: 'Donald Knuth Boundary Tags' },
      { id: 'sec-p3-coalesce', title: 'Instant O(1) Neighbor Coalescing' },
      { id: 'sec-p3-flow', title: 'Boundary-Tag Coalescing Flowchart' },
    ],
    resources: [
      {
        id: 'res-s5-1',
        source: 'KNUTH',
        sourceTooltip: 'The Art of Computer Programming, Vol. 1 — Dynamic Storage Allocation',
        title: '1 - Symmetric Header & Footer Boundary Tags',
        description: 'How a 4-byte footer allows inspecting the left neighbor block in O(1) time',
        sectionId: 'sec-p3-tags',
      },
      {
        id: 'res-s5-2',
        source: 'COALESCE',
        sourceTooltip: 'Bidirectional Block Merging Algorithm',
        title: '2 - Defeating Swiss-Cheese Fragmentation on Free()',
        description: 'Merging adjacent left and right free blocks into a single contiguous span',
        sectionId: 'sec-p3-coalesce',
      },
    ],
  },
  'stage-6': {
    id: 'stage-6',
    title: 'Hardware Reality: Bitwise Alignment & CPU Cache Lines',
    shortTitle: 'Bitwise Alignment & Caches',
    tier: 'hardware-sympathy',
    tierLabel: 'Hardware Sympathy',
    category: 'Mechanical Sympathy',
    authors: 'Low-Level Systems Architecture Group',
    contributors: 'x86-64 Microarchitecture Lab',
    subtitle: 'Replacing slow division modulo with 1-cycle two’s complement bitwise AND, struct padding optimization, and false sharing.',
    frequency: 4,
    frequencyLabel: 'Essential Architecture',
    updatedAgo: '1 day ago',
    prevModule: 'stage-5',
    prevLabel: 'Phase 3: Variable Allocator',
    nextModule: 'stage-7',
    nextLabel: 'Quant Capstone & Benchmarks',
    sections: [
      { id: 'sec-p4-formula', title: '1-Clock-Cycle Alignment Formula' },
      { id: 'sec-p4-calc', title: 'Interactive Bitwise Alignment Lab' },
      { id: 'sec-p4-cache', title: '64-Byte Cache Lines & False Sharing' },
      { id: 'sec-p4-padding', title: 'Struct Padding & Field Reordering' },
    ],
    resources: [
      {
        id: 'res-s6-1',
        source: 'BIT-OPS',
        sourceTooltip: "Hacker's Delight — Power-of-2 Alignment Math",
        title: '1 - (size + align - 1) & ~(align - 1)',
        description: 'Why DIV takes 20-40 cycles while AND + NOT takes 1 clock cycle',
        sectionId: 'sec-p4-formula',
      },
      {
        id: 'res-s6-2',
        source: 'MESI',
        sourceTooltip: 'MESI Cache Coherency Protocol',
        title: '2 - 64-Byte Cache Line Bounce & alignas(64)',
        description: 'Preventing multi-core L1 cache invalidation storms in concurrent queues',
        sectionId: 'sec-p4-cache',
      },
    ],
  },
  'stage-7': {
    id: 'stage-7',
    title: 'Systems Capstone: Benchmarks & Quant Interview War Room',
    shortTitle: 'Quant Capstone & Interview',
    tier: 'quant-capstone',
    tierLabel: 'Quant Systems',
    category: 'Quant Engineering Mastery',
    authors: 'Low-Level Systems Architecture Group',
    contributors: 'Low-Latency Systems Engineering',
    subtitle: 'P99.99 tail latency analysis, 1,000,000-operation benchmark suite, spaced-repetition flashcards, and interview war room.',
    frequency: 4,
    frequencyLabel: 'Essential Architecture',
    updatedAgo: 'today',
    prevModule: 'stage-6',
    prevLabel: 'Bitwise Alignment & Caches',
    nextModule: 'sandbox',
    nextLabel: 'Interactive RAM Sandbox',
    sections: [
      { id: 'sec-stage7-tail', title: 'The Tyranny of P99.99 Tail Latency' },
      { id: 'sec-stage7-matrix', title: '1,000,000 Ops Performance Matrix' },
      { id: 'sec-stage7-interview', title: 'Quant Interview War Room & Quiz' },
    ],
    resources: [
      {
        id: 'res-s7-1',
        source: 'BENCH',
        sourceTooltip: 'Google Benchmark / chrono::steady_clock Suite',
        title: '1 - Full 1M-Operation Latency & Speedup Matrix',
        description: 'Comparing std::malloc vs Arena (42x), Free-List (125x), and Variable (15x)',
        sectionId: 'sec-stage7-matrix',
      },
      {
        id: 'res-s7-2',
        source: 'WAR-ROOM',
        sourceTooltip: 'Quantitative Systems Developer Interview Prep',
        title: '2 - Interactive Quiz, Flashcard Deck & Resume Bullet Builder',
        description: 'Test your mastery and generate verifiable C++20 systems resume bullets',
        sectionId: 'sec-stage7-interview',
      },
    ],
  },
  sandbox: {
    id: 'sandbox',
    title: 'Interactive 64-Byte Hardware RAM Sandbox Studio',
    shortTitle: 'RAM Sandbox Studio',
    tier: 'foundations',
    tierLabel: 'Foundations',
    category: 'Interactive Laboratory',
    authors: 'Low-Level Systems Architecture Group',
    subtitle: 'Free-form experimentation studio for Linear Arena, Intrusive Free-List, and Boundary-Tag Variable Allocators.',
    frequency: 4,
    frequencyLabel: 'Essential Architecture',
    updatedAgo: 'today',
    prevModule: 'stage-7',
    prevLabel: 'Quant Capstone & Interview',
    sections: [
      { id: 'sec-sandbox-studio', title: 'Live Allocator Mode Switcher' },
      { id: 'sec-sandbox-guide', title: 'Experimentation Scenarios' },
    ],
    resources: [
      {
        id: 'res-sb-1',
        source: 'LAB',
        sourceTooltip: '64-Byte Virtual RAM Engine',
        title: '1 - Side-by-Side Arena, Free-List & Boundary-Tag Stress Testing',
        description: 'Trigger custom allocations, alignment padding, and O(1) neighbor coalescing',
      },
    ],
  },
};

export const SIDEBAR_CATEGORIES_BY_TIER: Record<
  CourseTierId,
  { category: string; moduleIds: ModuleId[] }[]
> = {
  foundations: [
    { category: 'Getting Started', moduleIds: ['stage-0', 'sandbox'] },
    {
      category: 'Curriculum Roadmap',
      moduleIds: ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5', 'stage-6', 'stage-7'],
    },
  ],
  'machine-model': [
    { category: 'Memory Fundamentals', moduleIds: ['stage-0', 'stage-1'] },
    { category: 'The Heap Problem', moduleIds: ['stage-2'] },
    { category: 'Next Phase Preview', moduleIds: ['stage-3'] },
  ],
  'allocator-engines': [
    { category: 'Phase 1: Bump Allocation', moduleIds: ['stage-3'] },
    { category: 'Phase 2: Intrusive Pool', moduleIds: ['stage-4'] },
    { category: 'Phase 3: Boundary Tags', moduleIds: ['stage-5'] },
    { category: 'Interactive Laboratory', moduleIds: ['sandbox'] },
  ],
  'hardware-sympathy': [
    { category: 'Mechanical Sympathy', moduleIds: ['stage-6'] },
    { category: 'Allocator Prerequisites', moduleIds: ['stage-3', 'stage-4', 'stage-5'] },
  ],
  'quant-capstone': [
    { category: 'Quant Engineering Mastery', moduleIds: ['stage-7'] },
    {
      category: 'Full Systems Stack',
      moduleIds: ['stage-3', 'stage-4', 'stage-5', 'stage-6', 'sandbox'],
    },
  ],
};
