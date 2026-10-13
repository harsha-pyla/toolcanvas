/**
 * ToolCanvas — Common Utilities, SPA Router & Shared Interactions
 */

let isGlobalUIInitialized = false;

export function initCommonUI() {
  if (isGlobalUIInitialized) {
    initSharedWorkspace();
    initFaqAccordions();
    return;
  }
  isGlobalUIInitialized = true;
  initTheme();
  initSearch();
  initMobileMenu();
  initToolNavigation();
  initSharedWorkspace();
  initFaqAccordions();
}

/* 1. Theme Switcher (Sliding Pill) */
export function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const saved = localStorage.getItem('toolcanvas_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved ? saved : (prefersDark ? 'dark' : 'light');

  setTheme(initial);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      const sunClicked = e.target.closest('.sun-icon');
      const moonClicked = e.target.closest('.moon-icon');
      let next;
      if (sunClicked) {
        next = 'light';
      } else if (moonClicked) {
        next = 'dark';
      } else {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        next = current === 'dark' ? 'light' : 'dark';
      }
      setTheme(next);
      localStorage.setItem('toolcanvas_theme', next);
    });
  }

  function setTheme(mode) {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (toggleBtn) toggleBtn.setAttribute('aria-checked', 'true');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      if (toggleBtn) toggleBtn.setAttribute('aria-checked', 'false');
    }
  }
}

/* 2. Search Bar */
export function initSearch() {
  const searchInput = document.getElementById('tool-search-input');
  const resultsBox = document.getElementById('search-results-dropdown');
  if (!searchInput || !resultsBox) return;

  const searchableItems = [
    { title: 'Case Converter', url: '/case-converter/', tag: 'Format' },
    { title: 'Code Case Converter', url: '/code-case-converter/', tag: 'Code' },
    { title: 'Sentence case', url: '/case-converter/?case=sentence', tag: 'Case' },
    { title: 'lower case', url: '/case-converter/?case=lower', tag: 'Case' },
    { title: 'UPPER CASE', url: '/case-converter/?case=upper', tag: 'Case' },
    { title: 'Capitalized Case', url: '/case-converter/?case=capitalized', tag: 'Case' },
    { title: 'Title Case', url: '/case-converter/?case=title', tag: 'Case' },
    { title: 'Alternating Case Converter', url: '/case-converter/?case=alternating', tag: 'Case' },
    { title: 'InVeRsE CaSe Converter', url: '/case-converter/?case=inverse', tag: 'Case' },
    { title: 'camelCase Converter', url: '/code-case-converter/?case=camel', tag: 'Code' },
    { title: 'PascalCase Converter', url: '/code-case-converter/?case=pascal', tag: 'Code' },
    { title: 'kebab-case Converter', url: '/code-case-converter/?case=kebab', tag: 'Code' },
    { title: 'snake_case Converter', url: '/code-case-converter/?case=snake', tag: 'Code' },
    { title: 'Word & Character Counter', url: '/word-counter/', tag: 'Stats' },
    { title: 'Duplicate Line Remover', url: '/duplicate-line-remover/', tag: 'List' },
    { title: 'Text Cleaner (Strip HTML)', url: '/text-cleaner/', tag: 'Clean' },
    { title: 'Text Compare (Diff Checker)', url: '/text-compare/', tag: 'Diff' },
    { title: 'About ToolCanvas', url: '/about/', tag: 'Info' },
    { title: 'Blog & Articles', url: '/blog/', tag: 'Blog' },
    { title: 'Privacy Policy', url: '/privacy/', tag: 'Legal' },
    { title: 'Terms of Service', url: '/terms/', tag: 'Legal' }
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
      resultsBox.innerHTML = `<div style="padding: 12px 14px; font-size: 14px; color: var(--text-muted);">No matching tools</div>`;
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

/* 3. Mobile Menu */
export function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-nav-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', !isOpen);
    });
  }
}

/* 4. Shared Workspace Toolbar (5 Square Icons + Counters) */
export function initSharedWorkspace(options = {}) {
  const textarea = document.getElementById('main-textarea');
  const copyBtn = document.getElementById('tool-btn-copy');
  const shareBtn = document.getElementById('tool-btn-share');
  const downloadBtn = document.getElementById('tool-btn-download');
  const clearBtn = document.getElementById('tool-btn-clear');
  const sampleBtn = document.getElementById('tool-btn-sample');

  if (textarea) {
    textarea.addEventListener('input', updateLiveCounters);
  }

  // Copy Icon
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = getActiveText();
      if (!text) {
        showToast('Text area is empty');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        const originalHtml = copyBtn.innerHTML;
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        showToast('Copied to clipboard!');
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHtml;
        }, 1500);
      } catch (e) {
        showToast('Unable to copy');
      }
    });
  }

  // Share Icon
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const text = getActiveText();
      if (navigator.share && text) {
        try {
          await navigator.share({ title: 'ToolCanvas', text });
          return;
        } catch (e) {}
      }
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Page link copied!');
      } catch (e) {
        showToast('Share link ready');
      }
    });
  }

  // Download Icon
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const text = getActiveText();
      if (!text) {
        showToast('Nothing to download');
        return;
      }
      const filename = options.filename || 'text-file.txt';
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded as .txt');
    });
  }

  // Clear Icon
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (options.onClear) {
        options.onClear();
      } else if (textarea) {
        textarea.value = '';
        textarea.focus();
      }
      updateLiveCounters();
      showToast('Editor cleared');
    });
  }


  // Sample Text Button
  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      if (options.onSample) {
        options.onSample();
      } else if (textarea) {
        textarea.value = "The quick brown fox jumps over the lazy dog. Try converting this text into uppercase, lowercase, title case, or sentence case!";
      }
      updateLiveCounters();
      showToast('Sample text inserted');
    });
  }

  // Trigger initial calculation
  updateLiveCounters();
}

export function getActiveText() {
  const orig = document.getElementById('compare-original');
  const mod = document.getElementById('compare-modified');
  if (orig && mod) {
    return `=== Original ===\n${orig.value}\n\n=== Modified ===\n${mod.value}`;
  }
  const main = document.getElementById('main-textarea');
  return main ? main.value : '';
}

export function updateLiveCounters() {
  const text = getActiveText();
  const charCount = text.length;
  const words = text.trim() ? text.trim().match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) || [] : [];
  const wordCount = words.length;
  const lines = text.length ? text.split(/\r?\n/).length : 0;

  const barChar = document.getElementById('bar-char-count');
  const barWord = document.getElementById('bar-word-count');
  const barLine = document.getElementById('bar-line-count');
  if (barChar) barChar.textContent = charCount.toLocaleString();
  if (barWord) barWord.textContent = wordCount.toLocaleString();
  if (barLine) barLine.textContent = lines.toLocaleString();
}

export function showToast(msg) {
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
  }, 1800);
}

export function initFaqAccordions() {
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const parent = button.closest('.faq-item');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });
}

/* =========================================================
   5. SPA TOOL ROUTER & SEAMLESS TRANSITIONS
   Keeps header steady, smoothly switches body content
   ========================================================= */

const toolModules = {
  'case-converter': () => import('/case-converter/script.js'),
  'code-case-converter': () => import('/code-case-converter/script.js'),
  'word-counter': () => import('/word-counter/script.js'),
  'duplicate-remover': () => import('/duplicate-line-remover/script.js'),
  'text-cleaner': () => import('/text-cleaner/script.js'),
  'text-compare': () => import('/text-compare/script.js'),
  'home': () => import('/js/home.js')
};

const htmlCache = new Map();
let isNavigating = false;

export function initToolNavigation() {
  // Preload all tools in background for instant 0ms switching
  const preloadRoutes = [
    '/',
    '/case-converter/',
    '/code-case-converter/',
    '/word-counter/',
    '/duplicate-line-remover/',
    '/text-cleaner/',
    '/text-compare/',
    '/about/',
    '/blog/',
    '/privacy/',
    '/terms/'
  ];

  const preloadAll = () => {
    preloadRoutes.forEach(route => {
      if (!htmlCache.has(route)) {
        fetch(route)
          .then(res => res.text())
          .then(html => htmlCache.set(route, html))
          .catch(() => {});
      }
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadAll);
  } else {
    setTimeout(preloadAll, 1000);
  }

  // Intercept all internal navigation clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;

    try {
      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      const isToolRoute =
        url.pathname === '/' ||
        url.pathname.startsWith('/case-converter') ||
        url.pathname.startsWith('/code-case-converter') ||
        url.pathname.startsWith('/word-counter') ||
        url.pathname.startsWith('/duplicate-line-remover') ||
        url.pathname.startsWith('/text-cleaner') ||
        url.pathname.startsWith('/text-compare') ||
        url.pathname.startsWith('/about') ||
        url.pathname.startsWith('/blog') ||
        url.pathname.startsWith('/privacy') ||
        url.pathname.startsWith('/terms');

      if (!isToolRoute) return;

      // If clicking current tool with identical query, skip
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      navigateToTool(url.pathname + url.search, true);
    } catch (_) {}
  });

  // Handle browser Back / Forward buttons smoothly
  window.addEventListener('popstate', () => {
    navigateToTool(window.location.pathname + window.location.search, false);
  });
}

export async function navigateToTool(targetPath, pushState = true) {
  if (isNavigating) return;
  isNavigating = true;

  const main = document.querySelector('main.page-container');

  try {
    // 1. Fetch or get from cache
    let html = htmlCache.get(targetPath);
    if (!html) {
      const pathOnly = targetPath.split('?')[0];
      html = htmlCache.get(pathOnly);
    }

    if (!html) {
      const res = await fetch(targetPath);
      html = await res.text();
      htmlCache.set(targetPath, html);
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newMain = doc.querySelector('main.page-container');
    const newTitle = doc.querySelector('title')?.textContent;
    const newTool = doc.body.getAttribute('data-tool') || (targetPath === '/' ? 'home' : 'case-converter');

    if (!newMain) {
      window.location.href = targetPath;
      return;
    }

    // 2. Smooth fade-out of the body only (header remains completely static!)
    if (main) {
      main.classList.add('is-transitioning');
      await new Promise(r => setTimeout(r, 120));
    }

    // 3. Swap the body content
    if (main) {
      main.innerHTML = newMain.innerHTML;
    }

    if (newTitle) {
      document.title = newTitle;
    }

    document.body.setAttribute('data-tool', newTool);

    // 4. Update Header Nav Active state smoothly
    updateHeaderActiveNav(newTool);

    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-nav-menu');
    if (mobileMenu) mobileMenu.classList.remove('open');

    // Close search dropdown
    const resultsBox = document.getElementById('search-results-dropdown');
    if (resultsBox) resultsBox.classList.remove('active');

    // 5. Update browser history
    if (pushState) {
      history.pushState({ path: targetPath }, '', targetPath);
    }

    // Scroll to top of content smoothly
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 6. Smooth fade-in of the new tool
    if (main) {
      main.classList.remove('is-transitioning');
    }

    // 7. Mount the new tool's JavaScript
    if (toolModules[newTool]) {
      const mod = await toolModules[newTool]();
      if (mod && mod.init) {
        mod.init();
      }
    }

    initFaqAccordions();
  } catch (err) {
    console.error('SPA transition error:', err);
    window.location.href = targetPath;
  } finally {
    isNavigating = false;
  }
}

function updateHeaderActiveNav(toolId) {
  const routeMap = {
    'case-converter': '/case-converter/',
    'word-counter': '/word-counter/',
    'duplicate-remover': '/duplicate-line-remover/',
    'text-cleaner': '/text-cleaner/',
    'text-compare': '/text-compare/'
  };

  const expectedHref = routeMap[toolId] || null;

  document.querySelectorAll('.header-tool-link').forEach(link => {
    const href = link.getAttribute('href');
    if (expectedHref && href === expectedHref) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (expectedHref && href === expectedHref) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
