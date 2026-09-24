'use client';

import React, { useState } from 'react';
import { UniversalRamInspector } from '@/components/virtual-machine/UniversalRamInspector';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

interface DualPaneLayoutProps {
  children: React.ReactNode;
  interactiveControls?: React.ReactNode;
}

export const DualPaneLayout: React.FC<DualPaneLayoutProps> = ({
  children,
  interactiveControls,
}) => {
  const [mobileTab, setMobileTab] = useState<'narrative' | 'machine'>('narrative');
  const { logs, resetMachine } = useVirtualMachine();

  return (
    <div className="w-full">
      {/* Mobile/Tablet Sticky Navigation Pill Bar */}
      <div className="lg:hidden sticky top-[52px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-center gap-2">
        <button
          onClick={() => setMobileTab('narrative')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            mobileTab === 'narrative'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          📖 Lesson Guide
        </button>
        <button
          onClick={() => setMobileTab('machine')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            mobileTab === 'machine'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          🖥️ Live RAM Studio
        </button>
      </div>

      {/* Main Dual-Pane Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Left Pane: Elevated Narrative Canvas (7 Cols on desktop) */}
        <div
          className={`lg:col-span-7 ${
            mobileTab === 'machine' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-sm transition-all">
            {children}
          </div>
        </div>

        {/* Right Pane: Sticky Virtual Machine Studio (5 Cols on desktop) */}
        <div
          className={`lg:col-span-5 lg:sticky top-[64px] lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto lg:pr-1 space-y-4 sm:space-y-5 scrollbar-thin ${
            mobileTab === 'narrative' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Universal RAM Grid */}
          <UniversalRamInspector />

          {/* Interactive Laboratory Controls Card */}
          {interactiveControls && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 transition-all">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="flex items-center gap-1.5">
                  <span>🎮</span>
                  <span>Interactive Controls</span>
                </span>
                <button
                  onClick={resetMachine}
                  className="text-[11px] font-mono font-medium text-slate-400 hover:text-red-500 transition-colors"
                  title="Clear hardware memory buffer"
                >
                  ↺ Clear
                </button>
              </div>
              <div>{interactiveControls}</div>
            </div>
          )}

          {/* Real-Time Hardware Telemetry Bus Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] shadow-sm space-y-2">
            <div className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span>⚡</span>
                <span>Hardware Bus Event Log</span>
              </span>
              <span className="text-emerald-400 text-[9.5px] font-bold tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="h-28 sm:h-32 overflow-y-auto space-y-1.5 text-slate-300 pr-1 select-text scrollbar-thin">
              {logs.map((lg, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 select-none text-[10px] w-12 pt-0.5 shrink-0">
                    {lg.time}
                  </span>
                  <span
                    className={`flex-1 ${
                      lg.type === 'alloc'
                        ? 'text-emerald-400'
                        : lg.type === 'free'
                        ? 'text-teal-400'
                        : lg.type === 'warn'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {lg.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
