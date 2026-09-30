'use client';

import React from 'react';

interface AnalogyCardProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Design System Callout Alert Box (Info / Mental Model Variant)
 * Matches .tailwind-alert--info design pattern
 */
export const AnalogyCard: React.FC<AnalogyCardProps> = ({ title, children }) => {
  return (
    <div className="my-5 rounded-md bg-blue-50 p-4 dark:bg-blue-700/25">
      <div className="flex items-start">
        <div className="shrink-0">
          <svg
            className="h-5 w-5 text-blue-400 dark:text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm leading-5 font-semibold text-blue-800 dark:text-blue-200">
            Mental Model — {title}
          </div>
          <div className="mt-2 text-sm leading-6 text-blue-700 dark:text-blue-200/90 space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
