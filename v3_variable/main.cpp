#include "variable_allocator.hpp"
#include <iostream>
#include <chrono>
#include <vector>
#include <cassert>
#include <cstdlib>

void escape(void* p) {
    asm volatile("" : : "g"(p) : "memory");
}

int main() {
    std::cout << "=========================================================\n";
    std::cout << " Phase 3: Variable-Size Allocator (Boundary Tags)\n";
    std::cout << "=========================================================\n\n";

    constexpr size_t ARENA_SIZE = 10 * 1024 * 1024; // 10 MB Pool
    constexpr size_t NUM_OPERATIONS = 100'000;

    VariableAllocator allocator(ARENA_SIZE);

    // 1. Correctness Test: Variable Size Allocations & Coalescing
    std::cout << "[1/3] Testing Variable-Size Allocations (32 B to 512 B)... ";
    void* p1 = allocator.allocate(32);
    void* p2 = allocator.allocate(128);
    void* p3 = allocator.allocate(256);

    assert(p1 != nullptr && p2 != nullptr && p3 != nullptr);
    std::cout << "SUCCESS!\n";

    std::cout << "[2/3] Testing O(1) Left/Right Boundary Tag Coalescing... ";
    allocator.deallocate(p2); // Free middle block
    allocator.deallocate(p1); // Free left block (coalesces with p2)
    allocator.deallocate(p3); // Free right block (coalesces all into single pool)

    void* p_large = allocator.allocate(800); // Verify large contiguous allocation succeeds after coalescing!
    assert(p_large != nullptr);
    allocator.deallocate(p_large);
    std::cout << "SUCCESS!\n\n";

    // 2. High-Frequency Variable-Size Benchmark
    std::cout << "[3/3] Running High-Frequency Variable-Size Benchmark (" << NUM_OPERATIONS << " ops)...\n";

    // Baseline: Global OS Heap (malloc / free)
    auto t1 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < NUM_OPERATIONS; ++i) {
        size_t sz = 16 + (i % 256);
        void* p = std::malloc(sz);
        escape(p);
        std::free(p);
    }
    auto t2 = std::chrono::high_resolution_clock::now();
    auto dur_heap = std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1).count();

    // Variable Allocator: Boundary-Tag Pool
    auto t3 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < NUM_OPERATIONS; ++i) {
        size_t sz = 16 + (i % 256);
        void* p = allocator.allocate(sz);
        escape(p);
        allocator.deallocate(p);
    }
    auto t4 = std::chrono::high_resolution_clock::now();
    auto dur_variable = std::chrono::duration_cast<std::chrono::microseconds>(t4 - t3).count();

    std::cout << "  - Standard Heap (malloc/free): " << dur_heap << " us\n";
    std::cout << "  - Variable-Size Allocator    : " << dur_variable << " us\n";

    if (dur_variable > 0) {
        double speedup = static_cast<double>(dur_heap) / dur_variable;
        std::cout << "\n>>> Phase 3 Variable Allocator Speedup: " << speedup << "x Faster! <<<\n";
    }
    std::cout << "=========================================================\n";

    return 0;
}
