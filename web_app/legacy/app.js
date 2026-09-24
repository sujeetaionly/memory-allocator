// MemCraft LearnCPP Masterclass Engine — Dynamic Router & Interactive Simulators

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Theme Switcher Controller (Light / Dark)
    // ==========================================
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const htmlElem = document.documentElement;

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            const currentTheme = htmlElem.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            htmlElem.setAttribute('data-theme', newTheme);
            btnThemeToggle.querySelector('.theme-icon').textContent = newTheme === 'light' ? '🌙' : '☀️';

            localStorage.setItem('lcpp-theme', newTheme);
        });

        // Load saved preference
        const savedTheme = localStorage.getItem('lcpp-theme');
        if (savedTheme) {
            htmlElem.setAttribute('data-theme', savedTheme);
            btnThemeToggle.querySelector('.theme-icon').textContent = savedTheme === 'light' ? '🌙' : '☀️';
        }
    }

    // ==========================================
    // 2. Dynamic NAVIGATE Dropdown Updater for Each Phase
    // ==========================================
    const navDropdownMenu = document.getElementById('dropdown-navigate-items');

    function updateNavigateDropdown(activeArticleId) {
        if (!navDropdownMenu) return;

        const activeArticle = document.getElementById(activeArticleId);
        if (!activeArticle) return;

        // Query all headings/sections inside the active article
        const sections = activeArticle.querySelectorAll('header.article-header, section.lesson-section');
        navDropdownMenu.innerHTML = '';

        sections.forEach(sec => {
            const id = sec.id;
            const titleElem = sec.querySelector('h1, h2');
            if (titleElem && id) {
                const item = document.createElement('a');
                item.className = 'dropdown-item';
                item.href = `#${id}`;
                item.textContent = titleElem.textContent.trim();
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.getElementById(id);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
                navDropdownMenu.appendChild(item);
            }
        });
    }

    // ==========================================
    // 3. Phase Navigation Router (Lesson Index Dropdown)
    // ==========================================
    const phaseLinks = document.querySelectorAll('.phase-link');
    const lessonArticles = document.querySelectorAll('.lesson-article');

    function switchPhase(targetId) {
        const targetArticle = document.getElementById(targetId);

        if (targetArticle) {
            phaseLinks.forEach(l => {
                if (l.getAttribute('href') === `#${targetId}`) {
                    l.classList.add('active');
                } else {
                    l.classList.remove('active');
                }
            });
            lessonArticles.forEach(a => a.style.display = 'none');

            targetArticle.style.display = 'block';
            updateNavigateDropdown(targetId);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    phaseLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            switchPhase(targetId);
        });
    });

    // Initialize NAVIGATE dropdown for default active phase (Phase 1)
    updateNavigateDropdown('phase1');

    // ==========================================
    // 4. Inline Accordion Code Line Toggles
    // ==========================================
    const codeRows = document.querySelectorAll('.code-row');

    codeRows.forEach(row => {
        const line = row.querySelector('.code-line');
        if (line) {
            line.addEventListener('click', () => {
                row.classList.toggle('open');
            });
        }
    });

    // ==========================================
    // 5. Placement new RAM Playground
    // ==========================================
    const ramGrid = document.getElementById('inline-ram-grid');
    const offsetText = document.getElementById('viz-offset-text');
    const stateText = document.getElementById('viz-state-text');
    const btnAlloc = document.getElementById('btn-demo-alloc');
    const btnReset = document.getElementById('btn-demo-reset');

    const TOTAL_BYTES = 64;
    let offset = 0;
    let allocatedRanges = [];

    function initRamGrid() {
        if (!ramGrid) return;
        ramGrid.innerHTML = '';
        for (let i = 0; i < TOTAL_BYTES; i++) {
            const cell = document.createElement('div');
            cell.className = 'ram-cell';
            cell.textContent = i.toString(16).padStart(2, '0').toUpperCase();
            ramGrid.appendChild(cell);
        }
    }

    function updateRamUI() {
        if (!ramGrid) return;
        const cells = ramGrid.children;
        for (let i = 0; i < TOTAL_BYTES; i++) {
            cells[i].className = 'ram-cell';
        }

        allocatedRanges.forEach(r => {
            for (let i = r.start; i < r.end; i++) {
                if (i < TOTAL_BYTES) {
                    cells[i].className = `ram-cell ${r.type}`;
                }
            }
        });

        if (offsetText) offsetText.textContent = `0x${offset.toString(16).padStart(4, '0').toUpperCase()} (${offset} B)`;

        if (stateText) {
            if (offset === 0) {
                stateText.textContent = 'Empty Buffer';
                stateText.style.color = 'var(--lcpp-text-meta)';
            } else {
                const count = allocatedRanges.filter(r => r.type === 'allocated').length;
                stateText.textContent = `${count} Node Object(s) Constructed`;
                stateText.style.color = 'var(--tok-keyword)';
            }
        }
    }

    if (btnAlloc) {
        btnAlloc.addEventListener('click', () => {
            const nodeSize = 24;
            const align = 8;

            const alignedAddr = (offset + align - 1) & ~(align - 1);
            const padding = alignedAddr - offset;
            const newEnd = alignedAddr + nodeSize;

            if (newEnd > TOTAL_BYTES) {
                alert('Arena Buffer Capacity Reached (64 Bytes)! Click "Reset Offset" to clear memory.');
                return;
            }

            if (padding > 0) {
                allocatedRanges.push({ start: offset, end: alignedAddr, type: 'padding' });
            }

            allocatedRanges.push({ start: alignedAddr, end: newEnd, type: 'allocated' });
            offset = newEnd;
            updateRamUI();
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            offset = 0;
            allocatedRanges = [];
            updateRamUI();
        });
    }

    initRamGrid();

    // ==========================================
    // 6. Bitwise Alignment Calculator
    // ==========================================
    const inputAddr = document.getElementById('input-addr');
    const inputAlign = document.getElementById('input-align');

    const stepAdd = document.getElementById('step-add-val');
    const stepMask = document.getElementById('step-mask-val');
    const stepOutput = document.getElementById('step-output-val');

    function calculateAlignment() {
        if (!inputAddr || !inputAlign) return;
        const addr = parseInt(inputAddr.value) || 0;
        const align = parseInt(inputAlign.value) || 8;

        const step1 = addr + align - 1;
        const mask = ~(align - 1);
        const aligned = step1 & mask;

        if (stepAdd) stepAdd.textContent = `${addr} + (${align} - 1) = ${step1}`;
        if (stepMask) stepMask.textContent = `~(${align - 1}) Mask => ` + (mask & 0xFF).toString(2).padStart(8, '0').replace(/(.{4})/g, '$1 ').trim();
        if (stepOutput) stepOutput.textContent = `${aligned} (Hex: 0x${aligned.toString(16).toUpperCase()})`;
    }

    if (inputAddr) inputAddr.addEventListener('input', calculateAlignment);
    if (inputAlign) inputAlign.addEventListener('change', calculateAlignment);
    calculateAlignment();
});
