export interface BenchmarkResult {
  allocatorName: string;
  shortName: string;
  avgLatencyUs: number;
  latencyPerOpNs: number;
  speedupFactor: number;
  p50Ns: number;
  p90Ns: number;
  p99Ns: number;
  p999Ns: number;
  throughputMops: number; // Millions of ops per second
  hardwareMechanism: string;
  bottlenecks: string;
  hftRecommendation: string;
}

export const BENCHMARK_METRICS: BenchmarkResult[] = [
  {
    allocatorName: 'Standard OS Heap (malloc / free)',
    shortName: 'OS Heap',
    avgLatencyUs: 54916,
    latencyPerOpNs: 54.9,
    speedupFactor: 1.0,
    p50Ns: 35.0,
    p90Ns: 68.0,
    p99Ns: 1850.0, // High tail latency!
    p999Ns: 14200.0, // Catastrophic tail spike from kernel traps / lock contention
    throughputMops: 18.2,
    hardwareMechanism: 'Searches bin trees, acquires thread mutex locks, triggers brk/mmap kernel syscalls on page faults.',
    bottlenecks: 'Lock contention, kernel context switches, cache line invalidation, memory fragmentation.',
    hftRecommendation: 'NEVER use on the hot trading critical path. Acceptable only during startup or background logging.',
  },
  {
    allocatorName: 'Phase 1: Linear Arena Allocator',
    shortName: 'Linear Arena',
    avgLatencyUs: 1306,
    latencyPerOpNs: 1.3,
    speedupFactor: 42.04,
    p50Ns: 1.2,
    p90Ns: 1.4,
    p99Ns: 1.8,
    p999Ns: 2.5,
    throughputMops: 765.7,
    hardwareMechanism: '1-cycle integer bump pointer addition: m_offset += size. Aligns via bitwise mask: (x+a-1)&~(a-1).',
    bottlenecks: 'Cannot free individual objects; must reset all allocations simultaneously.',
    hftRecommendation: 'PERFECT for tick scratchpads, market data packet parsing, and risk evaluation loops.',
  },
  {
    allocatorName: 'Phase 2: Fixed-Size Free-List',
    shortName: 'Free-List Pool',
    avgLatencyUs: 436.8,
    latencyPerOpNs: 0.44,
    speedupFactor: 125.7,
    p50Ns: 0.42,
    p90Ns: 0.46,
    p99Ns: 0.58,
    p999Ns: 0.85,
    throughputMops: 2289.4,
    hardwareMechanism: 'Zero per-block metadata via union NodeUnion. Constant O(1) LIFO singly-linked list push/pop.',
    bottlenecks: 'Restricted to fixed-size objects (cannot allocate arbitrary byte sizes).',
    hftRecommendation: 'GOLD STANDARD for Order Books, Limit Order structs, Trade executions, and connection handles.',
  },
  {
    allocatorName: 'Phase 3: Variable-Size Allocator',
    shortName: 'Boundary-Tag Heap',
    avgLatencyUs: 3654,
    latencyPerOpNs: 3.65,
    speedupFactor: 15.02,
    p50Ns: 2.8,
    p90Ns: 4.5,
    p99Ns: 9.2,
    p999Ns: 18.0,
    throughputMops: 273.7,
    hardwareMechanism: 'Knuth boundary tags (Header + Footer). Instant O(1) left and right free block coalescing.',
    bottlenecks: 'First-fit search through block headers; internal padding overhead for header/footer.',
    hftRecommendation: 'IDEAL when payload sizes vary dynamically but you still want 15x speedup over OS malloc.',
  },
];
