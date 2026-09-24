export type ModuleId =
  | 'index'
  | 'stage-0'
  | 'stage-1'
  | 'stage-2'
  | 'stage-3'
  | 'stage-4'
  | 'stage-5'
  | 'stage-6'
  | 'stage-7'
  | 'sandbox'
  // Legacy aliases for backward compatibility
  | 'foundations'
  | 'arena'
  | 'freelist'
  | 'variable'
  | 'bitwise-cache'
  | 'benchmarks'
  | 'interview';

export type AppMode = 'story' | 'sandbox' | 'reference';

export interface ConceptDefinition {
  id: string;
  term: string;
  tagline: string;
  category: 'hardware' | 'os' | 'cpp' | 'quant';
  analogy: string;
  inPlainEnglish: string;
  howHardwareWorks: string;
  whyQuantsCare: string;
  codeSnippet?: string;
}

export interface CodeLineAnnotation {
  lineNumber: number;
  code: string;
  explanation: string;
  hardwareEffect: string;
  quantInsight?: string;
  highlightCategory?: 'allocation' | 'alignment' | 'pointer' | 'cleanup' | 'danger';
}

export interface CodeFileRecord {
  id: string;
  filename: string;
  description: string;
  phase: string;
  lines: CodeLineAnnotation[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  quantFirmReference?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Quant Interview';
}

export interface Flashcard {
  id: string;
  category: string;
  question: string;
  answer: string;
  keyTakeaway: string;
  difficulty: 'Beginner' | 'HFT Classic';
}

export interface MicroChallenge {
  id: string;
  stageId: string;
  title: string;
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  xpReward: number;
}

export type MemoryCellState = 'empty' | 'allocated' | 'padding' | 'header' | 'footer' | 'pointer' | 'active';

export interface MemoryCell {
  address: number;
  addressHex: string;
  value: number; // 0-255 byte
  valueHex: string;
  state: MemoryCellState;
  tag?: string;
  blockId?: string;
  cacheLineIndex: number; // 0 or 1 for 64B line
  asciiChar?: string;
}

export interface MemoryBlock {
  id: string;
  startAddress: number;
  size: number;
  alignment: number;
  type: 'object' | 'padding' | 'header' | 'footer' | 'freelist-node';
  label: string;
  color?: string;
}

export interface StepInstruction {
  lineNum: number;
  code: string;
  explanation: string;
  actionType: 'init' | 'alloc' | 'free' | 'reset' | 'read' | 'write' | 'cache_miss' | 'cache_hit';
  hardwareNote: string;
  modifiedAddresses: number[];
  cyclesCost: number;
}
