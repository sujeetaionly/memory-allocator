#include <iostream>

void run_arena_tests();
void run_freelist_tests();
void run_variable_tests();

int main() {
    std::cout << "=========================================================\n";
    std::cout << "        RUNNING PRODUCTION AUTOMATED UNIT TEST SUITE\n";
    std::cout << "=========================================================\n\n";

    run_arena_tests();
    run_freelist_tests();
    run_variable_tests();

    std::cout << "\n=========================================================\n";
    std::cout << ">>> ALL UNIT TESTS PASSED SUCCESSFULLY (0 ERRORS)! <<<\n";
    std::cout << "=========================================================\n";
    return 0;
}
