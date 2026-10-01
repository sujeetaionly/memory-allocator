'use client';

import React from 'react';
import { DualPaneLayout } from '@/components/common/DualPaneLayout';
import { MicroChallengeEngine } from '@/components/common/MicroChallengeEngine';
import { AnalogyCard } from '@/components/common/AnalogyCard';
import { CppCodeStepper, CodeStep } from '@/components/virtual-machine/CppCodeStepper';
import { useVirtualMachine } from '@/stores/VirtualMachineContext';

interface Stage1Props {
  onNextStage: () => void;
  onPrevStage: () => void;
}

export const Stage1_CppMachineModel: React.FC<Stage1Props> = ({
  onNextStage,
  onPrevStage,
}) => {
  const { bumpAllocate, resetArena } = useVirtualMachine();

  const stepperSteps: CodeStep[] = [
    {
      lineNumber: 1,
      code: 'int order_id = 42;  // Reserve 4 bytes',
      explanation:
        'The compiler allocates 4 contiguous bytes on the stack and writes the binary value 42 into those 4 bytes.',
      hardwareEffect:
        'Stack pointer RSP is decremented by 4 bytes. Memory at 0x00 now holds the 32-bit integer 42.',
      action: () => {
        resetArena();
        bumpAllocate(4, 4, 'order_id (int: 42)');
      },
    },
    {
      lineNumber: 2,
      code: 'int* ptr = &order_id; // Pointer holds address 0x00',
      explanation:
        'The address-of operator (&) reads the locker address where order_id lives (0x00) and saves that 64-bit address into variable ptr.',
      hardwareEffect:
        'Register RAX is loaded with 0x00. A 64-bit pointer is saved on the stack pointing directly at cell 0x00.',
      action: () => {
        bumpAllocate(8, 8, 'ptr (int*: &order_id)');
      },
    },
    {
      lineNumber: 3,
      code: '*ptr = 100; // Dereference: write through pointer',
      explanation:
        'The dereference operator (*) instructs the CPU: "Go to the address stored inside ptr (0x00), open that locker, and overwrite its value with 100".',
      hardwareEffect:
        'CPU executes a MOV instruction: [RAX] <= 100. Cell 0x00 is updated with 100 in decimal (0x64 hex).',
      action: () => {
        // Keeps the layout, updates tag
      },
    },
  ];

  const challenge1 = {
    id: 'c-stage1-ptr',
    stageId: 'stage-1',
    title: 'The Pointer Dereference Intuition',
    scenario:
      'You have an integer variable `int count = 5;` residing at memory address `0x08`. You create a pointer: `int* p = &count;`. Then you execute `*p = 12;`.',
    question: 'What is the value of `count` after this line executes?',
    options: ['5', '0x08', '12', 'Undefined / Crash'],
    correctIndex: 2,
    hint: 'Dereferencing (*p) means opening the locker at address p and modifying what is inside.',
    explanation:
      '`p` holds the locker number `0x08`. `*p = 12;` tells the CPU: "Go to locker 0x08 and put 12 in it." Because `count` is the nickname for locker 0x08, `count` is now 12!',
    xpReward: 120,
  };

  const challenge2 = {
    id: 'c-stage1-stack',
    stageId: 'stage-1',
    title: 'Stack Frame Ephemeral Lifetime',
    scenario:
      'A function `int* createOrder()` creates a local variable `int temp = 999;` on the stack and returns `&temp;` (its address).',
    question: 'Why is returning a pointer to a local stack variable dangerous?',
    options: [
      'It works perfectly and is standard practice.',
      'The stack memory is reclaimed when the function returns, leaving a dangling pointer pointing to reused/corrupted memory.',
      'The CPU refuses to compile any function that returns a pointer.',
      'It causes a physical RAM short circuit.',
    ],
    correctIndex: 1,
    hint: 'When a function exits, its stack frame is instantly popped off and reused by future functions.',
    explanation:
      'Spot on! Local stack variables only live while the function is active. Once the function finishes, its stack frame is reclaimed. Returning that pointer produces a "Dangling Pointer", which leads to catastrophic memory corruption.',
    xpReward: 150,
  };

  const challenge3 = {
    id: 'c-stage1-ptr-math',
    stageId: 'stage-1',
    title: 'The Pointer Arithmetic Leap',
    scenario:
      'You have an array of 64-bit doubles: `double prices[4];` located at memory address `0x1000`. You compute `double* p = prices + 2;`.',
    question: 'What is the physical hexadecimal memory address stored inside `p`?',
    options: ['0x1002', '0x1008', '0x1010', '0x1016'],
    correctIndex: 2,
    hint: 'Pointer addition does NOT add raw numbers; it advances by N * sizeof(*ptr). On x86-64, sizeof(double) is 8 bytes.',
    explanation:
      'Spot on! `prices + 2` advances by `2 * sizeof(double) = 16 bytes` (which is `0x10` in hex). Adding `0x10` to `0x1000` yields `0x1010`. In custom allocators, we use `std::byte*` because `sizeof(std::byte) == 1`, allowing exact 1-byte pointer offsets!',
    xpReward: 140,
  };

  const challenge4 = {
    id: 'c-stage1-placement-destruct',
    stageId: 'stage-1',
    title: 'Placement new & Destructor Safety',
    scenario:
      'You construct an `Order` struct inside pre-allocated arena buffer memory using placement new: `Order* ord = new (buffer) Order(101);`. When you are finished with `ord`, what is the correct C++ syntax to clean it up?',
    question: 'How do you safely destroy an object created with placement new?',
    options: [
      'Call `delete ord;`',
      'Call `ord->~Order();` explicitly, and do NOT call delete.',
      'Call `free(ord);`',
      'Do nothing; C++ automatically calls the destructor when the buffer goes out of scope.',
    ],
    correctIndex: 1,
    hint: 'Never call `delete` on memory you did not allocate with normal `new`. Calling `delete` tries to return custom memory to the OS heap and crashes!',
    explanation:
      'Exact! `delete ord;` calls the destructor AND tries to return the memory to the OS heap manager (which never allocated it!), triggering a catastrophic crash. With custom memory allocators, you manually invoke `ord->~Order();` to run the destructor without touching the underlying memory!',
    xpReward: 160,
  };

  return (
    <DualPaneLayout>
      <article className="lesson-article">
        <header className="article-header" id="sec-stage1-head">
          <div className="text-xs uppercase font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
            STAGE 1 — THE C++ MENTAL MODEL
          </div>
          <h1 className="article-title">The C++ Machine Model, Pointers &amp; The Stack</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Estimated time: 15 mins • Key Concept: Types as byte sizes, Pointer arithmetic, Placement new
          </p>
        </header>

        <div className="article-body">
          <p className="prose">
            Now that you understand physical RAM as a row of numbered lockers, let&apos;s see how C++ maps your human-written code directly onto that hardware.
          </p>

          {/* Section 1.1 */}
          <section id="sec-stage1-types" className="lesson-section">
            <h2>1.1 — Data Types are Simply Byte Spans</h2>
            <p className="prose">
              In C++, a &quot;type&quot; tells the compiler two things:
            </p>
            <ol className="list-decimal list-inside prose pl-4 space-y-1.5">
              <li><strong>Size:</strong> Exactly how many contiguous byte lockers to reserve.</li>
              <li><strong>Interpretation:</strong> How to convert those raw bits into human meaning (integer, floating-point, character).</li>
            </ol>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-blue-600 font-bold block">char</span>
                <span className="text-slate-500 text-[11px]">1 Byte (8 bits)</span>
                <span className="text-slate-400 text-[10px] block mt-1">e.g. &apos;A&apos; = 65</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-blue-600 font-bold block">int</span>
                <span className="text-slate-500 text-[11px]">4 Bytes (32 bits)</span>
                <span className="text-slate-400 text-[10px] block mt-1">Up to ~2.1 billion</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-blue-600 font-bold block">double</span>
                <span className="text-slate-500 text-[11px]">8 Bytes (64 bits)</span>
                <span className="text-slate-400 text-[10px] block mt-1">Floating-point decimals</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-blue-600 font-bold block">Pointer (T*)</span>
                <span className="text-slate-500 text-[11px]">8 Bytes (64-bit OS)</span>
                <span className="text-slate-400 text-[10px] block mt-1">Holds any address</span>
              </div>
            </div>
          </section>

          {/* Section 1.2 */}
          <section id="sec-stage1-pointers" className="lesson-section">
            <h2>1.2 — Pointers Demystified: The Address Envelope</h2>
            <p className="prose">
              Pointers intimidate many beginners, but their hardware reality is delightfully simple:
            </p>

            <AnalogyCard title="The Mailing Envelope Analogy">
              Imagine you have a piece of paper with someone&apos;s house address written on it: <code className="code-pill">0x00</code>.
              <br /><br />
              • The <strong>Address-of Operator (<code className="code-pill">&amp;</code>)</strong> means: <em>&quot;Write down this variable&apos;s house address on the envelope.&quot;</em>
              <br /><br />
              • The <strong>Dereference Operator (<code className="code-pill">*</code>)</strong> means: <em>&quot;Go to the house address written on that envelope, open the door, and read or change what is inside!&quot;</em>
            </AnalogyCard>

            <p className="prose mt-4">
              Step through the interactive code snippet below. Watch how the <strong>Universal RAM Inspector</strong> on the right updates with the exact byte values and pointer offsets in real time!
            </p>

            <div className="my-5">
              <CppCodeStepper
                title="C++ Pointers in Action"
                filename="pointers_stepper.cpp"
                steps={stepperSteps}
                onReset={resetArena}
              />
            </div>

            <MicroChallengeEngine challenge={challenge1} />
          </section>

          {/* Section 1.3 */}
          <section id="sec-stage1-stack" className="lesson-section">
            <h2>1.3 — The Stack: Instant Speed with Strict Limits</h2>
            <p className="prose">
              Whenever you call a function in C++, your local variables are stored on <strong>The Stack</strong>.
            </p>
            <p className="prose">
              The stack is incredibly fast because allocating space is just a single CPU instruction: subtracting the stack pointer register <code className="code-pill">RSP</code> (e.g. <code className="code-pill">sub rsp, 32</code>).
            </p>
            <p className="prose">
              However, the stack has two fatal limitations:
            </p>
            <ul className="list-disc list-inside prose pl-4 space-y-1.5">
              <li><strong>Fixed Size:</strong> The stack is tiny (usually only 1MB to 8MB). If you try to allocate a large array, your program crashes immediately with a <em>Stack Overflow</em>.</li>
              <li><strong>Strict Lifetime:</strong> As soon as the function returns, its stack frame is instantly wiped clean. You cannot keep stack objects alive across long-running operations!</li>
            </ul>

            <MicroChallengeEngine challenge={challenge2} />
          </section>

          {/* Section 1.4 - The Bridge to Low-Level C++: Pointer Arithmetic & std::byte */}
          <section id="sec-stage1-ptr-arithmetic" className="lesson-section">
            <h2>1.4 — Pointer Arithmetic &amp; Why Allocators Use std::byte</h2>
            <p className="prose">
              In basic C++, when you write <code className="code-pill">ptr + 1</code>, the compiler does <strong>not</strong> add 1 byte! It scales by the size of the underlying type:
            </p>

            <div className="my-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 font-mono text-xs space-y-2">
              <div className="text-slate-500 font-semibold">// Pointer arithmetic scaling formula:</div>
              <div className="text-blue-600 dark:text-blue-400 font-bold">
                new_address = base_address + (N * sizeof(*ptr));
              </div>
              <div className="pt-2 text-slate-700 dark:text-slate-300">
                • <code className="code-pill">int* p = 0x1000; p + 1;</code> &rarr; advances by 4 bytes to <code className="code-pill font-bold">0x1004</code>
                <br />
                • <code className="code-pill">double* p = 0x1000; p + 1;</code> &rarr; advances by 8 bytes to <code className="code-pill font-bold">0x1008</code>
                <br />
                • <code className="code-pill">std::byte* p = 0x1000; p + 1;</code> &rarr; advances by exactly 1 byte to <code className="code-pill font-bold">0x1001</code>
              </div>
            </div>

            <p className="prose">
              This explains why <strong>every modern C++ custom allocator stores raw memory as <code className="code-pill">std::byte*</code></strong>:
            </p>
            <ul className="list-disc list-inside prose pl-4 space-y-1.5">
              <li><strong>Exact 1-byte increments:</strong> When an allocator reserves 24 bytes, <code className="code-pill">buffer + 24</code> moves forward by exactly 24 bytes.</li>
              <li><strong>Zero aliasing violations:</strong> Unlike <code className="code-pill">char</code> or <code className="code-pill">uint8_t</code>, <code className="code-pill">std::byte</code> is not treated as a numeric character; the compiler allows aliasing raw hardware memory through it without undefined behavior.</li>
              <li><strong>Pointer to Number Casts:</strong> We use <code className="code-pill">reinterpret_cast&lt;uintptr_t&gt;(ptr)</code> to convert pointers to 64-bit unsigned integers so we can perform bitwise alignment arithmetic, and <code className="code-pill">reinterpret_cast&lt;void*&gt;(addr)</code> to return it to the caller.</li>
            </ul>

            <MicroChallengeEngine challenge={challenge3} />
          </section>

          {/* Section 1.5 - The Lifecycle Bridge: Placement new & Explicit Destructors */}
          <section id="sec-stage1-placement-new" className="lesson-section">
            <h2>1.5 — The Low-Level Object Lifecycle: Placement new &amp; Explicit Destructors</h2>
            <p className="prose">
              In beginner C++, developers believe <code className="code-pill">new</code> and <code className="code-pill">delete</code> are indivisible single operations. In low-level systems C++, they are actually <strong>two separate phases</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 space-y-2 text-xs">
                <span className="font-mono font-bold text-red-700 dark:text-red-400 block uppercase tracking-wide">
                  Standard Beginner C++ (OS Heap)
                </span>
                <code className="block p-2 rounded bg-white dark:bg-slate-900 font-mono text-slate-800 dark:text-slate-200 border border-red-100 dark:border-red-900">
                  Order* ord = new Order(101);
                </code>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Calls OS <code className="code-pill">malloc()</code> &rarr; acquires mutex lock, enters kernel, searches free bins.
                  <br />
                  2. Calls constructor <code className="code-pill">Order::Order(101)</code>.
                  <br />
                  3. <code className="code-pill">delete ord;</code> calls destructor and calls OS <code className="code-pill">free()</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 text-xs">
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wide">
                  Low-Level Systems C++ (Custom Allocators)
                </span>
                <code className="block p-2 rounded bg-white dark:bg-slate-900 font-mono text-slate-800 dark:text-slate-200 border border-emerald-100 dark:border-emerald-900">
                  void* raw = arena.allocate(sizeof(Order));<br />
                  Order* ord = new (raw) Order(101);
                </code>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Allocator returns raw bytes in <strong>1 clock cycle</strong> (zero syscalls, zero mutexes).
                  <br />
                  2. <strong>Placement new</strong> initializes the object directly in those bytes.
                  <br />
                  3. Clean up with <strong>explicit destructor</strong>: <code className="code-pill font-bold">ord-&gt;~Order();</code>
                  <br />
                  4. The allocator wipes or recycles memory in bulk!
                </p>
              </div>
            </div>

            <AnalogyCard title="The Rental Apartment vs The Blank Canvas">
              Normal <code className="code-pill">new</code> is like signing a lease with a landlord (OS kernel) every single time you need to sit down for 5 minutes.
              <br /><br />
              <strong>Placement <code className="code-pill">new</code></strong> is having your own private warehouse (pre-allocated arena). You place your furniture exactly where you want, use it, dismantle it with <code className="code-pill">~Order()</code>, and the warehouse remains 100% yours!
            </AnalogyCard>

            <MicroChallengeEngine challenge={challenge4} />

            <div className="mt-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onPrevStage}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                ◀ Back to Stage 0
              </button>
              <button
                onClick={onNextStage}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Proceed to Stage 2: The Dynamic Heap Problem ▶
              </button>
            </div>
          </section>
        </div>
      </article>
    </DualPaneLayout>
  );
};
