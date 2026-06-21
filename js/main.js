/* =========================================
   ToolCanvas — Main JavaScript
   Mobile navigation + utility functions
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Mobile Navigation Toggle ----
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      siteNav.classList.toggle('open');
    });

    // Close nav when clicking a link
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        siteNav.classList.remove('open');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !siteNav.contains(e.target)) {
        navToggle.classList.remove('active');
        siteNav.classList.remove('open');
      }
    });
  }

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

  // ---- Set active nav link ----
  var currentPath = window.location.pathname;
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPath || (currentPath.endsWith('/') && href === currentPath + 'index.html')) {
      link.classList.add('active');
    }
  });
});
