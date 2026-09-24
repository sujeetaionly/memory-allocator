'use client';

import React from 'react';
import { QuizEngine } from '@/components/interview/QuizEngine';
import { FlashcardDeck } from '@/components/interview/FlashcardDeck';
import { ResumeBulletGenerator } from '@/components/interview/ResumeBulletGenerator';

interface Module6Props {
  onSelectConcept: (id: string) => void;
}

export const Module6_Interview: React.FC<Module6Props> = ({ onSelectConcept }) => {
  return (
    <article className="lesson-article">
      <header className="article-header" id="sec-p6-head">
        <h1 className="article-title">6.1 — Quant C++ Developer Interview War Room</h1>
      </header>

      <div className="article-body">
        <p className="prose">
          Proprietary trading firms (such as Citadel, Jane Street, Optiver, Jump Trading, and HRT) rigorously assess candidates on physical hardware intuition, memory alignment mechanics, and deterministic execution in modern C++.
        </p>

        {/* Section 6.2 */}
        <section id="sec-p6-expectations" className="lesson-section">
          <h2>6.2 — Core Systems Competencies Tested by Quant Interviewers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
            <div className="p-3 rounded border border-[#ced4da] bg-[#f8f9fa] text-[12px]">
              <strong className="text-[#111111] block mb-1">1. Mechanical Sympathy</strong>
              <span className="text-[#555555]">
                Understanding physical CPU registers, L1/L2 caches, 64-byte cache line boundaries, and memory alignment masks.
              </span>
            </div>
            <div className="p-3 rounded border border-[#ced4da] bg-[#f8f9fa] text-[12px]">
              <strong className="text-[#111111] block mb-1">2. Memory Ownership</strong>
              <span className="text-[#555555]">
                Mastering placement new, explicit destructor calling (<code className="code-pill">ptr-&gt;~T()</code>), and union pointer overlays.
              </span>
            </div>
            <div className="p-3 rounded border border-[#ced4da] bg-[#f8f9fa] text-[12px]">
              <strong className="text-[#111111] block mb-1">3. Latency Determinism</strong>
              <span className="text-[#555555]">
                Eliminating mutex lock contention, avoiding kernel traps (<code className="code-pill">mmap</code>), and minimizing P99 tail jitter.
              </span>
            </div>
          </div>
        </section>

        {/* Section 6.3 Quiz */}
        <section id="sec-p6-quiz" className="lesson-section">
          <h2>6.3 — Technical Systems Interview Quiz</h2>
          <QuizEngine />
        </section>

        {/* Section 6.4 Flashcards */}
        <section id="sec-p6-cards" className="lesson-section">
          <h2>6.4 — Flashcard Quick Recall Drills</h2>
          <FlashcardDeck />
        </section>

        {/* Section 6.5 Resume Bullets */}
        <section id="sec-p6-resume" className="lesson-section">
          <h2>6.5 — Quant Developer Resume Bullet Points</h2>
          <ResumeBulletGenerator />
        </section>
      </div>
    </article>
  );
};
