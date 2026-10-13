/**
 * ToolCanvas — Application Logic v2.0
 * Pure, clean, client-side text utility suite
 */

const TOOL_CONFIGS = {
  'word-counter': {
    name: 'Word & Character Counter',
    title: 'Word Counter & Character Counter',
    subtitle: 'Count words, characters, sentences, paragraphs and reading time instantly.'
  },
  'case-converter': {
    name: 'Case Converter',
    title: 'Case Converter',
    subtitle: 'Convert your text between uppercase, lowercase, title case, sentence case, and more.'
  },
  'text-cleaner': {
    name: 'Text Cleaner',
    title: 'Text Cleaner',
    subtitle: 'Remove extra whitespace, eliminate empty lines, strip HTML tags, and clean formatting.'
  },
  'duplicate-remover': {
    name: 'Duplicate Line Remover',
    title: 'Duplicate Line Remover',
    subtitle: 'Detect and remove duplicate lines, keywords, and list items instantly.'
  },
  'text-compare': {
    name: 'Text Compare',
    title: 'Text Compare',
    subtitle: 'Compare two text passages side-by-side to highlight additions, deletions, and differences.'
  }
};

let currentToolId = 'word-counter';

document.addEventListener('DOMContentLoaded', () => {
  currentToolId = document.body.dataset.tool || 'word-counter';
  initTheme();
  initSearch();
  initMobileMenu();
  initSharedWorkspace();
  initCaseConverter();
  initTextCleaner();
  initDuplicateRemover();
  initTextCompare();
  initFaqAccordions();

  // If on case-converter and query param ?case=... is provided, auto-trigger it
  if (currentToolId === 'case-converter') {
    const params = new URLSearchParams(window.location.search);
    const subcase = params.get('case');
    if (subcase) {
      const caseBtn = document.querySelector(`[data-case="${subcase}"]`);
      if (caseBtn) caseBtn.click();
    }
  }

  // Ensure editor starts empty by default
  const textarea = document.getElementById('main-textarea');
  if (textarea && !textarea.value) {
    textarea.value = '';
    updateLiveCounters();
  }
});

/* =========================================================
   1. THEME SWITCHER (Dark / Light On-Off Toggle)
   ========================================================= */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const saved = localStorage.getItem('toolcanvas_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved ? saved : (prefersDark ? 'dark' : 'light');

  setTheme(initial);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
      localStorage.setItem('toolcanvas_theme', next);
    });
  }

  function setTheme(mode) {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}

/* =========================================================
   3. SHARED WORKSPACE (Textarea, Toolbar, Live Counters)
   ========================================================= */
function initSharedWorkspace() {
  const textarea = document.getElementById('main-textarea');
  const copyBtn = document.getElementById('tool-btn-copy');
  const shareBtn = document.getElementById('tool-btn-share');
  const downloadBtn = document.getElementById('tool-btn-download');
  const clearBtn = document.getElementById('tool-btn-clear');
  const sampleBtn = document.getElementById('tool-btn-sample');

  if (textarea) {
    textarea.addEventListener('input', updateLiveCounters);
  }

  // Copy Icon Button
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = getCurrentActiveText();
      if (!text) {
        showToast('Text area is empty');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        const originalHtml = copyBtn.innerHTML;
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        showToast('Copied to clipboard!');
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHtml;
        }, 1600);
      } catch (err) {
        console.error('Copy failed:', err);
        showToast('Could not copy to clipboard');
      }
    });
  }

  // Share Icon Button
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const text = getCurrentActiveText();
      if (navigator.share && text) {
        try {
          await navigator.share({
            title: 'ToolCanvas Text',
            text: text
          });
          return;
        } catch (e) {
          // Fall through to copying page link
        }
      }
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      } catch (err) {
        showToast('Share link ready');
      }
    });
  }

  // Download Icon Button
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const text = getCurrentActiveText();
      if (!text) {
        showToast('Nothing to download');
        return;
      }
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentToolId || 'toolcanvas'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Text file downloaded');
    });
  }

  // Clear Icon Button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (currentToolId === 'text-compare') {
        const orig = document.getElementById('compare-original');
        const mod = document.getElementById('compare-modified');
        if (orig) orig.value = '';
        if (mod) mod.value = '';
        const diffBox = document.getElementById('diff-output-box');
        if (diffBox) diffBox.style.display = 'none';
        const diffMetrics = document.getElementById('diff-metrics-text');
        if (diffMetrics) diffMetrics.textContent = '';
      } else {
        if (textarea) {
          textarea.value = '';
          textarea.focus();
        }
      }
      updateLiveCounters();
      showToast('Editor cleared');
    });
  }


  // "Try an example" button
  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      loadSampleForTool(currentToolId);
      showToast('Sample text inserted');
    });
  }
}

function showToast(msg) {
  let toast = document.getElementById('toolcanvas-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toolcanvas-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function getCurrentActiveText() {
  if (currentToolId === 'text-compare') {
    const orig = document.getElementById('compare-original')?.value || '';
    const mod = document.getElementById('compare-modified')?.value || '';
    return `=== Original ===\n${orig}\n\n=== Modified ===\n${mod}`;
  }
  return document.getElementById('main-textarea')?.value || '';
}

function updateLiveCounters() {
  const text = getCurrentActiveText();
  
  // Character count (including spaces and linebreaks)
  const charCount = text.length;

  // Accurate word count handling Unicode, apostrophes, and hyphens
  const words = text.trim() ? text.trim().match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) || [] : [];
  const wordCount = words.length;

  // Line count
  const lines = text.length ? text.split(/\r?\n/).length : 0;

  // Bottom toolbar counter elements
  const barChar = document.getElementById('bar-char-count');
  const barWord = document.getElementById('bar-word-count');
  const barLine = document.getElementById('bar-line-count');
  if (barChar) barChar.textContent = charCount.toLocaleString();
  if (barWord) barWord.textContent = wordCount.toLocaleString();
  if (barLine) barLine.textContent = lines.toLocaleString();

  // Word Counter specific card statistics
  if (currentToolId === 'word-counter') {
    const charsNoSpace = text.replace(/\s/g, '').length;
    
    // Sentence count matching punctuation boundaries (. ! ?)
    const sentences = text.trim() ? (text.trim().match(/[^.!?]+[.!?]+(\s|$)/g) || []).length : 0;
    
    // Paragraph count (non-empty newline blocks)
    const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
    
    // Reading time at 225 wpm; Speaking time at 130 wpm
    const readSecs = Math.round((wordCount / 225) * 60);
    const speakSecs = Math.round((wordCount / 130) * 60);

    const elCharsAll = document.getElementById('wc-chars-all');
    const elCharsNoSpace = document.getElementById('wc-chars-nospace');
    const elWords = document.getElementById('wc-words');
    const elSentences = document.getElementById('wc-sentences');
    const elParagraphs = document.getElementById('wc-paragraphs');
    const elReading = document.getElementById('wc-reading-time');
    const elSpeaking = document.getElementById('wc-speaking-time');

    if (elCharsAll) elCharsAll.textContent = charCount.toLocaleString();
    if (elCharsNoSpace) elCharsNoSpace.textContent = charsNoSpace.toLocaleString();
    if (elWords) elWords.textContent = wordCount.toLocaleString();
    if (elSentences) elSentences.textContent = sentences ? sentences.toLocaleString() : (wordCount > 0 ? '1' : '0');
    if (elParagraphs) elParagraphs.textContent = paragraphs.toLocaleString();
    if (elReading) elReading.textContent = formatDuration(readSecs);
    if (elSpeaking) elSpeaking.textContent = formatDuration(speakSecs);
  }
}

function formatDuration(totalSeconds) {
  if (totalSeconds <= 0) return '0 sec';
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return secs > 0 ? `${mins} min ${secs}s` : `${mins} min`;
}

function loadSampleForTool(toolId) {
  const textarea = document.getElementById('main-textarea');
  if (!textarea) return;

  switch (toolId) {
    case 'word-counter':
      textarea.value = `The ToolCanvas Word and Character Counter provides reliable, real-time writing statistics. Every metric is computed instantly inside your browser without any network requests.

Whether you are writing an essay, preparing a presentation, or checking character limits for a post, you can count words, characters, sentences, and estimated reading times with confidence.`;
      break;

    case 'case-converter':
      textarea.value = `ACCIDENTALLY LEFT THE CAPS LOCK ON AND TYPED THIS ENTIRE PARAGRAPH? DON'T WORRY—USE THE CASE CONVERTER TO TRANSFORM IT TO SENTENCE CASE, LOWERCASE, OR TITLE CASE IN ONE CLICK.`;
      break;

    case 'text-cleaner':
      textarea.value = `   <div class="sample-box">   \n\n\n   This    paragraph      has     excessive     whitespace.   \n\n   It also contains “smart curly quotes” and emojis! 🚀 ✨   \n\n   <p>HTML tags and redundant blank lines are also present.</p>   </div>   `;
      break;

    case 'duplicate-remover':
      textarea.value = `apple\nbanana\norange\napple\nbanana\npear\norange\ngrapes\napple\nwatermelon`;
      break;

    case 'text-compare':
      const orig = document.getElementById('compare-original');
      const mod = document.getElementById('compare-modified');
      if (orig) orig.value = `The quick brown fox jumps over the lazy dog.\nToolCanvas provides fast utilities.\nThis line will be unchanged.`;
      if (mod) mod.value = `The fast brown fox jumps over the sleeping dog.\nToolCanvas provides fast and dependable utilities.\nThis line will be unchanged.\nAdded a brand new concluding line.`;
      runTextCompare();
      return;
  }

  updateLiveCounters();
}

/* =========================================================
   4. CASE CONVERTER IMPLEMENTATION
   ========================================================= */
function initCaseConverter() {
  const textarea = document.getElementById('main-textarea');

  document.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-case');
      const text = textarea.value;
      if (!text) return;

      let result = text;
      switch (type) {
        case 'sentence':
          result = toSentenceCase(text);
          break;
        case 'lower':
          result = text.toLowerCase();
          break;
        case 'upper':
          result = text.toUpperCase();
          break;
        case 'capitalized':
          result = toCapitalizedCase(text);
          break;
        case 'alternating':
          result = toAlternatingCase(text);
          break;
        case 'title':
          result = toTitleCase(text);
          break;
        case 'inverse':
          result = toInverseCase(text);
          break;
        case 'camel':
          result = toCamelCase(text);
          break;
        case 'pascal':
          result = toPascalCase(text);
          break;
        case 'kebab':
          result = toKebabCase(text);
          break;
        case 'snake':
          result = toSnakeCase(text);
          break;
      }

      textarea.value = result;
      updateLiveCounters();
    });
  });

  function toSentenceCase(str) {
    return str.toLowerCase().replace(/(^\s*|\.\s*|\?\s*|!\s*)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  }

  function toCapitalizedCase(str) {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  function toTitleCase(str) {
    const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet']);
    return str.toLowerCase().split(/\s+/).map((word, i) => {
      if (i === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }).join(' ');
  }

  function toAlternatingCase(str) {
    return str.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join('');
  }

  function toInverseCase(str) {
    return str.split('').map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('');
  }

  function getTokens(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  }

  function toCamelCase(str) {
    const tokens = getTokens(str);
    return tokens.map((t, i) => (i === 0 ? t.toLowerCase() : t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())).join('');
  }

  function toPascalCase(str) {
    const tokens = getTokens(str);
    return tokens.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join('');
  }

  function toKebabCase(str) {
    return getTokens(str).map(t => t.toLowerCase()).join('-');
  }

  function toSnakeCase(str) {
    return getTokens(str).map(t => t.toLowerCase()).join('_');
  }
}

/* =========================================================
   5. TEXT CLEANER
   ========================================================= */
function initTextCleaner() {
  const btn = document.getElementById('btn-run-clean');
  const textarea = document.getElementById('main-textarea');
  const feedback = document.getElementById('cleaner-feedback');

  if (btn && textarea) {
    btn.addEventListener('click', () => {
      const original = textarea.value;
      if (!original) return;

      let result = original;

      if (document.getElementById('clean-html')?.checked) {
        result = result.replace(/<[^>]*>/g, '');
      }

      if (document.getElementById('clean-quotes')?.checked) {
        result = result.replace(/[\u2018\u2019]/g, "'")
                       .replace(/[\u201C\u201D]/g, '"')
                       .replace(/\u2026/g, '...')
                       .replace(/[\u2013\u2014]/g, '-');
      }

      if (document.getElementById('clean-emoji')?.checked) {
        result = result.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
      }

      let lines = result.split(/\r?\n/);
      if (document.getElementById('clean-trim')?.checked) {
        lines = lines.map(l => l.trim());
      }
      if (document.getElementById('clean-spaces')?.checked) {
        lines = lines.map(l => l.replace(/[ \t]+/g, ' '));
      }
      if (document.getElementById('clean-empty-lines')?.checked) {
        lines = lines.filter(l => l.length > 0);
      }

      result = lines.join('\n');
      textarea.value = result;
      updateLiveCounters();

      const saved = original.length - result.length;
      if (feedback) {
        feedback.textContent = `Cleaned! Saved ${saved > 0 ? saved : 0} characters.`;
        setTimeout(() => { feedback.textContent = ''; }, 3000);
      }
    });
  }
}

/* =========================================================
   6. DUPLICATE LINE REMOVER
   ========================================================= */
function initDuplicateRemover() {
  const btn = document.getElementById('btn-run-dup');
  const textarea = document.getElementById('main-textarea');
  const feedback = document.getElementById('dup-feedback');

  if (btn && textarea) {
    btn.addEventListener('click', () => {
      const original = textarea.value;
      if (!original.trim()) return;

      let lines = original.split(/\r?\n/);
      const initialCount = lines.length;

      const isCase = document.getElementById('dup-case')?.checked;
      const isTrim = document.getElementById('dup-trim')?.checked;
      const isEmpty = document.getElementById('dup-empty')?.checked;
      const sortVal = document.getElementById('dup-sort')?.value || 'original';

      const seen = new Set();
      const unique = [];

      for (let line of lines) {
        if (isTrim) line = line.trim();
        if (isEmpty && line.length === 0) continue;
        const key = isCase ? line : line.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(line);
        }
      }

      if (sortVal === 'asc') {
        unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      } else if (sortVal === 'desc') {
        unique.sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' }));
      }

      textarea.value = unique.join('\n');
      updateLiveCounters();

      const removed = initialCount - unique.length;
      if (feedback) {
        feedback.textContent = `Removed ${removed} duplicate line${removed === 1 ? '' : 's'}. (${unique.length} unique lines left)`;
        setTimeout(() => { feedback.textContent = ''; }, 3500);
      }
    });
  }
}

/* =========================================================
   7. TEXT COMPARE (DIFF CHECKER)
   ========================================================= */
function initTextCompare() {
  const runBtn = document.getElementById('btn-run-compare');
  const swapBtn = document.getElementById('btn-swap-compare');
  const origTextarea = document.getElementById('compare-original');
  const modTextarea = document.getElementById('compare-modified');

  if (origTextarea) origTextarea.addEventListener('input', updateLiveCounters);
  if (modTextarea) modTextarea.addEventListener('input', updateLiveCounters);

  if (runBtn) runBtn.addEventListener('click', runTextCompare);

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      if (!origTextarea || !modTextarea) return;
      const tmp = origTextarea.value;
      origTextarea.value = modTextarea.value;
      modTextarea.value = tmp;
      runTextCompare();
    });
  }
}

function runTextCompare() {
  const orig = document.getElementById('compare-original')?.value || '';
  const mod = document.getElementById('compare-modified')?.value || '';
  const diffBox = document.getElementById('diff-output-box');
  const diffMetrics = document.getElementById('diff-metrics-text');

  if (!diffBox) return;

  const linesA = orig.split(/\r?\n/);
  const linesB = mod.split(/\r?\n/);
  const diff = computeLCS(linesA, linesB);

  diffBox.innerHTML = '';
  diffBox.style.display = 'block';

  let added = 0;
  let removed = 0;
  let unchanged = 0;

  diff.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `diff-row ${item.type}`;

    const num = document.createElement('span');
    num.className = 'diff-row-num';
    num.textContent = index + 1;

    const prefix = item.type === 'added' ? '+ ' : (item.type === 'removed' ? '- ' : '  ');
    const textSpan = document.createElement('span');
    textSpan.textContent = prefix + item.text;

    row.appendChild(num);
    row.appendChild(textSpan);
    diffBox.appendChild(row);

    if (item.type === 'added') added++;
    else if (item.type === 'removed') removed++;
    else unchanged++;
  });

  if (diffMetrics) {
    diffMetrics.textContent = `+${added} additions | -${removed} deletions | ${unchanged} unchanged`;
  }
}

function computeLCS(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (a[i] === b[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const result = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'unchanged', text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', text: b[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({ type: 'removed', text: a[i - 1] });
      i--;
    }
  }

  return result;
}

/* =========================================================
   8. DIRECTORY CARDS
   ========================================================= */
function initDirectoryCards() {
  document.querySelectorAll('[data-tool-card]').forEach(card => {
    card.addEventListener('click', () => {
      const toolId = card.getAttribute('data-tool-card');
      switchTool(toolId);
      window.location.hash = toolId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* =========================================================
   9. SEARCH BAR (Navigates to clean standalone tool URLs)
   ========================================================= */
function initSearch() {
  const searchInput = document.getElementById('tool-search-input') || document.getElementById('nav-search-input');
  const resultsBox = document.getElementById('search-results-dropdown') || document.getElementById('nav-search-results');
  if (!searchInput || !resultsBox) return;

  const searchableItems = [
    { title: 'Word & Character Counter', url: '/word-counter/', tag: 'Text Tool' },
    { title: 'Case Converter', url: '/case-converter/', tag: 'Format' },
    { title: 'Sentence Case Converter', url: '/case-converter/?case=sentence', tag: 'Case' },
    { title: 'Lower Case Converter', url: '/case-converter/?case=lower', tag: 'Case' },
    { title: 'Upper Case Converter', url: '/case-converter/?case=upper', tag: 'Case' },
    { title: 'Title Case Converter', url: '/case-converter/?case=title', tag: 'Case' },
    { title: 'camelCase Converter', url: '/case-converter/?case=camel', tag: 'Code' },
    { title: 'PascalCase Converter', url: '/case-converter/?case=pascal', tag: 'Code' },
    { title: 'kebab-case Converter', url: '/case-converter/?case=kebab', tag: 'Code' },
    { title: 'snake_case Converter', url: '/case-converter/?case=snake', tag: 'Code' },
    { title: 'Text Cleaner (Strip HTML & Spaces)', url: '/text-cleaner/', tag: 'Clean' },
    { title: 'Duplicate Line Remover', url: '/duplicate-line-remover/', tag: 'List' },
    { title: 'Text Compare (Diff Checker)', url: '/text-compare/', tag: 'Diff' }
  ];

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      resultsBox.innerHTML = '';
      resultsBox.classList.remove('active');
      return;
    }

    const matches = searchableItems.filter(item => item.title.toLowerCase().includes(q));
    if (matches.length === 0) {
      resultsBox.innerHTML = `<div style="padding: 12px; font-size: 13.5px; color: var(--text-muted);">No matching tools found</div>`;
      resultsBox.classList.add('active');
      return;
    }

    resultsBox.innerHTML = matches.map(m => `
      <a href="${m.url}" class="search-result-row">
        <div><strong>${m.title}</strong></div>
        <div class="search-result-tool-tag">${m.tag}</div>
      </a>
    `).join('');

    resultsBox.classList.add('active');
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
      resultsBox.classList.remove('active');
    }
  });
}

/* =========================================================
   10. MOBILE MENU
   ========================================================= */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-toggle') || document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-nav-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', !isOpen);
    });
  }
}

/* =========================================================
   11. FAQ ACCORDIONS
   ========================================================= */
function initFaqAccordions() {
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const parent = button.closest('.faq-item');
      if (parent) {
        const isOpen = parent.classList.contains('open');
        parent.classList.toggle('open');
        button.setAttribute('aria-expanded', !isOpen);
      }
    });
  });
}
