'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { MicroChallengeEngine } from '@/components/common/MicroChallengeEngine';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { QuantNote } from '@/components/common/QuantNote';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

interface Stage0Props {
  onNextStage: () => void;
}

export const Stage0_PhysicalMachine: React.FC<Stage0Props> = ({ onNextStage }) => {
  const { inspectAddress } = useVirtualMachine();

  const challenge1 = {
    id: 'c-stage0-bytes',
    stageId: 'stage-0',
    title: 'Deconstructing Physical Memory',
    scenario:
      'A hardware bus has 8 digital wire lines feeding into a memory cell. Each wire can carry either high voltage (1) or zero voltage (0).',
    question: 'How many distinct unique values can this 8-bit byte represent?',
    options: ['8 values (0 to 7)', '128 values (0 to 127)', '256 values (0 to 255)', '1,024 values'],
    correctIndex: 2,
    hint: 'Calculate 2 to the power of 8 (2^8).',
    explanation:
      'Each bit has 2 states (0 or 1). With 8 bits, 2^8 = 256 unique permutations (0 through 255 decimal, or 0x00 through 0xFF in hexadecimal). This makes 1 Byte the fundamental atom of modern computer memory!',
    xpReward: 100,
  };

  const challenge2 = {
    id: 'c-stage0-hex',
    stageId: 'stage-0',
    title: 'Hexadecimal Address Navigation',
    scenario:
      'In systems programming, memory addresses are written in Hexadecimal (base 16: 0-9, then A=10, B=11, C=12, D=13, E=14, F=15).',
    question: 'If a memory pointer is currently at address 0x0A, and you advance by 6 bytes, where does it land?',
    options: ['0x10', '0x16', '0x0F', '0x11'],
    correctIndex: 0,
    hint: '0x0A is 10 in decimal. 10 + 6 = 16 decimal. How is decimal 16 represented in hexadecimal?',
    explanation:
      'In decimal: 0x0A = 10. Adding 6 gives 16 in decimal. In base 16, 16 is written as 0x10 (1 sixteen + 0 ones). You just calculated a low-level pointer offset!',
    xpReward: 120,
  };

  const interactiveControls = (
    <div className="space-y-3">
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Click any button to jump the hardware inspector to that address in RAM:
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => inspectAddress(0x00)}
          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-mono text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
        >
          Inspect 0x00 (Byte 0)
        </button>
        <button
          onClick={() => inspectAddress(0x0A)}
          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-mono text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
        >
          Inspect 0x0A (Byte 10)
        </button>
        <button
          onClick={() => inspectAddress(0x3F)}
          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-mono text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
        >
          Inspect 0x3F (Byte 63)
        </button>
      </div>
    </div>
  );

  return (
    <DualPaneLayout interactiveControls={interactiveControls}>
      <article className="lesson-article">
        <header className="article-header" id="sec-stage0-head">
          <div className="text-xs uppercase font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
            STAGE 0 — ZERO PREREQUISITES
          </div>
          <h1 className="article-title">The Physical Machine &amp; The Illusion of Memory</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Estimated time: 10 mins • Key Concept: Physical Silicon vs Virtual Abstraction
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            Welcome to low-level systems programming. If you have only ever written Python, JavaScript, or basic school scripts, you are used to thinking of variables as magical containers floating in cyberspace.
          </p>
          <p className="prose">
            In systems programming and high-frequency quantitative systems, <strong>there is no magic</strong>. We take away the curtain and look directly at physical silicon chips, electrical charge, and hardware buses.
          </p>

          <AnalogyCard title="The Giant Street of Numbered Houses">
            Imagine an unimaginably long street of small storage lockers stretching for miles. Every single locker holds exactly <strong>1 byte (8 bits)</strong> of information.
            <br /><br />
            To keep track of them, the hardware manufacturer painted a unique number on the front of every locker: <strong>0, 1, 2, 3 ... all the way into the billions</strong>.
            <br /><br />
            That locker number is what we call a <strong>Memory Address</strong>. When you tell a computer to store something, it simply chooses a locker and places the bits inside.
          </AnalogyCard>

          {/* Section 0.2 */}
          <section id="sec-stage0-bits" className="lesson-section">
            <h2>0.1 — What is a Byte, Really?</h2>
            <p className="prose">
              Inside your computer&apos;s physical RAM chips, there are billions of tiny microscopic electrical capacitors. Each capacitor can either hold an electrical charge (representing <code className="code-pill">1</code>) or be empty (representing <code className="code-pill">0</code>). Each single charge is a <strong>bit</strong>.
            </p>
            <p className="prose">
              Because a single bit can only say &quot;yes&quot; or &quot;no&quot;, computers bundle 8 bits together into a <strong>Byte</strong>. With 8 binary switches, you can represent numbers from 0 up to 255.
            </p>

            <MicroChallengeEngine challenge={challenge1} />
          </section>

          {/* Section 0.3 */}
          <section id="sec-stage0-hex" className="lesson-section">
            <h2>0.2 — Hexadecimal: The Language of Memory Addresses</h2>
            <p className="prose">
              Writing memory addresses in base-10 decimal (like 140,733,193,388,032) is clumsy and tedious. Writing them in raw binary (zeros and ones) is unreadable.
            </p>
            <p className="prose">
              Systems engineers use <strong>Hexadecimal (Base 16)</strong> because every single hex character corresponds to exactly <strong>4 bits (half a byte)</strong>. Two hex characters make exactly <strong>1 full byte</strong>!
            </p>

            <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                The Hexadecimal Alphabet:
              </div>
              <div className="grid grid-cols-8 gap-2 text-center text-slate-600 dark:text-slate-300">
                <div>0 = 0</div>
                <div>1 = 1</div>
                <div>...</div>
                <div>9 = 9</div>
                <div className="text-blue-600 font-bold">A = 10</div>
                <div className="text-blue-600 font-bold">B = 11</div>
                <div className="text-blue-600 font-bold">...</div>
                <div className="text-blue-600 font-bold">F = 15</div>
              </div>
            </div>

            <p className="prose mt-3">
              Look at the <strong>Universal RAM Inspector</strong> on the right. Notice how the row headers and cells are labeled <code className="code-pill">0x00</code>, <code className="code-pill">0x01</code>, ..., <code className="code-pill">0x0F</code>, <code className="code-pill">0x10</code>. The <code className="code-pill">0x</code> prefix simply means &quot;this number is written in hexadecimal&quot;.
            </p>

            <MicroChallengeEngine challenge={challenge2} />
          </section>

          {/* Section 0.4 */}
          <section id="sec-stage0-wall" className="lesson-section">
            <h2>0.3 — The Memory Wall: Why Systems Programmers Obsess Over RAM</h2>
            <p className="prose">
              Why don&apos;t we just let standard libraries handle all memory?
            </p>
            <p className="prose">
              Your CPU is an incredible speed demon. Modern CPU cores run at ~4.0 GHz, executing an instruction every <strong>0.25 nanoseconds</strong>.
            </p>
            <p className="prose">
              However, fetching a single byte from main RAM takes <strong>60 to 100 nanoseconds</strong>. That means while waiting for RAM, the CPU sits idle doing absolutely nothing for <strong>200 to 400 clock cycles</strong>!
            </p>

            <QuantNote type="warning" title="THE MEMORY WALL IN QUANTITATIVE SYSTEMS">
              In High-Frequency Trading (HFT) and ultra-low latency computing, CPU arithmetic is essentially free.{' '}
              <strong>Memory access is the bottleneck of modern civilization.</strong>{' '}
              If your algorithm places data randomly in RAM, your program stalls. If you organize memory with mechanical sympathy, your code runs 100x faster!
            </QuantNote>
          </section>
        </div>
      </article>
    </DualPaneLayout>
  );
};
