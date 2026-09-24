#pragma once
#include <cstddef>
#include <cstdint>

namespace memory_allocator {

// 1-Clock-Cycle Bitwise Alignment Helper
// Enforces power-of-two alignment boundaries without modulo division
inline uintptr_t align_up(uintptr_t address, size_t alignment) noexcept {
    return (address + alignment - 1) & ~(static_cast<uintptr_t>(alignment) - 1);
}

inline bool is_aligned(const void* ptr, size_t alignment) noexcept {
    return (reinterpret_cast<uintptr_t>(ptr) & (alignment - 1)) == 0;
}

// Compiler Escape Barrier: Prevents optimizer from dead-code eliminating allocation benchmarks
inline void escape(void* p) noexcept {
#if defined(__GNUG__) || defined(__clang__)
    asm volatile("" : : "g"(p) : "memory");
#elif defined(_MSC_VER)
    // Microsoft Visual C++ inline memory barrier
    ::MemoryBarrier();
#endif
}

} // namespace memory_allocator
