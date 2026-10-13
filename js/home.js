import { initCommonUI, showToast } from '/js/common.js';

export function init() {
  initHomeInteractions();
}

function initHomeInteractions() {
  // Click to copy on example preview boxes
  document.querySelectorAll('.preview-output-box').forEach(box => {
    box.addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = box.innerText.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast('Example copied to clipboard!');
      } catch (_) {
        showToast('Example selected');
      }
    });
  });

  // Card click navigates to tool
  document.querySelectorAll('.tool-preview-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('.preview-output-box')) return;
      const titleLink = card.querySelector('.card-title');
      if (titleLink && titleLink.href) {
        titleLink.click();
      }
    });
  });
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
