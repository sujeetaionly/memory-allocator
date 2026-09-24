'use client';

import React from 'react';

interface AnalogyCardProps {
  title: string;
  children: React.ReactNode;
}

export const AnalogyCard: React.FC<AnalogyCardProps> = ({ title, children }) => {
  return (
    <div className="my-6 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-orange-50/20 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-sm transition-all">
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-sm font-bold border border-amber-500/20">
          💡
        </span>
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 block">
            Mental Model Analogy
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h4>
        </div>
      </div>
      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-9">
        {children}
      </div>
    </div>
  );
};
