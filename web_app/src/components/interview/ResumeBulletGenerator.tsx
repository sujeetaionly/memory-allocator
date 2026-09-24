'use client';

import React, { useState } from 'react';

export const ResumeBulletGenerator: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const bullets = [
    {
      title: 'Architectural Speedup & Zero Mutex Overhead',
      badge: 'LATENCY & MUTEX',
      text: 'Engineered high-performance C++20 memory allocator suite for ultra-low latency trading systems, achieving 125.7x execution speedup (0.44ns vs 54.9ns) and eliminating OS heap mutex locks across 1,000,000 operations.',
    },
    {
      title: 'Zero-Metadata Embedded Union Free-List',
      badge: 'DATA STRUCTURES',
      text: 'Architected fixed-size free-list allocator using embedded union memory overlays (union NodeUnion), achieving O(1) allocation/deallocation with 0-byte per-block metadata overhead and eliminating external fragmentation.',
    },
    {
      title: '1-Cycle Bump Arena & Bitwise Alignment',
      badge: 'MECHANICAL SYMPATHY',
      text: 'Implemented 1-cycle linear bump arena allocator with power-of-two bitwise alignment math ((addr + align - 1) & ~(align - 1)), eliminating 20-cycle hardware integer division stalls.',
    },
    {
      title: 'Knuth Boundary Tags & O(1) Coalescing',
      badge: 'ALGORITHMS',
      text: 'Designed variable-size allocator utilizing Knuth’s bidirectional boundary tags (Header/Footer), enabling instant O(1) adjacent free-block coalescing to mitigate memory fragmentation.',
    },
    {
      title: 'Standardized Benchmark & P99 Profiling',
      badge: 'BENCHMARKING',
      text: 'Constructed robust benchmarking harness with CPU cache warmup, compiler escape barriers (asm volatile memory barriers), and P99/P99.9 tail latency profiling to measure sub-microsecond jitter.',
    },
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              💼
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Resume &amp; Portfolio Bullet Generator (Quant / HFT)
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Production-grade, metric-backed impact statements ready to drop into your resume:
          </p>
        </div>
        <span className="self-start sm:self-center text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          METRIC-BACKED
        </span>
      </div>

      {/* Bullets List */}
      <div className="space-y-3">
        {bullets.map((b, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs space-y-2 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {b.badge}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px]">
                  {b.title}
                </span>
              </div>
              <button
                onClick={() => handleCopy(b.text, idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                  copiedIndex === idx
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs'
                }`}
              >
                <span>{copiedIndex === idx ? '✓' : '📋'}</span>
                <span>{copiedIndex === idx ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-sans leading-relaxed text-xs sm:text-[12.5px] pl-1">
              • {b.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
