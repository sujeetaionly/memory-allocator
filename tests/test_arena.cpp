#include <memory_allocator/arena_allocator.hpp>
#include <iostream>
#include <cassert>
#include <new>

void test_arena_basic_allocation() {
    std::cout << "[RUN] test_arena_basic_allocation... ";
    memory_allocator::ArenaAllocator arena(1024);

    void* p1 = arena.allocate(100, 8);
    assert(p1 != nullptr);
    assert(memory_allocator::is_aligned(p1, 8));
    assert(arena.used_bytes() >= 100);

    void* p2 = arena.allocate(200, 16);
    assert(p2 != nullptr);
    assert(memory_allocator::is_aligned(p2, 16));
    assert(p2 > p1);

    std::cout << "PASSED!\n";
}

void test_arena_exhaustion() {
    std::cout << "[RUN] test_arena_exhaustion... ";
    memory_allocator::ArenaAllocator arena(256);

    void* p = arena.allocate(200, 8);
    assert(p != nullptr);

    bool exception_caught = false;
    try {
        (void)arena.allocate(100, 8); // Exceeds 256 bytes capacity
    } catch (const std::bad_alloc&) {
        exception_caught = true;
    }
    assert(exception_caught);

    std::cout << "PASSED!\n";
}

void test_arena_reset() {
    std::cout << "[RUN] test_arena_reset... ";
    memory_allocator::ArenaAllocator arena(512);

    void* p1 = arena.allocate(300, 8);
    assert(p1 != nullptr);

    arena.reset();
    assert(arena.used_bytes() == 0);

    void* p2 = arena.allocate(300, 8);
    assert(p2 == p1); // After reset, same memory address is re-allocated

    std::cout << "PASSED!\n";
}

void run_arena_tests() {
    test_arena_basic_allocation();
    test_arena_exhaustion();
    test_arena_reset();
}
