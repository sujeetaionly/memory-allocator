#pragma once
#include "memory_utils.hpp"
#include <cstddef>
#include <cstdint>
#include <new>

namespace memory_allocator {

// Phase 1: Production Linear Arena Allocator
// Contiguous raw byte buffer with 1-cycle integer bump pointer allocation
class ArenaAllocator {
public:
    ArenaAllocator(const ArenaAllocator&) = delete;
    ArenaAllocator& operator=(const ArenaAllocator&) = delete;

    explicit ArenaAllocator(size_t capacity)
        : m_capacity(capacity), m_offset(0)
    {
        m_buffer = new std::byte[m_capacity];
    }

    ~ArenaAllocator() {
        delete[] m_buffer;
    }

    [[nodiscard]] void* allocate(size_t size, size_t alignment = 8) {
        uintptr_t current_address = reinterpret_cast<uintptr_t>(m_buffer + m_offset);
        uintptr_t aligned_address = align_up(current_address, alignment);
        uintptr_t buffer_start = reinterpret_cast<uintptr_t>(m_buffer);

        size_t new_offset = (aligned_address - buffer_start) + size;

        if (new_offset > m_capacity) {
            throw std::bad_alloc();
        }

        m_offset = new_offset;
        return reinterpret_cast<void*>(aligned_address);
    }

    void reset() noexcept {
        m_offset = 0;
    }

    [[nodiscard]] size_t capacity() const noexcept { return m_capacity; }
    [[nodiscard]] size_t used_bytes() const noexcept { return m_offset; }
    [[nodiscard]] size_t available_bytes() const noexcept { return m_capacity - m_offset; }

private:
    std::byte* m_buffer;
    size_t     m_capacity;
    size_t     m_offset;
};

} // namespace memory_allocator
