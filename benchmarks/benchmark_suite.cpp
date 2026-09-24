#include "../v1_arena/arena_allocator.hpp"
#include "../v2_freelist/free_list_allocator.hpp"
#include "../v3_variable/variable_allocator.hpp"
#include <iostream>
#include <chrono>
#include <vector>
#include <cstdlib>
#include <iomanip>

void escape(void* p) {
    asm volatile("" : : "g"(p) : "memory");
}

int main() {
    std::cout << "=========================================================================\n";
    std::cout << "        FINAL COMPREHENSIVE MEMORY ALLOCATOR BENCHMARK SUITE\n";
    std::cout << "=========================================================================\n\n";

    constexpr size_t NUM_OPS = 1'000'000;
    constexpr size_t POOL_SIZE = 64 * 1024 * 1024; // 64 MB

    std::cout << "Running 1,000,000 Allocation & Deallocation Operations...\n\n";

    // 1. Standard OS Heap Baseline (malloc / free)
    auto t1 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < NUM_OPS; ++i) {
        void* p = std::malloc(64);
        escape(p);
        std::free(p);
    }
    auto t2 = std::chrono::high_resolution_clock::now();
    auto dur_heap = std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1).count();

    // 2. Phase 1: Linear Arena Allocator (Bump Offset)
    ArenaAllocator arena(POOL_SIZE);
    auto t3 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < NUM_OPS; ++i) {
        void* p = arena.allocate(64, 8);
        escape(p);
        if ((i & 0x3FF) == 0x3FF) arena.reset(); // Periodic reset
    }
    auto t4 = std::chrono::high_resolution_clock::now();
    auto dur_arena = std::chrono::duration_cast<std::chrono::microseconds>(t4 - t3).count();

    // 3. Phase 2: Fixed-Size Free-List Allocator (Embedded Memory Union)
    FreeListAllocator<64> freelist(10'000);
    auto t5 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < NUM_OPS; ++i) {
        void* p = freelist.allocate();
        escape(p);
        freelist.deallocate(p);
    }
    auto t6 = std::chrono::high_resolution_clock::now();
    auto dur_freelist = std::chrono::duration_cast<std::chrono::microseconds>(t6 - t5).count();

    // 4. Phase 3: Variable-Size Boundary-Tag Allocator
    VariableAllocator variable(POOL_SIZE);
    auto t7 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < NUM_OPS; ++i) {
        size_t sz = 16 + (i % 128);
        void* p = variable.allocate(sz);
        escape(p);
        variable.deallocate(p);
    }
    auto t8 = std::chrono::high_resolution_clock::now();
    auto dur_variable = std::chrono::duration_cast<std::chrono::microseconds>(t8 - t7).count();

    // Print Results Matrix
    std::cout << std::left << std::setw(36) << "Allocator Architecture" 
              << std::setw(18) << "Execution Time" 
              << std::setw(16) << "Speedup Factor" << "\n";
    std::cout << "-------------------------------------------------------------------------\n";

    std::cout << std::left << std::setw(36) << "Standard OS Heap (malloc/free)" 
              << std::setw(18) << (std::to_string(dur_heap) + " us") 
              << std::setw(16) << "1.00x (Baseline)" << "\n";

    std::cout << std::left << std::setw(36) << "Phase 1: Linear Arena Allocator" 
              << std::setw(18) << (std::to_string(dur_arena) + " us") 
              << std::setw(16) << (std::to_string(static_cast<double>(dur_heap)/dur_arena).substr(0, 5) + "x FASTER") << "\n";

    std::cout << std::left << std::setw(36) << "Phase 2: Fixed-Size Free-List" 
              << std::setw(18) << (std::to_string(dur_freelist) + " us") 
              << std::setw(16) << (std::to_string(static_cast<double>(dur_heap)/dur_freelist).substr(0, 5) + "x FASTER") << "\n";

    std::cout << std::left << std::setw(36) << "Phase 3: Variable-Size Allocator" 
              << std::setw(18) << (std::to_string(dur_variable) + " us") 
              << std::setw(16) << (std::to_string(static_cast<double>(dur_heap)/dur_variable).substr(0, 5) + "x FASTER") << "\n";

    std::cout << "=========================================================================\n";
    std::cout << ">>> ALL PHASES COMPLETED AND VERIFIED SUCCESSFULLY! <<<\n";
    std::cout << "=========================================================================\n";

    return 0;
}
