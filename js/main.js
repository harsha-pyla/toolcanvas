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

  // Defer database-reliant/heavy ratings widgets initialization to avoid blocking the main thread during initial load
  window.addEventListener('load', function () {
    setTimeout(function () {
      // ---- Tool Rating Widget Init ----
      initToolRating();

      // ---- Site Overall Rating Init ----
      initOverallWebsiteRating();

      // ---- Homepage Tool Ratings Grid Init ----
      initHomepageToolRatings();
    }, 50);
  });
}

function initToolRating() {
  const ratingWrapper = document.querySelector('.tool-rating-wrapper');
  if (!ratingWrapper) return;

  const toolKey = ratingWrapper.getAttribute('data-tool-key');
  const stars = ratingWrapper.querySelectorAll('.star-btn');
  const ratingText = ratingWrapper.querySelector('.tool-rating-text');
  const feedback = ratingWrapper.querySelector('.tool-rating-feedback');

  if (!toolKey || stars.length === 0) return;

  const storageKey = 'tool-rating-' + toolKey;
  const savedRating = localStorage.getItem(storageKey);

  const ratingValueEl = ratingWrapper.querySelector('.rating-value');
  const ratingCountEl = ratingWrapper.querySelector('.rating-count');

  if (ratingValueEl) ratingValueEl.textContent = '...';
  if (ratingCountEl) ratingCountEl.textContent = '...';

  let totalPoints = 0;
  let totalReviews = 0;

  function highlightStars(val) {
    stars.forEach(star => {
      const starVal = parseInt(star.getAttribute('data-value'), 10);
      if (starVal <= val) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  function updateUI() {
    const avg = totalReviews > 0 ? (totalPoints / totalReviews) : 0.0;
    
    if (ratingValueEl) ratingValueEl.textContent = avg.toFixed(1);
    if (ratingCountEl) ratingCountEl.textContent = totalReviews.toLocaleString();
    
    // Highlight user's own local vote if rated, else keep empty
    if (localStorage.getItem(storageKey)) {
      highlightStars(parseInt(localStorage.getItem(storageKey), 10));
    } else {
      highlightStars(0);
    }
  }

  // Pre-fill user's own local vote if rated, or initialize to 0
  if (savedRating) {
    ratingWrapper.classList.add('rated');
    highlightStars(parseInt(savedRating, 10));
  } else {
    highlightStars(0);
  }

  // Setup hover and select listeners
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      if (localStorage.getItem(storageKey)) return;
      const hoverVal = parseInt(star.getAttribute('data-value'), 10);
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'), 10);
        if (sVal <= hoverVal) {
          s.classList.add('hover');
        } else {
          s.classList.remove('hover');
        }
      });
    });

    star.addEventListener('mouseleave', () => {
      if (localStorage.getItem(storageKey)) return;
      stars.forEach(s => s.classList.remove('hover'));
    });

    star.addEventListener('click', () => {
      if (localStorage.getItem(storageKey)) return;
      const clickedVal = parseInt(star.getAttribute('data-value'), 10);
      
      // Submit to Supabase
      loadSupabase(async function (supabase) {
        const { error } = await supabase
          .from('tool_ratings')
          .insert([{ tool_key: toolKey, rating: clickedVal }]);
        
        if (error) {
          console.error('Failed to submit rating:', error.message);
        }
      });

      localStorage.setItem(storageKey, clickedVal);
      ratingWrapper.classList.add('rated');
      
      highlightStars(clickedVal);
      stars.forEach(s => s.classList.remove('hover'));

      // Spring pop animation
      stars.forEach((s, idx) => {
        if (idx < clickedVal) {
          setTimeout(() => {
            s.style.transform = 'scale(1.4)';
            s.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            setTimeout(() => {
              s.style.transform = 'scale(1)';
            }, 150);
          }, idx * 50);
        }
      });

      // Update locally instantly
      totalReviews += 1;
      totalPoints += clickedVal;
      updateUI();

      if (ratingText) {
        ratingText.style.opacity = '0';
        setTimeout(() => {
          ratingText.style.display = 'none';
        }, 200);
      }

      if (feedback) {
        setTimeout(() => {
          feedback.style.display = 'block';
          feedback.style.opacity = '0';
          feedback.style.transform = 'translateY(5px)';
          feedback.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
          });
        }, 200);
      }

      if (window.showToast) {
        window.showToast('Thank you for your feedback!');
      }

      setTimeout(() => {
        if (feedback) {
          feedback.style.opacity = '0';
          feedback.style.transform = 'translateY(-5px)';
          feedback.style.transition = 'all 0.3s ease';
          setTimeout(() => {
            feedback.style.display = 'none';
          }, 300);
        }

        setTimeout(() => {
          if (ratingText) {
            ratingText.style.display = 'block';
            ratingText.style.opacity = '0';
            ratingText.style.transform = 'translateY(5px)';
            ratingText.style.transition = 'all 0.3s ease';
            requestAnimationFrame(() => {
              ratingText.style.opacity = '1';
              ratingText.style.transform = 'translateY(0)';
            });
          }
        }, 300);
      }, 10000);
    });
  });

  // Load live rating stats from Supabase
  loadSupabase(async function (supabase) {
    // Try fetching from the aggregated summary view first (immune to pagination cap)
    const { data: summaryData, error: summaryError } = await supabase
      .from('tool_ratings_summary')
      .select('average_rating, total_reviews')
      .eq('tool_key', toolKey)
      .maybeSingle();

    if (!summaryError && summaryData) {
      totalReviews = summaryData.total_reviews;
      totalPoints = summaryData.average_rating * summaryData.total_reviews;
      updateUI();
      return;
    }

    // Fallback: fetch raw ratings (subject to PostgREST 1000 cap)
    const { data, error } = await supabase
      .from('tool_ratings')
      .select('rating')
      .eq('tool_key', toolKey);

    if (error) {
      console.error('Failed to load live ratings for tool:', error);
      return;
    }

    if (data) {
      totalReviews = data.length;
      totalPoints = data.reduce((sum, row) => sum + row.rating, 0);
    }
    updateUI();
  });
}

function initOverallWebsiteRating() {
  const overallEl = document.getElementById('site-overall-rating');
  if (!overallEl) return;

  const ratingValueEl = overallEl.querySelector('.value');
  const ratingCountEl = overallEl.querySelector('.count');
  if (ratingValueEl) ratingValueEl.textContent = '...';
  if (ratingCountEl) ratingCountEl.textContent = '...';

  function updateOverallRatingUI(averageRating, totalReviews) {
    if (ratingValueEl) {
      ratingValueEl.textContent = averageRating.toFixed(1);
    }
    if (ratingCountEl) {
      ratingCountEl.textContent = totalReviews.toLocaleString();
    }

    const starsInner = overallEl.querySelector('.stars-inner');
    if (starsInner) {
      const percentage = (averageRating / 5) * 100;
      starsInner.style.width = percentage.toFixed(1) + '%';
    }
  }

  // Fetch and calculate dynamically from Supabase
  loadSupabase(async function (supabase) {
    // 1. Try fetching from the aggregated summary view (efficient, bypasses 1000 row limit)
    const { data, error } = await supabase
      .from('tool_ratings_summary')
      .select('*');

    if (!error && data) {
      if (data.length === 0) {
        updateOverallRatingUI(0.0, 0);
        return;
      }

      let totalReviews = 0;
      let totalPoints = 0;

      data.forEach(row => {
        totalReviews += row.total_reviews;
        totalPoints += (row.average_rating * row.total_reviews);
      });

      const averageRating = totalReviews > 0 ? (totalPoints / totalReviews) : 0.0;
      updateOverallRatingUI(averageRating, totalReviews);
      return;
    }

    // 2. Fallback: fetch raw ratings (subject to PostgREST 1000 pagination cap)
    console.warn('Could not query tool_ratings_summary view, falling back to raw table query:', error);
    const { data: rawData, error: rawError } = await supabase
      .from('tool_ratings')
      .select('rating');

    if (rawError || !rawData) {
      console.error('Failed to load raw ratings from Supabase:', rawError);
      updateOverallRatingUI(0.0, 0);
      return;
    }

    if (rawData.length === 0) {
      updateOverallRatingUI(0.0, 0);
      return;
    }

    const totalReviews = rawData.length;
    const totalPoints = rawData.reduce((acc, row) => acc + row.rating, 0);
    const averageRating = totalPoints / totalReviews;

    updateOverallRatingUI(averageRating, totalReviews);
  });
}

function initHomepageToolRatings() {
  const toolsGrid = document.querySelector('.tools-grid');
  if (!toolsGrid) return;

  // Render initial loading badges on the homepage tool cards
  const cards = toolsGrid.querySelectorAll('.tool-card');
  cards.forEach(card => {
    let badge = card.querySelector('.tool-card__rating');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'tool-card__rating';
      const desc = card.querySelector('.tool-card__desc');
      if (desc) {
        desc.parentNode.insertBefore(badge, desc.nextSibling);
      } else {
        card.appendChild(badge);
      }
    }
    badge.innerHTML = `<span class="star">★</span> <span class="rating-value">...</span>/5 <span class="rating-count">(... reviews)</span>`;
  });

  loadSupabase(async function (supabase) {
    let summaries = {};

    // 1. Try querying the view
    let { data: viewData, error: viewError } = await supabase
      .from('tool_ratings_summary')
      .select('*');

    if (!viewError && viewData) {
      viewData.forEach(row => {
        summaries[row.tool_key] = {
          average: row.average_rating,
          count: row.total_reviews
        };
      });
    } else {
      // 2. Fallback: query raw ratings and group in memory
      let { data: rawData, error: rawError } = await supabase
        .from('tool_ratings')
        .select('tool_key, rating');

      if (!rawError && rawData) {
        let grouped = {};
        rawData.forEach(row => {
          if (!grouped[row.tool_key]) {
            grouped[row.tool_key] = [];
          }
          grouped[row.tool_key].push(row.rating);
        });

        for (let key in grouped) {
          let list = grouped[key];
          let avg = list.reduce((a, b) => a + b, 0) / list.length;
          summaries[key] = {
            average: parseFloat(avg.toFixed(1)),
            count: list.length
          };
        }
      }
    }

    // Update the DOM cards
    const cards = toolsGrid.querySelectorAll('.tool-card');
    cards.forEach(card => {
      const link = card.querySelector('a.stretched-link');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Extract toolKey from folder structure (e.g. "link-in-bio/" or "experience-templates/")
      const match = href.match(/([^\/]+)\/?$/);
      if (!match) return;
      const toolKey = match[1];

      const summary = summaries[toolKey] || { average: 0.0, count: 0 };

      let badge = card.querySelector('.tool-card__rating');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'tool-card__rating';
        const desc = card.querySelector('.tool-card__desc');
        if (desc) {
          desc.parentNode.insertBefore(badge, desc.nextSibling);
        } else {
          card.appendChild(badge);
        }
      }

      badge.innerHTML = `<span class="star">★</span> <span class="rating-value">${summary.average.toFixed(1)}</span>/5 <span class="rating-count">(${summary.count.toLocaleString()} reviews)</span>`;
    });
  });
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

// Refresh ratings when navigating back via browser history (bfcache)
window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    initOverallWebsiteRating();
    initHomepageToolRatings();
  }
});
