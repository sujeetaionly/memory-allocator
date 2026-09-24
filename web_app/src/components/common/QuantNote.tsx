'use client';

import React from 'react';

interface QuantNoteProps {
  type?: 'quant' | 'warning' | 'speed' | 'insight';
  title?: string;
  children: React.ReactNode;
}

export const QuantNote: React.FC<QuantNoteProps> = ({
  type = 'quant',
  title,
  children,
}) => {
  const configs = {
    quant: {
      border: 'border-blue-200 dark:border-blue-900/60',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      icon: '📊',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      tag: 'QUANT & HFT SYSTEMS',
      defaultTitle: 'Why Quant Developers & Low-Latency Engines Care',
    },
    warning: {
      border: 'border-red-200 dark:border-red-900/60',
      bg: 'bg-red-50/50 dark:bg-red-950/20',
      icon: '⚠️',
      badge: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300',
      tag: 'SYSTEMS HAZARD',
      defaultTitle: 'Common Latency Trap & Undefined Behavior',
    },
    speed: {
      border: 'border-emerald-200 dark:border-emerald-900/60',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      icon: '⚡',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      tag: '1-CYCLE OPTIMIZATION',
      defaultTitle: 'Mechanical Sympathy & Hardware Acceleration',
    },
    insight: {
      border: 'border-indigo-200 dark:border-indigo-900/60',
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      icon: '🧠',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
      tag: 'ARCHITECTURAL TAKEAWAY',
      defaultTitle: 'Systems Architecture Insight',
    },
  }[type];

  return (
    <div
      className={`my-6 rounded-xl border ${configs.border} ${configs.bg} p-5 shadow-sm space-y-3 transition-all`}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-sm shadow-xs border border-slate-200/60 dark:border-slate-700">
          {configs.icon}
        </span>
        <div className="flex-1">
          <span
            className={`text-[9.5px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block mb-0.5 ${configs.badge}`}
          >
            {configs.tag}
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title || configs.defaultTitle}
          </h4>
        </div>
      </div>
      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-9">
        {children}
      </div>
    </div>
  );
};
