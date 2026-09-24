#include "free_list_allocator.hpp"
#include <iostream>
#include <chrono>
#include <vector>
#include <cassert>

struct OrderPacket {
    uint64_t order_id;
    double   price;
    uint32_t quantity;
    char     symbol[8];
}; // Size: 32 bytes

// Prevent compiler from optimizing away allocation benchmarks
void escape(void* p) {
    asm volatile("" : : "g"(p) : "memory");
}

int main() {
    std::cout << "=========================================================\n";
    std::cout << " Phase 2: Fixed-Size Free-List Allocator Benchmark\n";
    std::cout << "=========================================================\n\n";

    constexpr size_t NUM_OPERATIONS = 1'000'000;
    constexpr size_t POOL_CHUNKS = 10'000;

    // 1. Correctness Test: Repeated Allocate and Deallocate
    FreeListAllocator<64> pool(POOL_CHUNKS);
    std::vector<void*> allocated_ptrs;
    allocated_ptrs.reserve(POOL_CHUNKS);

    std::cout << "[1/3] Testing Pool Allocation (" << POOL_CHUNKS << " chunks)... ";
    for (size_t i = 0; i < POOL_CHUNKS; ++i) {
        void* p = pool.allocate();
        assert(p != nullptr);
        allocated_ptrs.push_back(p);
    }
    std::cout << "SUCCESS!\n";

    std::cout << "[2/3] Testing Individual O(1) Deallocations... ";
    for (void* p : allocated_ptrs) {
        pool.deallocate(p);
    }
    allocated_ptrs.clear();
    std::cout << "SUCCESS!\n\n";

    // 2. Micro-Benchmark vs Standard Heap (new / delete)
    std::cout << "[3/3] Running High-Frequency Allocation Benchmark (" << NUM_OPERATIONS << " ops)...\n";

    // Baseline: Global OS Heap (new / delete)
    auto t1 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < NUM_OPERATIONS; ++i) {
        OrderPacket* pkt = new OrderPacket{i, 150.25, 100, "AAPL"};
        escape(pkt);
        delete pkt;
    }
    auto t2 = std::chrono::high_resolution_clock::now();
    auto dur_heap = std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1).count();

    // Free-List Allocator: O(1) Push/Pop in Pre-allocated Pool
    auto t3 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < NUM_OPERATIONS; ++i) {
        void* mem = pool.allocate();
        OrderPacket* pkt = new (mem) OrderPacket{i, 150.25, 100, "AAPL"};
        escape(pkt);
        pkt->~OrderPacket();
        pool.deallocate(mem);
    }
    auto t4 = std::chrono::high_resolution_clock::now();
    auto dur_freelist = std::chrono::duration_cast<std::chrono::microseconds>(t4 - t3).count();

    std::cout << "  - Standard Heap (new/delete) : " << dur_heap << " us\n";
    std::cout << "  - Free-List Allocator (Pool) : " << dur_freelist << " us\n";

    if (dur_freelist > 0) {
        double speedup = static_cast<double>(dur_heap) / dur_freelist;
        std::cout << "\n>>> Phase 2 Free-List Speedup: " << speedup << "x Faster! <<<\n";
    }
    std::cout << "=========================================================\n";

    return 0;
}
