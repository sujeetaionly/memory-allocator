#include <memory_allocator/free_list_allocator.hpp>
#include <iostream>
#include <cassert>
#include <vector>
#include <new>

void test_freelist_allocation_deallocation() {
    std::cout << "[RUN] test_freelist_allocation_deallocation... ";
    memory_allocator::FreeListAllocator<64> freelist(100);

    std::vector<void*> ptrs;
    ptrs.reserve(100);

    for (size_t i = 0; i < 100; ++i) {
        void* p = freelist.allocate();
        assert(p != nullptr);
        assert(memory_allocator::is_aligned(p, alignof(std::max_align_t)));
        ptrs.push_back(p);
    }

    // Exceed capacity check
    bool exception_caught = false;
    try {
        (void)freelist.allocate();
    } catch (const std::bad_alloc&) {
        exception_caught = true;
    }
    assert(exception_caught);

    // Deallocate all pointers
    for (void* p : ptrs) {
        freelist.deallocate(p);
    }

    // After deallocation, we can allocate 100 items again
    for (size_t i = 0; i < 100; ++i) {
        void* p = freelist.allocate();
        assert(p != nullptr);
    }

    std::cout << "PASSED!\n";
}

void run_freelist_tests() {
    test_freelist_allocation_deallocation();
}
