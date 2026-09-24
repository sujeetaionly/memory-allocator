'use client';

import React, { useState } from 'react';

export const CacheLineVisualizer: React.FC = () => {
  const [scenario, setScenario] = useState<'aligned' | 'straddled' | 'false-sharing' | 'solved'>('aligned');

  const scenarioMeta = {
    aligned: {
      badge: 'OPTIMAL CACHE LOCALITY',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      busStatus: '1 L1 Cache Line Fetch (0.25ns latency)',
      busClass: 'text-emerald-600 dark:text-emerald-400',
      detail:
        'The 64-byte Order struct is perfectly aligned to address 0x00. The CPU executes a single L1 line burst. Zero bus split penalty!',
    },
    straddled: {
      badge: 'SPLIT BUS PENALTY',
      badgeColor: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800',
      busStatus: '2 L1 Cache Line Fetches (DOUBLE LATENCY)',
      busClass: 'text-red-600 dark:text-red-400',
      detail:
        'The struct begins at byte 32. Because it crosses the 64-byte boundary into Line 1, the CPU hardware memory controller is forced to execute two separate memory transactions to read one single struct!',
    },
    'false-sharing': {
      badge: 'MESI INVALIDATION STORM',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      busStatus: 'Hardware Cache Ping-Pong (L1 Core Invalidation)',
      busClass: 'text-amber-600 dark:text-amber-400',
      detail:
        'Core 0 modifies counter X while Core 1 modifies counter Y. Because both counters reside on the same 64-byte line, hardware MESI cache coherence constantly invalidates Core 1’s L1 cache, causing multi-core performance collapse!',
    },
    solved: {
      badge: 'alignas(64) ZERO CONTENTION',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      busStatus: 'Independent Cache Lines (Full Multi-Core Speed)',
      busClass: 'text-blue-600 dark:text-blue-400',
      detail:
        'By declaring `alignas(64)`, the compiler inserts padding so Core 0 and Core 1 have their own isolated 64-byte cache lines. Both cores write concurrently at 4.0 GHz without stalling each other!',
    },
  }[scenario];

  return (
    <div className="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
              🖥️
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              64-Byte CPU Cache Line &amp; False Sharing Visualizer
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hardware transfers RAM in 64-byte cache lines. Inspect multi-core cache effects:
          </p>
        </div>
        <span className={`self-start sm:self-center text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${scenarioMeta.badgeColor}`}>
          {scenarioMeta.badge}
        </span>
      </div>

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button
          onClick={() => setScenario('aligned')}
          className={`px-3 py-2 rounded-xl font-semibold border transition-all text-center ${
            scenario === 'aligned'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          Aligned (1 Fetch)
        </button>
        <button
          onClick={() => setScenario('straddled')}
          className={`px-3 py-2 rounded-xl font-semibold border transition-all text-center ${
            scenario === 'straddled'
              ? 'bg-red-600 text-white border-red-600 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          Straddled (2 Fetches)
        </button>
        <button
          onClick={() => setScenario('false-sharing')}
          className={`px-3 py-2 rounded-xl font-semibold border transition-all text-center ${
            scenario === 'false-sharing'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          False Sharing Trap
        </button>
        <button
          onClick={() => setScenario('solved')}
          className={`px-3 py-2 rounded-xl font-semibold border transition-all text-center ${
            scenario === 'solved'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          alignas(64) Fix
        </button>
      </div>

      {/* Visual Representation of Cache Lines */}
      <div className="space-y-4">
        {/* Cache Line 0 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              CPU Cache Line #0 (Bytes 0x00 .. 0x3F [0 – 63])
            </span>
            <span>64 Bytes</span>
          </div>

          <div className="h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1 flex relative overflow-hidden font-mono text-xs">
            {scenario === 'aligned' && (
              <div className="w-full h-full rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold px-3">
                <span>64-Byte Order Struct (100% inside Line 0 &rarr; 1 Single L1 Fetch)</span>
              </div>
            )}

            {scenario === 'straddled' && (
              <div className="w-full h-full flex">
                <div className="w-1/2 h-full rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-400 flex items-center justify-center text-[10.5px]">
                  Unused (0-31)
                </div>
                <div className="w-1/2 h-full rounded-lg bg-red-500/20 border border-red-500/40 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-[11px]">
                  Half 1 (Bytes 32-63)
                </div>
              </div>
            )}

            {scenario === 'false-sharing' && (
              <div className="w-full h-full flex gap-1.5">
                <div className="w-1/2 h-full rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-[11px]">
                  Core 0 Counter X (Writing)
                </div>
                <div className="w-1/2 h-full rounded-lg bg-red-500/20 border border-red-500/40 text-red-800 dark:text-red-200 flex items-center justify-center font-bold text-[11px] animate-pulse">
                  Core 1 Counter Y (Invalidated!)
                </div>
              </div>
            )}

            {scenario === 'solved' && (
              <div className="w-full h-full rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px]">
                Core 0 Counter X (alignas(64) &mdash; Dedicated Cache Line)
              </div>
            )}
          </div>
        </div>

        {/* Cache Line 1 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              CPU Cache Line #1 (Bytes 0x40 .. 0x7F [64 – 127])
            </span>
            <span>64 Bytes</span>
          </div>

          <div className="h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1 flex relative overflow-hidden font-mono text-xs">
            {scenario === 'aligned' && (
              <div className="w-full h-full rounded-lg bg-slate-200/50 dark:bg-slate-900/50 text-slate-400 flex items-center justify-center text-[11px]">
                Empty / Available for next struct
              </div>
            )}

            {scenario === 'straddled' && (
              <div className="w-full h-full flex">
                <div className="w-1/2 h-full rounded-lg bg-red-500/20 border border-red-500/40 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-[11px]">
                  Half 2 (Bytes 64-95) &rarr; Forces 2nd Memory Bus Read!
                </div>
                <div className="w-1/2 h-full rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-400 flex items-center justify-center text-[10.5px]">
                  Unused (96-127)
                </div>
              </div>
            )}

            {scenario === 'false-sharing' && (
              <div className="w-full h-full rounded-lg bg-slate-200/50 dark:bg-slate-900/50 text-slate-400 flex items-center justify-center text-[11px]">
                Unused (Both counters were packed into Line 0)
              </div>
            )}

            {scenario === 'solved' && (
              <div className="w-full h-full rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[11px]">
                Core 1 Counter Y (alignas(64) &mdash; Dedicated Cache Line)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hardware Telemetry & Explanation Box */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-slate-500 font-semibold text-[10.5px] uppercase tracking-wider">
            Hardware Bus Telemetry:
          </span>
          <span className={`font-mono font-bold ${scenarioMeta.busClass}`}>
            ● {scenarioMeta.busStatus}
          </span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
          {scenarioMeta.detail}
        </p>
      </div>
    </div>
  );
};
