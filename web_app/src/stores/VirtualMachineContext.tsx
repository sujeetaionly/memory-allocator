'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { MemoryCell, MemoryBlock } from '@/types';

const TOTAL_BYTES = 64;

interface FreeListNode {
  addr: number;
  next: number | null;
}

interface VariableBlock {
  start: number; // starts at header
  size: number; // total size including header/footer
  payloadSize: number;
  isAllocated: boolean;
  label: string;
}

interface VirtualMachineContextType {
  cells: MemoryCell[];
  blocks: MemoryBlock[];
  bumpPointer: number;
  freeListHead: number | null;
  selectedAddress: number | null;
  cyclesSpent: number;
  cacheHits: number;
  cacheMisses: number;
  logs: { time: string; text: string; type: 'info' | 'alloc' | 'free' | 'warn' }[];
  registers: { rax: string; rsp: string; rip: string };
  // Operations
  bumpAllocate: (size: number, align: number, label: string) => boolean;
  resetArena: () => void;
  initFreeList: (chunkSize?: number) => void;
  freeListAlloc: (label: string) => boolean;
  freeListFree: (address: number) => boolean;
  initVariableAllocator: () => void;
  variableAlloc: (size: number, label: string) => boolean;
  variableFree: (headerAddr: number) => boolean;
  inspectAddress: (addr: number | null) => void;
  resetMachine: () => void;
  loadCacheLine: (lineIndex: number) => void;
}

const VirtualMachineContext = createContext<VirtualMachineContextType | null>(null);

const alignUp = (addr: number, align: number) => (addr + align - 1) & ~(align - 1);

export const VirtualMachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bumpPointer, setBumpPointer] = useState<number>(0);
  const [blocks, setBlocks] = useState<MemoryBlock[]>([]);
  const [freeListHead, setFreeListHead] = useState<number | null>(null);
  const [variableBlocks, setVariableBlocks] = useState<VariableBlock[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(0);
  const [cyclesSpent, setCyclesSpent] = useState<number>(0);
  const [cacheHits, setCacheHits] = useState<number>(0);
  const [cacheMisses, setCacheMisses] = useState<number>(0);
  const [logs, setLogs] = useState<{ time: string; text: string; type: 'info' | 'alloc' | 'free' | 'warn' }[]>([
    { time: 'T+0', text: 'Hardware initialized: 64-byte RAM buffer ready. CPU registers cleared.', type: 'info' },
  ]);

  const addLog = (text: string, type: 'info' | 'alloc' | 'free' | 'warn' = 'info') => {
    setLogs((prev) => [{ time: `+${Date.now() % 10000}ms`, text, type }, ...prev.slice(0, 49)]);
  };

  // Build the 64-cell RAM representation from blocks & pointers
  const cells: MemoryCell[] = useMemo(() => {
    const rawCells: MemoryCell[] = Array.from({ length: TOTAL_BYTES }, (_, i) => ({
      address: i,
      addressHex: '0x' + i.toString(16).padStart(2, '0').toUpperCase(),
      value: 0,
      valueHex: '00',
      state: 'empty',
      cacheLineIndex: Math.floor(i / 64),
      asciiChar: '.',
    }));

    // If variable allocator active, render headers/footers/payloads
    if (variableBlocks.length > 0) {
      variableBlocks.forEach((vb) => {
        // Header (2 bytes)
        for (let i = vb.start; i < vb.start + 2 && i < TOTAL_BYTES; i++) {
          rawCells[i] = {
            ...rawCells[i],
            state: vb.isAllocated ? 'header' : 'empty',
            tag: `Header [Size: ${vb.size}B, ${vb.isAllocated ? 'Alloc' : 'Free'}]`,
            value: vb.size,
            valueHex: vb.size.toString(16).padStart(2, '0').toUpperCase(),
          };
        }
        // Payload
        const payloadStart = vb.start + 2;
        const payloadEnd = vb.start + vb.size - 2;
        for (let i = payloadStart; i < payloadEnd && i < TOTAL_BYTES; i++) {
          rawCells[i] = {
            ...rawCells[i],
            state: vb.isAllocated ? 'allocated' : 'empty',
            tag: vb.isAllocated ? vb.label : 'Free Memory Block',
            value: vb.isAllocated ? 0xAA : 0x00,
            valueHex: vb.isAllocated ? 'AA' : '00',
          };
        }
        // Footer (2 bytes)
        for (let i = payloadEnd; i < vb.start + vb.size && i < TOTAL_BYTES; i++) {
          rawCells[i] = {
            ...rawCells[i],
            state: vb.isAllocated ? 'footer' : 'empty',
            tag: `Footer [Size: ${vb.size}B, ${vb.isAllocated ? 'Alloc' : 'Free'}]`,
            value: vb.size,
            valueHex: vb.size.toString(16).padStart(2, '0').toUpperCase(),
          };
        }
      });
      return rawCells;
    }

    // Free-list mode or Arena blocks
    blocks.forEach((blk) => {
      for (let i = blk.startAddress; i < blk.startAddress + blk.size && i < TOTAL_BYTES; i++) {
        let state: MemoryCell['state'] = 'allocated';
        let val = 0x5a;
        if (blk.type === 'padding') {
          state = 'padding';
          val = 0x00;
        } else if (blk.type === 'freelist-node') {
          state = 'pointer';
          val = 0x10;
        }

        rawCells[i] = {
          ...rawCells[i],
          state,
          tag: blk.label,
          blockId: blk.id,
          value: val,
          valueHex: val.toString(16).padStart(2, '0').toUpperCase(),
        };
      }
    });

    return rawCells;
  }, [blocks, variableBlocks]);

  // Derived registers
  const registers = useMemo(() => {
    const raxVal = selectedAddress !== null ? '0x00007FFE' + selectedAddress.toString(16).padStart(4, '0').toUpperCase() : '0x0000000000000000';
    const rspVal = '0x00007FFF' + (TOTAL_BYTES - bumpPointer).toString(16).padStart(4, '0').toUpperCase();
    const ripVal = '0x00005555' + (0x1000 + bumpPointer * 4).toString(16).padStart(4, '0').toUpperCase();
    return { rax: raxVal, rsp: rspVal, rip: ripVal };
  }, [selectedAddress, bumpPointer]);

  // Actions
  const bumpAllocate = (size: number, align: number, label: string): boolean => {
    const alignedAddr = alignUp(bumpPointer, align);
    const padding = alignedAddr - bumpPointer;
    const newEnd = alignedAddr + size;

    if (newEnd > TOTAL_BYTES) {
      addLog(`[ARENA OOM] Cannot allocate ${size}B with ${align}B alignment. Buffer capacity exceeded!`, 'warn');
      return false;
    }

    const newBlocks = [...blocks];
    if (padding > 0) {
      newBlocks.push({
        id: `pad-${Date.now()}`,
        startAddress: bumpPointer,
        size: padding,
        alignment: align,
        type: 'padding',
        label: `Alignment Padding (${padding}B)`,
      });
    }

    newBlocks.push({
      id: `blk-${Date.now()}`,
      startAddress: alignedAddr,
      size,
      alignment: align,
      type: 'object',
      label: `${label} (${size}B @ 0x${alignedAddr.toString(16).padStart(2, '0').toUpperCase()})`,
    });

    setBlocks(newBlocks);
    setBumpPointer(newEnd);
    setSelectedAddress(alignedAddr);
    setCyclesSpent((c) => c + 1); // Bump allocation is 1 CPU cycle!
    setCacheHits((h) => h + 1);
    addLog(`[ARENA ALLOC] ⚡ 1 Cycle: ${label} placed at 0x${alignedAddr.toString(16).toUpperCase()} (${size}B, pad ${padding}B). Bump ptr now at 0x${newEnd.toString(16).toUpperCase()}`, 'alloc');
    return true;
  };

  const resetArena = () => {
    setBumpPointer(0);
    setBlocks([]);
    setSelectedAddress(0);
    setCyclesSpent((c) => c + 1);
    addLog('[ARENA RESET] ⚡ 1 Cycle: Bump pointer cleared to 0x00. Bulk deallocated all objects instantaneously!', 'info');
  };

  const initFreeList = (chunkSize: number = 16) => {
    const numChunks = Math.floor(TOTAL_BYTES / chunkSize);
    const initialBlocks: MemoryBlock[] = [];
    for (let i = 0; i < numChunks; i++) {
      initialBlocks.push({
        id: `free-chunk-${i}`,
        startAddress: i * chunkSize,
        size: chunkSize,
        alignment: 8,
        type: 'freelist-node',
        label: `Free Slot #${i} (Ptr -> ${i < numChunks - 1 ? '0x' + ((i + 1) * chunkSize).toString(16).padStart(2, '0').toUpperCase() : 'NULL'})`,
      });
    }
    setBlocks(initialBlocks);
    setFreeListHead(0);
    setVariableBlocks([]);
    setCyclesSpent((c) => c + 4);
    addLog(`[FREELIST INIT] Pre-split ${TOTAL_BYTES}B into ${numChunks} slots of ${chunkSize}B with embedded pointers.`, 'info');
  };

  const freeListAlloc = (label: string): boolean => {
    const freeIndex = blocks.findIndex((b) => b.type === 'freelist-node');
    if (freeIndex === -1) {
      addLog('[FREELIST OOM] No free slots left in the pool!', 'warn');
      return false;
    }

    const targetBlock = blocks[freeIndex];
    const updated = [...blocks];
    updated[freeIndex] = {
      ...targetBlock,
      type: 'object',
      label: `${label} (Allocated in Slot @ 0x${targetBlock.startAddress.toString(16).padStart(2, '0').toUpperCase()})`,
    };

    const nextFree = updated.find((b) => b.type === 'freelist-node');
    setFreeListHead(nextFree ? nextFree.startAddress : null);
    setBlocks(updated);
    setSelectedAddress(targetBlock.startAddress);
    setCyclesSpent((c) => c + 2); // O(1) Pop: 2 CPU cycles
    addLog(`[FREELIST POP] ⚡ 2 Cycles: Allocated ${label} at 0x${targetBlock.startAddress.toString(16).toUpperCase()} using embedded union. Head now points to ${nextFree ? '0x' + nextFree.startAddress.toString(16).toUpperCase() : 'NULL'}.`, 'alloc');
    return true;
  };

  const freeListFree = (address: number): boolean => {
    const targetIndex = blocks.findIndex((b) => b.startAddress === address && b.type === 'object');
    if (targetIndex === -1) {
      addLog(`[FREELIST WARN] No allocated object found at address 0x${address.toString(16).toUpperCase()}`, 'warn');
      return false;
    }

    const targetBlock = blocks[targetIndex];
    const updated = [...blocks];
    updated[targetIndex] = {
      ...targetBlock,
      type: 'freelist-node',
      label: `Recycled Slot (Ptr -> ${freeListHead !== null ? '0x' + freeListHead.toString(16).padStart(2, '0').toUpperCase() : 'NULL'})`,
    };

    setFreeListHead(targetBlock.startAddress);
    setBlocks(updated);
    setSelectedAddress(targetBlock.startAddress);
    setCyclesSpent((c) => c + 2); // O(1) Push: 2 CPU cycles
    addLog(`[FREELIST PUSH] ⚡ 2 Cycles: Recycled 0x${address.toString(16).toUpperCase()} back to free list head. Embedded union repurposed from payload to next pointer!`, 'free');
    return true;
  };

  const initVariableAllocator = () => {
    setBlocks([]);
    setBumpPointer(0);
    setFreeListHead(null);
    setVariableBlocks([
      {
        start: 0,
        size: TOTAL_BYTES,
        payloadSize: TOTAL_BYTES - 4,
        isAllocated: false,
        label: 'Initial Free Chunk',
      },
    ]);
    addLog(`[VARIABLE INIT] Initialized 64-byte boundary tag arena with 1 contiguous free block.`, 'info');
  };

  const variableAlloc = (requestedSize: number, label: string): boolean => {
    const totalNeeded = requestedSize + 4; // 2B header + 2B footer
    const freeBlockIndex = variableBlocks.findIndex((b) => !b.isAllocated && b.size >= totalNeeded);

    if (freeBlockIndex === -1) {
      addLog(`[VARIABLE OOM] External fragmentation: No contiguous free block of ${totalNeeded}B available!`, 'warn');
      return false;
    }

    const target = variableBlocks[freeBlockIndex];
    const remaining = target.size - totalNeeded;
    const newBlocks: VariableBlock[] = [];

    // Push preceding blocks
    for (let i = 0; i < freeBlockIndex; i++) newBlocks.push(variableBlocks[i]);

    // Push newly allocated block
    newBlocks.push({
      start: target.start,
      size: remaining >= 8 ? totalNeeded : target.size, // allocate remainder if too small
      payloadSize: requestedSize,
      isAllocated: true,
      label,
    });

    // If remaining space can hold another block, split it
    if (remaining >= 8) {
      newBlocks.push({
        start: target.start + totalNeeded,
        size: remaining,
        payloadSize: remaining - 4,
        isAllocated: false,
        label: 'Split Free Remainder',
      });
    }

    // Push remaining blocks
    for (let i = freeBlockIndex + 1; i < variableBlocks.length; i++) newBlocks.push(variableBlocks[i]);

    setVariableBlocks(newBlocks);
    setSelectedAddress(target.start);
    setCyclesSpent((c) => c + 12);
    addLog(`[VARIABLE ALLOC] Placed ${label} (${requestedSize}B) at 0x${target.start.toString(16).toUpperCase()} with Knuth Header & Footer tags.`, 'alloc');
    return true;
  };

  const variableFree = (headerAddr: number): boolean => {
    const targetIdx = variableBlocks.findIndex((b) => b.start === headerAddr && b.isAllocated);
    if (targetIdx === -1) {
      addLog(`[VARIABLE WARN] Block at 0x${headerAddr.toString(16).toUpperCase()} is already free or invalid!`, 'warn');
      return false;
    }

    const updated = [...variableBlocks];
    updated[targetIdx] = {
      ...updated[targetIdx],
      isAllocated: false,
      label: 'Freed Block',
    };

    // Knuth O(1) Coalescing: merge with right neighbor if free
    if (targetIdx + 1 < updated.length && !updated[targetIdx + 1].isAllocated) {
      const right = updated[targetIdx + 1];
      updated[targetIdx] = {
        start: updated[targetIdx].start,
        size: updated[targetIdx].size + right.size,
        payloadSize: updated[targetIdx].size + right.size - 4,
        isAllocated: false,
        label: 'Coalesced Right Block',
      };
      updated.splice(targetIdx + 1, 1);
      addLog(`[COALESCE RIGHT] ⚡ O(1) Instant Coalesce with right neighbor block!`, 'info');
    }

    // Knuth O(1) Coalescing: merge with left neighbor if free (using left's footer tag!)
    if (targetIdx > 0 && !updated[targetIdx - 1].isAllocated) {
      const left = updated[targetIdx - 1];
      updated[targetIdx - 1] = {
        start: left.start,
        size: left.size + updated[targetIdx].size,
        payloadSize: left.size + updated[targetIdx].size - 4,
        isAllocated: false,
        label: 'Coalesced Bidirectional Block',
      };
      updated.splice(targetIdx, 1);
      addLog(`[COALESCE LEFT] ⚡ O(1) Instant Coalesce with left neighbor using footer boundary tag!`, 'info');
    }

    setVariableBlocks(updated);
    setCyclesSpent((c) => c + 8);
    addLog(`[VARIABLE FREE] Freed block at 0x${headerAddr.toString(16).toUpperCase()}. Neighbor boundary tags inspected in O(1) time.`, 'free');
    return true;
  };

  const inspectAddress = (addr: number | null) => {
    setSelectedAddress(addr);
    if (addr !== null) {
      const line = Math.floor(addr / 64);
      const hexAddr = '0x' + addr.toString(16).padStart(2, '0').toUpperCase();
      const cell = cells[addr];
      const valHex = cell?.valueHex ?? '00';
      const valDec = cell?.value ?? 0;
      const state = cell?.state ?? 'empty';
      const tag = cell?.tag ? ` [${cell.tag}]` : '';

      setCyclesSpent((c) => c + 1);
      if (line === 0) {
        setCacheHits((h) => h + 1);
        addLog(
          `[BUS READ] CPU probed ${hexAddr} (dec ${addr}) -> Value: 0x${valHex} (${valDec}d, ${state})${tag} • L1 Cache Hit (Line #${line})`,
          'info'
        );
      } else {
        setCacheMisses((m) => m + 1);
        addLog(
          `[BUS READ] CPU probed ${hexAddr} (dec ${addr}) -> L1 Cache Miss! Probed DRAM line #${line}`,
          'warn'
        );
      }
    } else {
      addLog('[BUS PROBE] Probed address cleared. Hardware bus idle.', 'info');
    }
  };

  const loadCacheLine = (lineIndex: number) => {
    setCacheHits((h) => h + 1);
    addLog(`[CACHE LINE] Loaded 64-byte block #${lineIndex} into CPU L1 Cache in ~1ns (~4 cycles).`, 'info');
  };

  const resetMachine = () => {
    setBumpPointer(0);
    setBlocks([]);
    setVariableBlocks([]);
    setFreeListHead(null);
    setSelectedAddress(0);
    setCyclesSpent(0);
    setCacheHits(0);
    setCacheMisses(0);
    setLogs([{ time: 'T+0', text: 'Hardware reset: 64B RAM cleared.', type: 'info' }]);
  };

  return (
    <VirtualMachineContext.Provider
      value={{
        cells,
        blocks,
        bumpPointer,
        freeListHead,
        selectedAddress,
        cyclesSpent,
        cacheHits,
        cacheMisses,
        logs,
        registers,
        bumpAllocate,
        resetArena,
        initFreeList,
        freeListAlloc,
        freeListFree,
        initVariableAllocator,
        variableAlloc,
        variableFree,
        inspectAddress,
        resetMachine,
        loadCacheLine,
      }}
    >
      {children}
    </VirtualMachineContext.Provider>
  );
};

export const useVirtualMachine = () => {
  const ctx = useContext(VirtualMachineContext);
  if (!ctx) {
    return {
      cells: [],
      blocks: [],
      bumpPointer: 0,
      freeListHead: null,
      selectedAddress: 0,
      cyclesSpent: 0,
      cacheHits: 0,
      cacheMisses: 0,
      logs: [],
      registers: { rax: '0x0', rsp: '0x0', rip: '0x0' },
      bumpAllocate: () => false,
      resetArena: () => {},
      initFreeList: () => {},
      freeListAlloc: () => false,
      freeListFree: () => false,
      initVariableAllocator: () => {},
      variableAlloc: () => false,
      variableFree: () => false,
      inspectAddress: () => {},
      resetMachine: () => {},
      loadCacheLine: () => {},
    };
  }
  return ctx;
};
