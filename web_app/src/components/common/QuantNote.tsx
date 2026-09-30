'use client';

import React from 'react';

interface QuantNoteProps {
  type?: 'quant' | 'warning' | 'speed' | 'insight';
  title?: string;
  children: React.ReactNode;
}

/**
 * Design System Callout Alert Boxes (Warning / Danger / Optional / Info)
 * Matches alert box design pattern with colored containers, icons, and typography
 */
export const QuantNote: React.FC<QuantNoteProps> = ({
  type = 'quant',
  title,
  children,
}) => {
  const configs = {
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-700/25',
      iconColor: 'text-yellow-400 dark:text-yellow-500',
      titleColor: 'text-yellow-800 dark:text-yellow-200',
      bodyColor: 'text-yellow-700 dark:text-yellow-300',
      prefix: 'Warning',
      defaultTitle: 'Common Latency Trap & Undefined Behavior',
      icon: (
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      ),
    },
    quant: {
      container: 'bg-purple-50 dark:bg-purple-700/25',
      iconColor: 'text-purple-400 dark:text-purple-300',
      titleColor: 'text-purple-800 dark:text-purple-200',
      bodyColor: 'text-purple-700 dark:text-purple-200/90',
      prefix: 'Quant & HFT Note',
      defaultTitle: 'Why Low-Latency Trading Systems Care',
      icon: (
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      ),
    },
    speed: {
      container: 'bg-green-50 dark:bg-green-700/25',
      iconColor: 'text-green-400 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-200',
      bodyColor: 'text-green-700 dark:text-green-200/90',
      prefix: '1-Cycle Optimization',
      defaultTitle: 'Mechanical Sympathy & Hardware Acceleration',
      icon: (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      ),
    },
    insight: {
      container: 'bg-red-50 dark:bg-red-700/25',
      iconColor: 'text-red-400 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      bodyColor: 'text-red-700 dark:text-red-200/90',
      prefix: 'Critical Architecture Rule',
      defaultTitle: 'Systems Architecture Invariant',
      icon: (
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      ),
    },
  }[type];

  return (
    <div className={`my-7 sm:my-8 rounded-lg p-5 sm:p-6 shadow-xs border border-black/5 dark:border-white/5 ${configs.container}`}>
      <div className="flex items-start">
        <div className="shrink-0 mt-0.5">
          <svg
            className={`h-5 w-5 ${configs.iconColor}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            {configs.icon}
          </svg>
        </div>
        <div className="ml-3.5 flex-1">
          <div className={`text-sm leading-snug font-bold ${configs.titleColor}`}>
            {configs.prefix}: {title || configs.defaultTitle}
          </div>
          <div className={`mt-2.5 text-sm leading-relaxed ${configs.bodyColor}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
