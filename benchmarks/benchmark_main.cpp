#include <memory_allocator/arena_allocator.hpp>
#include <memory_allocator/free_list_allocator.hpp>
#include <memory_allocator/variable_allocator.hpp>
#include <iostream>
#include <chrono>
#include <vector>
#include <cstdlib>
#include <iomanip>

int main() {
    std::cout << "=========================================================================\n";
    std::cout << "     PRODUCTION C++ MICRO-BENCHMARK HARNESS (STANDARDIZED STATS)\n";
    std::cout << "=========================================================================\n\n";

    constexpr size_t NUM_OPS = 1'000'000;
    constexpr size_t WARMUP_RUNS = 3;
    constexpr size_t TEST_RUNS = 5;
    constexpr size_t POOL_SIZE = 64 * 1024 * 1024; // 64 MB

    std::cout << "Configuration: " << NUM_OPS << " ops per iteration, " << TEST_RUNS << " iterations.\n\n";

    // 1. Standard OS Heap Baseline (malloc / free)
    std::cout << "Warming up CPU cache...\n";
    for (size_t w = 0; w < WARMUP_RUNS; ++w) {
        for (size_t i = 0; i < 100'000; ++i) {
            void* p = std::malloc(64);
            memory_allocator::escape(p);
            std::free(p);
        }
    }

    uint64_t total_heap_us = 0;
    for (size_t r = 0; r < TEST_RUNS; ++r) {
        auto t1 = std::chrono::high_resolution_clock::now();
        for (size_t i = 0; i < NUM_OPS; ++i) {
            void* p = std::malloc(64);
            memory_allocator::escape(p);
            std::free(p);
        }
        auto t2 = std::chrono::high_resolution_clock::now();
        total_heap_us += std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1).count();
    }
    double avg_heap = static_cast<double>(total_heap_us) / TEST_RUNS;

    // 2. Phase 1: Linear Arena Allocator
    memory_allocator::ArenaAllocator arena(POOL_SIZE);
    uint64_t total_arena_us = 0;
    for (size_t r = 0; r < TEST_RUNS; ++r) {
        arena.reset();
        auto t1 = std::chrono::high_resolution_clock::now();
        for (size_t i = 0; i < NUM_OPS; ++i) {
            void* p = arena.allocate(64, 8);
            memory_allocator::escape(p);
            if ((i & 0x3FF) == 0x3FF) arena.reset();
        }
        auto t2 = std::chrono::high_resolution_clock::now();
        total_arena_us += std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1).count();
    }
    double avg_arena = static_cast<double>(total_arena_us) / TEST_RUNS;

    // 3. Phase 2: Fixed-Size Free-List Allocator
    memory_allocator::FreeListAllocator<64> freelist(10'000);
    uint64_t total_freelist_us = 0;
    for (size_t r = 0; r < TEST_RUNS; ++r) {
        auto t1 = std::chrono::high_resolution_clock::now();
        for (size_t i = 0; i < NUM_OPS; ++i) {
            void* p = freelist.allocate();
            memory_allocator::escape(p);
            freelist.deallocate(p);
        }
        auto t2 = std::chrono::high_resolution_clock::now();
        total_freelist_us += std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1).count();
    }
    double avg_freelist = static_cast<double>(total_freelist_us) / TEST_RUNS;

    // 4. Phase 3: Variable-Size Boundary-Tag Allocator
    memory_allocator::VariableAllocator variable(POOL_SIZE);
    uint64_t total_variable_us = 0;
    for (size_t r = 0; r < TEST_RUNS; ++r) {
        auto t1 = std::chrono::high_resolution_clock::now();
        for (size_t i = 0; i < NUM_OPS; ++i) {
            size_t sz = 16 + (i % 128);
            void* p = variable.allocate(sz);
            memory_allocator::escape(p);
            variable.deallocate(p);
        }
        auto t2 = std::chrono::high_resolution_clock::now();
        total_variable_us += std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1).count();
    }
    double avg_variable = static_cast<double>(total_variable_us) / TEST_RUNS;

    // Print Statistically Robust Results
    std::cout << std::left << std::setw(36) << "Allocator Architecture" 
              << std::setw(18) << "Avg Latency (us)" 
              << std::setw(16) << "Speedup Factor" << "\n";
    std::cout << "-------------------------------------------------------------------------\n";

    std::cout << std::left << std::setw(36) << "Standard OS Heap (malloc/free)" 
              << std::setw(18) << std::fixed << std::setprecision(1) << avg_heap 
              << std::setw(16) << "1.00x (Baseline)" << "\n";

    std::cout << std::left << std::setw(36) << "Phase 1: Linear Arena Allocator" 
              << std::setw(18) << std::fixed << std::setprecision(1) << avg_arena 
              << std::setw(16) << (std::to_string(avg_heap / avg_arena).substr(0, 5) + "x FASTER") << "\n";

    std::cout << std::left << std::setw(36) << "Phase 2: Fixed-Size Free-List" 
              << std::setw(18) << std::fixed << std::setprecision(1) << avg_freelist 
              << std::setw(16) << (std::to_string(avg_heap / avg_freelist).substr(0, 5) + "x FASTER") << "\n";

    std::cout << std::left << std::setw(36) << "Phase 3: Variable-Size Allocator" 
              << std::setw(18) << std::fixed << std::setprecision(1) << avg_variable 
              << std::setw(16) << (std::to_string(avg_heap / avg_variable).substr(0, 5) + "x FASTER") << "\n";

    std::cout << "=========================================================================\n";
    return 0;
}
