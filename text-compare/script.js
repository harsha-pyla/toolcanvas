import { initCommonUI, showToast } from '/js/common.js';

export function init() {
  const orig = document.getElementById('compare-original');
  const mod = document.getElementById('compare-modified');
  const btnCompare = document.getElementById('btn-run-compare');
  const btnSwap = document.getElementById('btn-swap-compare');
  const btnClearBoth = document.getElementById('btn-clear-both');
  const btnOrigSample = document.getElementById('btn-orig-sample');
  const btnOrigCopy = document.getElementById('btn-orig-copy');
  const btnOrigClear = document.getElementById('btn-orig-clear');
  const btnModCopy = document.getElementById('btn-mod-copy');
  const btnModShare = document.getElementById('btn-mod-share');
  const btnModDownload = document.getElementById('btn-mod-download');
  const btnModClear = document.getElementById('btn-mod-clear');

  // 1. Linked Resizing Between Dual Boxes
  initLinkedResizing();

  // 2. Linked Scrolling
  initLinkedScrolling();

  // 3. Live Stats for Each Independent Box
  if (orig) {
    orig.addEventListener('input', updateBoxCounters);
  }
  if (mod) {
    mod.addEventListener('input', updateBoxCounters);
  }
  updateBoxCounters();

  // 4. Sample Action
  if (btnOrigSample) {
    btnOrigSample.addEventListener('click', loadSampleTexts);
  }
  const badgeExample = document.querySelector('.pane-badge-tag');
  if (badgeExample) {
    badgeExample.style.cursor = 'pointer';
    badgeExample.title = 'Click to load sample text';
    badgeExample.addEventListener('click', loadSampleTexts);
  }

  // 5. Box 1 Toolbar Actions
  if (btnOrigCopy) {
    btnOrigCopy.addEventListener('click', () => copyTextFrom(orig, btnOrigCopy, 'Original text copied!'));
  }
  if (btnOrigClear) {
    btnOrigClear.addEventListener('click', () => {
      if (orig) {
        orig.value = '';
        updateBoxCounters();
        hideDiff();
        showToast('Original text cleared');
      }
    });
  }

  // 6. Box 2 Toolbar Actions
  if (btnModCopy) {
    btnModCopy.addEventListener('click', () => copyTextFrom(mod, btnModCopy, 'Modified text copied!'));
  }
  if (btnModShare) {
    btnModShare.addEventListener('click', async () => {
      const text = mod ? mod.value : '';
      if (navigator.share && text) {
        try {
          await navigator.share({ title: 'ToolCanvas - Text Compare', text });
          return;
        } catch (e) {}
      }
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Page link copied!');
      } catch (e) {
        showToast('Link ready');
      }
    });
  }
  if (btnModDownload) {
    btnModDownload.addEventListener('click', () => {
      const text = mod ? mod.value : '';
      if (!text) {
        showToast('Nothing to download');
        return;
      }
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modified-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded text file');
    });
  }
  if (btnModClear) {
    btnModClear.addEventListener('click', () => {
      if (mod) {
        mod.value = '';
        updateBoxCounters();
        hideDiff();
        showToast('Modified text cleared');
      }
    });
  }

  // 7. Global Compare Controls
  if (btnCompare) {
    btnCompare.addEventListener('click', runTextCompare);
  }
  if (btnSwap) {
    btnSwap.addEventListener('click', swapCompareSides);
  }
  if (btnClearBoth) {
    btnClearBoth.addEventListener('click', () => {
      if (orig) orig.value = '';
      if (mod) mod.value = '';
      updateBoxCounters();
      hideDiff();
      showToast('Both panes cleared');
    });
  }
}

// Direct initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCommonUI();
    init();
  });
} else {
  initCommonUI();
  init();
}

/**
 * Synchronizes the height of both standalone boxes when either is resized
 */
function initLinkedResizing() {
  const boxOrig = document.getElementById('box-original');
  const boxMod = document.getElementById('box-modified');
  if (!boxOrig || !boxMod) return;

  let isSyncing = false;
  let activeDraggingBox = null;

  // 1. Observe height changes via ResizeObserver
  const ro = new ResizeObserver((entries) => {
    if (isSyncing) return;
    for (const entry of entries) {
      const target = entry.target;
      const targetH = target.offsetHeight;
      if (!targetH) continue;

      if (target === boxOrig) {
        if (Math.abs(boxMod.offsetHeight - targetH) > 1) {
          isSyncing = true;
          boxMod.style.height = `${targetH}px`;
          requestAnimationFrame(() => { isSyncing = false; });
        }
      } else if (target === boxMod) {
        if (Math.abs(boxOrig.offsetHeight - targetH) > 1) {
          isSyncing = true;
          boxOrig.style.height = `${targetH}px`;
          requestAnimationFrame(() => { isSyncing = false; });
        }
      }
    }
  });

  ro.observe(boxOrig);
  ro.observe(boxMod);

  // 2. High-performance pointer tracking for instant 60fps mirror while dragging the native resize handle
  function attachDragTracker(sourceBox, peerBox) {
    sourceBox.addEventListener('pointerdown', (e) => {
      const rect = sourceBox.getBoundingClientRect();
      // Native resize handle is in the bottom-right corner (~30px x 30px)
      const inResizeZone = (rect.bottom - e.clientY <= 30) && (rect.right - e.clientX <= 30);
      if (!inResizeZone) return;

      activeDraggingBox = sourceBox;

      const onMove = () => {
        if (activeDraggingBox !== sourceBox) return;
        const currentH = sourceBox.offsetHeight;
        if (currentH > 0 && Math.abs(peerBox.offsetHeight - currentH) > 1) {
          isSyncing = true;
          peerBox.style.height = `${currentH}px`;
          requestAnimationFrame(() => { isSyncing = false; });
        }
      };

      const onEnd = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onEnd);
        window.removeEventListener('pointercancel', onEnd);
        activeDraggingBox = null;
        peerBox.style.height = `${sourceBox.offsetHeight}px`;
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onEnd, { passive: true });
      window.addEventListener('pointercancel', onEnd, { passive: true });
    });
  }

  attachDragTracker(boxOrig, boxMod);
  attachDragTracker(boxMod, boxOrig);
}

/**
 * Synchronizes scrolling between original and modified textareas
 */
function initLinkedScrolling() {
  const orig = document.getElementById('compare-original');
  const mod = document.getElementById('compare-modified');
  if (!orig || !mod) return;

  let isScrolling = false;

  orig.addEventListener('scroll', () => {
    if (isScrolling) return;
    isScrolling = true;
    mod.scrollTop = orig.scrollTop;
    mod.scrollLeft = orig.scrollLeft;
    requestAnimationFrame(() => { isScrolling = false; });
  }, { passive: true });

  mod.addEventListener('scroll', () => {
    if (isScrolling) return;
    isScrolling = true;
    orig.scrollTop = mod.scrollTop;
    orig.scrollLeft = mod.scrollLeft;
    requestAnimationFrame(() => { isScrolling = false; });
  }, { passive: true });
}

/**
 * Updates live character, word, and line statistics for both boxes independently
 */
function updateBoxCounters() {
  const orig = document.getElementById('compare-original');
  const mod = document.getElementById('compare-modified');

  if (orig) {
    const text = orig.value;
    const words = text.trim() ? text.trim().match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) || [] : [];
    const lines = text.length ? text.split(/\r?\n/).length : 0;

    const charEl = document.getElementById('orig-char-count');
    const wordEl = document.getElementById('orig-word-count');
    const lineEl = document.getElementById('orig-line-count');
    if (charEl) charEl.textContent = text.length.toLocaleString();
    if (wordEl) wordEl.textContent = words.length.toLocaleString();
    if (lineEl) lineEl.textContent = lines.toLocaleString();
  }

  if (mod) {
    const text = mod.value;
    const words = text.trim() ? text.trim().match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) || [] : [];
    const lines = text.length ? text.split(/\r?\n/).length : 0;

    const charEl = document.getElementById('mod-char-count');
    const wordEl = document.getElementById('mod-word-count');
    const lineEl = document.getElementById('mod-line-count');
    if (charEl) charEl.textContent = text.length.toLocaleString();
    if (wordEl) wordEl.textContent = words.length.toLocaleString();
    if (lineEl) lineEl.textContent = lines.toLocaleString();
  }
}

/**
 * Copies text from a specific textarea with visual button feedback
 */
async function copyTextFrom(textarea, btn, successMessage) {
  if (!textarea || !textarea.value) {
    showToast('Box is empty');
    return;
  }
  try {
    await navigator.clipboard.writeText(textarea.value);
    const originalHtml = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    showToast(successMessage);
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalHtml;
    }, 1500);
  } catch (err) {
    showToast('Unable to copy');
  }
}

/**
 * Populates sample texts
 */
function loadSampleTexts() {
  const orig = document.getElementById('compare-original');
  const mod = document.getElementById('compare-modified');
  if (orig && mod) {
    orig.value = `1. First item\n2. Second item\n\nExtra blank lines above collapse, and tabs and lists stay put.\nUnchanged line for verification.`;
    mod.value = `1. First item\n2. Modified second item with extra details\n\nExtra blank lines above collapse, and tabs and lists stay put.\nUnchanged line for verification.\n3. Brand new third item added to list.`;
    updateBoxCounters();
    runTextCompare();
    showToast('Sample comparison loaded');
  }
}

/**
 * Swaps contents between original and modified boxes
 */
function swapCompareSides() {
  const orig = document.getElementById('compare-original');
  const mod = document.getElementById('compare-modified');
  if (orig && mod) {
    const temp = orig.value;
    orig.value = mod.value;
    mod.value = temp;
    updateBoxCounters();
    runTextCompare();
    showToast('Sides swapped');
  }
}

/**
 * Computes and displays side-by-side / inline LCS diff
 */
function runTextCompare() {
  const orig = document.getElementById('compare-original');
  const mod = document.getElementById('compare-modified');
  const outputBox = document.getElementById('diff-output-box');
  const metricsText = document.getElementById('diff-metrics-text');

  if (!orig || !mod || !outputBox) return;

  const text1 = orig.value;
  const text2 = mod.value;

  if (!text1 && !text2) {
    showToast('Paste text in both boxes to compare');
    return;
  }

  const lines1 = text1.split(/\r?\n/);
  const lines2 = text2.split(/\r?\n/);

  // Compute LCS diff
  const diff = computeLCSDiff(lines1, lines2);

  let addedCount = 0;
  let deletedCount = 0;
  let unchangedCount = 0;

  outputBox.innerHTML = diff.map(item => {
    let cls = 'unchanged';
    let prefix = '  ';
    if (item.type === 'add') {
      cls = 'added';
      prefix = '+ ';
      addedCount++;
    } else if (item.type === 'del') {
      cls = 'deleted';
      prefix = '- ';
      deletedCount++;
    } else {
      unchangedCount++;
    }
    return `<div class="diff-line ${cls}"><span style="opacity:0.6;user-select:none;">${prefix}</span><span>${escapeHtml(item.text)}</span></div>`;
  }).join('');

  outputBox.style.display = 'block';

  if (metricsText) {
    metricsText.textContent = `+${addedCount} additions, -${deletedCount} deletions, ${unchangedCount} unchanged lines`;
  }

  showToast('Comparison generated');
}

function hideDiff() {
  const outputBox = document.getElementById('diff-output-box');
  const metricsText = document.getElementById('diff-metrics-text');
  if (outputBox) outputBox.style.display = 'none';
  if (metricsText) metricsText.textContent = '';
}

function computeLCSDiff(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const result = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'same', text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', text: b[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({ type: 'del', text: a[i - 1] });
      i--;
    }
  }

  return result;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
