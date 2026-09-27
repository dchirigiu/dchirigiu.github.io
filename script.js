/* Daniel Chirigiu — Portfolio
   Vanilla JS, no libraries. Loaded with `defer`.
   Progressive enhancement: every feature no-ops gracefully without it. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function scrollOpts(behavior) {
    return { behavior: reduceMotion.matches ? 'auto' : (behavior || 'smooth') };
  }

  /* ------------------------------------------------------------------
     Mobile menu (spec §2.6): slide-in overlay, Escape/backdrop close
     ------------------------------------------------------------------ */
  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var backdrop = document.querySelector('.nav-backdrop');
    var nav = document.getElementById('nav-list');
    if (!toggle || !nav) return;

    if (backdrop) backdrop.hidden = false;

    function setOpen(open) {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        var first = nav.querySelector('a');
        if (first) first.focus();
      } else {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('menu-open'));
    });

    if (backdrop) {
      backdrop.addEventListener('click', function () { setOpen(false); });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        setOpen(false);
      }
    });

    // Close when a nav link is chosen (same-page anchors included)
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.innerWidth < 900) setOpen(false);
    });

    // Reset state when crossing the desktop breakpoint
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) {
      if (e.matches && document.body.classList.contains('menu-open')) {
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------------------
     Featured projects slider (spec §2.1, §3.3)
     CSS scroll-snap does the physics; JS adds centering detection,
     dots, arrows, keyboard and mouse-drag support. No libraries.
     ------------------------------------------------------------------ */
  function initSlider() {
    var track = document.getElementById('slider-track');
    if (!track) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll('.slider-card'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.slider-dot'));
    var prevBtn = document.querySelector('.slider-prev');
    var nextBtn = document.querySelector('.slider-next');
    var current = 0;
    var raf = null;

    function centerOf(el) {
      return el.offsetLeft + el.offsetWidth / 2;
    }

    function indexFromScroll() {
      var target = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      cards.forEach(function (card, i) {
        var d = Math.abs(centerOf(card) - target);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function scrollToCard(i, instant) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      var card = cards[i];
      var left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({
        left: left,
        behavior: instant || reduceMotion.matches ? 'auto' : 'smooth'
      });
    }

    function setActive(i, fromScroll) {
      if (i === current && fromScroll) { /* still update on first run */ }
      current = i;
      cards.forEach(function (card, j) {
        card.classList.toggle('centered', j === i);
      });
      dots.forEach(function (dot, j) {
        if (j === i) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    // Center detection: IntersectionObserver with a zero-height line at
    // the track's horizontal center (spec §3.3). Fallback rAF check on
    // scroll keeps state exact for programmatic + drag scrolls.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(cards.indexOf(entry.target), true);
          }
        });
      }, {
        root: track,
        rootMargin: '0% -50% 0% -50%',
        threshold: 0
      });
      cards.forEach(function (card) { io.observe(card); });
    }

    track.addEventListener('scroll', function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = null;
        setActive(indexFromScroll(), true);
      });
    }, { passive: true });

    if (prevBtn) prevBtn.addEventListener('click', function () { scrollToCard(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollToCard(current + 1); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { scrollToCard(i); });
    });

    // Keyboard: arrows navigate when focus is inside the slider
    var region = track.closest('section');
    if (region) {
      region.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToCard(current - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); scrollToCard(current + 1); }
      });
    }

    // Mouse drag (desktop). Touch uses native momentum scrolling.
    var dragging = false;
    var dragMoved = false;
    var startX = 0;
    var startScroll = 0;

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      dragMoved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
    });

    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        dragMoved = true;
        track.style.scrollSnapType = 'none';
        track.style.scrollBehavior = 'auto';
        track.scrollLeft = startScroll - dx;
      }
    });

    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      track.style.scrollSnapType = '';
      track.style.scrollBehavior = '';
      if (dragMoved) scrollToCard(indexFromScroll());
    });

    // Suppress link clicks after a drag gesture
    track.addEventListener('click', function (e) {
      if (dragMoved) {
        e.preventDefault();
        e.stopPropagation();
        dragMoved = false;
      }
    }, true);

    // Initial state: center the featured card (JARVIS, index 1)
    scrollToCard(1, true);
    setActive(1, false);
  }

  /* ------------------------------------------------------------------
     Scroll reveal (spec §2.1 Quick Stats): fade-up, 100ms stagger
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var group = el.parentElement;
        var siblings = group ? Array.prototype.slice.call(group.querySelectorAll('[data-reveal]')) : [el];
        var i = siblings.indexOf(el);
        el.style.transitionDelay = (i > 0 ? i * 100 : 0) + 'ms';
        el.classList.add('in-view');
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  function init() {
    initMenu();
    initSlider();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
