@echo off
echo Compiling Arena Allocator V1...
g++ -std=c++20 -O3 main.cpp -o main.exe -Wall -Wextra

if %ERRORLEVEL% EQU 0 (
    echo Compilation successful! Running main.exe...
    echo ------------------------------------------
    main.exe
) else (
    echo Compilation failed!
)
