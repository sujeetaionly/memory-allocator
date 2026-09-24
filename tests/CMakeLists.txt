# Unit Tests CMake Target
add_executable(unit_tests
    unit_tests_main.cpp
    test_arena.cpp
    test_freelist.cpp
    test_variable.cpp
)

target_link_libraries(unit_tests PRIVATE memory_allocator)

add_test(NAME UnitTests COMMAND unit_tests)
