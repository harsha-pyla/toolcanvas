import { initCommonUI, initSharedWorkspace, updateLiveCounters, showToast } from '/js/common.js';
import {
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase
} from '/js/caseUtils.js';

export function init() {
  initSharedWorkspace({
    filename: 'code-case-converted.txt',
    onSample: () => {
      const textarea = document.getElementById('main-textarea');
      if (textarea) {
        textarea.value = "user_account_id\nfirst_name\ncreated_at_timestamp\nis_active_subscriber\napi-v1-customer-profile";
      }
    }
  });

  initCodeCaseConverter();

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

function initCodeCaseConverter() {
  const textarea = document.getElementById('main-textarea');
  if (!textarea) return;

  document.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-case');
      const text = textarea.value;
      if (!text) {
        showToast('Enter code identifiers first');
        return;
      }

      let result = text;
      switch (type) {
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
