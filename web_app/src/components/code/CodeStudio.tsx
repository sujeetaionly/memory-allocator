'use client';

import React, { useState } from 'react';
import { CPP_SOURCE_FILES } from '@/data/cppSourceCode';

interface CodeStudioProps {
  initialFileKey?: string;
}

export const CodeStudio: React.FC<CodeStudioProps> = ({ initialFileKey = 'arena' }) => {
  const [selectedFileKey, setSelectedFileKey] = useState<string>(initialFileKey);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({ 12: true, 28: true, 37: true, 63: true });
  const activeFile = CPP_SOURCE_FILES[selectedFileKey] || CPP_SOURCE_FILES['arena'];

  const toggleRow = (lineNum: number) => {
    setOpenRows((prev) => ({ ...prev, [lineNum]: !prev[lineNum] }));
  };

  return (
    <div className="code-block-wrapper">
      {/* Code Header Bar (LearnCPP Subdued Header) */}
      <div className="code-block-header">
        <span className="cb-filename">{activeFile.filename}</span>
        <div className="flex gap-2">
          {Object.entries(CPP_SOURCE_FILES).map(([key, file]) => (
            <button
              key={key}
              onClick={() => setSelectedFileKey(key)}
              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                selectedFileKey === key
                  ? 'bg-[#2b4c7e] text-white font-bold'
                  : 'text-[#6c757d] hover:text-[#111111]'
              }`}
            >
              {file.filename}
            </button>
          ))}
        </div>
      </div>

      {/* Code Box */}
      <div className="lcpp-code-box">
        {activeFile.lines.map((line) => {
          const isOpen = !!openRows[line.lineNumber];

          return (
            <div
              key={line.lineNumber}
              className={`code-row ${isOpen ? 'open' : ''}`}
            >
              <div
                className="code-line"
                onClick={() => toggleRow(line.lineNumber)}
                title="Click line to toggle inline breakdown and hardware notes"
              >
                <span className="ln">{line.lineNumber}</span>
                <code className="text-[13px]">{line.code}</code>
              </div>

              {/* Inline Accordion Comment Breakdown */}
              <div className="line-comment">
                <div><strong>// Explanation:</strong> {line.explanation}</div>
                <div><strong>// Hardware:</strong> {line.hardwareEffect}</div>
                {line.quantInsight && (
                  <div><strong>// Quant Note:</strong> {line.quantInsight}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
