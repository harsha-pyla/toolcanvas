import { initCommonUI, initSharedWorkspace, updateLiveCounters, showToast } from '/js/common.js';

export function init() {
  initSharedWorkspace({
    filename: 'word-counter.txt',
    onSample: () => {
      const textarea = document.getElementById('main-textarea');
      if (textarea) {
        textarea.value = `Writing is an exploration. You start from nothing and learn as you go.

Good prose is like a windowpane. It lets the reader observe the underlying thought without distorting it or drawing undue attention to itself.

Clear thinking leads to clear writing. Keep your sentences direct, your active verbs strong, and your message focused.`;
        updateWordCounterStats();
      }
    }
  });

  const textarea = document.getElementById('main-textarea');
  if (textarea) {
    textarea.addEventListener('input', updateWordCounterStats);
    updateWordCounterStats();
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

function updateWordCounterStats() {
  const textarea = document.getElementById('main-textarea');
  const text = textarea ? textarea.value : '';

  const charsAll = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) || [] : [];
  const wordCount = words.length;

  const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;

  // Reading time at 225 wpm
  const readingSeconds = Math.round((wordCount / 225) * 60);
  const readingText = readingSeconds < 60 ? `${readingSeconds} sec` : `${Math.ceil(readingSeconds / 60)} min`;

  // Speaking time at 130 wpm
  const speakingSeconds = Math.round((wordCount / 130) * 60);
  const speakingText = speakingSeconds < 60 ? `${speakingSeconds} sec` : `${Math.ceil(speakingSeconds / 60)} min`;

  const elCharsAll = document.getElementById('wc-chars-all');
  const elCharsNoSpace = document.getElementById('wc-chars-nospace');
  const elWords = document.getElementById('wc-words-total');
  const elSentences = document.getElementById('wc-sentences-total');
  const elParagraphs = document.getElementById('wc-paragraphs-total');
  const elReading = document.getElementById('wc-reading-time');
  const elSpeaking = document.getElementById('wc-speaking-time');

  if (elCharsAll) elCharsAll.textContent = charsAll.toLocaleString();
  if (elCharsNoSpace) elCharsNoSpace.textContent = charsNoSpace.toLocaleString();
  if (elWords) elWords.textContent = wordCount.toLocaleString();
  if (elSentences) elSentences.textContent = sentences.toLocaleString();
  if (elParagraphs) elParagraphs.textContent = paragraphs.toLocaleString();
  if (elReading) elReading.textContent = readingText;
  if (elSpeaking) elSpeaking.textContent = speakingText;
}
