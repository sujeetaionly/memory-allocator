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
  const {
    progress,
    setCurrentStageId,
    registerNavigator,
    registerGlossaryOpener,
    isDark,
    toggleTheme,
  } = useLearner();

  const [activeModule, setActiveModule] = useState<ModuleId>(progress.currentStageId || 'index');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);

  const handleOpenConcept = (conceptId?: string) => {
    if (conceptId) setActiveConceptId(conceptId);
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

  // Register global navigation and glossary opener with LearnerStore
  useEffect(() => {
    registerNavigator((moduleId: ModuleId, sectionId?: string) => {
      handleSelectModule(moduleId, sectionId);
    });
    registerGlossaryOpener((conceptId?: string) => {
      handleOpenConcept(conceptId);
    });
  }, [registerNavigator, registerGlossaryOpener]);

  // Keep activeModule in sync if currentStageId changes externally
  useEffect(() => {
    if (progress.currentStageId && progress.currentStageId !== activeModule) {
      setActiveModule(progress.currentStageId);
    }
  }, [progress.currentStageId]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-high-emphasis transition-colors duration-150">
      {/* Top Header (Visible on course index / overview) */}
      <Header
        activeModule={activeModule}
        setActiveModule={handleSelectModule}
        onOpenGlossary={() => handleOpenConcept()}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
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
