'use client';

import React, { useState } from 'react';

export const BitwiseAlignmentLab: React.FC = () => {
  const [address, setAddress] = useState<number>(27);
  const [alignment, setAlignment] = useState<number>(8);

  const safeAddr = Math.max(0, Math.min(1024, address || 0));
  const step1 = safeAddr + alignment - 1;
  const mask = ~(alignment - 1);
  const aligned = step1 & mask;
  const paddingBytes = aligned - safeAddr;

  const maskBinary = (mask & 0xff).toString(2).padStart(8, '0').replace(/(.{4})/g, '$1 ').trim();
  const addrBinary = (safeAddr & 0xff).toString(2).padStart(8, '0').replace(/(.{4})/g, '$1 ').trim();
  const alignedBinary = (aligned & 0xff).toString(2).padStart(8, '0').replace(/(.{4})/g, '$1 ').trim();

  return (
    <div className="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
              ⚡
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Interactive Bitwise Alignment Calculator
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Evaluates <code className="font-mono text-blue-600 dark:text-blue-400 font-semibold">(address + align - 1) &amp; ~(align - 1)</code> in real time.
          </p>
        </div>
        <span className="self-start sm:self-center text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          1 CPU CLOCK CYCLE
        </span>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5">
          <label htmlFor="input-addr" className="font-semibold text-slate-700 dark:text-slate-300 block">
            Raw Memory Address (Decimal):
          </label>
          <div className="relative">
            <input
              id="input-addr"
              type="number"
              min="0"
              max="1024"
              value={address}
              onChange={(e) => setAddress(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <span className="absolute right-3 top-2 text-[10.5px] font-mono text-slate-400">
              0x{safeAddr.toString(16).padStart(2, '0').toUpperCase()}
            </span>
          </div>
          <div className="flex gap-1.5 pt-1">
            {[5, 13, 27, 42, 61].map((preset) => (
              <button
                key={preset}
                onClick={() => setAddress(preset)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                  address === preset
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="input-align" className="font-semibold text-slate-700 dark:text-slate-300 block">
            Target Alignment (Power-of-Two):
          </label>
          <select
            id="input-align"
            value={alignment}
            onChange={(e) => setAlignment(parseInt(e.target.value) || 8)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="2">2 Bytes (short)</option>
            <option value="4">4 Bytes (int / float)</option>
            <option value="8">8 Bytes (Standard 64-bit int / pointer)</option>
            <option value="16">16 Bytes (SIMD / SSE / __m128)</option>
            <option value="64">64 Bytes (CPU Cache Line)</option>
          </select>
          <span className="text-[10.5px] text-slate-500 block pt-1">
            Requires address to be divisible by {alignment}
          </span>
        </div>
      </div>

      {/* Step-by-Step Hardware Execution */}
      <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
            Input Address Binary:
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">
            {addrBinary} <span className="text-slate-400 font-normal">({safeAddr} dec / 0x{safeAddr.toString(16).toUpperCase()})</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
            Step 1: Add (align - 1):
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {safeAddr} + ({alignment} - 1) = {step1}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
            Step 2: Bitwise Mask ~(align - 1):
          </span>
          <span className="text-purple-600 dark:text-purple-400 font-bold">
            {maskBinary} <span className="text-slate-400 font-normal">(Zeroes lower {Math.log2(alignment)} bits)</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 text-sm font-bold">
          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <span>✓</span>
            <span>Final Aligned Address:</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
            {aligned} <span className="text-xs font-semibold">(0x{aligned.toString(16).padStart(2, '0').toUpperCase()} / {alignedBinary})</span>
          </span>
        </div>
      </div>

      {/* Visual Memory Allocation Span */}
      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 text-xs space-y-2">
        <div className="flex items-center justify-between text-blue-950 dark:text-blue-200 font-bold">
          <span>Memory Boundary Inspection:</span>
          <span>{paddingBytes === 0 ? 'Already Aligned' : `${paddingBytes} Padding Bytes Inserted`}</span>
        </div>
        <div className="h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex overflow-hidden border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold">
          <div
            style={{ width: `${Math.min(100, Math.max(20, (safeAddr / (aligned + 16)) * 100))}%` }}
            className="bg-blue-600 text-white flex items-center justify-center truncate px-1"
          >
            Start: {safeAddr}
          </div>
          {paddingBytes > 0 && (
            <div
              style={{ width: `${Math.max(15, (paddingBytes / (aligned + 16)) * 100)}%` }}
              className="bg-amber-400 text-amber-950 flex items-center justify-center repeating-stripes px-1"
            >
              +{paddingBytes}B Pad
            </div>
          )}
          <div className="flex-1 bg-emerald-600 text-white flex items-center justify-center truncate px-1">
            Aligned @ {aligned}
          </div>
        </div>
      </div>
    </div>
  );
};
