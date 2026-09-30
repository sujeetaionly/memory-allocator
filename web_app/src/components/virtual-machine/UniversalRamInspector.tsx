'use client';

import React, { useState } from 'react';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

export const UniversalRamInspector: React.FC = () => {
  const {
    cells,
    bumpPointer,
    freeListHead,
    selectedAddress,
    inspectAddress,
    cyclesSpent,
    registers,
  } = useVirtualMachine();

  const [colsMode, setColsMode] = useState<8 | 16>(8);

  const selectedCell = selectedAddress !== null ? cells[selectedAddress] : null;

  const formatBinary = (val: number) => {
    const raw = val.toString(2).padStart(8, '0');
    return `${raw.slice(0, 4)} ${raw.slice(4)}`;
  };

  const getCellStyles = (state: string, isSelected: boolean) => {
    if (isSelected) {
      return 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500 font-bold dark:bg-blue-900/60 dark:text-blue-100 dark:border-blue-400 shadow-xs';
    }
    switch (state) {
      case 'allocated':
        return 'bg-blue-100/90 text-blue-950 border-blue-300 hover:bg-blue-200 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700 font-semibold';
      case 'padding':
        return 'bg-amber-100/80 text-amber-950 border-amber-300 hover:bg-amber-200 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700 repeating-stripes';
      case 'header':
      case 'footer':
        return 'bg-purple-100/90 text-purple-950 border-purple-300 hover:bg-purple-200 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-700 font-semibold';
      case 'pointer':
        return 'bg-teal-100/90 text-teal-950 border-teal-300 hover:bg-teal-200 dark:bg-teal-950/80 dark:text-teal-200 dark:border-teal-700 font-semibold';
      default:
        return 'bg-slate-50 text-slate-400 border-slate-200/90 hover:bg-slate-100 hover:text-slate-600 dark:bg-slate-900/50 dark:text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800/80';
    }
  };

  const numCols = colsMode;
  const numRows = Math.ceil(64 / numCols);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-all">
      {/* Top Bar with Title & View Mode Toggle */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
              Universal RAM Inspector
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              64 Bytes
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Physical RAM grid (Click any byte to inspect binary bits)
          </p>
        </div>

        {/* Telemetry pill & View switch */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
            ⚡ {cyclesSpent} Cyc
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setColsMode(8)}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                colsMode === 8
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              8-Wide
            </button>
            <button
              onClick={() => setColsMode(16)}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                colsMode === 16
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              16-Wide
            </button>
          </div>
        </div>
      </div>

      {/* Pointer & Register Badges */}
      <div className="flex flex-wrap gap-2 text-[11px] font-mono">
        <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800/80 flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span className="font-semibold">Bump Cursor:</span>
          <span className="font-bold">0x{bumpPointer.toString(16).padStart(2, '0').toUpperCase()}</span>
          <span className="text-[10px] text-blue-500">({bumpPointer}B)</span>
        </div>

        {freeListHead !== null && (
          <div className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-800/80 flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            <span className="font-semibold">FreeList Head:</span>
            <span className="font-bold">0x{freeListHead.toString(16).padStart(2, '0').toUpperCase()}</span>
          </div>
        )}

        <div className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800/80 flex items-center gap-1.5 shadow-xs">
          <span className="font-semibold text-purple-500">RSP:</span>
          <span>{registers.rsp.slice(-6)}</span>
        </div>
      </div>

      {/* Spacious Memory Matrix with Pixel-Perfect Alignment */}
      <div className="overflow-x-auto space-y-1.5 bg-slate-50/70 dark:bg-slate-950/40 p-2 sm:p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
        <div className="min-w-[300px]">
          {/* Column Headers with exact flex container matching rows */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-center text-slate-400 select-none pb-1">
          <span className="w-10 select-none text-right shrink-0"></span>
          <div
            className={`grid gap-1.5 flex-1 ${
              colsMode === 8 ? 'grid-cols-8' : 'grid-cols-16'
            }`}
          >
            {Array.from({ length: numCols }).map((_, col) => (
              <div key={col} className="font-semibold">
                +{col.toString(16).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Rows of Bytes */}
        {Array.from({ length: numRows }).map((_, row) => {
          const rowStart = row * numCols;
          const rowAddressHex = '0x' + rowStart.toString(16).padStart(2, '0').toUpperCase();

          return (
            <div key={row} className="flex items-center gap-2">
              {/* Row Address Label */}
              <span className="text-[10.5px] font-mono text-slate-400 w-10 select-none text-right font-medium shrink-0">
                {rowAddressHex}
              </span>

              {/* Bytes Grid */}
              <div
                className={`grid gap-1.5 flex-1 ${
                  colsMode === 8 ? 'grid-cols-8' : 'grid-cols-16'
                }`}
              >
                {Array.from({ length: numCols }).map((_, col) => {
                  const addr = rowStart + col;
                  if (addr >= 64) return null;
                  const cell = cells[addr];
                  const isSelected = selectedAddress === addr;
                  const isBumpHead = bumpPointer === addr;
                  const isFreeHead = freeListHead === addr;

                  return (
                    <button
                      key={addr}
                      onClick={() => inspectAddress(addr)}
                      title={`Address: ${cell.addressHex} (${cell.address}) | Value: 0x${cell.valueHex} | ${cell.tag || cell.state}`}
                      className={`relative rounded-lg font-mono transition-all flex flex-col items-center justify-center border cursor-pointer select-none ${
                        colsMode === 8 ? 'h-9 py-0.5' : 'h-7'
                      } ${getCellStyles(cell.state, isSelected)}`}
                    >
                      <span className="text-[11px] font-bold tracking-tight">
                        {cell.valueHex}
                      </span>
                      {colsMode === 8 && (
                        <span className="text-[8.5px] opacity-50 block -mt-0.5">
                          {cell.address}
                        </span>
                      )}

                      {/* Head Pointer Pin Indicator */}
                      {isBumpHead && (
                        <span
                          className="absolute -top-1.5 -right-1 text-[8px] bg-blue-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs font-bold"
                          title="Bump Cursor Pointing Here"
                        >
                          ▲
                        </span>
                      )}
                      {isFreeHead && (
                        <span
                          className="absolute -bottom-1.5 -left-1 text-[8px] bg-teal-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs font-bold"
                          title="FreeList Head Pointing Here"
                        >
                          ●
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Memory Color Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700"></span> Empty
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-blue-400"></span> Allocated Object
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-400 repeating-stripes"></span> Padding
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-purple-400"></span> Boundary Tag
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-teal-400"></span> Embedded Ptr
        </span>
      </div>

      {/* Inspector Details Card (When a cell is clicked) */}
      {selectedCell && (
        <div className="bg-slate-50/90 dark:bg-slate-800/80 rounded-xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-extrabold">
                {selectedCell.addressHex}
              </span>
              <span className="text-slate-500 font-normal">
                (Byte offset: {selectedCell.address} dec)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {selectedCell.state}
              </span>
              <button
                onClick={() => inspectAddress(selectedCell.address)}
                className="text-slate-400 hover:text-slate-600 text-xs"
                title="Deselect"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">HEX BYTE</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                0x{selectedCell.valueHex}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">DECIMAL</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {selectedCell.value}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">8 RAW BITS</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatBinary(selectedCell.value)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[9px] uppercase font-semibold">CACHE LINE</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                Line #{selectedCell.cacheLineIndex}
              </span>
            </div>
          </div>

          {selectedCell.tag && (
            <div className="text-[11px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Payload Tag: </span>
              <span className="font-mono">{selectedCell.tag}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
