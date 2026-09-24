'use client';

import React, { useState } from 'react';

interface Chunk {
  index: number;
  isAllocated: boolean;
  orderInfo?: {
    symbol: string;
    shares: number;
    price: number;
  };
}

export const FreeListSimulator: React.FC = () => {
  const [freeHead, setFreeHead] = useState<number | null>(0);
  const [nextPointers, setNextPointers] = useState<(number | null)[]>([1, 2, 3, 4, 5, null]);
  const [chunks, setChunks] = useState<Chunk[]>([
    { index: 0, isAllocated: false },
    { index: 1, isAllocated: false },
    { index: 2, isAllocated: false },
    { index: 3, isAllocated: false },
    { index: 4, isAllocated: false },
    { index: 5, isAllocated: false },
  ]);
  const [statusLog, setStatusLog] = useState<string>(
    'Pool initialized: 6 uniform 64-byte slots. Head points to Slot #0.'
  );

  const symbols = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'TSLA'];

  const allocateChunk = () => {
    if (freeHead === null) {
      alert('All 6 slots are currently in use! Click "Deallocate" on any active slot.');
      return;
    }

    const allocatedIndex = freeHead;
    const nextFreeIndex = nextPointers[allocatedIndex];

    const updatedChunks = [...chunks];
    const sym = symbols[allocatedIndex % symbols.length];
    updatedChunks[allocatedIndex] = {
      index: allocatedIndex,
      isAllocated: true,
      orderInfo: {
        symbol: sym,
        shares: (allocatedIndex + 1) * 100,
        price: 150 + allocatedIndex * 12.5,
      },
    };

    setFreeHead(nextFreeIndex);
    setChunks(updatedChunks);
    setStatusLog(
      `Popped Slot #${allocatedIndex} in O(1). Overwrote embedded pointer with ${sym} Order!`
    );
  };

  const deallocateChunk = (indexToFree: number) => {
    if (!chunks[indexToFree].isAllocated) return;

    const updatedNext = [...nextPointers];
    updatedNext[indexToFree] = freeHead;

    const updatedChunks = [...chunks];
    updatedChunks[indexToFree] = { index: indexToFree, isAllocated: false };

    setNextPointers(updatedNext);
    setFreeHead(indexToFree);
    setChunks(updatedChunks);

    setStatusLog(`Pushed Slot #${indexToFree} back to head of free list in O(1).`);
  };

  const resetAll = () => {
    setFreeHead(0);
    setNextPointers([1, 2, 3, 4, 5, null]);
    setChunks([
      { index: 0, isAllocated: false },
      { index: 1, isAllocated: false },
      { index: 2, isAllocated: false },
      { index: 3, isAllocated: false },
      { index: 4, isAllocated: false },
      { index: 5, isAllocated: false },
    ]);
    setStatusLog('Reset pool. All slots re-linked.');
  };

  return (
    <div className="interactive-tool-card">
      <div className="tool-title">Interactive Tool: Embedded Union Free-List Memory Pool</div>
      <div className="tool-sub">
        Visualizing zero-metadata overhead: free slots hold <code>FreeNode* next</code>; allocated slots hold order data.
      </div>

      <div className="tool-controls">
        <button onClick={allocateChunk} className="lcpp-btn primary">
          Allocate Order (Pop Head - O(1))
        </button>
        <button onClick={resetAll} className="lcpp-btn secondary">
          Reset All Slots
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-3">
        {chunks.map((chunk) => {
          const isHead = freeHead === chunk.index;
          const nextFree = nextPointers[chunk.index];

          return (
            <div
              key={chunk.index}
              className={`p-3 rounded border text-[12px] font-mono ${
                chunk.isAllocated
                  ? 'bg-[#e7f5ff] border-[#0056b3]'
                  : isHead
                  ? 'bg-white border-[#2b4c7e] shadow-sm ring-1 ring-[#2b4c7e]'
                  : 'bg-[#f8f9fa] border-[#ced4da]'
              }`}
            >
              <div className="flex justify-between items-center mb-1 pb-1 border-b border-[#e0e4e8]">
                <strong className="text-[#111111]">Slot #{chunk.index} (64B)</strong>
                <span className={`text-[10px] px-1 rounded ${
                  chunk.isAllocated ? 'bg-[#0056b3] text-white' : 'bg-[#e9ecef] text-[#495057]'
                }`}>
                  {chunk.isAllocated ? 'ALLOCATED' : isHead ? 'FREE HEAD' : 'FREE'}
                </span>
              </div>

              <div className="min-h-[38px] flex flex-col justify-center text-[11.5px]">
                {chunk.isAllocated ? (
                  <div>
                    <span className="text-[#0056b3] font-bold">{chunk.orderInfo?.symbol} Order</span>
                    <div className="text-[#555555]">{chunk.orderInfo?.shares} shs @ ${chunk.orderInfo?.price.toFixed(2)}</div>
                  </div>
                ) : (
                  <div className="text-[#555555]">
                    next &rarr; <strong>{nextFree !== null ? `Slot #${nextFree}` : 'NULL'}</strong>
                  </div>
                )}
              </div>

              {chunk.isAllocated && (
                <button
                  onClick={() => deallocateChunk(chunk.index)}
                  className="mt-2 text-[11px] text-[#c92a2a] hover:underline font-bold"
                >
                  Deallocate (O(1))
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="ram-status-bar">
        <span>Free Head: <strong>Slot #{freeHead !== null ? freeHead : 'NULL (Full)'}</strong></span>
        <span>{statusLog}</span>
      </div>
    </div>
  );
};
