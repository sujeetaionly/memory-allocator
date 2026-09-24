#pragma once

#include <cstddef>   // Required for std::byte and size_t
#include <cstdint>   // Required for uintptr_t
#include <new>       // Required for std::bad_alloc
#include <iostream>  // Useful for debug prints if needed

/**
 * @brief A simple Arena (Linear) Allocator.
 * 
 * An Arena Allocator pre-allocates a single contiguous block of memory.
 * Allocations are made by moving a pointer forward (bumping it).
 * Individual deallocations are not allowed; instead, the entire arena
 * is reset at once, reclaiming all memory in O(1) time.
 */
class ArenaAllocator {
public:
    // We disallow copy-construction and copy-assignment because an allocator
    // owns a specific block of physical memory. Copying it would lead to double-free bugs.
    ArenaAllocator(const ArenaAllocator&) = delete;
    ArenaAllocator& operator=(const ArenaAllocator&) = delete;

    /**
     * @brief Construct a new Arena Allocator.
     * 
     * @param capacity The total size of the backing buffer in bytes.
     */
    explicit ArenaAllocator(size_t capacity) 
        : m_capacity(capacity), m_offset(0) {
        
        // We allocate the raw memory as an array of std::byte.
        // std::byte (introduced in C++17) is preferred over char or unsigned char
        // because it explicitly represents raw, untyped memory instead of character data.
        m_buffer = new std::byte[m_capacity];
    }

    /**
     * @brief Destroy the Arena Allocator and free the pre-allocated backing memory.
     */
    ~ArenaAllocator() {
        // Since we allocated the buffer with 'new[]', we must free it with 'delete[]'.
        // This is the only system call we make to free this memory block.
        delete[] m_buffer;
    }

    /**
     * @brief Allocates raw memory of a given size and alignment.
     * 
     * @param size The number of bytes to allocate.
     * @param alignment The alignment boundary (must be a power of 2, e.g., 1, 2, 4, 8, 16, 64).
     * @return void* A pointer to the aligned block of memory.
     */
    void* allocate(size_t size, size_t alignment) {
        // 1. Get the current raw address where the next allocation would start
        // if alignment was not a factor.
        uintptr_t current_address = reinterpret_cast<uintptr_t>(m_buffer + m_offset);

        // 2. Perform the memory alignment math.
        // We need to find the next address >= current_address that is a multiple of 'alignment'.
        //
        // Explaining the Bitwise Math:
        // A number alignment (like 8) is a power of 2:
        //   8 = 0b00001000
        //   8 - 1 = 7 = 0b00000111
        //   ~(8 - 1) = ~7 = ...11111000 (a mask that clears the lower 3 bits)
        //
        // Adding (alignment - 1) forces the address to cross the next boundary if it wasn't
        // already aligned. The bitwise AND with ~(alignment - 1) then rounds it down to that boundary.
        //
        // Example: If current_address = 9, alignment = 8:
        //   (9 + 7) & ~7
        //   = 16 & 0b...11111000
        //   = 16 (properly aligned to 8)
        uintptr_t aligned_address = (current_address + alignment - 1) & ~(alignment - 1);

        // 3. Calculate the new offset relative to the start of our backing buffer.
        // We subtract the start address of our buffer to find how many bytes deep we are.
        uintptr_t buffer_start = reinterpret_cast<uintptr_t>(m_buffer);
        size_t new_offset = (aligned_address - buffer_start) + size;

        // 4. Check for Out-Of-Memory (OOM).
        // If the new offset exceeds the capacity, we cannot fulfill the allocation.
        if (new_offset > m_capacity) {
            // Throwing standard C++ bad_alloc exception, mirroring standard library behavior
            throw std::bad_alloc();
        }

        // 5. Commit the allocation.
        // We update our offset tracker to point to the next free byte.
        m_offset = new_offset;

        // 6. Return the aligned address cast back to a generic void pointer.
        return reinterpret_cast<void*>(aligned_address);
    }

    /**
     * @brief Reclaims all memory inside the arena in O(1) time.
     * 
     * Instead of running destructors or cleaning up individual allocations,
     * we simply reset the offset to 0. The next allocations will overwrite the old data.
     * 
     * WARNING: Any pointers previously allocated from this arena become invalid
     * after calling reset()! Destructors for constructed objects must be called
     * manually BEFORE resetting the arena.
     */
    void reset() {
        m_offset = 0;
    }

    /**
     * @brief Returns the total capacity of the allocator.
     */
    size_t capacity() const { return m_capacity; }

    /**
     * @brief Returns the number of bytes currently used (including padding bytes).
     */
    size_t used() const { return m_offset; }

private:
    std::byte* m_buffer;   // Pointer to the pre-allocated raw memory buffer
    size_t     m_capacity; // Total size of the buffer in bytes
    size_t     m_offset;   // Tracks where the next available byte is
};
