'use client';

import React from 'react';
import { LearnerProvider } from '@/stores/LearnerStore';
import { VirtualMachineProvider } from '@/stores/VirtualMachineContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LearnerProvider>
      <VirtualMachineProvider>
        {children}
      </VirtualMachineProvider>
    </LearnerProvider>
  );
};
