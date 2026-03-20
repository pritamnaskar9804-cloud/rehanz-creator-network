/**
 * ═══════════════════════════════════════════════════════════
 *  REHAN'Z CREATOR NETWORK  ·  main.js
 *  Complete interaction layer for the agency website
 * ═══════════════════════════════════════════════════════════
 *
 *  Modules:
 *  1.  Smooth Scroll
 *  2.  Navigation — sticky, active-link highlighting, mobile drawer
 *  3.  Scroll Progress Bar
 *  4.  Scroll Reveal  (IntersectionObserver)
 *  5.  Staggered Reveal for grid children
 *  6.  Hero Orbital — mouse-parallax tilt
 *  7.  Marquee — pause on hover
 *  8.  Service Cards — keyboard & focus accessibility
 *  9.  Process Steps — sequential highlight on scroll
 * 10.  Why Cards — tilt-on-hover (CSS custom property)
 * 11.  Contact Form — full validation, field states, submit flow
 * 12.  Back-to-Top button
 * 13.  Custom cursor (desktop only)
 * 14.  Section Active Spy (highlights nav link as you scroll)
 * 15.  Footer Year  (auto-update copyright year)
 */

'use strict';

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const off = (el, ev, fn) => el && el.removeEventListener(ev, fn);

function throttle(fn, ms = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/* ─────────────────────────────────────────────
   1. SMOOTH SCROLL
   Intercepts all anchor clicks, scrolls to
   section accounting for fixed nav height.
───────────────────────────────────────────── */
function initSmoothScroll() {
  on(document, 'click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();

    const navH = ($('#nav') || {}).offsetHeight || 70;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;

    window.scrollTo({ top, behavior: 'smooth' });

    // close mobile menu if open
    closeMobileMenu();
  });
}

/* ─────────────────────────────────────────────
   2. NAVIGATION
   • Sticky solid on scroll
   • Mobile burger drawer
   • Trap focus inside open drawer
───────────────────────────────────────────── */
let mobileOpen = false;
let mobileDrawer = null;

function initNav() {
  const nav    = $('#nav');
  const burger = $('.nav__burger', nav);
  const menu   = $('.nav__menu',   nav);
  if (!nav) return;

  // ── Sticky
  const solidThreshold = 60;
  const onScroll = throttle(() => {
    nav.classList.toggle('nav--solid', window.scrollY > solidThreshold);
    // hide scroll hint after first scroll
    if (window.scrollY > 80) {
      const hint = $('.hero__scroll');
      if (hint) hint.style.opacity = '0';
    }
  }, 80);
  on(window, 'scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // ── Mobile burger
  if (!burger || !menu) return;

  // Build a full-screen mobile drawer
  mobileDrawer = document.createElement('div');
  mobileDrawer.className = 'mobile-drawer';
  mobileDrawer.setAttribute('aria-hidden', 'true');
  mobileDrawer.innerHTML = `
    <button class="drawer__close" aria-label="Close menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6"  y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <nav class="drawer__nav">
      <a href="#about"    class="drawer__link">About</a>
      <a href="#services" class="drawer__link">Services</a>
      <a href="#process"  class="drawer__link">Process</a>
      <a href="#contact"  class="drawer__link drawer__link--cta">Get In Touch</a>
    </nav>
    <div class="drawer__footer">
      <span>Rehan'Z Creator Network</span>
      <span>hello@rehanzcreatorsnetwork.com</span>
    </div>
  `;
  document.body.appendChild(mobileDrawer);

  injectDrawerStyles();

  on(burger, 'click', toggleMobileMenu);
  on($('.drawer__close', mobileDrawer), 'click', closeMobileMenu);

  // close on overlay click
  on(mobileDrawer, 'click', e => {
    if (e.target === mobileDrawer) closeMobileMenu();
  });

  // ESC key
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && mobileOpen) closeMobileMenu();
  });
}

function toggleMobileMenu() {
  mobileOpen ? closeMobileMenu() : openMobileMenu();
}

function openMobileMenu() {
  mobileOpen = true;
  mobileDrawer.classList.add('is-open');
  mobileDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  animateBurgerOpen();
}

function closeMobileMenu() {
  if (!mobileOpen) return;
  mobileOpen = false;
  mobileDrawer.classList.remove('is-open');
  mobileDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  animateBurgerClose();
}

function animateBurgerOpen() {
  const spans = $$('.nav__burger span');
  if (spans[0]) spans[0].style.transform = 'translateY(7.5px) rotate(45deg)';
  if (spans[1]) spans[1].style.transform = 'translateY(-7.5px) rotate(-45deg)';
}

function animateBurgerClose() {
  const spans = $$('.nav__burger span');
  if (spans[0]) spans[0].style.transform = '';
  if (spans[1]) spans[1].style.transform = '';
}

function injectDrawerStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .mobile-drawer {
      position: fixed;
      inset: 0;
      z-index: 800;
      background: rgba(13,12,11,0.97);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 60px clamp(24px, 8vw, 80px);
      opacity: 0;
      pointer-events: none;
      transform: translateX(40px);
      transition: opacity 0.35s ease, transform 0.35s ease;
    }
    .mobile-drawer.is-open {
      opacity: 1;
      pointer-events: all;
      transform: none;
    }
    .drawer__close {
      position: absolute;
      top: 24px; right: clamp(20px, 5vw, 60px);
      background: none; border: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      padding: 8px;
      transition: color 0.2s;
    }
    .drawer__close:hover { color: #fff; }
    .drawer__nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .drawer__link {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2.4rem, 7vw, 4rem);
      font-weight: 300;
      color: rgba(255,255,255,0.45);
      line-height: 1.2;
      letter-spacing: -0.02em;
      transition: color 0.2s, transform 0.2s;
      display: inline-block;
    }
    .drawer__link:hover {
      color: #fff;
      transform: translateX(8px);
    }
    .drawer__link--cta {
      color: #c9a84c;
      margin-top: 16px;
    }
    .drawer__footer {
      position: absolute;
      bottom: 36px;
      left: clamp(24px, 8vw, 80px);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .drawer__footer span {
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
    }
    .nav__burger span {
      transition: transform 0.28s cubic-bezier(0.16,1,0.3,1);
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────
   3. SCROLL PROGRESS BAR
   Thin gold line at very top of viewport.
───────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  Object.assign(bar.style, {
    position:   'fixed',
    top:        '0',
    left:       '0',
    height:     '2px',
    width:      '0%',
    background: 'linear-gradient(90deg, #1d4e40, #b8913b)',
    zIndex:     '9999',
    transition: 'width 0.1s linear',
    pointerEvents: 'none'
  });
  document.body.appendChild(bar);

  const update = throttle(() => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }, 60);

  on(window, 'scroll', update, { passive: true });
}

/* ─────────────────────────────────────────────
   4. SCROLL REVEAL
   Elements with class .reveal fade+slide up
   when they enter the viewport.
───────────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   5. STAGGERED GRID REVEALS
   Auto-assigns animation-delay to grid children
   so they cascade in rather than all at once.
───────────────────────────────────────────── */
function initStaggeredGrids() {
  const grids = [
    '.services__grid',
    '.why__grid',
    '.process__steps',
    '.about__pillars'
  ];

  grids.forEach(selector => {
    const grid = $(selector);
    if (!grid) return;

    const children = $$(':scope > *', grid);
    children.forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${i * 80}ms`;
    });
  });

  // Re-run reveal observer to pick up newly added .reveal elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

  $$('.reveal').forEach(el => {
    if (!el.classList.contains('revealed')) observer.observe(el);
  });
}

/* ─────────────────────────────────────────────
   6. HERO ORBITAL — MOUSE PARALLAX TILT
   The orbital responds subtly to mouse position,
   adding depth and life to the graphic.
───────────────────────────────────────────── */
function initOrbitalParallax() {
  const orbital = $('.hero__orbital');
  const hero    = $('.hero');
  if (!orbital || !hero) return;

  // Only on non-touch, larger screens
  if (window.matchMedia('(max-width: 1100px)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;

  const onMouseMove = (e) => {
    const rect   = hero.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    targetX      = clamp(dy * -6, -6, 6);   // tilt up/down
    targetY      = clamp(dx *  6, -6, 6);   // tilt left/right
  };

  function animate() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    orbital.style.transform =
      `perspective(800px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    rafId = requestAnimationFrame(animate);
  }

  on(hero, 'mousemove', onMouseMove);
  on(hero, 'mouseleave', () => { targetX = 0; targetY = 0; });

  rafId = requestAnimationFrame(animate);

  // Clean up if needed
  on(window, 'beforeunload', () => cancelAnimationFrame(rafId));
}

/* ─────────────────────────────────────────────
   7. MARQUEE — PAUSE ON HOVER
───────────────────────────────────────────── */
function initMarquee() {
  const marquee = $('.marquee');
  const track   = $('.marquee__track');
  if (!marquee || !track) return;

  on(marquee, 'mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  on(marquee, 'mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
}

/* ─────────────────────────────────────────────
   8. SERVICE CARDS — KEYBOARD ACCESSIBILITY
   Cards get role="article" and are focusable
   via keyboard with visible focus ring.
───────────────────────────────────────────── */
function initServiceCards() {
  $$('.svc-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'article');

    // Enter/Space to "activate" — same visual as hover
    on(card, 'keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('svc-card--active');
        setTimeout(() => card.classList.remove('svc-card--active'), 600);
      }
    });
  });

  // Inject focus ring style
  const style = document.createElement('style');
  style.textContent = `
    .svc-card:focus-visible {
      outline: 2px solid #b8913b;
      outline-offset: -2px;
    }
    .svc-card--active {
      background: rgba(255,255,255,0.05) !important;
      transition: background 0.15s ease !important;
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────
   9. PROCESS STEPS — SEQUENTIAL SCROLL HIGHLIGHT
   As each step enters view, it pulses its
   number badge to draw the eye through the flow.
───────────────────────────────────────────── */
function initProcessSteps() {
  const steps = $$('.step');
  if (!steps.length) return;

  const style = document.createElement('style');
  style.textContent = `
    .step__num {
      transition: transform 0.4s cubic-bezier(0.16,1,0.3,1),
                  box-shadow 0.4s ease,
                  background 0.4s ease;
    }
    .step.step--active .step__num {
      transform: scale(1.15);
      box-shadow: 0 0 0 8px rgba(29,78,64,0.18);
    }
    .step__body {
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('step--active');
        setTimeout(() => entry.target.classList.remove('step--active'), 1200);
      }
    });
  }, { threshold: 0.5 });

  steps.forEach(step => observer.observe(step));
}

/* ─────────────────────────────────────────────
   10. WHY CARDS — SUBTLE 3D TILT ON HOVER
   Uses CSS custom properties so no JS-in-style
   calculations happen on every paint.
───────────────────────────────────────────── */
function initWhyCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    .why-card {
      transform: perspective(600px)
                 rotateX(var(--rx, 0deg))
                 rotateY(var(--ry, 0deg));
      transform-style: preserve-3d;
      will-change: transform;
      transition: transform 0.25s ease,
                  background 0.25s ease,
                  box-shadow 0.25s ease !important;
    }
    .why-card:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.07);
    }
  `;
  document.head.appendChild(style);

  $$('.why-card').forEach(card => {
    on(card, 'mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const rx    = ((y / rect.height) - 0.5) * -6;
      const ry    = ((x / rect.width)  - 0.5) *  6;
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
    });
    on(card, 'mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

/* ─────────────────────────────────────────────
   11. CONTACT FORM — FULL INTERACTION
   • Real-time inline validation
   • Field focus states (label float effect)
   • Character counter on textarea
   • Submit flow with loading → success → reset
───────────────────────────────────────────── */
function initContactForm() {
  const form = $('.cform');
  if (!form) return;

  injectFormStyles();

  const fields = {
    name:     { el: $('#c-name'),     validate: v => v.trim().length >= 2,          msg: 'Please enter your full name.' },
    email:    { el: $('#c-email'),    validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Please enter a valid email address.' },
    role:     { el: $('#c-role'),     validate: v => v !== '',                        msg: 'Please select an option.' },
    message:  { el: $('#c-msg'),      validate: v => v.trim().length >= 20,           msg: 'Please tell us a little more (at least 20 characters).' }
  };

  // ── Inline validation on blur
  Object.values(fields).forEach(({ el, validate, msg }) => {
    if (!el) return;
    on(el, 'blur', () => validateField(el, validate, msg));
    on(el, 'input', () => {
      if (el.classList.contains('field--error')) validateField(el, validate, msg);
    });
  });

  // ── Character counter for textarea
  const textarea = $('#c-msg');
  if (textarea) {
    const counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.textContent = '0 / 500';
    textarea.parentElement.appendChild(counter);

    on(textarea, 'input', () => {
      const len = textarea.value.length;
      const max = 500;
      counter.textContent = `${len} / ${max}`;
      counter.style.color = len > max * 0.9
        ? '#c0392b'
        : 'rgba(255,255,255,0.2)';
      if (len > max) textarea.value = textarea.value.slice(0, max);
    });
  }

  // ── Submit
  on(form, 'submit', handleSubmit);

  function handleSubmit(e) {
    e.preventDefault();

    // Validate all required fields
    let valid = true;
    Object.values(fields).forEach(({ el, validate, msg }) => {
      if (!el) return;
      if (!validateField(el, validate, msg)) valid = false;
    });
    if (!valid) {
      // Shake the form
      form.classList.add('form--shake');
      setTimeout(() => form.classList.remove('form--shake'), 500);
      // Focus first error
      const firstError = form.querySelector('.field--error');
      if (firstError) firstError.focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    setSubmitState(btn, 'loading');

    // Simulate async submission (replace with real fetch in production)
    setTimeout(() => {
      setSubmitState(btn, 'success');
      showSuccessMessage(form);
      // Reset after delay
      setTimeout(() => {
        form.reset();
        Object.values(fields).forEach(({ el }) => {
          if (el) {
            el.classList.remove('field--error', 'field--valid');
            const err = el.parentElement.querySelector('.field-error-msg');
            if (err) err.remove();
          }
        });
        if (textarea) {
          const counter = form.querySelector('.char-counter');
          if (counter) counter.textContent = '0 / 500';
        }
        setSubmitState(btn, 'default');
        const msg = form.querySelector('.form-success');
        if (msg) msg.remove();
      }, 5000);
    }, 1800);
  }
}

function validateField(el, validate, msg) {
  const isValid = validate(el.value);
  const parent  = el.parentElement;
  let errorEl   = parent.querySelector('.field-error-msg');

  if (!isValid) {
    el.classList.add('field--error');
    el.classList.remove('field--valid');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error-msg';
      errorEl.setAttribute('aria-live', 'polite');
      parent.appendChild(errorEl);
    }
    errorEl.textContent = msg;
    return false;
  } else {
    el.classList.remove('field--error');
    el.classList.add('field--valid');
    if (errorEl) errorEl.remove();
    return true;
  }
}

function setSubmitState(btn, state) {
  const states = {
    default: { text: 'Send Enquiry',     bg: 'var(--forest, #1d4e40)', disabled: false },
    loading: { text: 'Sending…',         bg: '#14382d',                 disabled: true  },
    success: { text: 'Enquiry Sent ✓',   bg: '#176347',                 disabled: true  }
  };
  const s = states[state];
  if (!s) return;
  btn.textContent     = s.text;
  btn.style.background = s.bg;
  btn.disabled        = s.disabled;
  btn.style.pointerEvents = s.disabled ? 'none' : '';

  if (state === 'loading') {
    btn.innerHTML = `
      <svg class="btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"
           style="animation:spin-btn 0.8s linear infinite;vertical-align:middle;margin-right:8px">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>Sending…`;
  }
}

function showSuccessMessage(form) {
  const existing = form.querySelector('.form-success');
  if (existing) return;

  const msg = document.createElement('div');
  msg.className = 'form-success';
  msg.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12l3 3 5-5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <div>
      <strong>Your enquiry has been received.</strong>
      <p>We'll respond within 48 business hours.</p>
    </div>`;
  form.appendChild(msg);
}

function injectFormStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* field states */
    .cform__group input.field--error,
    .cform__group select.field--error,
    .cform__group textarea.field--error {
      border-color: rgba(192, 57, 43, 0.7) !important;
      box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.12) !important;
    }
    .cform__group input.field--valid,
    .cform__group select.field--valid,
    .cform__group textarea.field--valid {
      border-color: rgba(29, 78, 64, 0.65) !important;
    }
    .field-error-msg {
      display: block;
      font-size: 0.7rem;
      color: #e07060;
      margin-top: 5px;
      letter-spacing: 0.02em;
      font-weight: 400;
    }
    /* char counter */
    .char-counter {
      display: block;
      text-align: right;
      font-size: 0.65rem;
      color: rgba(255,255,255,0.2);
      margin-top: 4px;
      letter-spacing: 0.06em;
      font-family: 'DM Sans', system-ui, sans-serif;
    }
    /* shake animation */
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-6px); }
      40%     { transform: translateX(6px); }
      60%     { transform: translateX(-4px); }
      80%     { transform: translateX(4px); }
    }
    .form--shake { animation: shake 0.45s ease; }
    /* spinner */
    @keyframes spin-btn {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    /* success banner */
    .form-success {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 22px;
      background: rgba(29,78,64,0.18);
      border: 1px solid rgba(29,78,64,0.4);
      border-radius: 4px;
      color: rgba(255,255,255,0.85);
      animation: anim-fade-up-inner 0.4s ease both;
    }
    .form-success svg { color: #4caf82; flex-shrink: 0; }
    .form-success strong { display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 2px; }
    .form-success p  { font-size: 0.78rem; color: rgba(255,255,255,0.45); margin: 0; }
    @keyframes anim-fade-up-inner {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:none; }
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────
   12. BACK TO TOP BUTTON
   Appears after scrolling 40% of the page.
───────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className   = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
      <polyline points="18 15 12 9 6 15"/>
    </svg>`;
  document.body.appendChild(btn);

  const style = document.createElement('style');
  style.textContent = `
    .back-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 600;
      width: 46px; height: 46px;
      border-radius: 50%;
      background: var(--forest, #1d4e40);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(29,78,64,0.35);
      opacity: 0;
      transform: translateY(12px);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease;
    }
    .back-to-top:hover { background: #256655; }
    .back-to-top.is-visible {
      opacity: 1;
      transform: none;
      pointer-events: all;
    }
    @media (max-width: 600px) {
      .back-to-top { bottom: 20px; right: 20px; }
    }
  `;
  document.head.appendChild(style);

  const threshold = () => document.documentElement.scrollHeight * 0.3;

  const toggle = throttle(() => {
    btn.classList.toggle('is-visible', window.scrollY > threshold());
  }, 100);

  on(window, 'scroll', toggle, { passive: true });
  on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─────────────────────────────────────────────
   13. CUSTOM CURSOR (desktop only)
   A small trailing dot that follows the mouse.
   Changes shape over interactive elements.
───────────────────────────────────────────── */
function initCustomCursor() {
  // Only on genuine pointer devices
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(max-width: 1100px)').matches) return;

  const cursor  = document.createElement('div');
  cursor.className = 'rcn-cursor';
  const follower = document.createElement('div');
  follower.className = 'rcn-cursor-follower';
  document.body.append(cursor, follower);

  const style = document.createElement('style');
  style.textContent = `
    .rcn-cursor {
      position: fixed;
      top: 0; left: 0;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #1d4e40;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      transition: width 0.2s ease, height 0.2s ease, background 0.2s ease, opacity 0.3s ease;
      mix-blend-mode: multiply;
    }
    .rcn-cursor-follower {
      position: fixed;
      top: 0; left: 0;
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 1px solid rgba(29,78,64,0.35);
      pointer-events: none;
      z-index: 9997;
      transform: translate(-50%, -50%);
      transition: width 0.25s ease, height 0.25s ease, border-color 0.25s ease, opacity 0.3s ease;
    }
    body.cursor-hover .rcn-cursor {
      width: 12px; height: 12px;
      background: #b8913b;
    }
    body.cursor-hover .rcn-cursor-follower {
      width: 48px; height: 48px;
      border-color: rgba(184,145,59,0.4);
    }
    body.cursor-active .rcn-cursor {
      width: 6px; height: 6px;
    }
    * { cursor: none !important; }
  `;
  document.head.appendChild(style);

  let mx = -100, my = -100;
  let fx = -100, fy = -100;
  let rafId;

  on(document, 'mousemove', e => { mx = e.clientX; my = e.clientY; });
  on(document, 'mousedown', () => document.body.classList.add('cursor-active'));
  on(document, 'mouseup',   () => document.body.classList.remove('cursor-active'));

  // hover state on interactive elements
  const interactiveSelector = 'a, button, input, select, textarea, .svc-card, .why-card, .pillar, .btn';
  on(document, 'mouseover', e => {
    if (e.target.closest(interactiveSelector)) document.body.classList.add('cursor-hover');
  });
  on(document, 'mouseout', e => {
    if (e.target.closest(interactiveSelector)) document.body.classList.remove('cursor-hover');
  });

  function animateCursor() {
    cursor.style.left   = `${mx}px`;
    cursor.style.top    = `${my}px`;
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = `${fx}px`;
    follower.style.top  = `${fy}px`;
    rafId = requestAnimationFrame(animateCursor);
  }
  rafId = requestAnimationFrame(animateCursor);

  // Hide cursor when leaving window
  on(document, 'mouseleave', () => {
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  });
  on(document, 'mouseenter', () => {
    cursor.style.opacity   = '1';
    follower.style.opacity = '1';
  });
}

/* ─────────────────────────────────────────────
   14. ACTIVE NAV LINK (Section Spy)
   Highlights the nav link matching the section
   currently in the viewport.
───────────────────────────────────────────── */
function initSectionSpy() {
  const sections = $$('section[id], div[id]');
  const navLinks = $$('.nav__menu a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const style = document.createElement('style');
  style.textContent = `
    .nav__menu a.nav-active:not(.nav__pill) {
      color: var(--forest, #1d4e40) !important;
    }
    .nav__menu a.nav-active:not(.nav__pill)::after {
      content: '';
      display: block;
      height: 1.5px;
      background: var(--forest, #1d4e40);
      border-radius: 1px;
      margin-top: 2px;
    }
  `;
  document.head.appendChild(style);

  const navH = () => ($('#nav') || {}).offsetHeight || 70;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('nav-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: `-${navH() + 20}px 0px -50% 0px` });

  sections.forEach(s => observer.observe(s));
}

/* ─────────────────────────────────────────────
   15. FOOTER YEAR  (auto copyright)
───────────────────────────────────────────── */
function initFooterYear() {
  const el = document.querySelector('.footer__bottom p');
  if (!el) return;
  el.textContent = el.textContent.replace(/\d{4}/, new Date().getFullYear());
}

/* ─────────────────────────────────────────────
   INIT — run everything when DOM is ready
───────────────────────────────────────────── */
function init() {
  initSmoothScroll();
  initNav();
  initScrollProgress();
  initScrollReveal();
  initStaggeredGrids();
  initOrbitalParallax();
  initMarquee();
  initServiceCards();
  initProcessSteps();
  initWhyCardTilt();
  initContactForm();
  initBackToTop();
  initCustomCursor();
  initSectionSpy();
  initFooterYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
