/**
 * Alsina Sunshine Portfolio — Core Script
 * Multi-page navigation, mobile drawer, Web Audio preview player,
 * sticky mini-player bar, music filtering, lyrics accordion,
 * booking form validation, clipboard utilities & scroll animations.
 */

(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     DOM References
     ----------------------------------------------------------------------- */
  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav__link, .footer__link');
  const revealElements = document.querySelectorAll('.reveal');

  /* -----------------------------------------------------------------------
     Multi-Page Active Navigation Detection
     ----------------------------------------------------------------------- */
  function highlightCurrentPageNav() {
    const currentPath = window.location.pathname;
    let pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    if (pageName === '' || pageName === '/') pageName = 'index.html';

    // Highlight matching link in desktop and mobile menus
    document.querySelectorAll('.nav__link').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      // Extract filename from href (e.g. "about.html#team" -> "about.html")
      const targetFile = href.split('#')[0] || 'index.html';

      if (
        (pageName === 'index.html' && (targetFile === 'index.html' || targetFile === './' || targetFile === '')) ||
        (pageName !== 'index.html' && targetFile === pageName)
      ) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  highlightCurrentPageNav();

  /* -----------------------------------------------------------------------
     Mobile Menu Drawer
     ----------------------------------------------------------------------- */
  function openMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  }

  if (navToggle) {
    navToggle.addEventListener('click', toggleMenu);
  }

  // Close menu when pressing Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Close mobile menu when clicking any nav link
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  /* -----------------------------------------------------------------------
     Smooth Scroll (For in-page anchors on the same page)
     ----------------------------------------------------------------------- */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (!href) return;

      // If it's a pure hash link on current page (e.g. "#music")
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          history.pushState(null, '', href);
        }
      }
    });
  });

  /* -----------------------------------------------------------------------
     Header Scroll Backdrop Effect
     ----------------------------------------------------------------------- */
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* -----------------------------------------------------------------------
     In-Page Section Intersection Observer (For Index.html)
     ----------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 1) {
    const navObserverOptions = {
      root: null,
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
    };

    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          // Only update hash active if user is actively scrolling on index.html
          const currentPath = window.location.pathname;
          const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
          if (pageName === '' || pageName === 'index.html') {
            document.querySelectorAll('.nav__link').forEach(function (link) {
              const href = link.getAttribute('href');
              if (href === '#' + id || href === 'index.html#' + id) {
                link.classList.add('active');
              }
            });
          }
        }
      });
    }, navObserverOptions);

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* -----------------------------------------------------------------------
     Scroll Reveal Animation (Intersection Observer)
     ----------------------------------------------------------------------- */
  const revealObserverOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* -----------------------------------------------------------------------
     Toast Notification Utility
     ----------------------------------------------------------------------- */
  let toastEl = document.getElementById('toast-notification');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast-notification';
    toastEl.className = 'toast-notification';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.innerHTML = `
      <span class="toast-notification__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
      <span class="toast-notification__text">Copied to clipboard!</span>
    `;
    document.body.appendChild(toastEl);
  }

  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    const textEl = toastEl.querySelector('.toast-notification__text');
    if (textEl) textEl.textContent = message;

    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 3200);
  }

  // Clipboard copy buttons
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(function () {
          showToast(btn.getAttribute('data-copy-label') || 'Copied: ' + textToCopy);
        }).catch(function () {
          fallbackCopy(textToCopy);
        });
      } else {
        fallbackCopy(textToCopy);
      }
    });
  });

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!');
    } catch (err) {
      console.warn('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  }

  /* -----------------------------------------------------------------------
     Sticky Mini-Player Bar & Web Audio Synthesizer
     ----------------------------------------------------------------------- */
  let currentPlayingTrack = null;
  let currentTrackId = null;
  let audioCtx = null;
  let previewTimeout = null;
  let synthOscillators = [];
  let progressInterval = null;

  const playerBar = document.getElementById('player-bar');
  const playerBarTitle = document.getElementById('player-bar-title');
  const playerBarGenre = document.getElementById('player-bar-genre');
  const playerBarPlayBtn = document.getElementById('player-bar-play-btn');
  const playerBarCloseBtn = document.getElementById('player-bar-close-btn');
  const playerBarProgressFill = document.getElementById('player-bar-progress-fill');

  const playButtons = document.querySelectorAll('.music-card__play-btn');

  const trackMetadata = {
    'freetown-nights': {
      title: 'Freetown Nights',
      genre: 'Afrobeats Pop · 2026',
      notes: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99],
      tempo: 0.18,
      oscType: 'triangle'
    },
    'salone-pride': {
      title: 'Salone Pride',
      genre: 'Cultural Afrobeats · 2026',
      notes: [261.63, 329.63, 392.00, 440.00, 523.25, 392.00],
      tempo: 0.24,
      oscType: 'triangle'
    },
    'sunshine-riddim': {
      title: 'Sunshine Riddim',
      genre: 'Afro-Dancehall & Pop · 2026',
      notes: [329.63, 392.00, 440.00, 493.88, 587.33, 493.88],
      tempo: 0.19,
      oscType: 'triangle'
    },
    'sweet-melody': {
      title: 'Sweet Melody',
      genre: 'R&B / Soulful Pop · 2026',
      notes: [220.00, 277.18, 329.63, 415.30, 440.00],
      tempo: 0.32,
      oscType: 'sine'
    }
  };

  function stopCurrentAudio() {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    synthOscillators.forEach(function (node) {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    synthOscillators = [];

    // Reset play buttons on cards
    document.querySelectorAll('.music-card__play-btn').forEach(function (btn) {
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play preview');
      const icon = btn.querySelector('.music-card__play-icon');
      if (icon) {
        icon.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      }
    });

    document.querySelectorAll('.music-card').forEach(function (card) {
      card.classList.remove('is-active-track');
    });

    if (playerBarPlayBtn) {
      playerBarPlayBtn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      playerBarPlayBtn.setAttribute('aria-label', 'Play preview');
    }

    if (playerBarProgressFill) {
      playerBarProgressFill.style.width = '0%';
    }

    currentPlayingTrack = null;
    currentTrackId = null;
  }

  function playPreviewTone(trackId) {
    const meta = trackMetadata[trackId];
    if (!meta) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    try {
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const notes = meta.notes;
      const tempo = meta.tempo;
      const now = audioCtx.currentTime;
      const totalDuration = 12; // 12 second preview

      for (let loop = 0; loop < Math.floor(totalDuration / (notes.length * tempo)); loop++) {
        notes.forEach(function (freq, index) {
          const startTime = now + (loop * notes.length + index) * tempo;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = meta.oscType;
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + tempo * 0.9);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + tempo);
          synthOscillators.push(osc);
        });
      }

      // Update sticky player bar
      if (playerBar) {
        if (playerBarTitle) playerBarTitle.textContent = meta.title;
        if (playerBarGenre) playerBarGenre.textContent = meta.genre;
        if (playerBarPlayBtn) {
          playerBarPlayBtn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
          playerBarPlayBtn.setAttribute('aria-label', 'Pause preview');
        }
        playerBar.classList.add('is-active');
      }

      // Progress animation
      let startTimeMs = Date.now();
      if (playerBarProgressFill) {
        progressInterval = setInterval(function () {
          const elapsed = (Date.now() - startTimeMs) / 1000;
          const percent = Math.min(100, (elapsed / totalDuration) * 100);
          playerBarProgressFill.style.width = percent + '%';
        }, 100);
      }

      previewTimeout = setTimeout(function () {
        stopCurrentAudio();
      }, totalDuration * 1000);
    } catch (err) {
      console.warn('Audio preview unavailable:', err);
    }
  }

  playButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const card = button.closest('.music-card');
      const trackId = card ? card.getAttribute('data-track') : '';

      if (currentTrackId === trackId) {
        stopCurrentAudio();
      } else {
        stopCurrentAudio();
        currentTrackId = trackId;
        currentPlayingTrack = button;
        button.classList.add('is-playing');
        button.setAttribute('aria-label', 'Pause preview');
        if (card) {
          card.classList.add('is-active-track');
        }
        const icon = button.querySelector('.music-card__play-icon');
        if (icon) {
          icon.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        }
        playPreviewTone(trackId);
      }
    });
  });

  // Player Bar Play/Pause toggle
  if (playerBarPlayBtn) {
    playerBarPlayBtn.addEventListener('click', function () {
      if (currentTrackId) {
        stopCurrentAudio();
      } else {
        // Play default first track if none active
        const firstBtn = document.querySelector('.music-card__play-btn');
        if (firstBtn) firstBtn.click();
      }
    });
  }

  // Player Bar Close button
  if (playerBarCloseBtn) {
    playerBarCloseBtn.addEventListener('click', function () {
      stopCurrentAudio();
      if (playerBar) playerBar.classList.remove('is-active');
    });
  }

  /* -----------------------------------------------------------------------
     Music Genre Filter (Music Page)
     ----------------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const musicCards = document.querySelectorAll('.music-card');

  if (filterBtns.length > 0 && musicCards.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        musicCards.forEach(function (card) {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = 'flex';
            setTimeout(function () {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 30);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            setTimeout(function () {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  /* -----------------------------------------------------------------------
     Lyrics & Behind-The-Song Accordion (Music Page)
     ----------------------------------------------------------------------- */
  const lyricsToggles = document.querySelectorAll('.lyrics-toggle');
  lyricsToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      const parentBody = toggle.closest('.music-card__body');
      if (!parentBody) return;
      const lyricsBox = parentBody.querySelector('.lyrics-box');
      if (!lyricsBox) return;

      const isOpening = !lyricsBox.classList.contains('is-open');
      lyricsBox.classList.toggle('is-open', isOpening);
      toggle.classList.toggle('is-open', isOpening);
      toggle.setAttribute('aria-expanded', isOpening ? 'true' : 'false');
      const textSpan = toggle.querySelector('.lyrics-toggle__text');
      if (textSpan) {
        textSpan.textContent = isOpening ? 'Hide Lyrics & Story' : 'View Lyrics & Story';
      }
    });
  });

  /* -----------------------------------------------------------------------
     Booking Form Validation & Submission (Booking Page)
     ----------------------------------------------------------------------- */
  const bookingForm = document.getElementById('booking-form');
  const formSuccessBanner = document.getElementById('booking-success-banner');
  const sendAnotherBtn = document.getElementById('send-another-btn');

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;
      const requiredInputs = bookingForm.querySelectorAll('[required]');

      requiredInputs.forEach(function (input) {
        const val = input.value.trim();
        const feedback = input.parentElement.querySelector('.form-feedback');

        if (!val) {
          isValid = false;
          input.classList.add('is-invalid');
          if (feedback) feedback.classList.add('is-visible');
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          isValid = false;
          input.classList.add('is-invalid');
          if (feedback) {
            feedback.textContent = 'Please enter a valid email address.';
            feedback.classList.add('is-visible');
          }
        } else {
          input.classList.remove('is-invalid');
          if (feedback) feedback.classList.remove('is-visible');
        }
      });

      if (!isValid) {
        const firstError = bookingForm.querySelector('.is-invalid');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate sending inquiry
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/>
            <path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          Sending Inquiry...
        `;
      }

      setTimeout(function () {
        bookingForm.reset();
        bookingForm.style.display = 'none';
        if (formSuccessBanner) {
          formSuccessBanner.classList.add('is-visible');
          formSuccessBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showToast('Booking inquiry submitted successfully!');
      }, 900);
    });

    // Remove invalid style on input change
    bookingForm.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('is-invalid');
        const feedback = field.parentElement.querySelector('.form-feedback');
        if (feedback) feedback.classList.remove('is-visible');
      });
    });

    if (sendAnotherBtn) {
      sendAnotherBtn.addEventListener('click', function () {
        if (formSuccessBanner) formSuccessBanner.classList.remove('is-visible');
        bookingForm.style.display = 'block';
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

})();
