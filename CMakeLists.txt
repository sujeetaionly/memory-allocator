cmake_minimum_required(VERSION 3.16)
project(MemoryAllocator VERSION 2.0.0 LANGUAGES CXX)

# Enforce Modern C++20 Standard Across All Platforms
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Option to Enable Mathematical Proof of Safety via Sanitizers (ASan / UBSan)
option(ENABLE_SANITIZERS "Enable AddressSanitizer (ASan) and UndefinedBehaviorSanitizer (UBSan)" OFF)

# Modern Interface Header-Only Library Target
add_library(memory_allocator INTERFACE)

target_include_directories(memory_allocator INTERFACE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

# Compiler Warning Flags (HFT / Production Strictness)
if(MSVC)
    target_compile_options(memory_allocator INTERFACE /W4 /WX)
else()
    target_compile_options(memory_allocator INTERFACE -Wall -Wextra -Wpedantic -Werror)
endif()

# Sanitizer Flags Configuration
if(ENABLE_SANITIZERS)
    message(STATUS "Enabling AddressSanitizer (ASan) and UndefinedBehaviorSanitizer (UBSan)")
    if(MSVC)
        target_compile_options(memory_allocator INTERFACE /fsanitize=address)
    else()
        target_compile_options(memory_allocator INTERFACE -fsanitize=address,undefined -fno-omit-frame-pointer -g)
        target_link_options(memory_allocator INTERFACE -fsanitize=address,undefined)
    endif()
endif()

# Enable Testing (CTest)
enable_testing()

# Include Subdirectories
add_subdirectory(tests)
add_subdirectory(benchmarks)

message(STATUS "Memory Allocator Production CMake Configured Successfully.")
