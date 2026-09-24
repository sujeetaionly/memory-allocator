#include "arena_allocator.hpp"
#include <iostream>
#include <chrono>    // For high-precision time measurements
#include <vector>
#include <cassert>

// A sample struct representing a node in a binary tree or graph.
// It has 24 bytes size (on a 64-bit machine): 8 bytes for double, 8 bytes for int + 4 bytes padding, 8 bytes for pointer?
// Let's inspect its size and alignment.
struct Node {
    double value;   // 8 bytes
    int id;         // 4 bytes
    // 4 bytes padding automatically inserted here by the compiler to align the next member or match the struct's alignment.
    Node* next;     // 8 bytes (on 64-bit)

    // Constructor: Prints when called (optional, we can see it in action)
    Node(double v, int i, Node* n = nullptr) 
        : value(v), id(i), next(n) {
        // std::cout << "[Constructor] Node " << id << " constructed at " << this << "\n";
    }

    // Destructor: Prints when called to show explicit destructor calls
    ~Node() {
        // std::cout << "[Destructor] Node " << id << " destroyed from " << this << "\n";
    }
};

// A struct with extra large alignment requirement (e.g. AVX vector data might need 32 or 64 byte alignment)
struct alignas(64) HighAlignedData {
    float values[16]; // 16 * 4 = 64 bytes
};

int main() {
    std::cout << "=== V1 Arena Allocator Demonstration ===\n\n";

    // Show properties of the Node struct
    std::cout << "Size of Node: " << sizeof(Node) << " bytes\n";
    std::cout << "Alignment of Node: " << alignof(Node) << " bytes\n";
    std::cout << "Size of HighAlignedData: " << sizeof(HighAlignedData) << " bytes\n";
    std::cout << "Alignment of HighAlignedData: " << alignof(HighAlignedData) << " bytes\n\n";

    // -------------------------------------------------------------
    // Part 1: Basic Arena Setup and Allocations
    // -------------------------------------------------------------
    std::cout << "--- Part 1: Allocating & Constructing Objects ---\n";
    // We pre-allocate a 1 KB arena buffer
    ArenaAllocator arena(1024);
    std::cout << "Arena initialized with capacity: " << arena.capacity() << " bytes\n";
    std::cout << "Initial arena usage: " << arena.used() << " bytes\n\n";

    // Allocate memory for our first Node
    void* raw_mem_1 = arena.allocate(sizeof(Node), alignof(Node));
    std::cout << "Allocated Node memory at: " << raw_mem_1 << " | Arena usage: " << arena.used() << " bytes\n";

    // Verify alignment: the address cast to integer must be divisible by 8 (alignof(Node))
    uintptr_t addr_1 = reinterpret_cast<uintptr_t>(raw_mem_1);
    assert(addr_1 % alignof(Node) == 0 && "Memory must be aligned to Node's alignment requirement!");
    std::cout << "Confirmed: Address " << raw_mem_1 << " is divisible by " << alignof(Node) << "\n";

    // Use placement new to construct Node inside the allocated memory
    Node* node1 = new (raw_mem_1) Node(3.14, 101);
    std::cout << "Node 1 values: value=" << node1->value << ", id=" << node1->id << "\n\n";

    // Allocate and construct a second Node
    void* raw_mem_2 = arena.allocate(sizeof(Node), alignof(Node));
    Node* node2 = new (raw_mem_2) Node(2.718, 102, node1);
    std::cout << "Allocated Node 2 memory at: " << raw_mem_2 << " | Arena usage: " << arena.used() << " bytes\n";
    std::cout << "Node 2 values: value=" << node2->value << ", id=" << node2->id << ", next=" << node2->next << "\n\n";

    // Allocate data with 64-byte alignment
    void* raw_mem_aligned = arena.allocate(sizeof(HighAlignedData), alignof(HighAlignedData));
    std::cout << "Allocated HighAlignedData memory at: " << raw_mem_aligned << " | Arena usage: " << arena.used() << " bytes\n";
    uintptr_t addr_aligned = reinterpret_cast<uintptr_t>(raw_mem_aligned);
    assert(addr_aligned % 64 == 0 && "Memory must be 64-byte aligned!");
    std::cout << "Confirmed: Address " << raw_mem_aligned << " is divisible by 64!\n\n";

    // -------------------------------------------------------------
    // Part 2: Manual Cleanup
    // -------------------------------------------------------------
    std::cout << "--- Part 2: Manual Cleanup ---\n";
    // We cannot call "delete node1" or "delete node2". If we did, the runtime would try
    // to return the individual node addresses back to the global heap, causing a crash.
    //
    // Instead, we must call the destructors explicitly:
    std::cout << "Calling Node destructors explicitly...\n";
    node2->~Node();
    node1->~Node();

    // Now we reset the entire arena. This is an O(1) operation that sets the offset back to 0.
    arena.reset();
    std::cout << "Arena reset. Usage is now: " << arena.used() << " bytes\n\n";

    // -------------------------------------------------------------
    // Part 3: Micro-Benchmarking (Arena vs. Standard malloc/new)
    // -------------------------------------------------------------
    std::cout << "--- Part 3: Micro-Benchmarking (Arena vs. Heap Allocator) ---\n";
    const int NUM_ALLOCATIONS = 100000;
    std::cout << "Running comparison by allocating " << NUM_ALLOCATIONS << " Nodes...\n";

    // 1. Benchmarking Standard heap allocation (new/delete)
    auto start_standard = std::chrono::high_resolution_clock::now();
    
    // We store pointers in a vector to simulate real usage and to free them later.
    std::vector<Node*> standard_nodes;
    standard_nodes.reserve(NUM_ALLOCATIONS);

    for (int i = 0; i < NUM_ALLOCATIONS; ++i) {
        // Standard "new" does: Syscall for memory allocation + constructor call
        standard_nodes.push_back(new Node(static_cast<double>(i), i));
    }

    auto end_standard = std::chrono::high_resolution_clock::now();
    
    // Cleanup the standard heap objects (we must run destructors AND free memory)
    for (int i = 0; i < NUM_ALLOCATIONS; ++i) {
        delete standard_nodes[i];
    }
    
    auto duration_standard = std::chrono::duration_cast<std::chrono::microseconds>(end_standard - start_standard).count();
    std::cout << "Standard heap (new/delete): " << duration_standard << " microseconds\n";

    // 2. Benchmarking Arena Allocator
    // Allocate a large arena (Node size + alignment room * NUM_ALLOCATIONS)
    size_t arena_capacity = (sizeof(Node) + alignof(Node)) * NUM_ALLOCATIONS;
    ArenaAllocator benchmark_arena(arena_capacity);

    auto start_arena = std::chrono::high_resolution_clock::now();
    
    std::vector<Node*> arena_nodes;
    arena_nodes.reserve(NUM_ALLOCATIONS);

    for (int i = 0; i < NUM_ALLOCATIONS; ++i) {
        // 1. Allocate from arena (simple pointer math)
        void* mem = benchmark_arena.allocate(sizeof(Node), alignof(Node));
        // 2. Construct via placement new
        arena_nodes.push_back(new (mem) Node(static_cast<double>(i), i));
    }

    auto end_arena = std::chrono::high_resolution_clock::now();

    // Cleanup: Run destructors manually.
    // Note: In real production, if the Node destructor is trivial (doesn't free internal heap memory),
    // we can completely skip calling it! That makes Arena allocator even faster.
    // But to be safe, we will call it here.
    for (int i = 0; i < NUM_ALLOCATIONS; ++i) {
        arena_nodes[i]->~Node();
    }
    // Reclaim all memory instantly!
    benchmark_arena.reset();

    auto duration_arena = std::chrono::duration_cast<std::chrono::microseconds>(end_arena - start_arena).count();
    std::cout << "Arena Allocator (placement new): " << duration_arena << " microseconds\n";

    // Calculate speedup
    double speedup = static_cast<double>(duration_standard) / duration_arena;
    std::cout << "Speedup Factor: " << speedup << "x faster than standard heap!\n";
    std::cout << "(Custom Allocator reduced allocation time by " 
              << (1.0 - (static_cast<double>(duration_arena) / duration_standard)) * 100.0 << "%)\n\n";

    std::cout << "=== V1 Demonstration Complete ===\n";
    return 0;
}
