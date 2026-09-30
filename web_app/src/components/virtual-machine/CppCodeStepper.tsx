'use client';

import React, { useState } from 'react';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

export interface CodeStep {
  lineNumber: number;
  code: string;
  explanation: string;
  hardwareEffect: string;
  action: () => void;
}

interface CppCodeStepperProps {
  title: string;
  filename: string;
  steps: CodeStep[];
  onReset?: () => void;
}

export const CppCodeStepper: React.FC<CppCodeStepperProps> = ({
  title,
  filename,
  steps,
  onReset,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const { resetMachine } = useVirtualMachine();

  const currentStep = steps[currentStepIndex] || steps[0];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      steps[nextIdx].action();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      resetMachine();
      if (onReset) onReset();
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      for (let i = 0; i <= prevIdx; i++) {
        steps[i].action();
      }
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    resetMachine();
    if (onReset) onReset();
    if (steps.length > 0) {
      steps[0].action();
    }
  };

  return (
    <div className="my-8 sm:my-10 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg text-slate-100 transition-all">
      {/* Code Studio Header */}
      <div className="bg-slate-900/90 px-4 sm:px-6 py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
          <span className="font-mono text-xs text-slate-400 pl-2 font-medium">
            {filename}
          </span>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-mono transition-colors cursor-pointer"
          >
            ◀ Prev
          </button>
          <span className="font-mono text-xs text-blue-400 px-1.5 font-semibold">
            {currentStepIndex + 1} / {steps.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="px-3.5 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Next Line</span>
            <span>▶</span>
          </button>
          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-mono transition-colors cursor-pointer"
            title="Reset code execution"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Code Listing with Active Line Indicator */}
      <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] overflow-x-auto space-y-1 bg-slate-950">
        {steps.map((st, idx) => {
          const isActive = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center px-3.5 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600/20 border-l-4 border-blue-500 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:bg-slate-900/50'
              }`}
            >
              <span className="w-8 text-right pr-3 select-none text-slate-600 font-mono text-xs">
                {st.lineNumber}
              </span>
              <span className="w-4 select-none text-blue-400 font-bold">
                {isActive ? '➔' : ' '}
              </span>
              <code className="flex-1 whitespace-pre">{st.code}</code>
            </div>
          );
        })}
      </div>

      {/* Synchronized Explanation Drawer */}
      <div className="bg-slate-900/70 p-5 sm:p-6 border-t border-slate-800 space-y-3 text-xs">
        <div className="flex items-start gap-3">
          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold tracking-wider uppercase mt-0.5 whitespace-nowrap">
            C++ MEANING
          </span>
          <span className="text-slate-200 leading-relaxed">
            {currentStep.explanation}
          </span>
        </div>

        <div className="flex items-start gap-3 pt-2.5 border-t border-slate-800/60">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase mt-0.5 whitespace-nowrap">
            HARDWARE REALITY
          </span>
          <span className="text-amber-200 font-mono text-[11px] leading-relaxed">
            ⚡ {currentStep.hardwareEffect}
          </span>
        </div>
      </div>
    </div>
  );
};
