'use client';

import React from 'react';
import { ConceptPill } from '@/components/common/ConceptPill';
import { QuantNote } from '@/components/common/QuantNote';
import { LatencyComparisonChart } from '@/components/benchmark/LatencyComparisonChart';

interface Module5Props {
  onSelectConcept: (id: string) => void;
  onNextModule: () => void;
}

export const Module5_Benchmarks: React.FC<Module5Props> = ({
  onSelectConcept,
  onNextModule,
}) => {
  return (
    <article className="lesson-article">
      <header className="article-header" id="sec-p5-head">
        <h1 className="article-title">5.1 — Standardized Micro-Benchmarks &amp; Tail Latency Lab</h1>
      </header>

      <div className="article-body">
        <p className="prose">
          Writing rigorous micro-benchmarks in low-latency systems requires eliminating operating system background noise, warming up instruction and data caches, and preventing modern optimizing compilers from dead-code eliminating test operations.
        </p>

        {/* Section 5.2 */}
        <section id="sec-p5-tail" className="lesson-section">
          <h2>5.2 — Why Average Latency Lies in High-Frequency Trading</h2>
          <p className="prose">
            Standard software benchmarks focus entirely on average execution time. In electronic trading, <strong>tail latency (P99 / P99.9) and jitter</strong> dictate profitability.
          </p>
          <p className="prose">
            An allocator that executes in 50ns on average, but hits a 50,000ns mutex stall on 1 out of 1,000 orders, causes catastrophic financial risk. A predictable allocator that executes in 200ns with zero variance wins the trade every time.
          </p>

          <QuantNote type="warning" title="TAIL LATENCY DETERMINISM">
            Deterministic worst-case latency always triumphs over a low average with volatile spikes.
          </QuantNote>
        </section>

        {/* Section 5.3 Benchmark Results */}
        <section id="sec-p5-matrix" className="lesson-section">
          <h2>5.3 — Standardized Micro-Benchmark Matrix (1,000,000 Operations)</h2>
          <LatencyComparisonChart />
        </section>

        {/* Section 5.4 Compiler Barriers */}
        <section id="sec-p5-escape" className="lesson-section">
          <h2>5.4 — Compiler Escape Barriers: Preventing Dead-Code Elimination</h2>
          <p className="prose">
            With aggressive optimizations (<code className="code-pill">g++ -O3</code>), if the compiler detects that allocated memory is never read or written to, it will optimize away the entire benchmark loop.
            We insert an inline assembly memory barrier (<code className="code-pill">escape(p)</code>) to force the compiler to emit the allocation instructions:
          </p>

          <div className="code-block-wrapper">
            <div className="code-block-header">
              <span className="cb-filename">memory_barrier.hpp</span>
            </div>
            <div className="lcpp-code-box">
              <div className="code-row">
                <div className="code-line"><span className="ln">1</span><span className="tok-keyword">inline</span> <span className="tok-type">void</span> escape(<span className="tok-type">void</span>* p) <span className="tok-keyword">noexcept</span> &#123;</div>
              </div>
              <div className="code-row">
                <div className="code-line"><span className="ln">2</span><span className="tok-comment">#if defined(__GNUG__) || defined(__clang__)</span></div>
              </div>
              <div className="code-row">
                <div className="code-line"><span className="ln">3</span>    <span className="tok-keyword">asm</span> <span className="tok-keyword">volatile</span>(&quot;&quot; : : &quot;g&quot;(p) : &quot;memory&quot;);</div>
              </div>
              <div className="code-row">
                <div className="code-line"><span className="ln">4</span><span className="tok-comment">#endif</span></div>
              </div>
              <div className="code-row">
                <div className="code-line"><span className="ln">5</span>&#125;</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e9ecef] flex justify-between items-center">
            <span className="text-[#6c757d] text-xs">Next Lesson: Phase 6 Quant Interview War Room</span>
            <button onClick={onNextModule} className="lcpp-btn primary">
              Continue to Lesson 6.1 &rarr;
            </button>
          </div>
        </section>
      </div>
    </article>
  );
};
