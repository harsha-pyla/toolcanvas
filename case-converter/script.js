import { initCommonUI, initSharedWorkspace, updateLiveCounters, showToast } from '/js/common.js';
import {
  toSentenceCase,
  toLowerCase,
  toUpperCase,
  toCapitalizedCase,
  toAlternatingCase,
  toTitleCase,
  toInverseCase,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase
} from '/js/caseUtils.js';

export function init() {
  initSharedWorkspace({
    filename: 'case-converted.txt',
    onSample: () => {
      const textarea = document.getElementById('main-textarea');
      if (textarea) {
        textarea.value = "The quick brown fox jumps over the lazy dog.\n\nTry converting this text with multiple paragraphs, quotes, and punctuation!";
      }
    }
  });

  initCaseConverter();

  // If URL has ?case=... auto-click
  const params = new URLSearchParams(window.location.search);
  const subcase = params.get('case');
  if (subcase) {
    const btn = document.querySelector(`[data-case="${subcase}"]`);
    if (btn) btn.click();
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

function initCaseConverter() {
  const textarea = document.getElementById('main-textarea');
  if (!textarea) return;

  document.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-case');
      const text = textarea.value;
      if (!text) {
        showToast('Enter some text first');
        return;
      }

      let result = text;
      switch (type) {
        case 'sentence':
          result = toSentenceCase(text);
          break;
        case 'lower':
          result = toLowerCase(text);
          break;
        case 'upper':
          result = toUpperCase(text);
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
      showToast(`Converted to ${btn.textContent.trim()}`);
    });
  });
}
