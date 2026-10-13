import { initCommonUI, initSharedWorkspace, updateLiveCounters, showToast } from '/js/common.js';

export function init() {
  initSharedWorkspace({
    filename: 'cleaned-text.txt',
    onSample: () => {
      const textarea = document.getElementById('main-textarea');
      if (textarea) {
        textarea.value = `   <div class="sample-box">   \n\n\n   This    paragraph      has     excessive     whitespace.   \n\n   It also contains “smart curly quotes” and emojis! 🚀 ✨   \n\n   <p>HTML tags and redundant blank lines are also present.</p>   </div>   `;
      }
    }
  });

  const btn = document.getElementById('btn-run-clean');
  if (btn) {
    btn.onclick = runTextCleaner;
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

function runTextCleaner() {
  const textarea = document.getElementById('main-textarea');
  if (!textarea || !textarea.value) {
    showToast('Enter some text first');
    return;
  }

  let text = textarea.value;
  const initialLength = text.length;

  const removeSpaces = document.getElementById('clean-spaces')?.checked ?? true;
  const trimLines = document.getElementById('clean-trim')?.checked ?? true;
  const removeEmpty = document.getElementById('clean-empty-lines')?.checked ?? true;
  const stripHtml = document.getElementById('clean-html')?.checked ?? false;
  const normQuotes = document.getElementById('clean-quotes')?.checked ?? false;
  const stripEmoji = document.getElementById('clean-emoji')?.checked ?? false;

  if (stripHtml) {
    text = text.replace(/<\/?[^>]+(>|$)/g, '');
  }

  if (normQuotes) {
    text = text
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2013\u2014]/g, '-');
  }

  if (stripEmoji) {
    text = text.replace(/\p{Extended_Pictographic}/gu, '');
  }

  let lines = text.split(/\r?\n/);

  if (removeSpaces) {
    lines = lines.map(line => line.replace(/[ \t]+/g, ' '));
  }

  if (trimLines) {
    lines = lines.map(line => line.trim());
  }

  if (removeEmpty) {
    lines = lines.filter(line => line.length > 0);
  }

  text = lines.join('\n');
  textarea.value = text;
  updateLiveCounters();

  const charsSaved = initialLength - text.length;
  const feedback = document.getElementById('cleaner-feedback');
  if (feedback) {
    feedback.textContent = `Cleaned! Removed ${charsSaved.toLocaleString()} characters.`;
  }
  showToast('Text cleaned successfully');
}
