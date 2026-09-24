'use client';

import React, { useState } from 'react';

interface VariableBlock {
  id: string;
  size: number;
  isFree: boolean;
  label?: string;
}

export const VariableSimulator: React.FC = () => {
  const TOTAL_CAPACITY = 256;
  const HEADER_SIZE = 16;
  const FOOTER_SIZE = 16;
  const MIN_SPLIT_THRESHOLD = HEADER_SIZE + FOOTER_SIZE + 16;

  const [blocks, setBlocks] = useState<VariableBlock[]>([
    { id: 'b-init', size: TOTAL_CAPACITY, isFree: true },
  ]);

  const [statusLog, setStatusLog] = useState<string>(
    'Heap initialized: 1 free block (256 bytes) with boundary tags.'
  );

  const allocate = (payloadSize: number, labelName: string) => {
    const needed = payloadSize + HEADER_SIZE + FOOTER_SIZE;
    const blockIndex = blocks.findIndex((b) => b.isFree && b.size >= needed);

    if (blockIndex === -1) {
      alert(`Allocation of ${needed}B failed: No contiguous free block available!`);
      return;
    }

    const target = blocks[blockIndex];
    const leftover = target.size - needed;
    const updated = [...blocks];

    if (leftover >= MIN_SPLIT_THRESHOLD) {
      const allocatedBlock: VariableBlock = {
        id: `alloc-${Date.now()}`,
        size: needed,
        isFree: false,
        label: `${labelName} (${payloadSize}B)`,
      };
      const freeBlock: VariableBlock = {
        id: `free-${Date.now()}`,
        size: leftover,
        isFree: true,
      };
      updated.splice(blockIndex, 1, allocatedBlock, freeBlock);
      setStatusLog(`Split block: allocated ${needed}B, leftover ${leftover}B remains free.`);
    } else {
      updated[blockIndex] = {
        ...target,
        isFree: false,
        label: `${labelName} (${target.size - 32}B)`,
      };
      setStatusLog(`Allocated ${target.size}B block without splitting.`);
    }

    setBlocks(updated);
  };

  const deallocate = (index: number) => {
    if (blocks[index].isFree) return;

    let updated = [...blocks];
    updated[index] = { ...updated[index], isFree: true, label: undefined };

    // Coalesce right
    if (index + 1 < updated.length && updated[index + 1].isFree) {
      updated[index].size += updated[index + 1].size;
      updated.splice(index + 1, 1);
    }

    // Coalesce left
    if (index - 1 >= 0 && updated[index - 1].isFree) {
      updated[index - 1].size += updated[index].size;
      updated.splice(index, 1);
    }

    setBlocks(updated);
    setStatusLog('Freed block and coalesced adjacent free neighbors in O(1).');
  };

  const resetAll = () => {
    setBlocks([{ id: 'b-init', size: TOTAL_CAPACITY, isFree: true }]);
    setStatusLog('Heap reset to 1 continuous 256-byte free block.');
  };

  return (
    <div className="interactive-tool-card">
      <div className="tool-title">Interactive Tool: Knuth Boundary Tags &amp; O(1) Coalescing</div>
      <div className="tool-sub">
        Every block has a Header (16B) and Footer (16B). Freeing a block instantly merges adjacent free blocks.
      </div>

      <div className="tool-controls">
        <button onClick={() => allocate(32, 'Packet')} className="lcpp-btn primary">
          Allocate Packet (32B)
        </button>
        <button onClick={() => allocate(64, 'FIX Msg')} className="lcpp-btn primary">
          Allocate Msg (64B)
        </button>
        <button onClick={resetAll} className="lcpp-btn secondary">
          Reset Heap
        </button>
      </div>

      {/* Ribbon representation */}
      <div className="flex h-16 w-full rounded border border-[#ced4da] bg-white p-1 gap-1 my-3 overflow-hidden">
        {blocks.map((b, idx) => {
          const widthPct = (b.size / TOTAL_CAPACITY) * 100;
          return (
            <div
              key={b.id}
              style={{ width: `${widthPct}%` }}
              className={`p-1.5 rounded text-[10px] font-mono flex flex-col justify-between border ${
                b.isFree
                  ? 'bg-[#f8f9fa] border-[#dee2e6] text-[#6c757d]'
                  : 'bg-[#e7f5ff] border-[#0056b3] text-[#0056b3]'
              }`}
            >
              <div className="flex justify-between font-bold">
                <span>{b.isFree ? 'FREE' : 'USED'}</span>
                <span>{b.size}B</span>
              </div>
              <div className="truncate text-[9.5px]">
                {b.label || 'Available'}
              </div>
              {!b.isFree && (
                <button
                  onClick={() => deallocate(idx)}
                  className="text-left text-[#c92a2a] hover:underline font-bold"
                >
                  Free
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="ram-status-bar">
        <span>Blocks: <strong>{blocks.length}</strong></span>
        <span>{statusLog}</span>
      </div>
    </div>
  );
};
