# C++ Systems Programming Concepts: V1 Arena Allocator
*(Designed for Competitive Programmers transitioning to Low-Level Systems)*

As a competitive programmer, you are used to writing `vector<int>`, `cin`, `cout`, and focusing on time complexity like $O(N \log N)$. Memory is usually something C++ manages for you behind the scenes.

In low-level systems programming, **we take away the magic**. We look at how physical RAM, bytes, memory addresses, and CPU caches actually work.

---

## 1. Deconstructing `char[]` and Raw Byte Memory

In competitive programming, you treat `char` as a character like `'a'` or `'z'`. 
However, in C++ and computer hardware:
* **1 `char` = exactly 1 Byte = 8 bits** of physical RAM.
* Because 1 byte is the smallest addressable unit of memory in hardware, an array of `char` (or `std::byte` in modern C++) is **not just for text**—it is the universal container for **raw, untyped memory**.

Let's break down this line word-by-word:

```cpp
char* rawMemory = new char[sizeof(Node)];
```

| Word / Token | What it means in detail |
| :--- | :--- |
| **`char`** | The data type. Since 1 `char` = 1 byte, `char` is used here as a single unit of raw byte memory. |
| **`*`** | Pointer symbol. `char*` means "a variable that holds the memory address of a `char` (byte)". |
| **`rawMemory`** | The variable name we choose to hold this memory address (e.g. `0x7ffc82`). |
| **`=`** | Assignment operator. Stores the memory address returned from the right side into `rawMemory`. |
| **`new`** | Requests memory allocation from the operating system's heap manager. |
| **`char[...]`** | Tells `new` to allocate a contiguous array of `char` bytes. |
| **`sizeof(Node)`** | A built-in C++ operator that calculates the total number of bytes needed to store a `Node` object (e.g., 24 bytes). |
| **`;`** | End of line statement. |

### ⚠️ The Key Difference: `new Node` vs. `new char[24]`
1. **`new Node(10)`**: 
   - Step A: Asks OS for 24 bytes of heap memory.
   - Step B: **Automatically runs the `Node` constructor** to set up variables like `value = 10`.
2. **`new char[24]`**: 
   - Step A: Asks OS for 24 bytes of heap memory.
   - Step B: **Does NOT run any constructor!** It just gives you 24 empty, uninitialized bytes containing random garbage bits.

---

## 2. What is Placement `new`?

In standard competitive programming, if you want an object on the heap, you write:
```cpp
Node* n = new Node(10); // OS allocates memory + constructs object
```
**Placement `new`** allows you to separate memory allocation from object construction. 

If you already have a chunk of raw memory (for example, bytes inside our Arena's pre-allocated memory), you tell C++: *"Do not ask the OS for memory. Construct the `Node` at this specific memory address I give you."*

```cpp
// Syntax: new (MEMORY_ADDRESS) TYPE(CONSTRUCTOR_ARGUMENTS);
Node* n = new (rawMemory) Node(10);
```

---

## 3. What is a "Backing Buffer"?

Imagine you are in a competitive programming contest and want to avoid slow dynamic allocations inside a fast loop. You declare a big global array at the top of your file:
```cpp
char pool[1000000]; // 1 Megabyte array reserved upfront
```
That giant `pool` array is your **Backing Buffer**.

* **Backing Buffer**: The single big block of contiguous RAM (e.g., a 100MB array) that our Allocator requests from the Operating System **once** when the program starts.
* When your program needs memory for a new `Node`, instead of asking the OS (which is slow), the Allocator simply slices off 24 bytes from inside this pre-reserved **Backing Buffer**.

---

## 4. What is `n->~Node()` (Explicit Destructor Call)?

In C++, a **Destructor** is a special member function responsible for cleaning up an object when its lifecycle ends. Its name is always a tilde (`~`) followed by the class name, e.g., `~Node()`.

### How destruction normally works:
When you write `delete n;`, C++ automatically executes two separate actions behind the scenes:
1. Calls `n->~Node()` — runs the destructor code to clean up internal resources (like closing opened files or clearing inner `std::vector`s).
2. Frees the memory at pointer `n` back to the Operating System heap.

### Why `delete n` breaks when using Placement `new`:
Because `n` was constructed inside our Arena's **Backing Buffer**, writing `delete n;` would tell the Operating System to free a small piece *inside* our big pre-allocated array. The OS heap manager will get confused and crash your program with a **Heap Corruption / Segmentation Fault**.

### The Solution:
We must separate destruction from memory freeing:
1. **`n->~Node();`**: We call the destructor manually. This executes any cleanup code inside `Node` without touching the memory allocation.
2. **Reset the Arena**: Later, when we are done with all objects, we simply reset the Arena's bump pointer back to 0 to reuse the entire backing buffer.

---

## 5. Memory Alignment & Structure Padding

CPUs do not read RAM byte-by-byte. They read memory in 4-byte or 8-byte chunks (words).

### Alignment Requirement
* An 8-byte integer or pointer must be located at a memory address that is a multiple of 8 (e.g. address `0`, `8`, `16`, `24`...).
* If an 8-byte value is stored at a misaligned address like `3`, the CPU has to read two separate 8-byte blocks from RAM and stitch them together. On some CPU architectures (like ARM), misaligned access crashes the program!

### Structure Padding Example
```cpp
struct Example {
    char a;  // 1 byte
    // Compiler inserts 3 hidden "padding" bytes here!
    int b;   // 4 bytes (must start at an address divisible by 4)
};
```
Because of padding, `sizeof(Example)` is **8 bytes**, not 5 bytes!

### Bitwise Alignment Formula
To align any memory address to the next multiple of `align` (where `align` is a power of 2, like 8 or 64):

$$\text{aligned\_address} = (address + align - 1) \ \& \ \sim(align - 1)$$

In binary, subtracting 1 from a power of 2 creates a bitmask of all 1s in the lower bits. Inverting it (`~`) creates a mask that zeroes out lower bits, effectively rounding the address up to the nearest multiple of `align`.

---

## 6. CPU Cache Lines & Locality

* System RAM is relatively slow (takes ~100 CPU cycles to fetch data).
* CPU L1/L2 Cache is extremely fast (takes 1-3 CPU cycles).
* When the CPU accesses 1 byte of RAM, it automatically loads an entire **64-byte Cache Line** containing that byte and nearby bytes into the CPU cache.

### Why Arena Allocator is Faster than `malloc`:
1. **`malloc` / `new`**: Allocates nodes at random locations all across RAM. Jumping from node to node causes **Cache Misses** (CPU has to wait for slow RAM).
2. **Arena Allocator**: Places nodes sequentially right next to each other inside the contiguous **backing buffer**. When the CPU loads Node 1 into cache, Node 2 and Node 3 are already sitting inside the same 64-byte cache line (**Cache Hit**)!
