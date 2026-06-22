/* =========================================
   ToolCanvas — Main JavaScript
   Mobile navigation + utility functions
   ========================================= */

// ---- Toast notification ----
window.showToast = function (message, duration) {
  duration = duration || 2500;
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('show');
  });

  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, duration);
};

function initMain() {
  // ---- Mobile Navigation Toggle ----
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    // Prevent duplicate event listener binding
    if (navToggle.dataset.menuBound) return;
    navToggle.dataset.menuBound = "true";

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navToggle.classList.toggle('active');
      siteNav.classList.toggle('open');
    });

    // Toggle dropdowns on mobile click
    siteNav.querySelectorAll('.nav-item.dropdown > a').forEach(function (dropdownLink) {
      dropdownLink.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault(); // Prevent navigating
          e.stopPropagation();
          const parent = dropdownLink.parentElement;
          
          // Close other dropdowns
          siteNav.querySelectorAll('.nav-item.dropdown').forEach(function (item) {
            if (item !== parent) {
              item.classList.remove('open-mobile');
            }
          });
          
          parent.classList.toggle('open-mobile');
        }
      });
    });

    // Close nav when clicking a link (excluding dropdown parents on mobile)
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (link.parentElement.classList.contains('dropdown') && window.innerWidth <= 768) {
          return; // Do not close the main navigation menu
        }
        navToggle.classList.remove('active');
        siteNav.classList.remove('open');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !siteNav.contains(e.target)) {
        navToggle.classList.remove('active');
        siteNav.classList.remove('open');
        siteNav.querySelectorAll('.nav-item.dropdown').forEach(function (item) {
          item.classList.remove('open-mobile');
        });
      }
    });
  }

  // ---- Set active nav link ----
  var currentPath = window.location.pathname;
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPath || (currentPath.endsWith('/') && href === currentPath + 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Robust ready-state initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain);
} else {
  initMain();
}
