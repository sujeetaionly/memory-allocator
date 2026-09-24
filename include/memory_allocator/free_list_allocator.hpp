#pragma once
#include "memory_utils.hpp"
#include <cstddef>
#include <cstdint>
#include <new>

namespace memory_allocator {

// Phase 2: Production Fixed-Size Free-List Allocator
// Zero per-block metadata overhead using embedded memory unions (union NodeUnion)
template <size_t ChunkSize = 64>
class FreeListAllocator {
public:
    static_assert(ChunkSize >= sizeof(void*), "ChunkSize must be at least pointer size (8 bytes)");

    FreeListAllocator(const FreeListAllocator&) = delete;
    FreeListAllocator& operator=(const FreeListAllocator&) = delete;

    explicit FreeListAllocator(size_t total_chunks)
        : m_total_chunks(total_chunks), m_free_head(nullptr)
    {
        size_t total_bytes = m_total_chunks * sizeof(NodeUnion);
        m_buffer = new std::byte[total_bytes];
        reset();
    }

    ~FreeListAllocator() {
        delete[] m_buffer;
    }

    [[nodiscard]] void* allocate() {
        if (!m_free_head) {
            throw std::bad_alloc();
        }
        FreeNode* node = m_free_head;
        m_free_head = m_free_head->next;
        return reinterpret_cast<void*>(node);
    }

    void deallocate(void* ptr) noexcept {
        if (!ptr) return;
        FreeNode* node = reinterpret_cast<FreeNode*>(ptr);
        node->next = m_free_head;
        m_free_head = node;
    }

    void reset() noexcept {
        m_free_head = nullptr;
        NodeUnion* chunks = reinterpret_cast<NodeUnion*>(m_buffer);
        for (size_t i = 0; i < m_total_chunks; ++i) {
            chunks[i].free_node.next = m_free_head;
            m_free_head = &chunks[i].free_node;
        }
    }

    [[nodiscard]] size_t total_chunks() const noexcept { return m_total_chunks; }

private:
    struct FreeNode {
        FreeNode* next;
    };

    union NodeUnion {
        FreeNode free_node;
        alignas(std::max_align_t) std::byte data[ChunkSize];
    };

    size_t      m_total_chunks;
    std::byte*  m_buffer;
    FreeNode*   m_free_head;
};

} // namespace memory_allocator
