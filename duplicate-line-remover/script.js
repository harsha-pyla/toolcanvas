import { initCommonUI, initSharedWorkspace, updateLiveCounters, showToast } from '/js/common.js';

export function init() {
  initSharedWorkspace({
    filename: 'deduplicated-lines.txt',
    onSample: () => {
      const textarea = document.getElementById('main-textarea');
      if (textarea) {
        textarea.value = `apple\nbanana\norange\napple\nbanana\npear\norange\ngrapes\napple\nwatermelon`;
      }
    }
  });

  const btn = document.getElementById('btn-run-dup');
  if (btn) {
    btn.onclick = runDuplicateRemoval;
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

function runDuplicateRemoval() {
  const textarea = document.getElementById('main-textarea');
  if (!textarea || !textarea.value) {
    showToast('Enter some lines first');
    return;
  }

  const isCaseSensitive = document.getElementById('dup-case')?.checked ?? false;
  const isTrim = document.getElementById('dup-trim')?.checked ?? true;
  const removeEmpty = document.getElementById('dup-empty')?.checked ?? true;
  const sortMode = document.getElementById('dup-sort')?.value || 'original';

  const rawLines = textarea.value.split(/\r?\n/);
  const seen = new Set();
  const output = [];

  for (let line of rawLines) {
    let processed = isTrim ? line.trim() : line;
    if (removeEmpty && processed.length === 0) continue;

    const lookupKey = isCaseSensitive ? processed : processed.toLowerCase();
    if (!seen.has(lookupKey)) {
      seen.add(lookupKey);
      output.push(processed);
    }
  }

  if (sortMode === 'asc') {
    output.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: isCaseSensitive ? 'case' : 'base' }));
  } else if (sortMode === 'desc') {
    output.sort((a, b) => b.localeCompare(a, undefined, { sensitivity: isCaseSensitive ? 'case' : 'base' }));
  }

  const removedCount = rawLines.length - output.length;
  textarea.value = output.join('\n');
  updateLiveCounters();

  const feedback = document.getElementById('dup-feedback');
  if (feedback) {
    feedback.textContent = `Removed ${removedCount.toLocaleString()} duplicate ${removedCount === 1 ? 'line' : 'lines'}`;
  }
  showToast(`Deduplicated: ${output.length} unique lines kept`);
}
