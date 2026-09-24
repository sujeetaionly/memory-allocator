'use client';

import React from 'react';
import { ModuleId } from '@/types';
import { useLearner } from '@/stores/LearnerStore';

interface TopicItem {
  num: string;
  title: string;
  moduleId: ModuleId;
  sectionId?: string;
}

interface UnitItem {
  unitNum: number;
  unitTitle: string;
  topics: TopicItem[];
}

interface StageItem {
  id: string;
  stageNumber: string;
  name: string;
  badge: string;
  badgeColor: string;
  moduleId: ModuleId;
  description: string;
  units: UnitItem[];
}

interface CourseIndexProps {
  onSelectTopic: (moduleId: ModuleId, sectionId?: string) => void;
}

export const CourseIndex: React.FC<CourseIndexProps> = ({ onSelectTopic }) => {
  const { progress } = useLearner();

  const stages: StageItem[] = [
    {
      id: 'stage-0',
      stageNumber: 'STAGE 0',
      name: 'The Physical Machine & The Illusion of Memory',
      badge: 'ZERO PREREQUISITES',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      moduleId: 'stage-0',
      description:
        'Start from bare silicon transistors, physical voltage, 8-bit bytes, hexadecimal address lockers, and the CPU memory wall.',
      units: [
        {
          unitNum: 1,
          unitTitle: 'Physical Silicon & Byte Addressing',
          topics: [
            { num: '0.1', title: 'What is Physical RAM & What is a Byte?', moduleId: 'stage-0', sectionId: 'sec-stage0-bits' },
            { num: '0.2', title: 'Hexadecimal: The Language of Memory Addresses', moduleId: 'stage-0', sectionId: 'sec-stage0-hex' },
            { num: '0.3', title: 'The Memory Wall: CPU Speed vs RAM Latency', moduleId: 'stage-0', sectionId: 'sec-stage0-wall' },
          ],
        },
      ],
    },
    {
      id: 'stage-1',
      stageNumber: 'STAGE 1',
      name: 'The C++ Machine Model, Pointers & The Stack',
      badge: 'FIRST PRINCIPLES',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      moduleId: 'stage-1',
      description:
        'Demystify types as byte spans, variables as nicknames, and pointers as locker envelopes. Step through real memory mutations.',
      units: [
        {
          unitNum: 1,
          unitTitle: 'Memory Layout & Pointers Demystified',
          topics: [
            { num: '1.1', title: 'Data Types are Simply Byte Spans (char, int, double)', moduleId: 'stage-1', sectionId: 'sec-stage1-types' },
            { num: '1.2', title: 'Pointers Demystified: The Address Envelope (& and *)', moduleId: 'stage-1', sectionId: 'sec-stage1-pointers' },
            { num: '1.3', title: 'The Stack: 1-Cycle Speed with Strict Lifetime Limits', moduleId: 'stage-1', sectionId: 'sec-stage1-stack' },
          ],
        },
      ],
    },
    {
      id: 'stage-2',
      stageNumber: 'STAGE 2',
      name: 'The Dynamic Memory Problem & The OS Heap Bottleneck',
      badge: 'THE ROOT PROBLEM',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      moduleId: 'stage-2',
      description:
        'Understand why standard malloc causes catastrophic latency spikes: kernel traps, multi-threaded mutex locks, and Swiss-cheese fragmentation.',
      units: [
        {
          unitNum: 1,
          unitTitle: 'The Three Sins of Standard Heap',
          topics: [
            { num: '2.1', title: 'The Three Fatal Sins of Standard Malloc', moduleId: 'stage-2', sectionId: 'sec-stage2-traps' },
            { num: '2.2', title: 'The Paradigm Shift: Why We Build Custom Allocators', moduleId: 'stage-2', sectionId: 'sec-stage2-solution' },
          ],
        },
      ],
    },
    {
      id: 'stage-3',
      stageNumber: 'STAGE 3',
      name: 'Phase 1: Linear Arena (Bump Pointer) Allocator',
      badge: '42.04x FASTER',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      moduleId: 'stage-3',
      description:
        'Construct the fastest allocator known to computer science. 1-cycle integer bump pointer addition, placement new, and bulk reset.',
      units: [
        {
          unitNum: 1,
          unitTitle: 'Bump Pointer & Object Construction',
          topics: [
            { num: '3.1', title: 'Raw Memory Representation with std::byte[]', moduleId: 'stage-3', sectionId: 'sec-p1-raw' },
            { num: '3.2', title: 'Placement new: Constructing Objects in Pre-Allocated RAM', moduleId: 'stage-3', sectionId: 'sec-p1-placement' },
            { num: '3.3', title: 'The Arena Tradeoff: Bulk Reset vs Individual Free', moduleId: 'stage-3', sectionId: 'sec-p1-destruct' },
          ],
        },
      ],
    },
    {
      id: 'stage-4',
      stageNumber: 'STAGE 4',
      name: 'Phase 2: Fixed-Size Free-List (Order Pool)',
      badge: '125.7x FASTER',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      moduleId: 'stage-4',
      description:
        'Recycle individual fixed-size chunks in O(1) time without any metadata overhead by using the intrusive embedded union technique.',
      units: [
        {
          unitNum: 1,
          unitTitle: 'Embedded Unions & Zero Overhead',
          topics: [
            { num: '4.1', title: 'The Zero-Overhead Embedded Union Technique (union NodeUnion)', moduleId: 'stage-4', sectionId: 'sec-p2-union' },
            { num: '4.2', title: 'O(1) Singly-Linked Push & Pop Mechanics', moduleId: 'stage-4', sectionId: 'sec-p2-o1' },
          ],
        },
      ],
    },
    {
      id: 'stage-5',
      stageNumber: 'STAGE 5',
      name: 'Phase 3: Variable-Size Boundary-Tag Allocator',
      badge: '15.02x FASTER',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      moduleId: 'stage-5',
      description:
        'Handle arbitrary-sized messages with Donald Knuth boundary headers and footers, enabling instant O(1) bidirectional coalescing.',
      units: [
        {
          unitNum: 1,
          unitTitle: 'Boundary Tags & Instant Coalescing',
          topics: [
            { num: '5.1', title: "Donald Knuth's Boundary Tag Invention (Headers & Footers)", moduleId: 'stage-5', sectionId: 'sec-p3-tags' },
            { num: '5.2', title: 'Instant O(1) Left & Right Neighbor Coalescing', moduleId: 'stage-5', sectionId: 'sec-p3-coalesce' },
          ],
        },
      ],
    },
    {
      id: 'stage-6',
      stageNumber: 'STAGE 6',
      name: 'The Hardware Reality: Bitwise Math & 64B Cache Lines',
      badge: 'MECHANICAL SYMPATHY',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      moduleId: 'stage-6',
      description:
        'Master the 1-cycle bitwise alignment mask formula, understand 64-byte CPU cache lines, and eliminate multi-core false sharing.',
      units: [
        {
          unitNum: 1,
          unitTitle: 'Bus Alignment & Cache Locality',
          topics: [
            { num: '6.1', title: '1-Clock-Cycle Bitwise Alignment Formula: (addr + align - 1) & ~(align - 1)', moduleId: 'stage-6', sectionId: 'sec-p4-formula' },
            { num: '6.2', title: 'Interactive Bitwise Alignment Calculator', moduleId: 'stage-6', sectionId: 'sec-p4-calc' },
            { num: '6.3', title: '64-Byte CPU Cache Lines & Multi-Core False Sharing', moduleId: 'stage-6', sectionId: 'sec-p4-cache' },
            { num: '6.4', title: 'Struct Member Reordering & Padding Optimization', moduleId: 'stage-6', sectionId: 'sec-p4-padding' },
          ],
        },
      ],
    },
    {
      id: 'stage-7',
      stageNumber: 'STAGE 7',
      name: 'Systems Capstone: Benchmarks & Quant War Room',
      badge: 'CAREER READY',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      moduleId: 'stage-7',
      description:
        'Empirical latency benchmarks across 1,000,000 operations, compiler escape barriers, and Citadel/Jane Street interview drills.',
      units: [
        {
          unitNum: 1,
          unitTitle: 'Tail Latency & Interview Drills',
          topics: [
            { num: '7.1', title: 'The Tyranny of Tail Latency (P99 / P99.9)', moduleId: 'stage-7', sectionId: 'sec-stage7-tail' },
            { num: '7.2', title: 'Standardized Benchmark Matrix (1,000,000 Operations)', moduleId: 'stage-7', sectionId: 'sec-stage7-matrix' },
            { num: '7.3', title: 'Technical Systems & Quant Interview Drills', moduleId: 'stage-7', sectionId: 'sec-stage7-interview' },
          ],
        },
      ],
    },
  ];

  return (
    <div className="py-8 space-y-10 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Hero Banner with Responsive Flex Layout (No absolute collision bugs) */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all">
        {/* Left Column: Headlines & Action Buttons */}
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono">
            <span>⚡ Zero-to-Hero Systems Academy</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Master Low-Level Systems &amp; C++ Memory Allocators
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Designed specifically for beginners with <strong>zero low-level experience</strong>. Journey from raw electrical silicon to engineering production-grade C++ memory allocators running <strong>125x faster than std::malloc</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectTopic('stage-0')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              Start Story Quest (Stage 0) ▶
            </button>
            <button
              onClick={() => onSelectTopic('sandbox')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-1.5"
            >
              🎮 Open Allocator Sandbox
            </button>
          </div>
        </div>

        {/* Right Column: Telemetry Summary Card */}
        <div className="bg-slate-950/80 backdrop-blur rounded-2xl p-5 border border-slate-800 text-xs font-mono space-y-3.5 min-w-[260px] shadow-inner">
          <div className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Learner Telemetry</span>
            <span className="text-emerald-400">● SYNCED</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-sans">TOTAL SCORE</span>
              <span className="text-lg font-bold text-amber-400">⚡ {progress.xp}</span>
              <span className="text-[10px] text-slate-500 ml-1">XP</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-sans">CHALLENGES</span>
              <span className="text-lg font-bold text-emerald-400">
                {progress.completedChallenges.length}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">Done</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-blue-400">★</span>
            <span>8 Interactive Stages Ready</span>
          </div>
        </div>
      </div>

      {/* Curriculum Stages Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🗺️ The 7-Stage Learning Roadmap</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            8 Modules • 20+ Interactive Labs
          </span>
        </div>

        <div className="space-y-4">
          {stages.map((stg) => (
            <div
              key={stg.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {stg.stageNumber}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${stg.badgeColor}`}>
                      {stg.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stg.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-3xl">
                    {stg.description}
                  </p>
                </div>

                <button
                  onClick={() => onSelectTopic(stg.moduleId)}
                  className="self-start sm:self-center px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors whitespace-nowrap"
                >
                  Enter Stage ▶
                </button>
              </div>

              {/* Subtopic links with clean spacing */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {stg.units.flatMap((u) =>
                  u.topics.map((top, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectTopic(top.moduleId, top.sectionId)}
                      className="text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center gap-2.5 group transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <span className="font-mono text-slate-400 text-[11px] group-hover:text-blue-500 font-semibold">
                        {top.num}
                      </span>
                      <span className="flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium leading-snug">
                        {top.title}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-colors">
                        →
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
