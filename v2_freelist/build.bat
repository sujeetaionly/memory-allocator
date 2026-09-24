@echo off
echo Compiling Phase 2 Fixed-Size Free-List Allocator (g++ -O3 -std=c++20)...
g++ -std=c++20 -O3 main.cpp -o freelist_benchmark.exe
if %ERRORLEVEL% NEQ 0 (
    echo Compilation FAILED!
    exit /b %ERRORLEVEL%
)
echo Compilation SUCCESSFUL!
echo Running Benchmark...
freelist_benchmark.exe
