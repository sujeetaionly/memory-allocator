@echo off
echo Compiling Final Memory Allocator Benchmark Suite (g++ -O3 -std=c++20)...
g++ -std=c++20 -O3 benchmark_suite.cpp -o full_benchmark.exe
if %ERRORLEVEL% NEQ 0 (
    echo Compilation FAILED!
    exit /b %ERRORLEVEL%
)
echo Compilation SUCCESSFUL!
echo Running Final Comparative Benchmark...
full_benchmark.exe
