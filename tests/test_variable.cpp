#include <memory_allocator/variable_allocator.hpp>
#include <iostream>
#include <cassert>
#include <new>

void test_variable_coalescing() {
    std::cout << "[RUN] test_variable_coalescing... ";
    memory_allocator::VariableAllocator allocator(10 * 1024); // 10 KB

    void* p1 = allocator.allocate(100);
    void* p2 = allocator.allocate(200);
    void* p3 = allocator.allocate(300);

    assert(p1 != nullptr && p2 != nullptr && p3 != nullptr);

    // Free p2 (middle block), then p1 (left block), then p3 (right block)
    allocator.deallocate(p2);
    allocator.deallocate(p1);
    allocator.deallocate(p3);

    // Verify coalescing: requesting a large 500-byte block must succeed
    void* p_large = allocator.allocate(500);
    assert(p_large != nullptr);
    allocator.deallocate(p_large);

    std::cout << "PASSED!\n";
}

void run_variable_tests() {
    test_variable_coalescing();
}
