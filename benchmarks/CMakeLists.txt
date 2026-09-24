# Benchmarks CMake Target
add_executable(memory_allocator_benchmarks
    benchmark_main.cpp
)

target_link_libraries(memory_allocator_benchmarks PRIVATE memory_allocator)
