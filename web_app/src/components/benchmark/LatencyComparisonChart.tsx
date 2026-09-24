'use client';

import React, { useState } from 'react';
import { BENCHMARK_METRICS } from '@/data/benchmarkData';

export const LatencyComparisonChart: React.FC = () => {
  const [metricView, setMetricView] = useState<'ns' | 'speedup' | 'total'>('speedup');

  // Baseline is OS Malloc
  const baselineNs = 54.91;

  return (
    <div className="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              📊
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Benchmark Telemetry: 1,000,000 Operations
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Empirical benchmark suite compiled with <code className="font-mono text-blue-600 dark:text-blue-400 font-semibold">g++ -O3 -std=c++20</code> with CPU cache warmup and compiler escape barriers.
          </p>
        </div>

        {/* View Switcher */}
        <div className="self-start sm:self-center inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs font-mono">
          <button
            onClick={() => setMetricView('speedup')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metricView === 'speedup'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Speedup Multiplier
          </button>
          <button
            onClick={() => setMetricView('ns')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metricView === 'ns'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Nanoseconds / Op
          </button>
          <button
            onClick={() => setMetricView('total')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metricView === 'total'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            1M Total Time
          </button>
        </div>
      </div>

      {/* Visual Comparative Bars */}
      <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider mb-2">
          Execution Speed Comparison (Lower Latency = Faster):
        </div>

        {BENCHMARK_METRICS.map((bm, idx) => {
          // Normalize bar length: Baseline = 100%, 0.44ns = 1%
          const pct = Math.max(3, Math.min(100, (bm.latencyPerOpNs / baselineNs) * 100));
          const isFastest = bm.speedupFactor >= 100;
          const isBaseline = bm.speedupFactor <= 1;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {bm.allocatorName}
                </span>
                <span className="font-mono text-xs">
                  {metricView === 'speedup' && (
                    <strong className={isFastest ? 'text-teal-600 dark:text-teal-400' : isBaseline ? 'text-slate-500' : 'text-blue-600 dark:text-blue-400'}>
                      {bm.speedupFactor > 1 ? `${bm.speedupFactor}x FASTER` : '1.00x (Baseline)'}
                    </strong>
                  )}
                  {metricView === 'ns' && (
                    <strong className="text-slate-700 dark:text-slate-300">
                      {bm.latencyPerOpNs.toFixed(2)} ns / op
                    </strong>
                  )}
                  {metricView === 'total' && (
                    <strong className="text-slate-700 dark:text-slate-300">
                      {bm.avgLatencyUs.toLocaleString()} µs
                    </strong>
                  )}
                </span>
              </div>

              {/* Bar */}
              <div className="h-5 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full rounded-lg transition-all duration-500 ${
                    isBaseline
                      ? 'bg-red-500'
                      : isFastest
                      ? 'bg-teal-500'
                      : bm.speedupFactor > 30
                      ? 'bg-blue-600'
                      : 'bg-purple-600'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Telemetry Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400">
              <th className="py-2.5 px-3 font-semibold">Allocator Architecture</th>
              <th className="py-2.5 px-3 font-semibold">Avg Latency</th>
              <th className="py-2.5 px-3 font-semibold">Speedup</th>
              <th className="py-2.5 px-3 font-semibold font-sans">Mechanical Sympathy Advantage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {BENCHMARK_METRICS.map((bm, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                  {bm.allocatorName}
                </td>
                <td className="py-3 px-3">
                  <span className={`font-semibold ${bm.speedupFactor > 1 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                    {bm.latencyPerOpNs.toFixed(2)} ns/op
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                    bm.speedupFactor > 100
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : bm.speedupFactor > 1
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {bm.speedupFactor > 1 ? `${bm.speedupFactor}x` : '1.0x'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-sans text-xs">
                  {bm.hardwareMechanism}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Highlight Card */}
      <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-white font-bold text-sm shadow-xs">
            ⚡
          </span>
          <div>
            <div className="font-bold text-teal-950 dark:text-teal-200">
              Maximum Quant Speedup: 125.7x Execution Advantage
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11.5px] mt-0.5">
              The Fixed-Size Free-List executes in <strong>0.44 nanoseconds</strong> (less than 2 CPU clock cycles), completely eliminating memory mutex locks.
            </p>
          </div>
        </div>
        <span className="self-start sm:self-center font-mono font-bold text-teal-700 dark:text-teal-300 whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800">
          P99 &lt; 1.0ns
        </span>
      </div>
    </div>
  );
};
