@echo off
echo Compiling Phase 3 Variable-Size Allocator with Boundary Tags (g++ -O3 -std=c++20)...
g++ -std=c++20 -O3 main.cpp -o variable_benchmark.exe
if %ERRORLEVEL% NEQ 0 (
    echo Compilation FAILED!
    exit /b %ERRORLEVEL%
)
echo Compilation SUCCESSFUL!
echo Running Benchmark...
variable_benchmark.exe
