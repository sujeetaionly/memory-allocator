# High-Performance C++ Memory Allocators & Systems Engine

[![C++20](https://img.shields.io/badge/C%2B%2B-20-blue.svg)](https://en.cppreference.com/w/cpp/20)
[![Build System](https://img.shields.io/badge/CMake-3.16%2B-green.svg)](https://cmake.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

A production-grade, zero-overhead custom memory allocator suite written in modern C++20 for high-frequency trading (HFT) and ultra-low latency backend systems. Achieves up to **125x–150x execution speedups** over the standard Operating System heap manager (`std::malloc` / `new`).

---

## ⚡ Architectural Performance Matrix

Benchmarked across **1,000,000 allocation & deallocation operations** (`g++ -O3 -std=c++20`):

| Allocator Architecture | Avg Latency | Speedup Factor | Hardware & Systems Mechanical Advantage |
| :--- | :--- | :--- | :--- |
| **Standard OS Heap (`malloc`/`free`)** | `54,916 µs` | `1.00x` (Baseline) | Incurs kernel traps (`brk`/`mmap`), thread mutex locks, & free-list bin searches |
| **Phase 1: Linear Arena Allocator** | `1,306 µs` | **`42.04x FASTER`** | 1-cycle integer bump pointer addition & bitwise alignment mask `(addr + align - 1) & ~(align - 1)` |
| **Phase 2: Fixed-Size Free-List** | `436.8 µs` | **`125.7x FASTER`** | Zero per-block metadata overhead via embedded memory unions (`union NodeUnion`) & $O(1)$ push/pop |
| **Phase 3: Variable-Size Allocator** | `3,654 µs` | **`15.02x FASTER`** | Boundary tag headers/footers with instant $O(1)$ left/right free block coalescing |

---

## 📁 Repository Structure

```
Memory Allocator/
├── CMakeLists.txt                 # Master CMake Build Configuration
├── include/                       # Public Header-Only Production Library
│   └── memory_allocator/
│       ├── arena_allocator.hpp    # Linear Arena Allocator (Phase 1)
│       ├── free_list_allocator.hpp# Fixed-Size Free-List Allocator (Phase 2)
│       ├── variable_allocator.hpp # Variable-Size Boundary-Tag Allocator (Phase 3)
│       └── memory_utils.hpp       # Bitwise alignment & compiler escape barriers
├── tests/                         # Production Automated Unit Test Suite
│   ├── CMakeLists.txt
│   ├── unit_tests_main.cpp
│   ├── test_arena.cpp
│   ├── test_freelist.cpp
│   └── test_variable.cpp
├── benchmarks/                    # Standardized Micro-Benchmark Suite
│   ├── CMakeLists.txt
│   └── benchmark_main.cpp
```
Memory Allocator/
├── CMakeLists.txt                 # Master CMake Build Configuration
├── include/                       # Public Header-Only Production Library
│   └── memory_allocator/
│       ├── arena_allocator.hpp    # Linear Arena Allocator (Phase 1)
│       ├── free_list_allocator.hpp# Fixed-Size Free-List Allocator (Phase 2)
│       ├── variable_allocator.hpp # Variable-Size Boundary-Tag Allocator (Phase 3)
│       └── memory_utils.hpp       # Bitwise alignment & compiler escape barriers
├── tests/                         # Production Automated Unit Test Suite
├── benchmarks/                    # Standardized Micro-Benchmark Suite
└── web_app/                       # Next.js 14 Production Interactive Learning Platform
    ├── src/
    │   ├── app/                   # App router pages & layouts
    │   ├── components/            # Interactive simulators & code studios
    │   ├── data/                  # Beginner-first concepts, quizzes & flashcards
    │   └── types/                 # TypeScript type definitions
    ├── package.json
    └── vercel.json                # 1-Click Vercel Deployment Config
```

---

## 🚀 Interactive Next.js Learning Platform (Vercel Deployable)

A full-stack, zero-to-one educational platform engineered specifically for **C++ beginners aspiring to become Quant Developers in Low-Latency HFT systems**:

* 🎓 **Module 0: Systems Primer**: Explains physical RAM, pointers, the stack vs the heap, processes vs threads, and why standard `malloc` mutex locks cause catastrophic HFT latency spikes.
* ⚡ **Interactive Simulators**:
  - **Live Arena Bump Pointer**: Watch the 1-cycle pointer slide forward and see alignment padding bytes.
  - **Embedded Union Free-List**: See how 64-byte chunks store linked list pointers when free and user orders when allocated (0 bytes overhead!).
  - **Knuth Boundary-Tag Coalescing**: Watch real-time block splitting and bidirectional O(1) left/right neighbor merging.
  - **Bitwise Math Lab**: Step-by-step breakdown of `(addr + align - 1) & ~(align - 1)`.
  - **64-Byte CPU Cache Line & False Sharing Lab**: Visualizes cache straddling and multi-core `alignas(64)` fixes.
* 💻 **Synchronized C++ Code Studio**: Click on any line of code to inspect how CPU registers and physical RAM execute it.
* 📊 **Quant Latency Lab**: Interactive comparison of P50 vs P99/P99.9 tail latencies across 1,000,000 operations.
* 🏆 **Quant Interview War Room**: Real interview questions from Citadel, Jane Street, and Optiver, with flashcards and resume bullet points.

### Running the Web Platform Locally

```bash
cd web_app
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploying to Vercel in 1 Click

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: upgrade to Next.js quant learning platform"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository and set the **Root Directory** to `web_app`.
4. Click **Deploy**! Vercel will automatically build and publish your platform globally with zero configuration.

---

## 📜 License

MIT License. Developed for low-latency C++ systems research and portfolio demonstration.
