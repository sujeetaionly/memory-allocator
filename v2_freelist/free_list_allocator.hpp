#pragma once
#include <cstddef>
#include <cstdint>
#include <new>

// Fixed-Size Free-List Allocator (Phase 2)
// Provides O(1) allocation and O(1) deallocation of fixed-size chunks (e.g. 64 Bytes).
// Achieves ZERO per-block metadata overhead by embedding free-list pointers inside unallocated blocks.
template <size_t ChunkSize = 64>
class FreeListAllocator {
public:
    FreeListAllocator(const FreeListAllocator&) = delete;
    FreeListAllocator& operator=(const FreeListAllocator&) = delete;

    explicit FreeListAllocator(size_t total_chunks)
        : m_total_chunks(total_chunks), m_free_head(nullptr)
    {
        static_assert(ChunkSize >= sizeof(FreeNode*), "ChunkSize must be at least pointer size (8 bytes)");
        size_t total_bytes = total_chunks * sizeof(NodeUnion);
        m_buffer = new std::byte[total_bytes];
        reset();
    }

    ~FreeListAllocator() {
        delete[] m_buffer;
    }

    // O(1) Allocation: Pops top free chunk from embedded free-list
    void* allocate() {
        if (!m_free_head) {
            throw std::bad_alloc();
        }
        FreeNode* node = m_free_head;
        m_free_head = m_free_head->next;
        return reinterpret_cast<void*>(node);
    }

    // O(1) Deallocation: Pushes freed chunk back onto embedded free-list
    void deallocate(void* ptr) {
        if (!ptr) return;
        FreeNode* node = reinterpret_cast<FreeNode*>(ptr);
        node->next = m_free_head;
        m_free_head = node;
    }

    // Re-links all chunks into a contiguous free-list in O(N) time
    void reset() {
        m_free_head = nullptr;
        NodeUnion* chunks = reinterpret_cast<NodeUnion*>(m_buffer);
        for (size_t i = 0; i < m_total_chunks; ++i) {
            chunks[i].free_node.next = m_free_head;
            m_free_head = &chunks[i].free_node;
        }
    }

    size_t get_total_chunks() const { return m_total_chunks; }

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
