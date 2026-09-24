'use client';

import React, { useState } from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

export const SandboxView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'arena' | 'freelist' | 'variable'>('arena');
  const [customSize, setCustomSize] = useState<number>(16);
  const [customAlign, setCustomAlign] = useState<number>(8);
  const [targetFreeAddr, setTargetFreeAddr] = useState<number>(0);

  const {
    bumpAllocate,
    resetArena,
    initFreeList,
    freeListAlloc,
    freeListFree,
    initVariableAllocator,
    variableAlloc,
    variableFree,
    resetMachine,
  } = useVirtualMachine();

  const handleTabChange = (tab: 'arena' | 'freelist' | 'variable') => {
    setActiveTab(tab);
    resetMachine();
    if (tab === 'freelist') initFreeList(16);
    if (tab === 'variable') initVariableAllocator();
  };

  const interactiveControls = (
    <div className="space-y-4 text-xs">
      {/* Allocator Mode Selector Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => handleTabChange('arena')}
          className={`flex-1 py-2 font-semibold rounded-lg text-xs transition-all ${
            activeTab === 'arena'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Arena
        </button>
        <button
          onClick={() => handleTabChange('freelist')}
          className={`flex-1 py-2 font-semibold rounded-lg text-xs transition-all ${
            activeTab === 'freelist'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          FreeList
        </button>
        <button
          onClick={() => handleTabChange('variable')}
          className={`flex-1 py-2 font-semibold rounded-lg text-xs transition-all ${
            activeTab === 'variable'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Variable
        </button>
      </div>

      {/* Dynamic Controls based on selected tab */}
      {activeTab === 'arena' && (
        <div className="space-y-3.5 p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200/90 dark:border-blue-900/50">
          <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center justify-between">
            <span>Linear Arena Controls</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              1-CYCLE ADD
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 uppercase block">Size (Bytes)</label>
              <input
                type="number"
                min="1"
                max="64"
                value={customSize}
                onChange={(e) => setCustomSize(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs shadow-xs"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 uppercase block">Alignment</label>
              <select
                value={customAlign}
                onChange={(e) => setCustomAlign(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs shadow-xs"
              >
                <option value="1">1 Byte (None)</option>
                <option value="4">4 Bytes (int)</option>
                <option value="8">8 Bytes (default)</option>
                <option value="16">16 Bytes (SIMD)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => bumpAllocate(customSize, customAlign, `Custom Obj (${customSize}B)`)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-xs transition-all"
            >
              + Bump Allocate
            </button>
            <button
              onClick={resetArena}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-mono transition-colors shadow-xs"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      )}

      {activeTab === 'freelist' && (
        <div className="space-y-3.5 p-4 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-teal-200/90 dark:border-teal-900/50">
          <div className="font-bold text-teal-900 dark:text-teal-300 flex items-center justify-between">
            <span>Fixed-Size Free-List</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
              16B SLOTS
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-[11.5px] leading-relaxed">
            Uses intrusive embedded unions (0 bytes metadata overhead). O(1) Push and Pop.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => freeListAlloc('Order Node')}
              className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold shadow-xs transition-all"
            >
              + Pop Slot (Alloc)
            </button>
            <button
              onClick={() => initFreeList(16)}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-mono transition-colors shadow-xs"
            >
              ↺ Reset
            </button>
          </div>
          <div className="pt-2 border-t border-teal-200/60 dark:border-teal-900/40">
            <label className="text-[10.5px] font-semibold text-slate-500 uppercase block">Recycle Address</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                step="16"
                min="0"
                max="48"
                value={targetFreeAddr}
                onChange={(e) => setTargetFreeAddr(Number(e.target.value))}
                className="w-24 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs shadow-xs"
              />
              <button
                onClick={() => freeListFree(targetFreeAddr)}
                className="flex-1 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                Push 0x{targetFreeAddr.toString(16).padStart(2, '0').toUpperCase()} to Head
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'variable' && (
        <div className="space-y-3.5 p-4 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-200/90 dark:border-purple-900/50">
          <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center justify-between">
            <span>Knuth Boundary-Tag Allocator</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
              O(1) COALESCE
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-[11.5px] leading-relaxed">
            Bidirectional headers and footers with instant O(1) neighbor coalescing.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => variableAlloc(12, 'Packet A')}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-xs transition-all"
            >
              + Alloc 12B
            </button>
            <button
              onClick={() => variableAlloc(16, 'Packet B')}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-xs transition-all"
            >
              + Alloc 16B
            </button>
            <button
              onClick={initVariableAllocator}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-mono transition-colors shadow-xs"
            >
              ↺
            </button>
          </div>
          <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
            <button
              onClick={() => variableFree(0x00)}
              className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-semibold shadow-xs transition-colors"
            >
              Free Block @ 0x00 &amp; Coalesce
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DualPaneLayout interactiveControls={interactiveControls}>
      <article className="lesson-article">
        <header className="article-header">
          <div className="text-xs uppercase font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
            OPEN HARDWARE SANDBOX
          </div>
          <h1 className="article-title">Interactive Allocator Laboratory &amp; Telemetry</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Free-Form Experimentation • Test Fragmentation • Trigger OOM • Inspect Cycles
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            This open sandbox gives you direct, unconstrained access to all three custom memory allocators.
          </p>
          <p className="prose">
            Use the interactive control panel on the right to toggle between the <strong>Arena</strong>, <strong>Free-List</strong>, and <strong>Variable Allocator</strong>. Observe how memory layouts, fragmentation holes, and CPU cycles respond in real time on the 64-byte RAM Inspector!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div
              onClick={() => handleTabChange('arena')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === 'arena'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Linear Arena
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  1 CYCLE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Bump cursor addition. 0 metadata overhead. Instant bulk reset. Optimal for transient scratchpads.
              </p>
            </div>

            <div
              onClick={() => handleTabChange('freelist')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === 'freelist'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-sm ring-1 ring-teal-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Fixed Free-List
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                  2 CYCLES
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Recycles individual fixed chunks using embedded union overlays. Zero fragmentation.
              </p>
            </div>

            <div
              onClick={() => handleTabChange('variable')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === 'variable'
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 shadow-sm ring-1 ring-purple-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Variable Boundary-Tag
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  O(1) COALESCE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Knuth boundary tags with bidirectional instant merging. Handles arbitrary sized objects.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm space-y-2.5">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🛠️</span>
              <span>Recommended Experiments to Try in this Sandbox:</span>
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300 pl-2">
              <li>
                <strong>Trigger Out-of-Memory:</strong> In Arena mode, allocate three 24-byte objects into the 64-byte buffer to see how capacity overflows are prevented.
              </li>
              <li>
                <strong>Observe Alignment Padding:</strong> In Arena mode, allocate an 8-byte aligned object with size 12, then allocate another 8-byte aligned object. Notice the 4 padding bytes inserted automatically!
              </li>
              <li>
                <strong>Test O(1) Coalescing:</strong> In Variable mode, allocate two blocks, then free them to watch the boundary tags merge them back into one large contiguous free block.
              </li>
            </ul>
          </div>
        </div>
      </article>
    </DualPaneLayout>
  );
};
