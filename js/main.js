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

let supabaseClient = null;
let supabaseConfigPromise = null;

function getSupabaseConfig() {
  if (!supabaseConfigPromise) {
    // Determine the base path to fetch the local fallback (in case we are in subdirectories)
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    const pathPrefix = window.location.pathname.endsWith('index.html') ? '../'.repeat(depth - 1) : '../'.repeat(depth);
    const localConfigPath = (pathPrefix || '') + 'js/local-config.json';

    supabaseConfigPromise = fetch('/api/supabase-config')
      .then(res => {
        if (!res.ok) throw new Error('Vercel serverless function config not found');
        return res.json();
      })
      .then(data => {
        if (!data.supabaseUrl || !data.supabaseKey) {
          throw new Error('Supabase credentials missing in serverless environment');
        }
        return data;
      })
      .catch(err => {
        console.warn('Failed to load credentials from Vercel Serverless Function, trying local config fallback:', err.message);
        // Fallback: fetch local uncommitted config file
        return fetch(localConfigPath)
          .then(res => {
            if (!res.ok) throw new Error('Local config file not found');
            return res.json();
          })
          .catch(localErr => {
            console.error('Failed to load local config fallback:', localErr.message);
            // Hardcoded developer fallback as a last resort
            return {
              supabaseUrl: 'https://xldublyrjqnlbyfwjpwd.supabase.co',
              supabaseKey: 'sb_publishable_yjD30uSZL1QRD2_t3_JCTg_lqMExOhT'
            };
          });
      });
  }
  return supabaseConfigPromise;
}

function loadSupabase(callback) {
  if (window.supabase) {
    if (supabaseClient) {
      if (callback) callback(supabaseClient);
      return;
    }
    getSupabaseConfig().then(config => {
      if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
      }
      if (callback) callback(supabaseClient);
    });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => {
    getSupabaseConfig().then(config => {
      if (window.supabase && !supabaseClient) {
        supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
      }
      if (callback) callback(supabaseClient);
    });
  };
  document.head.appendChild(script);
}

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

  // ---- Homepage Tool Category Filter Swapper ----
  const filterTabs = document.querySelector('.filter-tabs');
  const toolCards = document.querySelectorAll('.tools-grid .tool-card');

  if (filterTabs && toolCards.length > 0) {
    const tabs = filterTabs.querySelectorAll('.filter-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        // Remove active state from all tabs
        tabs.forEach(function (t) {
          t.classList.remove('active');
        });
        // Add active state to selected tab
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');

        toolCards.forEach(function (card) {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
  
  // ---- Contact Form Init ----
  initContactForm();

}

function initContactForm() {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    loadSupabase(async function (supabase) {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{ name: name, email: email, message: message }]);

      if (error) {
        console.error('Failed to submit message:', error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        if (window.showToast) {
          window.showToast('Oops! Something went wrong. Please try again.');
        } else {
          alert('Oops! Something went wrong while sending your message. Please try again.');
        }
      } else {
        // Success Transition: Fade out the form inputs
        contactForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        contactForm.style.opacity = '0';
        contactForm.style.transform = 'translateY(-10px)';

        setTimeout(() => {
          contactForm.innerHTML = `
            <div class="contact-success-card">
              <div class="success-checkmark-circle">
                <svg class="success-checkmark-svg" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3>Thank you!</h3>
              <p>Your message has been sent successfully. We will get back to you within 24–48 hours.</p>
            </div>
          `;
          
          // Re-enable opacity and slide success card in
          contactForm.style.opacity = '1';
          contactForm.style.transform = 'translateY(0)';
          
          const card = contactForm.querySelector('.contact-success-card');
          requestAnimationFrame(() => {
            card.classList.add('show');
          });

          // Smoothly fade out and remove the note text below the form
          const note = document.querySelector('.form-note');
          if (note) {
            note.style.transition = 'opacity 0.4s ease';
            note.style.opacity = '0';
            setTimeout(() => note.remove(), 400);
          }
        }, 400);
      }
    });
  });
}

// Robust ready-state initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain);
} else {
  initMain();
}

