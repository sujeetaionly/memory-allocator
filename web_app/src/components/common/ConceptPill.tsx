'use client';

import React from 'react';
import { CONCEPTS } from '@/data/concepts';

interface ConceptPillProps {
  id: string;
  label?: string;
  onSelectConcept?: (id: string) => void;
}

export const ConceptPill: React.FC<ConceptPillProps> = ({
  id,
  label,
  onSelectConcept,
}) => {
  const concept = CONCEPTS[id];
  const displayText = label || (concept ? concept.term : id);

  return (
    <button
      type="button"
      onClick={() => onSelectConcept && onSelectConcept(id)}
      className="code-pill hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-1 mx-0.5"
      title={`Click to inspect systems definition for ${displayText}`}
    >
      <span>{displayText}</span>
      <span className="text-[10px] text-slate-400">ℹ️</span>
    </button>
  );
};
