#pragma once
#include "memory_utils.hpp"
#include <cstddef>
#include <cstdint>
#include <new>

namespace memory_allocator {

// Phase 3: Production Variable-Size Boundary-Tag Allocator
// Supports dynamic block splitting and O(1) adjacent free block coalescing
class VariableAllocator {
public:
    struct Header {
        size_t size;    // Total block size including Header and Footer
        bool   is_free; // true if block is unallocated
    };

    struct Footer {
        size_t size;    // Mirrors Header size for backward O(1) coalescing
        bool   is_free;
    };

    VariableAllocator(const VariableAllocator&) = delete;
    VariableAllocator& operator=(const VariableAllocator&) = delete;

    explicit VariableAllocator(size_t capacity)
        : m_capacity(capacity)
    {
        m_buffer = new std::byte[m_capacity];
        reset();
    }

    ~VariableAllocator() {
        delete[] m_buffer;
    }

    [[nodiscard]] void* allocate(size_t size, size_t alignment = 8) {
        size_t needed_bytes = align_up(size + sizeof(Header) + sizeof(Footer), alignment);

        std::byte* curr_ptr = m_buffer;
        std::byte* end_ptr = m_buffer + m_capacity;

        while (curr_ptr < end_ptr) {
            Header* hdr = reinterpret_cast<Header*>(curr_ptr);
            if (hdr->is_free && hdr->size >= needed_bytes) {
                // Check if block can be split
                size_t leftover = hdr->size - needed_bytes;
                if (leftover >= sizeof(Header) + sizeof(Footer) + 16) {
                    // Split block
                    hdr->size = needed_bytes;
                    hdr->is_free = false;
                    set_footer(hdr);

                    // Create new free block in leftover space
                    std::byte* next_free_ptr = curr_ptr + needed_bytes;
                    Header* next_hdr = reinterpret_cast<Header*>(next_free_ptr);
                    next_hdr->size = leftover;
                    next_hdr->is_free = true;
                    set_footer(next_hdr);
                } else {
                    hdr->is_free = false;
                    set_footer(hdr);
                }

                return reinterpret_cast<void*>(curr_ptr + sizeof(Header));
            }
            curr_ptr += hdr->size;
        }

        throw std::bad_alloc();
    }

    void deallocate(void* ptr) noexcept {
        if (!ptr) return;

        std::byte* payload_ptr = reinterpret_cast<std::byte*>(ptr);
        std::byte* block_start = payload_ptr - sizeof(Header);
        Header* hdr = reinterpret_cast<Header*>(block_start);

        hdr->is_free = true;
        set_footer(hdr);

        // Coalesce Right Neighbor
        std::byte* right_ptr = block_start + hdr->size;
        if (right_ptr < m_buffer + m_capacity) {
            Header* right_hdr = reinterpret_cast<Header*>(right_ptr);
            if (right_hdr->is_free) {
                hdr->size += right_hdr->size;
                set_footer(hdr);
            }
        }

        // Coalesce Left Neighbor
        if (block_start > m_buffer) {
            std::byte* left_footer_ptr = block_start - sizeof(Footer);
            Footer* left_ftr = reinterpret_cast<Footer*>(left_footer_ptr);
            if (left_ftr->is_free) {
                std::byte* left_start = block_start - left_ftr->size;
                Header* left_hdr = reinterpret_cast<Header*>(left_start);
                left_hdr->size += hdr->size;
                set_footer(left_hdr);
            }
        }
    }

    void reset() noexcept {
        Header* initial_hdr = reinterpret_cast<Header*>(m_buffer);
        initial_hdr->size = m_capacity;
        initial_hdr->is_free = true;
        set_footer(initial_hdr);
    }

    [[nodiscard]] size_t capacity() const noexcept { return m_capacity; }

private:
    void set_footer(Header* hdr) noexcept {
        std::byte* ftr_ptr = reinterpret_cast<std::byte*>(hdr) + hdr->size - sizeof(Footer);
        Footer* ftr = reinterpret_cast<Footer*>(ftr_ptr);
        ftr->size = hdr->size;
        ftr->is_free = hdr->is_free;
    }

    size_t      m_capacity;
    std::byte*  m_buffer;
};

} // namespace memory_allocator
