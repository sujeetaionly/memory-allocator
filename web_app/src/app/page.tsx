'use client';

import React, { useState, useEffect } from 'react';
import { ModuleId } from '@/types';
import { Header } from '@/components/common/Header';
import { ConceptModal } from '@/components/common/ConceptModal';
import { CourseIndex } from '@/components/modules/CourseIndex';
import { Stage0_PhysicalMachine } from '@/components/modules/Stage0_PhysicalMachine';
import { Stage1_CppMachineModel } from '@/components/modules/Stage1_CppMachineModel';
import { Stage2_HeapBottleneck } from '@/components/modules/Stage2_HeapBottleneck';
import { Module1_Arena } from '@/components/modules/Module1_Arena';
import { Module2_FreeList } from '@/components/modules/Module2_FreeList';
import { Module3_Variable } from '@/components/modules/Module3_Variable';
import { Module4_BitwiseCache } from '@/components/modules/Module4_BitwiseCache';
import { Stage7_QuantCapstone } from '@/components/modules/Stage7_QuantCapstone';
import { SandboxView } from '@/components/modules/SandboxView';
import { useLearner } from '@/stores/LearnerStore';

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleId>('index');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const { setCurrentStageId } = useLearner();

  // Load saved theme preference
  useEffect(() => {
    const saved = localStorage.getItem('lcpp-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const themeStr = newTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeStr);
    localStorage.setItem('lcpp-theme', themeStr);
  };

  const handleOpenConcept = (conceptId: string) => {
    setActiveConceptId(conceptId);
    setIsGlossaryOpen(true);
  };

  const handleSelectModule = (moduleId: ModuleId, sectionId?: string) => {
    setActiveModule(moduleId);
    setCurrentStageId(moduleId);
    if (sectionId) {
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Dynamic sections per module for the NAVIGATE dropdown
  const sectionMap: Record<string, { id: string; title: string }[]> = {
    index: [
      { id: 'sec-stages', title: 'The 7-Stage Learning Roadmap' },
    ],
    'stage-0': [
      { id: 'sec-stage0-head', title: '0.0 — Overview: The Physical Machine' },
      { id: 'sec-stage0-bits', title: '0.1 — What is a Byte, Really?' },
      { id: 'sec-stage0-hex', title: '0.2 — Hexadecimal Memory Addresses' },
      { id: 'sec-stage0-wall', title: '0.3 — The Memory Wall' },
    ],
    'stage-1': [
      { id: 'sec-stage1-head', title: '1.0 — Overview: The C++ Machine Model' },
      { id: 'sec-stage1-types', title: '1.1 — Data Types are Byte Spans' },
      { id: 'sec-stage1-pointers', title: '1.2 — Pointers Demystified: The Address Envelope' },
      { id: 'sec-stage1-stack', title: '1.3 — The Stack: Instant Speed with Limits' },
    ],
    'stage-2': [
      { id: 'sec-stage2-head', title: '2.0 — Overview: The Dynamic Heap Problem' },
      { id: 'sec-stage2-traps', title: '2.1 — The Three Fatal Sins of Malloc' },
      { id: 'sec-stage2-solution', title: '2.2 — Why We Build Custom Allocators' },
    ],
    'stage-3': [
      { id: 'sec-p1-head', title: '3.0 — Overview: Phase 1 Arena Allocator' },
      { id: 'sec-p1-raw', title: '3.1 — Raw Memory: std::byte[]' },
      { id: 'sec-p1-placement', title: '3.2 — Placement new Objects' },
      { id: 'sec-p1-destruct', title: '3.3 — Bulk Reset vs Individual Free' },
    ],
    'stage-4': [
      { id: 'sec-p2-head', title: '4.0 — Overview: Phase 2 Free-List' },
      { id: 'sec-p2-union', title: '4.1 — Zero-Overhead Embedded Union' },
      { id: 'sec-p2-o1', title: '4.2 — O(1) Singly-Linked Mechanics' },
    ],
    'stage-5': [
      { id: 'sec-p3-head', title: '5.0 — Overview: Phase 3 Variable Allocator' },
      { id: 'sec-p3-tags', title: '5.1 — Donald Knuth Boundary Tags' },
      { id: 'sec-p3-coalesce', title: '5.2 — Instant O(1) Neighbor Coalescing' },
    ],
    'stage-6': [
      { id: 'sec-p4-head', title: '6.0 — Overview: Hardware Reality' },
      { id: 'sec-p4-formula', title: '6.1 — 1-Clock-Cycle Alignment Formula' },
      { id: 'sec-p4-calc', title: '6.2 — Interactive Bitwise Calculator' },
      { id: 'sec-p4-cache', title: '6.3 — 64-Byte Cache Lines & False Sharing' },
      { id: 'sec-p4-padding', title: '6.4 — Struct Padding & Optimization' },
    ],
    'stage-7': [
      { id: 'sec-stage7-head', title: '7.0 — Overview: Systems Capstone' },
      { id: 'sec-stage7-tail', title: '7.1 — The Tyranny of Tail Latency' },
      { id: 'sec-stage7-matrix', title: '7.2 — 1,000,000 Ops Performance Matrix' },
      { id: 'sec-stage7-interview', title: '7.3 — Quant Interview War Room' },
    ],
    sandbox: [],
    foundations: [
      { id: 'sec-stage0-head', title: '0.0 — The Physical Machine' },
    ],
    arena: [
      { id: 'sec-p1-head', title: 'Phase 1: Linear Arena' },
    ],
    freelist: [
      { id: 'sec-p2-head', title: 'Phase 2: Free-List' },
    ],
    variable: [
      { id: 'sec-p3-head', title: 'Phase 3: Variable Allocator' },
    ],
    'bitwise-cache': [
      { id: 'sec-p4-head', title: 'Hardware Reality' },
    ],
    benchmarks: [
      { id: 'sec-stage7-matrix', title: '1,000,000 Ops Benchmarks' },
    ],
    interview: [
      { id: 'sec-stage7-interview', title: 'Quant Interview War Room' },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Sleek Low-Level Academy Header */}
      <Header
        activeModule={activeModule}
        setActiveModule={handleSelectModule}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        sections={sectionMap[activeModule] || []}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {activeModule === 'index' && (
          <CourseIndex onSelectTopic={handleSelectModule} />
        )}

        {activeModule === 'sandbox' && <SandboxView />}

        {(activeModule === 'stage-0' || activeModule === 'foundations') && (
          <Stage0_PhysicalMachine
            onNextStage={() => handleSelectModule('stage-1')}
          />
        )}

        {activeModule === 'stage-1' && (
          <Stage1_CppMachineModel
            onPrevStage={() => handleSelectModule('stage-0')}
            onNextStage={() => handleSelectModule('stage-2')}
          />
        )}

        {activeModule === 'stage-2' && (
          <Stage2_HeapBottleneck
            onPrevStage={() => handleSelectModule('stage-1')}
            onNextStage={() => handleSelectModule('stage-3')}
          />
        )}

        {(activeModule === 'stage-3' || activeModule === 'arena') && (
          <Module1_Arena
            onSelectConcept={handleOpenConcept}
            onPrevModule={() => handleSelectModule('stage-2')}
            onNextModule={() => handleSelectModule('stage-4')}
          />
        )}

        {(activeModule === 'stage-4' || activeModule === 'freelist') && (
          <Module2_FreeList
            onSelectConcept={handleOpenConcept}
            onPrevModule={() => handleSelectModule('stage-3')}
            onNextModule={() => handleSelectModule('stage-5')}
          />
        )}

        {(activeModule === 'stage-5' || activeModule === 'variable') && (
          <Module3_Variable
            onSelectConcept={handleOpenConcept}
            onPrevModule={() => handleSelectModule('stage-4')}
            onNextModule={() => handleSelectModule('stage-6')}
          />
        )}

        {(activeModule === 'stage-6' || activeModule === 'bitwise-cache') && (
          <Module4_BitwiseCache
            onSelectConcept={handleOpenConcept}
            onPrevModule={() => handleSelectModule('stage-5')}
            onNextModule={() => handleSelectModule('stage-7')}
          />
        )}

        {(activeModule === 'stage-7' ||
          activeModule === 'benchmarks' ||
          activeModule === 'interview') && (
          <Stage7_QuantCapstone
            onPrevStage={() => handleSelectModule('stage-6')}
            onSelectTopic={() => handleSelectModule('index')}
          />
        )}
      </main>

      {/* Systems Concept Dictionary Modal */}
      <ConceptModal
        conceptId={activeConceptId}
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        onSelectConcept={(id) => setActiveConceptId(id)}
      />
    </div>
  );
}
