'use client';

import React, { useState } from 'react';

export interface CodeTab {
  filename: string;
  language: string;
  code: string;
  description?: string;
  runCommand?: string;
}

interface ProductionCodeBlockProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  compileCommand?: string;
  tabs?: CodeTab[];
  files?: CodeTab[];
}

export const ProductionCodeBlock: React.FC<ProductionCodeBlockProps> = ({
  title,
  subtitle,
  description,
  badge,
  compileCommand,
  tabs,
  files,
}) => {
  const codeTabs: CodeTab[] = tabs || files || [];
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (codeTabs.length === 0) {
    return null;
  }

  const activeTab = codeTabs[activeTabIdx] || codeTabs[0];
  const displaySubtitle = subtitle || description || activeTab.description;
  const displayCommand = activeTab.runCommand || compileCommand;
  const displayBadge = badge || (activeTab.language === 'cpp' ? 'C++20 Header' : activeTab.language);

  const handleCopy = async () => {
    if (!activeTab) return;
    try {
      await navigator.clipboard.writeText(activeTab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = activeTab.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = activeTab.code.split('\n');

  return (
    <div className="my-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 ml-1">
            {title}
          </span>
          {displayBadge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              {displayBadge}
            </span>
          )}
        </div>

        {/* Tab Switcher & Copy Button */}
        <div className="flex items-center gap-2">
          {codeTabs.length > 1 && (
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 rounded-lg p-0.5">
              {codeTabs.map((tab, idx) => (
                <button
                  key={tab.filename}
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                    activeTabIdx === idx
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.filename}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleCopy}
            className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
            }`}
            title="Copy full source code to clipboard"
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {displaySubtitle && (
        <div className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/60 leading-relaxed">
          {displaySubtitle}
        </div>
      )}

      {/* Code Body */}
      <div className="overflow-x-auto p-0 max-h-[520px] overflow-y-auto font-mono text-[13px] leading-relaxed scrollbar-thin">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*');
              const isPreprocessor = line.trim().startsWith('#');

              let lineStyle = 'text-slate-800 dark:text-slate-200';
              if (isComment) lineStyle = 'text-slate-400 dark:text-slate-500 italic';
              else if (isPreprocessor) lineStyle = 'text-rose-600 dark:text-rose-400 font-semibold';

              return (
                <tr
                  key={lineNum}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                >
                  <td className="w-12 py-0.5 pr-4 pl-3 text-right text-[11px] text-slate-400 dark:text-slate-600 select-none border-r border-slate-200 dark:border-slate-800/80 font-mono">
                    {lineNum}
                  </td>
                  <td className={`py-0.5 px-4 whitespace-pre font-mono ${lineStyle}`}>
                    {line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Terminal Run Footer if available */}
      {displayCommand && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 py-2.5 bg-slate-900 dark:bg-slate-950 border-t border-slate-800 text-xs font-mono text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">$</span>
            <span className="text-slate-200 select-all">{displayCommand}</span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">
            Run in terminal (C++20 required)
          </span>
        </div>
      )}
    </div>
  );
};
