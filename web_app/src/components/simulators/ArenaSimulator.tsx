'use client';

import React, { useState } from 'react';

interface MemoryRange {
  id: string;
  start: number;
  end: number;
  type: 'allocated' | 'padding';
  label: string;
}

export const ArenaSimulator: React.FC = () => {
  const TOTAL_BYTES = 64;
  const [offset, setOffset] = useState<number>(0);
  const [ranges, setRanges] = useState<MemoryRange[]>([]);
  const [orderCounter, setOrderCounter] = useState<number>(1);
  const [statusLog, setStatusLog] = useState<string>('Empty Buffer');

  const alignUp = (addr: number, align: number) => (addr + align - 1) & ~(align - 1);

  const allocate = (size: number, align: number) => {
    const alignedAddr = alignUp(offset, align);
    const padding = alignedAddr - offset;
    const newEnd = alignedAddr + size;

    if (newEnd > TOTAL_BYTES) {
      alert(`Arena Buffer Capacity Reached (64 Bytes)! Click "Reset Offset" to clear memory.`);
      return;
    }

    const newRanges: MemoryRange[] = [...ranges];

    if (padding > 0) {
      newRanges.push({
        id: `pad-${Date.now()}`,
        start: offset,
        end: alignedAddr,
        type: 'padding',
        label: `Pad (${padding}B)`,
      });
    }

    newRanges.push({
      id: `alloc-${Date.now()}`,
      start: alignedAddr,
      end: newEnd,
      type: 'allocated',
      label: `Node #${orderCounter} (${size}B)`,
    });

    setRanges(newRanges);
    setOffset(newEnd);
    setOrderCounter((prev) => prev + 1);
    setStatusLog(`${orderCounter} Node Object(s) Constructed`);
  };

  const handleReset = () => {
    setOffset(0);
    setRanges([]);
    setStatusLog('Empty Buffer');
  };

  const getCellType = (idx: number) => {
    for (const r of ranges) {
      if (idx >= r.start && idx < r.end) {
        return r.type;
      }
    }
    return '';
  };

  return (
    <div className="interactive-tool-card">
      <div className="tool-title">Interactive Tool: Placement new RAM Memory Playground</div>
      <div className="tool-sub">
        Click to allocate 24-byte Node objects (8-byte aligned) into a 64-byte raw backing buffer.
      </div>

      <div className="tool-controls">
        <button
          onClick={() => allocate(24, 8)}
          className="lcpp-btn primary"
        >
          Allocate Node Object (24B)
        </button>
        <button
          onClick={handleReset}
          className="lcpp-btn secondary"
        >
          Reset Offset
        </button>
      </div>

      {/* 16x4 RAM cell grid matching LearnCPP exact design */}
      <div className="ram-grid-cells">
        {Array.from({ length: TOTAL_BYTES }).map((_, i) => {
          const type = getCellType(i);
          return (
            <div
              key={i}
              className={`ram-cell ${type}`}
              title={`Byte 0x${i.toString(16).padStart(2, '0').toUpperCase()} (${i})`}
            >
              {i.toString(16).padStart(2, '0').toUpperCase()}
            </div>
          );
        })}
      </div>

      <div className="ram-status-bar">
        <span>Current Bump Offset: <strong>0x{offset.toString(16).padStart(4, '0').toUpperCase()} ({offset} B)</strong></span>
        <span>State: <strong>{statusLog}</strong></span>
      </div>
    </div>
  );
};
