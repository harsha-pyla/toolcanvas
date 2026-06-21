/* =========================================
   ToolCanvas — Online Notepad Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Hooks
    const textarea = document.getElementById('notepad-textarea');
    
    // Menubar triggers & dropdowns
    const menuTriggers = document.querySelectorAll('.btn-menu-trigger');
    const dropdowns = document.querySelectorAll('.menu-dropdown-list');
    
    // File Menu actions
    const btnNewDoc = document.getElementById('menu-new-doc');
    const btnSaveDoc = document.getElementById('menu-save-doc');
    const btnDownloadTxt = document.getElementById('menu-download-txt');
    const btnDownloadHtml = document.getElementById('menu-download-html');
    const btnPrintDoc = document.getElementById('menu-print-doc');
    
    // Edit Menu actions
    const btnUndo = document.getElementById('menu-undo');
    const btnRedo = document.getElementById('menu-redo');
    const btnCut = document.getElementById('menu-cut');
    const btnCopy = document.getElementById('menu-copy');
    const btnPaste = document.getElementById('menu-paste');
    const btnFindReplace = document.getElementById('menu-find-btn');
    
    // Insert Menu actions
    const btnInsertChar = document.getElementById('menu-insert-char');
    const btnInsertDate = document.getElementById('menu-insert-date');
    
    // Help Menu actions
    const btnShowShortcuts = document.getElementById('menu-show-shortcuts');
    const btnShowAbout = document.getElementById('menu-show-about');

    // Quick Toolbar buttons & selectors
    const tbNew = document.getElementById('tb-new');
    const tbSave = document.getElementById('tb-save');
    const tbPrint = document.getElementById('tb-print');
    const tbUndo = document.getElementById('tb-undo');
    const tbRedo = document.getElementById('tb-redo');
    const tbFind = document.getElementById('tb-find');
    const tbChar = document.getElementById('tb-char');
    const tbDate = document.getElementById('tb-date');
    
    const selectFont = document.getElementById('tb-select-font');
    const selectSize = document.getElementById('tb-select-size');
    const selectPaper = document.getElementById('tb-select-paper');
    
    // Submenu click formats
    const submenuFontFamily = document.getElementById('submenu-font-family');
    const submenuFontSize = document.getElementById('submenu-font-size');
    const submenuPaperStyle = document.getElementById('submenu-paper-style');

    // Headers Elements
    const saveStatus = document.getElementById('save-status');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const notepadAppCard = document.getElementById('notepad-app-card');
    const overlay = document.getElementById('notepad-editor-overlay');

    // File Open & Spellcheck Hooks
    const btnOpenDoc = document.getElementById('menu-open-doc');
    const tbOpen = document.getElementById('tb-open');
    const fileInputUploader = document.getElementById('file-input-uploader');
    const spellcheckMenu = document.getElementById('spellcheck-menu');
    const scmSuggestions = document.getElementById('scm-suggestions');
    const scmAddDict = document.getElementById('scm-add-dict');
    const scmIgnore = document.getElementById('scm-ignore');

    // Find & Replace Overlay Elements
    const findReplacePanel = document.getElementById('find-replace-panel');
    const findInput = document.getElementById('fr-find-input');
    const replaceInput = document.getElementById('fr-replace-input');
    const btnFindNext = document.getElementById('fr-find-next');
    const btnReplace = document.getElementById('fr-replace');
    const btnReplaceAll = document.getElementById('fr-replace-all');
    const btnCloseFR = document.getElementById('fr-close-panel');

    // Modals
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const closeShortcutsModal = document.getElementById('close-shortcuts-modal');
    const specialCharModal = document.getElementById('special-char-modal');
    const closeCharModal = document.getElementById('close-char-modal');
    const aboutModal = document.getElementById('about-modal');
    const closeAboutModal = document.getElementById('close-about-modal');
    
    // Counters
    const statusWordCount = document.getElementById('status-word-count');
    const statusCharCount = document.getElementById('status-char-count');
    const statusLineCount = document.getElementById('status-line-count');

    // Notepad States (Autosaved single note)
    let undoStack = [];
    let redoStack = [];
    const maxHistory = 100;
    let lastSavedState = "";

    // -------------------------------------------------------------
    // Menu Dropdown Logic (Google Docs-Style Drag Navigation)
    // -------------------------------------------------------------
    menuTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = 'dropdown-' + trigger.id.replace('menu-', '');
            const targetDropdown = document.getElementById(targetId);
            const isShown = targetDropdown.classList.contains('show');
            closeAllDropdowns();

            if (!isShown) {
                targetDropdown.classList.add('show');
                trigger.classList.add('active');
            }
        });
        
        trigger.addEventListener('mouseenter', () => {
            const anyOpen = Array.from(dropdowns).some(d => d.classList.contains('show'));
            if (anyOpen) {
                const targetId = 'dropdown-' + trigger.id.replace('menu-', '');
                const targetDropdown = document.getElementById(targetId);
                closeAllDropdowns();
                targetDropdown.classList.add('show');
                trigger.classList.add('active');
            }
        });
    });

    function closeAllDropdowns() {
        dropdowns.forEach(d => d.classList.remove('show'));
        menuTriggers.forEach(t => t.classList.remove('active'));
    }

    document.addEventListener('click', () => {
        closeAllDropdowns();
    });

    // -------------------------------------------------------------
    // Formatting & Paper-line updates (Dynamic Alignment Logic)
    // -------------------------------------------------------------
    function updatePaperStyle() {
        const paper = textarea.dataset.paper || 'ruled-ivory';
        const fontSize = parseInt(textarea.dataset.fontSize || '18', 10);
        const fontFamily = textarea.dataset.fontFamily || 'sans';
        
        let cssFontFamily = "'Inter', sans-serif";
        if (fontFamily === 'serif') cssFontFamily = "Georgia, serif";
        else if (fontFamily === 'mono') cssFontFamily = "'JetBrains Mono', monospace";
        else if (fontFamily === 'handwriting') cssFontFamily = "'Caveat', cursive";
        
        textarea.style.fontFamily = cssFontFamily;
        textarea.style.fontSize = fontSize + 'px';
        
        // Compute line-height based on font selection
        const ratio = fontFamily === 'handwriting' ? 1.75 : 1.6;
        const lineHeight = Math.round(fontSize * ratio);
        textarea.style.lineHeight = lineHeight + 'px';

        // Calculate dynamic padding sizes based on mobile viewport width
        const isSmallMobile = window.innerWidth <= 480;
        const paddingTop = isSmallMobile ? 24 : 40;
        const paddingRight = isSmallMobile ? 16 : 24;
        const paddingBottom = isSmallMobile ? 24 : 40;
        
        if (overlay) {
            overlay.style.fontFamily = cssFontFamily;
            overlay.style.fontSize = fontSize + 'px';
            overlay.style.lineHeight = lineHeight + 'px';
            overlay.style.paddingTop = paddingTop + 'px';
            overlay.style.paddingRight = paddingRight + 'px';
            overlay.style.paddingBottom = paddingBottom + 'px';
        }

        // Reset defaults
        textarea.style.backgroundImage = 'none';
        textarea.style.backgroundSize = 'auto';
        textarea.style.paddingTop = paddingTop + 'px';
        textarea.style.paddingRight = paddingRight + 'px';
        textarea.style.paddingBottom = paddingBottom + 'px';
        textarea.style.paddingLeft = paddingRight + 'px'; // matches right padding
        textarea.style.backgroundColor = 'transparent';
        if (overlay) overlay.style.paddingLeft = paddingRight + 'px';
        
        let caretColor = '#1e293b';
        let overlayColor = '#1e293b';

        if (paper === 'ruled-ivory' || paper === 'ruled-yellow' || paper === 'ruled-white') {
            let bgColor = '#fcfbf7'; // ivory
            let lineColor = 'rgba(37, 99, 235, 0.25)'; // standard ruled blue
            let marginColor = 'rgba(239, 68, 68, 0.45)'; // red left margin
            
            if (paper === 'ruled-yellow') {
                bgColor = '#fdf6e2'; // legal pad yellow
                lineColor = 'rgba(37, 99, 235, 0.22)';
            } else if (paper === 'ruled-white') {
                bgColor = '#ffffff';
            }
            
            textarea.style.backgroundColor = bgColor;

            // Reduce left margin line on small screens to save valuable viewport space
            const isSmallScreen = window.innerWidth <= 480;
            const marginLinePos = isSmallScreen ? 49 : 79;
            const paddingLeftVal = isSmallScreen ? 64 : 96;

            // Draw margin vertical line + horizontal ruled lines
            textarea.style.backgroundImage = `
                linear-gradient(90deg, transparent ${marginLinePos}px, ${marginColor} ${marginLinePos}px, ${marginColor} ${marginLinePos + 2}px, transparent ${marginLinePos + 2}px),
                linear-gradient(transparent, transparent ${lineHeight - 1}px, ${lineColor} ${lineHeight - 1}px)
            `;
            textarea.style.backgroundSize = `100% 100%, 100% ${lineHeight}px`;
            textarea.style.backgroundPosition = `0 0, 0 ${paddingTop}px`; // align ruled lines past dynamic padding-top
            textarea.style.paddingLeft = paddingLeftVal + 'px';
            if (overlay) overlay.style.paddingLeft = paddingLeftVal + 'px';
            
        } else if (paper === 'graph') {
            textarea.style.backgroundColor = '#ffffff';
            const gridColor = 'rgba(37, 99, 235, 0.15)';
            textarea.style.backgroundImage = `
                linear-gradient(90deg, ${gridColor} 1px, transparent 1px),
                linear-gradient(${gridColor} 1px, transparent 1px)
            `;
            textarea.style.backgroundSize = `${lineHeight}px ${lineHeight}px`;
            textarea.style.backgroundPosition = `0 ${paddingTop}px, 0 ${paddingTop}px`;
            textarea.style.paddingLeft = paddingRight + 'px';
            if (overlay) overlay.style.paddingLeft = paddingRight + 'px';
            
        } else if (paper === 'plain') {
            textarea.style.backgroundColor = '#ffffff';
            
        } else if (paper === 'dark') {
            textarea.style.backgroundColor = '#1e293b';
            const lineColor = 'rgba(255, 255, 255, 0.08)';
            textarea.style.backgroundImage = `
                linear-gradient(transparent ${lineHeight - 1}px, ${lineColor} ${lineHeight - 1}px)
            `;
            textarea.style.backgroundSize = `100% ${lineHeight}px`;
            textarea.style.backgroundPosition = `0 ${paddingTop}px`;
            textarea.style.paddingLeft = paddingRight + 'px';
            if (overlay) overlay.style.paddingLeft = paddingRight + 'px';
            caretColor = '#f8fafc';
            overlayColor = '#f8fafc';
        }

        // Set the text color CSS variable for high accessibility contrast in mobile view
        const textColor = paper === 'dark' ? '#f8fafc' : '#1e293b';
        textarea.style.setProperty('--notepad-text-color', textColor);

        textarea.style.caretColor = caretColor;
        if (overlay) overlay.style.color = overlayColor;
    }

    function syncFormatUI() {
        const fontFamily = textarea.dataset.fontFamily || 'sans';
        const fontSize = textarea.dataset.fontSize || '18';
        const paper = textarea.dataset.paper || 'ruled-ivory';
        
        // Sync toolbar selects
        selectFont.value = fontFamily;
        selectSize.value = fontSize;
        selectPaper.value = paper;
        
        // Sync menu item checkmarks
        document.querySelectorAll('#submenu-font-family .menu-item-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === fontFamily);
        });
        document.querySelectorAll('#submenu-font-size .menu-item-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === fontSize);
        });
        document.querySelectorAll('#submenu-paper-style .menu-item-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === paper);
        });
    }

    function setFontFamily(val) {
        textarea.dataset.fontFamily = val;
        updatePaperStyle();
        syncFormatUI();
        saveToLocalStorage();
    }

    function setFontSize(val) {
        textarea.dataset.fontSize = val;
        updatePaperStyle();
        syncFormatUI();
        saveToLocalStorage();
    }

    function setPaperStyle(val) {
        textarea.dataset.paper = val;
        updatePaperStyle();
        syncFormatUI();
        saveToLocalStorage();
    }

    // Format listeners
    selectFont.addEventListener('change', (e) => setFontFamily(e.target.value));
    selectSize.addEventListener('change', (e) => setFontSize(e.target.value));
    selectPaper.addEventListener('change', (e) => setPaperStyle(e.target.value));

    submenuFontFamily.querySelectorAll('.menu-item-btn').forEach(btn => {
        btn.addEventListener('click', () => setFontFamily(btn.dataset.value));
    });
    submenuFontSize.querySelectorAll('.menu-item-btn').forEach(btn => {
        btn.addEventListener('click', () => setFontSize(btn.dataset.value));
    });
    submenuPaperStyle.querySelectorAll('.menu-item-btn').forEach(btn => {
        btn.addEventListener('click', () => setPaperStyle(btn.dataset.value));
    });

    // -------------------------------------------------------------
    // Undo & Redo History management
    // -------------------------------------------------------------
    function saveState() {
        const val = textarea.value;
        if (val === lastSavedState) return;

        if (undoStack.length >= maxHistory) {
            undoStack.shift();
        }
        undoStack.push({
            value: val,
            selectionStart: textarea.selectionStart,
            selectionEnd: textarea.selectionEnd
        });
        redoStack = []; // clear redo
        lastSavedState = val;
        updateEditMenuStates();
    }

    function undo() {
        if (undoStack.length === 0) return;
        
        redoStack.push({
            value: textarea.value,
            selectionStart: textarea.selectionStart,
            selectionEnd: textarea.selectionEnd
        });
        
        const state = undoStack.pop();
        textarea.value = state.value;
        textarea.setSelectionRange(state.selectionStart, state.selectionEnd);
        lastSavedState = textarea.value;
        
        updateEditMenuStates();
        updateCounts();
        saveToLocalStorage();
    }

    function redo() {
        if (redoStack.length === 0) return;
        
        undoStack.push({
            value: textarea.value,
            selectionStart: textarea.selectionStart,
            selectionEnd: textarea.selectionEnd
        });
        
        const state = redoStack.pop();
        textarea.value = state.value;
        textarea.setSelectionRange(state.selectionStart, state.selectionEnd);
        lastSavedState = textarea.value;
        
        updateEditMenuStates();
        updateCounts();
        saveToLocalStorage();
    }

    function updateEditMenuStates() {
        const canUndo = undoStack.length > 0;
        const canRedo = redoStack.length > 0;
        
        btnUndo.disabled = !canUndo;
        tbUndo.disabled = !canUndo;
        
        btnRedo.disabled = !canRedo;
        tbRedo.disabled = !canRedo;
    }

    // -------------------------------------------------------------
    // Text stats calculation
    // -------------------------------------------------------------
    function updateCounts() {
        const text = textarea.value;
        const charCount = text.length;
        
        const words = text.trim().split(/\s+/);
        const wordCount = text.trim() === "" ? 0 : words.length;
        
        const lineCount = text.split('\n').length;
        
        statusWordCount.textContent = wordCount;
        statusCharCount.textContent = charCount;
        statusLineCount.textContent = lineCount;
    }

    // -------------------------------------------------------------
    // Documents Session Management (Autosave every Keystroke)
    // -------------------------------------------------------------
    function initNotepadSession() {
        // Load settings from local storage
        const savedText = localStorage.getItem('toolcanvas_notepad_text') || '';
        const savedFont = localStorage.getItem('toolcanvas_notepad_font_family') || 'sans';
        const savedSize = localStorage.getItem('toolcanvas_notepad_font_size') || '18';
        const savedPaper = localStorage.getItem('toolcanvas_notepad_paper_style') || 'ruled-ivory';

        // Populate inputs
        textarea.value = savedText;
        textarea.dataset.fontFamily = savedFont;
        textarea.dataset.fontSize = savedSize;
        textarea.dataset.paper = savedPaper;
        
        // Sync layout
        updatePaperStyle();
        syncFormatUI();
        updateCounts();
        updateOverlay();
        
        // Clear history stack
        undoStack = [];
        redoStack = [];
        lastSavedState = textarea.value;
        updateEditMenuStates();
        
        showSaveIndicator('saved');
    }

    function saveToLocalStorage() {
        localStorage.setItem('toolcanvas_notepad_text', textarea.value);
        localStorage.setItem('toolcanvas_notepad_font_family', textarea.dataset.fontFamily || 'sans');
        localStorage.setItem('toolcanvas_notepad_font_size', textarea.dataset.fontSize || '18');
        localStorage.setItem('toolcanvas_notepad_paper_style', textarea.dataset.paper || 'ruled-ivory');
        showSaveIndicator('saved');
        updateOverlay();
    }

    function createNewDocWorkflow() {
        if (textarea.value.trim().length > 0) {
            if (!confirm("Clear current document and start a new notes sheet?")) {
                return;
            }
        }
        
        // Reset states
        textarea.value = '';
        textarea.dataset.fontFamily = 'sans';
        textarea.dataset.fontSize = '18';
        textarea.dataset.paper = 'ruled-ivory';
        
        updatePaperStyle();
        syncFormatUI();
        updateCounts();
        
        undoStack = [];
        redoStack = [];
        lastSavedState = '';
        updateEditMenuStates();
        
        saveToLocalStorage();
        showToast("New notepad sheet created!");
    }

    textarea.addEventListener('input', () => {
        saveState();
        updateCounts();
        saveToLocalStorage(); // Immediate auto-save on every keystroke
    });

    // -------------------------------------------------------------
    // Save status indicator
    // -------------------------------------------------------------
    function showSaveIndicator(status) {
        saveStatus.className = 'save-status-indicator';
        if (status === 'saved') {
            saveStatus.textContent = 'Saved';
        } else if (status === 'saving') {
            saveStatus.classList.add('saving');
            saveStatus.textContent = 'Saving...';
        } else if (status === 'unsaved') {
            saveStatus.classList.add('unsaved');
            saveStatus.textContent = 'Unsaved';
        }
    }

    // -------------------------------------------------------------
    // File Actions (Print, Download/Save Dialog)
    // -------------------------------------------------------------
    function printNotes() {
        window.print();
    }

    function downloadText() {
        const text = textarea.value;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const firstLine = text.split('\n')[0].trim();
        const filename = (firstLine ? firstLine.substring(0, 15).replace(/[^a-z0-9]/gi, '_') : 'notes_document') + '.txt';
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function downloadHTML() {
        const text = textarea.value;
        const fontFamily = textarea.dataset.fontFamily || 'sans';
        const fontSize = textarea.dataset.fontSize || '18';
        const paper = textarea.dataset.paper || 'ruled-ivory';
        
        let fontCSS = "font-family: sans-serif;";
        if (fontFamily === 'serif') fontCSS = "font-family: Georgia, serif;";
        else if (fontFamily === 'mono') fontCSS = "font-family: 'Courier New', monospace;";
        else if (fontFamily === 'handwriting') fontCSS = "font-family: 'Caveat', cursive;";
        
        let paperBg = "#fcfbf7";
        if (paper === 'ruled-yellow') paperBg = "#fdf6e2";
        else if (paper === 'plain' || paper === 'ruled-white' || paper === 'graph') paperBg = "#ffffff";
        else if (paper === 'dark') paperBg = "#1e293b";
        
        const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ToolCanvas Notepad Export</title>
    <style>
        body {
            background-color: ${paperBg};
            color: ${paper === 'dark' ? '#f1f5f9' : '#1e293b'};
            margin: 0;
            padding: 40px;
            ${fontCSS}
            font-size: ${fontSize}px;
            line-height: 1.6;
        }
        .content {
            max-width: 800px;
            margin: 0 auto;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="content">${escapedText}</div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const firstLine = text.split('\n')[0].trim();
        const filename = (firstLine ? firstLine.substring(0, 15).replace(/[^a-z0-9]/gi, '_') : 'notes_document') + '.html';
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // -------------------------------------------------------------
    // Edit Actions (Cut, Copy, Paste, Find & Replace)
    // -------------------------------------------------------------
    function cutSelection() {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        if (!selectedText) {
            showToast("Select text to cut.");
            return;
        }
        
        navigator.clipboard.writeText(selectedText).then(() => {
            textarea.setRangeText('', start, end, 'end');
            saveState();
            updateCounts();
            saveToLocalStorage();
            showToast("Cut selection copied to clipboard.");
        }).catch(() => {
            showToast("Cut blocked by browser. Please use Ctrl+X.");
        });
    }

    function copySelection() {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        if (!selectedText) {
            showToast("Select text to copy.");
            return;
        }
        
        navigator.clipboard.writeText(selectedText).then(() => {
            showToast("Copied to clipboard.");
        }).catch(() => {
            showToast("Copy blocked by browser. Please use Ctrl+C.");
        });
    }

    function pasteClipboard() {
        navigator.clipboard.readText().then(text => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.setRangeText(text, start, end, 'end');
            saveState();
            updateCounts();
            saveToLocalStorage();
            showToast("Pasted from clipboard.");
        }).catch(() => {
            showToast("Paste blocked by browser. Please use Ctrl+V.");
        });
    }

    // Find & Replace Panel
    function toggleFindReplace(show) {
        findReplacePanel.classList.toggle('hidden', !show);
        if (show) {
            findInput.focus();
            findInput.select();
        }
    }

    function findNextWord() {
        const text = textarea.value;
        const query = findInput.value;
        if (!query) {
            showToast("Enter a query to find.");
            return;
        }

        const currentPos = textarea.selectionEnd;
        let index = text.toLowerCase().indexOf(query.toLowerCase(), currentPos);
        
        if (index === -1) {
            index = text.toLowerCase().indexOf(query.toLowerCase(), 0);
        }

        if (index !== -1) {
            textarea.focus();
            textarea.setSelectionRange(index, index + query.length);
            
            const textBefore = text.substring(0, index);
            const lineNum = textBefore.split('\n').length - 1;
            const style = window.getComputedStyle(textarea);
            const lineH = parseInt(style.lineHeight, 10);
            const targetScrollTop = (lineNum * lineH) - (textarea.clientHeight / 2);
            document.querySelector('.editor-scroll-container').scrollTop = Math.max(0, targetScrollTop);
        } else {
            showToast("Query not found.");
        }
    }

    function replaceWord() {
        const query = findInput.value;
        const replacement = replaceInput.value;
        if (!query) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selection = textarea.value.substring(start, end);

        if (selection.toLowerCase() === query.toLowerCase()) {
            textarea.setRangeText(replacement, start, end, 'select');
            saveState();
            updateCounts();
            saveToLocalStorage();
            findNextWord();
        } else {
            findNextWord();
        }
    }

    function replaceAllWords() {
        const query = findInput.value;
        const replacement = replaceInput.value;
        if (!query) return;

        const text = textarea.value;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        const matches = text.match(regex);

        if (matches && matches.length > 0) {
            textarea.value = text.replace(regex, replacement);
            saveState();
            updateCounts();
            saveToLocalStorage();
            showToast(`Replaced all ${matches.length} occurrences.`);
        } else {
            showToast("Matches not found.");
        }
    }

    btnFindReplace.addEventListener('click', () => toggleFindReplace(true));
    tbFind.addEventListener('click', () => toggleFindReplace(true));
    btnCloseFR.addEventListener('click', () => toggleFindReplace(false));
    btnFindNext.addEventListener('click', findNextWord);
    btnReplace.addEventListener('click', replaceWord);
    btnReplaceAll.addEventListener('click', replaceAllWords);

    findInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            findNextWord();
        }
    });

    // -------------------------------------------------------------
    // Date and Symbol insertions
    // -------------------------------------------------------------
    function insertDateString() {
        const dateStr = new Date().toLocaleString();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.setRangeText(dateStr, start, end, 'end');
        saveState();
        updateCounts();
        saveToLocalStorage();
    }

    function insertChar(char) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.setRangeText(char, start, end, 'end');
        saveState();
        updateCounts();
        saveToLocalStorage();
        specialCharModal.classList.add('hidden');
    }

    btnInsertDate.addEventListener('click', insertDateString);
    tbDate.addEventListener('click', insertDateString);

    // -------------------------------------------------------------
    // Special Characters Modal Grid Loader
    // -------------------------------------------------------------
    const specialChars = {
        currency: ["$", "€", "£", "¥", "¢", "¤", "₠", "₢", "₣", "₤", "₧", "₨", "₩", "₪", "₫", "₭", "₮", "₯", "₰", "₱", "₲", "₳", "₴", "₵", "₶", "₷", "₸", "₹", "₺"],
        math: ["±", "×", "÷", "=", "≠", "<", ">", "≤", "≥", "√", "∞", "ℵ", "∂", "∇", "∊", "∋", "∏", "∑", "−", "∕", "⁎", "∘", "∙", "∝", "∟", "∠", "∡", "∢", "∣", "∤", "∥", "∦", "∧", "∨", "∩", "∪", "∫", "∬", "∭", "∮", "∯", "∰", "∱", "∲", "∳"],
        arrows: ["←", "↑", "→", "↓", "↔", "↕", "↖", "↗", "↘", "↙", "↚", "↛", "↜", "↝", "↞", "↟", "↠", "↡", "↢", "↣", "↤", "↥", "↦", "↧", "↨", "↩", "↪", "↫", "↬", "↭", "↮", "↯", "↰", "↱", "↲", "↳", "↴", "↵"],
        typography: ["©", "®", "™", "§", "¶", "•", "‐", "‒", "–", "—", "―", "†", "‡", "․", "‥", "…"],
        fractions: ["¼", "½", "¾", "⅐", "⅑", "⅒", "⅓", "⅔", "⅕", "⅖", "⅗", "⅘", "⅙", "⅚", "⅛", "⅜", "⅝", "⅞"]
    };

    function initSpecialCharGrid() {
        for (const [tab, chars] of Object.entries(specialChars)) {
            const container = document.getElementById('char-grid-' + tab);
            if (!container) continue;
            
            container.innerHTML = '';
            chars.forEach(char => {
                const btn = document.createElement('button');
                btn.className = 'btn-char-cell';
                btn.textContent = char;
                btn.title = 'Insert ' + char;
                btn.addEventListener('click', () => insertChar(char));
                container.appendChild(btn);
            });
        }
    }

    const tabButtons = document.querySelectorAll('.char-tab-btn');
    const tabGrids = document.querySelectorAll('.char-grid-container');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabGrids.forEach(g => g.classList.remove('active'));
            btn.classList.add('active');
            
            const activeGrid = document.getElementById('char-grid-' + btn.dataset.tab);
            if (activeGrid) activeGrid.classList.add('active');
        });
    });

    btnInsertChar.addEventListener('click', () => {
        closeAllDialogs();
        specialCharModal.classList.remove('hidden');
    });
    tbChar.addEventListener('click', () => {
        closeAllDialogs();
        specialCharModal.classList.remove('hidden');
    });
    closeCharModal.addEventListener('click', () => specialCharModal.classList.add('hidden'));

    // -------------------------------------------------------------
    // Fullscreen Toggles
    // -------------------------------------------------------------
    function toggleFullscreen() {
        const isMaximized = notepadAppCard.classList.contains('maximized');
        
        if (!isMaximized) {
            notepadAppCard.classList.add('maximized');
            document.body.classList.add('notepad-maximized-active');
            fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/></svg>`;
            fullscreenBtn.title = "Restore Screen";
            showToast("Notepad Expanded (Full Screen)");
        } else {
            notepadAppCard.classList.remove('maximized');
            document.body.classList.remove('notepad-maximized-active');
            fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>`;
            fullscreenBtn.title = "Toggle Full Screen (Maximize)";
            showToast("Notepad Restored");
        }
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // -------------------------------------------------------------
    // Menu & Help Modals
    // -------------------------------------------------------------
    function closeAllDialogs() {
        shortcutsModal.classList.add('hidden');
        specialCharModal.classList.add('hidden');
        aboutModal.classList.add('hidden');
    }

    btnNewDoc.addEventListener('click', createNewDocWorkflow);
    tbNew.addEventListener('click', createNewDocWorkflow);

    btnSaveDoc.addEventListener('click', () => {
        saveToLocalStorage();
        downloadText(); // Show browser save file dialog
    });
    tbSave.addEventListener('click', () => {
        saveToLocalStorage();
        downloadText(); // Show browser save file dialog
    });

    btnDownloadTxt.addEventListener('click', downloadText);
    btnDownloadHtml.addEventListener('click', downloadHTML);
    
    btnPrintDoc.addEventListener('click', printNotes);
    tbPrint.addEventListener('click', printNotes);

    btnUndo.addEventListener('click', undo);
    tbUndo.addEventListener('click', undo);
    btnRedo.addEventListener('click', redo);
    tbRedo.addEventListener('click', redo);

    btnCut.addEventListener('click', cutSelection);
    btnCopy.addEventListener('click', copySelection);
    btnPaste.addEventListener('click', pasteClipboard);

    btnShowShortcuts.addEventListener('click', () => {
        closeAllDialogs();
        shortcutsModal.classList.remove('hidden');
    });
    closeShortcutsModal.addEventListener('click', () => shortcutsModal.classList.add('hidden'));

    btnShowAbout.addEventListener('click', () => {
        closeAllDialogs();
        aboutModal.classList.remove('hidden');
    });
    closeAboutModal.addEventListener('click', () => aboutModal.classList.add('hidden'));

    // Close on overlay clicks
    [shortcutsModal, specialCharModal, aboutModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // -------------------------------------------------------------
    // Keyboard Event Hotkeys
    // -------------------------------------------------------------
    window.addEventListener('keydown', (e) => {
        const isCtrl = e.ctrlKey || e.metaKey;
        
        if (isCtrl && e.key === 'n') {
            e.preventDefault();
            createNewDocWorkflow();
        }
        if (isCtrl && (e.key === 'o' || e.key === 'O')) {
            e.preventDefault();
            triggerFileOpen();
        }
        if (isCtrl && e.key === 's') {
            e.preventDefault();
            saveToLocalStorage();
            downloadText(); // Show browser save file dialog
        }
        if (isCtrl && e.key === 'p') {
            e.preventDefault();
            printNotes();
        }
        if (isCtrl && e.key === 'f') {
            e.preventDefault();
            toggleFindReplace(true);
        }
        if (isCtrl && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        if (isCtrl && e.key === 'y') {
            e.preventDefault();
            redo();
        }
        if (isCtrl && e.altKey && (e.key === 't' || e.key === 'T')) {
            e.preventDefault();
            insertDateString();
        }
        if (e.key === 'Escape') {
            closeAllDialogs();
            toggleFindReplace(false);
            closeAllDropdowns();
        }
    });

    // Before unload logic
    window.addEventListener('beforeunload', () => {
        saveToLocalStorage();
    });

    // -------------------------------------------------------------
    // Toast notifications utility
    // -------------------------------------------------------------
    function showToast(message, duration = 3000) {
        let existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // -------------------------------------------------------------
    // Focus preservation during formatting/menu actions
    // -------------------------------------------------------------
    const keepFocusSelectors = [
        '.quick-toolbar',
        '.btn-menu-trigger',
        '.menu-dropdown-list',
        '.menu-submenu-list',
        '.spellcheck-context-menu',
        '#fullscreen-btn'
    ];
    
    document.addEventListener('mousedown', (e) => {
        const target = e.target;
        const isFocusKeeper = keepFocusSelectors.some(sel => target.closest(sel));
        
        if (isFocusKeeper) {
            const tagName = target.tagName;
            if (tagName !== 'SELECT' && tagName !== 'INPUT' && tagName !== 'OPTION') {
                e.preventDefault();
            }
        }
    });

    // -------------------------------------------------------------
    // Scroll Synchronization
    // -------------------------------------------------------------
    textarea.addEventListener('scroll', () => {
        if (overlay) overlay.scrollTop = textarea.scrollTop;
    });

    // -------------------------------------------------------------
    // File Upload / Opening Logic
    // -------------------------------------------------------------
    function triggerFileOpen() {
        fileInputUploader.click();
    }

    fileInputUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target.result;
            
            textarea.value = content;
            textarea.setSelectionRange(0, 0);
            
            saveState();
            updateCounts();
            saveToLocalStorage();
            
            showToast(`Opened file: ${file.name}`);
        };
        reader.readAsText(file);
        fileInputUploader.value = '';
    });

    btnOpenDoc.addEventListener('click', triggerFileOpen);
    tbOpen.addEventListener('click', triggerFileOpen);

    // -------------------------------------------------------------
    // Spellcheck System
    // -------------------------------------------------------------
    let dictionary = new Set();
    const customDict = new Set(JSON.parse(localStorage.getItem('toolcanvas_custom_dictionary') || '[]'));
    const ignoredWords = new Set();

    const fallbackWords = [
        "the", "of", "and", "a", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", 
        "as", "with", "his", "they", "i", "at", "be", "this", "have", "from", "or", "one", "had", "by", 
        "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said", "there", "use", 
        "an", "each", "which", "she", "do", "how", "their", "if", "will", "up", "other", "about", "out", 
        "many", "then", "them", "these", "so", "some", "her", "would", "make", "like", "him", "into", 
        "time", "has", "look", "two", "more", "write", "go", "see", "number", "no", "way", "could", "people", 
        "my", "than", "first", "water", "been", "call", "who", "oil", "its", "now", "find", "long", "down", 
        "day", "did", "get", "come", "made", "may", "part", "over", "new", "sound", "take", "only", "little", 
        "work", "know", "place", "year", "live", "me", "back", "give", "most", "very", "after", "thing", 
        "our", "just", "name", "sentence", "man", "think", "say", "great", "where", "help", "through", 
        "much", "before", "line", "right", "too", "mean", "old", "any", "same", "tell", "boy", "follow", 
        "came", "want", "show", "also", "around", "farm", "three", "small", "set", "home", "read", "hand", 
        "port", "large", "spell", "add", "even", "land", "here", "must", "big", "high", "such", "follow", 
        "act", "why", "ask", "men", "change", "went", "light", "kind", "off", "need", "house", "picture", 
        "try", "us", "again", "animal", "point", "mother", "world", "near", "build", "self", "earth", 
        "father", "head", "stand", "own", "page", "should", "country", "found", "answer", "school", "grow", 
        "study", "still", "learn", "plant", "cover", "food", "sun", "four", "between", "state", "keep", 
        "eye", "never", "last", "let", "thought", "city", "tree", "cross", "start", "might", "story", 
        "saw", "far", "sea", "draw", "left", "late", "run", "don't", "while", "press", "close", "night", 
        "real", "life", "few", "north", "open", "seem", "together", "next", "white", "children", "begin", 
        "got", "walk", "example", "ease", "paper", "group", "always", "music", "those", "both", "mark", 
        "often", "letter", "until", "mile", "river", "car", "feet", "care", "second", "book", "carry", 
        "took", "rain", "eat", "room", "friend", "began", "idea", "fish", "mountain", "stop", "once", 
        "base", "hear", "horse", "cut", "sure", "watch", "color", "face", "wood", "main", "enough", 
        "plain", "girl", "usual", "young", "ready", "above", "ever", "red", "list", "though", "feel", 
        "talk", "bird", "soon", "body", "dog", "family", "direct", "pose", "leave", "song", "measure", 
        "door", "product", "black", "short", "numeral", "class", "wind", "question", "happen", "complete", 
        "ship", "area", "half", "rock", "order", "fire", "south", "problem", "piece", "told", "knew", 
        "pass", "since", "top", "whole", "king", "space", "heard", "best", "hour", "better", "true", 
        "during", "hundred", "five", "remember", "step", "early", "hold", "west", "ground", "interest", 
        "reach", "fast", "verb", "sing", "listen", "six", "table", "travel", "less", "morning", "ten", 
        "simple", "several", "vowel", "toward", "war", "lay", "against", "pattern", "slow", "center", 
        "love", "person", "money", "map", "rule", "govern", "pull", "cold", "notice", "voice", "unit", 
        "power", "town", "fine", "certain", "fly", "fall", "lead", "cry", "dark", "machine", "note", 
        "wait", "plan", "figure", "star", "box", "noun", "field", "rest", "correct", "able", "pound", 
        "done", "beauty", "drive", "stood", "contain", "front", "teach", "week", "final", "gave", 
        "green", "oh", "quick", "develop", "ocean", "warm", "free", "minute", "strong", "special", 
        "mind", "behind", "clear", "tail", "produce", "fact", "street", "image", "itself", "force", 
        "blue", "easy", "speed", "decide", "word", "words", "spelling", "checker", "auto", "save", 
        "full", "screen", "notebook", "notepad", "online", "toolcanvas", "wrong"
    ];

    function initDictionary() {
        const cache = localStorage.getItem('toolcanvas_dictionary_cache');
        if (cache) {
            parseDictionaryText(cache);
        } else {
            fallbackWords.forEach(w => dictionary.add(w.toLowerCase()));
        }

        fetch('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears.txt')
            .then(res => {
                if (!res.ok) throw new Error('CDN error');
                return res.text();
            })
            .then(text => {
                localStorage.setItem('toolcanvas_dictionary_cache', text);
                parseDictionaryText(text);
                updateOverlay();
            })
            .catch(() => {
                console.log("Dictionary fetch failed, using fallback.");
            });
    }

    function parseDictionaryText(text) {
        dictionary.clear();
        const words = text.split('\n');
        words.forEach(w => {
            const trimmed = w.trim().toLowerCase();
            if (trimmed) dictionary.add(trimmed);
        });
        fallbackWords.forEach(w => dictionary.add(w.toLowerCase()));
    }

    function isWordMisspelled(word) {
        const lower = word.toLowerCase();
        if (lower.length <= 1) return false;
        if (/^\d+$/.test(lower)) return false;
        if (dictionary.has(lower) || customDict.has(lower) || ignoredWords.has(lower)) return false;

        if (lower.endsWith("'s")) {
            const stripped = lower.slice(0, -2);
            if (dictionary.has(stripped) || customDict.has(stripped) || ignoredWords.has(stripped)) return false;
        }
        return true;
    }

    function updateOverlay() {
        if (!overlay) return;
        const text = textarea.value;

        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const wordRegex = /\b[A-Za-z']+\b/g;
        html = html.replace(wordRegex, (word) => {
            if (isWordMisspelled(word)) {
                return `<span class="misspelled">${word}</span>`;
            }
            return word;
        });

        if (text.endsWith('\n')) {
            html += '<br>';
        }

        overlay.innerHTML = html;
        overlay.scrollTop = textarea.scrollTop;
    }

    function getWordAtCaret(textarea) {
        const text = textarea.value;
        const idx = textarea.selectionStart;
        if (idx < 0 || idx > text.length) return null;

        let start = idx;
        while (start > 0 && /[A-Za-z']/.test(text[start - 1])) {
            start--;
        }

        let end = idx;
        while (end < text.length && /[A-Za-z']/.test(text[end])) {
            end++;
        }

        const word = text.substring(start, end);
        if (word && /[A-Za-z]/.test(word)) {
            return { word, start, end };
        }
        return null;
    }

    function damerauLevenshteinDistance(s1, s2) {
        const len1 = s1.length;
        const len2 = s2.length;
        if (Math.abs(len1 - len2) > 2) return 99;

        const d = [];
        for (let i = 0; i <= len1; i++) {
            d[i] = [i];
        }
        for (let j = 0; j <= len2; j++) {
            d[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                d[i][j] = Math.min(
                    d[i - 1][j] + 1,
                    d[i][j - 1] + 1,
                    d[i - 1][j - 1] + cost
                );

                if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                }
            }
        }
        return d[len1][len2];
    }

    function getSpellingSuggestions(word) {
        const lowerWord = word.toLowerCase();
        const suggestions = [];

        dictionary.forEach(dictWord => {
            if (Math.abs(dictWord.length - lowerWord.length) > 2) return;
            const dist = damerauLevenshteinDistance(lowerWord, dictWord);
            if (dist <= 2) {
                suggestions.push({ word: dictWord, dist });
            }
        });

        customDict.forEach(dictWord => {
            if (Math.abs(dictWord.length - lowerWord.length) > 2) return;
            const dist = damerauLevenshteinDistance(lowerWord, dictWord);
            if (dist <= 2) {
                suggestions.push({ word: dictWord, dist });
            }
        });

        suggestions.sort((a, b) => a.dist - b.dist);

        const unique = [];
        const seen = new Set();
        suggestions.forEach(s => {
            if (!seen.has(s.word)) {
                seen.add(s.word);
                let displayWord = s.word;
                if (word[0] === word[0].toUpperCase()) {
                    displayWord = displayWord[0].toUpperCase() + displayWord.substring(1);
                }
                unique.push(displayWord);
            }
        });

        return unique.slice(0, 5);
    }

    let currentSpellcheckWord = null;
    let currentSpellcheckRange = { start: 0, end: 0 };

    function showSpellcheckContextMenu(clientX, clientY, word, start, end, suggestions) {
        currentSpellcheckWord = word;
        currentSpellcheckRange = { start, end };

        scmSuggestions.innerHTML = '';

        if (suggestions.length === 0) {
            const noSug = document.createElement('div');
            noSug.className = 'scm-no-suggestions';
            noSug.textContent = 'No suggestions found';
            scmSuggestions.appendChild(noSug);
        } else {
            suggestions.forEach(s => {
                const btn = document.createElement('button');
                btn.className = 'scm-item scm-suggestion-btn';
                btn.textContent = s;
                btn.addEventListener('click', () => {
                    replaceWordInTextarea(currentSpellcheckRange.start, currentSpellcheckRange.end, s);
                    spellcheckMenu.classList.add('hidden');
                });
                scmSuggestions.appendChild(btn);
            });
        }

        spellcheckMenu.classList.remove('hidden');

        const menuWidth = 180;
        const menuHeight = 220;
        let x = clientX;
        let y = clientY;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        spellcheckMenu.style.left = `${x}px`;
        spellcheckMenu.style.top = `${y}px`;
    }

    function replaceWordInTextarea(start, end, replacement) {
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        
        textarea.value = before + replacement + after;
        const newCursorPos = start + replacement.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);

        saveState();
        updateCounts();
        saveToLocalStorage();
    }

    textarea.addEventListener('contextmenu', (e) => {
        const wordInfo = getWordAtCaret(textarea);
        if (wordInfo && isWordMisspelled(wordInfo.word)) {
            e.preventDefault();
            const suggestions = getSpellingSuggestions(wordInfo.word);
            showSpellcheckContextMenu(e.clientX, e.clientY, wordInfo.word, wordInfo.start, wordInfo.end, suggestions);
        } else {
            spellcheckMenu.classList.add('hidden');
        }
    });

    document.addEventListener('click', () => {
        spellcheckMenu.classList.add('hidden');
    });

    scmAddDict.addEventListener('click', () => {
        if (currentSpellcheckWord) {
            const lower = currentSpellcheckWord.toLowerCase();
            customDict.add(lower);
            localStorage.setItem('toolcanvas_custom_dictionary', JSON.stringify(Array.from(customDict)));
            updateOverlay();
            showToast(`Added "${currentSpellcheckWord}" to dictionary.`);
        }
        spellcheckMenu.classList.add('hidden');
    });

    scmIgnore.addEventListener('click', () => {
        if (currentSpellcheckWord) {
            const lower = currentSpellcheckWord.toLowerCase();
            ignoredWords.add(lower);
            updateOverlay();
            showToast(`Ignored "${currentSpellcheckWord}" for this session.`);
        }
        spellcheckMenu.classList.add('hidden');
    });

    // -------------------------------------------------------------
    // Application Initializer
    // -------------------------------------------------------------
    window.addEventListener('resize', updatePaperStyle);

    initDictionary();
    initSpecialCharGrid();
    initNotepadSession();
});
