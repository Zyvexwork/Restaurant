/* ═══════════════════════════════════════════════════════════════
   AURUM — LUXURY RESTAURANT WEBSITE
   Phase 1: Loader · Cursor · Navbar · Hero Interactions · Particles
   Designed by Zyvex Premium Web Design
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── UTILITY ────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp  = (a, b, t)   => a + (b - a) * t;

/* ═══════════════════════════════════════════════════════════════
   1. LOADING SCREEN
═══════════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader = qs('#loader');
  if (!loader) return;

  document.body.classList.add('loading');

  // Minimum visible time for brand impression
  const MIN_MS = 2800;
  const startTime = performance.now();

  function exitLoader() {
    const elapsed = performance.now() - startTime;
    const delay   = Math.max(0, MIN_MS - elapsed);

    setTimeout(() => {
      loader.classList.add('loader--exit');
      document.body.classList.remove('loading');

      loader.addEventListener('transitionend', () => {
        loader.classList.add('loader--done');
      }, { once: true });

      // Fallback
      setTimeout(() => loader.classList.add('loader--done'), 1500);
    }, delay);
  }

  if (document.readyState === 'complete') {
    exitLoader();
  } else {
    window.addEventListener('load', exitLoader, { once: true });
    // Hard cap in case load never fires
    setTimeout(exitLoader, 5000);
  }
})();

/* ═══════════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
═══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor   = qs('#cursor');
  const follower = qs('#cursor-follower');
  if (!cursor || !follower) return;

  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -100, my = -100;
  let fx = -100, fy = -100;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateFollower() {
    fx = lerp(fx, mx, 0.14);
    fy = lerp(fy, my, 0.14);
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    rafId = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover state on interactive elements
  const hoverTargets = 'a, button, .btn, [data-cursor-hover]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   3. NAVBAR
═══════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = qs('#navbar');
  const burger    = qs('#burger');
  const navLinks  = qs('#navLinks');
  if (!navbar) return;

  /* Scroll effect */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Burger toggle */
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    qsa('.nav-link', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* Active link on scroll */
  const sections = qsa('section[id]');
  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const link   = qs(`.nav-link[href="#${sec.id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < bottom);
      }
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   4. HERO — MOUSE PARALLAX
═══════════════════════════════════════════════════════════════ */
(function initHeroParallax() {
  const hero      = qs('.hero');
  const floats    = qsa('.hero__float');
  const bgImg     = qs('.hero__bg-img');
  if (!hero) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    // Normalized -1 to 1
    targetX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    targetY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function tickParallax() {
    currentX = lerp(currentX, targetX, 0.06);
    currentY = lerp(currentY, targetY, 0.06);

    // Subtle background drift
    if (bgImg) {
      bgImg.style.transform = `scale(1.1)
        translate(${currentX * 12}px, ${currentY * 8}px)`;
    }

    // Floating elements with different depths
    floats.forEach(f => {
      const depth = parseFloat(f.dataset.depth || '0.1');
      const tx = currentX * depth * 60;
      const ty = currentY * depth * 60;
      // Preserve the bob animation by using CSS variable trick
      f.style.setProperty('--px', tx + 'px');
      f.style.setProperty('--py', ty + 'px');
      f.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    requestAnimationFrame(tickParallax);
  }
  tickParallax();
})();

/* ═══════════════════════════════════════════════════════════════
   5. HERO — PARTICLE SYSTEM
═══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = qs('#particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = window.innerWidth < 600 ? 30 : 60;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x   = Math.random() * W;
      this.y   = initial ? Math.random() * H : H + 10;
      this.vy  = -(0.15 + Math.random() * 0.4);
      this.vx  = (Math.random() - 0.5) * 0.2;
      this.r   = 0.5 + Math.random() * 1.2;
      this.life     = 0;
      this.maxLife  = 200 + Math.random() * 200;
      this.gold = Math.random() > 0.6;
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.life++;
      if (this.y < -5 || this.life > this.maxLife) this.reset();
    }
    draw() {
      const t   = this.life / this.maxLife;
      const alpha = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      if (this.gold) {
        ctx.fillStyle = `rgba(201,168,76,${alpha * 0.55})`;
      } else {
        ctx.fillStyle = `rgba(245,238,220,${alpha * 0.2})`;
      }
      ctx.fill();
    }
  }

  function initParticleList() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); initParticleList(); });
  resize();
  initParticleList();
  tick();
})();

/* ═══════════════════════════════════════════════════════════════
   6. SCROLL REVEAL (shared utility for all sections)
═══════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const revealEls = qsa('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = el.dataset.delay || '0';
        setTimeout(() => el.classList.add('visible'), parseFloat(delay) * 1000);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════
   7. BUTTON RIPPLE EFFECT
═══════════════════════════════════════════════════════════════ */
(function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const rx   = ((e.clientX - rect.left) / rect.width)  * 100 + '%';
    const ry   = ((e.clientY - rect.top)  / rect.height) * 100 + '%';
    btn.style.setProperty('--rx', rx);
    btn.style.setProperty('--ry', ry);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   8. SMOOTH SCROLL FOR ANCHOR LINKS
═══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id  = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height'), 10) || 80;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ─── LOG ────────────────────────────────────────────────────── */
console.log('%cAURUM — Phase 1 loaded ✨', 'color: #c9a84c; font-size: 14px; font-weight: bold;');

/* ═══════════════════════════════════════════════════════════════
   PHASE 2 — ANIMATED COUNTERS
═══════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = qsa('.about-stats__num');
  if (!counters.length) return;

  function formatNum(n) {
    if (n >= 1000) return Math.round(n).toLocaleString();
    return Math.round(n).toString();
  }

  function animateCounter(el) {
    const target  = parseInt(el.dataset.count, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 2200;
    const start   = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = formatNum(target * ease) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 2 — MENU CATEGORY FILTER
═══════════════════════════════════════════════════════════════ */
(function initMenuFilter() {
  const tabs  = qsa('.menu-tab');
  const cards = qsa('.menu-card');
  if (!tabs.length) return;

  function filterCards(cat) {
    cards.forEach((card, i) => {
      const match = card.dataset.cat === cat;
      if (match) {
        card.classList.remove('hidden');
        // Staggered entrance
        card.style.animationDelay = (i % 3) * 0.08 + 's';
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = 'menuCardIn 0.5s var(--ease-luxury) both';
      } else {
        card.classList.add('hidden');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterCards(tab.dataset.cat);
    });
  });

  // Init with first tab
  filterCards('starters');
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 2 — 3D TILT CARDS
═══════════════════════════════════════════════════════════════ */
(function initTiltCards() {
  const cards = qsa('.tilt-card');
  if (!cards.length) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const MAX_TILT = 10;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotY   = dx * MAX_TILT;
      const rotX   = -dy * MAX_TILT;

      card.style.transform =
        `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;

      // Move glow to cursor position
      const glow = card.querySelector('.menu-card__glow');
      if (glow) {
        const mx = ((e.clientX - rect.left) / rect.width)  * 100 + '%';
        const my = ((e.clientY - rect.top)  / rect.height) * 100 + '%';
        glow.style.setProperty('--mx', mx);
        glow.style.setProperty('--my', my);
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      card.style.transition = 'transform 0.5s var(--ease-luxury)';
      setTimeout(() => card.style.transition = '', 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease, box-shadow 0.4s, border-color 0.4s';
    });
  });
})();

console.log('%cAURUM — Phase 2 loaded ✨', 'color: #c9a84c; font-size: 14px;');

/* ═══════════════════════════════════════════════════════════════
   PHASE 3 — GALLERY LIGHTBOX
═══════════════════════════════════════════════════════════════ */
(function initGalleryLightbox() {
  const lightbox  = qs('#galleryLightbox');
  const lbImg     = qs('#lightboxImg');
  const lbCaption = qs('#lightboxCaption');
  const lbClose   = qs('#lightboxClose');
  const backdrop  = lightbox && lightbox.querySelector('.gallery-lightbox__backdrop');
  if (!lightbox) return;

  function openLightbox(src, alt, caption) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    if (lbCaption) lbCaption.textContent = caption || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 400);
  }

  // Click gallery items
  qsa('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img     = item.querySelector('img');
      const title   = item.querySelector('.gallery-item__title');
      const cat     = item.querySelector('.gallery-item__cat');
      if (!img) return;
      // Use higher-res URL by replacing width param
      const hiresSrc = img.src.replace(/w=\d+/, 'w=1600');
      const caption  = cat
        ? `${cat.textContent.trim()} · ${title ? title.textContent.trim() : ''}`
        : (title ? title.textContent.trim() : '');
      openLightbox(hiresSrc, img.alt, caption);
    });
  });

  // Close buttons
  if (lbClose)   lbClose.addEventListener('click', closeLightbox);
  if (backdrop)  backdrop.addEventListener('click', closeLightbox);

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 3 — SPECIALS HERO PARALLAX ON SCROLL
═══════════════════════════════════════════════════════════════ */
(function initSpecialsParallax() {
  const heroImg = qs('.specials-hero__img-wrap img');
  if (!heroImg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function onScroll() {
    const wrap   = heroImg.closest('.specials-hero__img-wrap');
    if (!wrap) return;
    const rect   = wrap.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const vhalf  = window.innerHeight / 2;
    const offset = (center - vhalf) * 0.08;
    heroImg.style.transform = `scale(1.05) translateY(${offset}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 3 — GALLERY ITEM 3D HOVER
═══════════════════════════════════════════════════════════════ */
(function initGalleryHover() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.gallery-item').forEach(item => {
    const MAX = 6;

    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      item.style.transform =
        `perspective(900px) rotateX(${-dy * MAX}deg) rotateY(${dx * MAX}deg)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
      item.style.transition = 'transform 0.6s var(--ease-luxury)';
      setTimeout(() => item.style.transition = '', 600);
    });

    item.addEventListener('mouseenter', () => {
      item.style.transition = 'transform 0.12s ease';
    });
  });
})();

console.log('%cAURUM — Phase 3 loaded ✨', 'color: #c9a84c; font-size: 14px;');

/* ═══════════════════════════════════════════════════════════════
   PHASE 4 — WHY CARD MOUSE GLOW TRACKER
═══════════════════════════════════════════════════════════════ */
(function initWhyCards() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.why-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
      card.style.backgroundImage = `
        radial-gradient(circle at ${x}% ${y}%,
          rgba(201,168,76,0.055) 0%, transparent 55%),
        rgba(26,23,20,0.6)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.backgroundImage = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 4 — CHEF CARDS TILT
═══════════════════════════════════════════════════════════════ */
(function initChefTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.chef-card').forEach(card => {
    const MAX = 5;
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      card.style.transform =
        `perspective(1000px) rotateX(${-dy * MAX}deg) rotateY(${dx * MAX}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.6s var(--ease-luxury)';
      setTimeout(() => card.style.transition = '', 600);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();

console.log('%cAURUM — Phase 4 loaded ✨', 'color: #c9a84c; font-size: 14px;');

/* ═══════════════════════════════════════════════════════════════
   PHASE 5 — TESTIMONIALS SLIDER
═══════════════════════════════════════════════════════════════ */
(function initTestimonialsSlider() {
  const track  = qs('#testimonialsTrack');
  const dots   = qsa('.testimonials-dot');
  const prev   = qs('#testimonialPrev');
  const next   = qs('#testimonialNext');
  if (!track) return;

  const cards  = qsa('.testimonial-card', track);
  const total  = cards.length;
  let current  = 0;
  let autoTimer;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  if (prev) prev.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  if (next) next.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(parseInt(dot.dataset.idx, 10));
      startAuto();
    });
  });

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      stopAuto();
      goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    }
  }, { passive: true });

  goTo(0);
  startAuto();
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 5 — FAQ ACCORDION
═══════════════════════════════════════════════════════════════ */
(function initFAQ() {
  const items = qsa('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.faq-item__trigger');
    const body    = item.querySelector('.faq-item__body');
    if (!trigger || !body) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq-item__body');
        if (b) b.style.maxHeight = '0';
      });
      // Open clicked
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 5 — RESERVATION FORM SUBMIT
═══════════════════════════════════════════════════════════════ */
(function initReservationForm() {
  const btn     = qs('#reservationSubmit');
  const success = qs('#formSuccess');
  const fields  = ['resName','resEmail','resPhone','resGuests','resDate','resTime'];
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Simple validation
    let allFilled = true;
    fields.forEach(id => {
      const el = qs('#' + id);
      if (el && !el.value.trim()) {
        allFilled = false;
        el.style.borderBottomColor = '#c0392b';
        setTimeout(() => el.style.borderBottomColor = '', 2000);
      }
    });
    if (!allFilled) return;

    // Simulate submission
    btn.disabled = true;
    btn.querySelector('.btn__text').textContent = 'Sending…';

    setTimeout(() => {
      btn.style.display = 'none';
      if (success) success.classList.add('visible');
    }, 1200);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 5 — CONTACT FORM SUBMIT
═══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const btn = qs('#contactSubmit');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const name = qs('#ctName');
    const email = qs('#ctEmail');
    const msg  = qs('#ctMsg');
    if (!name?.value || !email?.value || !msg?.value) return;

    btn.disabled = true;
    btn.querySelector('.btn__text').textContent = 'Sending…';
    setTimeout(() => {
      btn.querySelector('.btn__text').textContent = 'Message Sent ✦';
      btn.style.background = 'rgba(201,168,76,0.15)';
      btn.style.borderColor = 'rgba(201,168,76,0.4)';
      btn.style.color = '#c9a84c';
    }, 1000);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 5 — FORM LABEL FLOAT for date inputs
═══════════════════════════════════════════════════════════════ */
(function initDateLabels() {
  // Date inputs don't support :placeholder-shown, manually handle
  qsa('input[type="date"]').forEach(input => {
    input.addEventListener('change', () => {
      input.classList.toggle('has-value', !!input.value);
    });
  });
})();

console.log('%cAURUM — Phase 5 loaded ✨', 'color: #c9a84c; font-size: 14px;');

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — BACK TO TOP
═══════════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — NEWSLETTER SUBSCRIBE
═══════════════════════════════════════════════════════════════ */
(function initNewsletter() {
  const btn   = qs('#newsletterBtn');
  const input = qs('#newsletterEmail');
  const ok    = qs('#newsletterOk');
  if (!btn || !input) return;

  function subscribe() {
    if (!input.value || !input.value.includes('@')) {
      input.style.borderColor = '#c0392b';
      setTimeout(() => input.style.borderColor = '', 1500);
      return;
    }
    input.disabled = true;
    btn.disabled   = true;
    btn.style.background = 'rgba(201,168,76,0.2)';
    if (ok) ok.classList.add('visible');
  }

  btn.addEventListener('click', subscribe);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') subscribe();
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — IMAGE LAZY LOAD OBSERVER (fade-in on load)
═══════════════════════════════════════════════════════════════ */
(function initImageFade() {
  const imgs = qsa('img');
  imgs.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — PARALLAX SECTIONS ON SCROLL
═══════════════════════════════════════════════════════════════ */
(function initSectionParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const parallaxEls = [
    { el: qs('.chef-section__bg-img'),   speed: 0.15 },
    { el: qs('.reservation-section__bg'), speed: 0.12 },
  ].filter(item => item.el !== null);

  if (!parallaxEls.length) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        parallaxEls.forEach(({ el, speed }) => {
          const rect   = el.parentElement.getBoundingClientRect();
          const center = rect.top + rect.height / 2 - window.innerHeight / 2;
          el.style.transform = `translateY(${center * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — STAGGER REVEAL FOR GRID CHILDREN
═══════════════════════════════════════════════════════════════ */
(function initGridStagger() {
  const grids = [
    { selector: '.why-grid',     childSelector: '.why-card' },
    { selector: '.chef-grid',    childSelector: '.chef-card' },
    { selector: '.specials-grid', childSelector: '.specials-card' },
  ];

  grids.forEach(({ selector, childSelector }) => {
    const grid = qs(selector);
    if (!grid) return;
    const children = qsa(childSelector, grid);
    children.forEach((child, i) => {
      if (!child.dataset.delay) {
        child.dataset.delay = (i * 0.1).toFixed(2);
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — NAVBAR HIDE ON SCROLL DOWN, SHOW ON SCROLL UP
═══════════════════════════════════════════════════════════════ */
(function initNavbarHide() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  let lastY   = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        // Only hide after scrolling past hero
        if (currentY > 200) {
          if (currentY > lastY + 8) {
            navbar.style.transform = 'translateY(-100%)';
          } else if (currentY < lastY - 4) {
            navbar.style.transform = 'translateY(0)';
          }
        } else {
          navbar.style.transform = 'translateY(0)';
        }
        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — GOLD SHIMMER ON SECTION TITLES ON HOVER
═══════════════════════════════════════════════════════════════ */
(function initTitleShimmer() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.section-title').forEach(title => {
    title.addEventListener('mouseenter', () => {
      title.style.backgroundImage =
        'linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 60%, #e8c868 100%)';
      title.style.backgroundSize = '200% auto';
      title.style.webkitBackgroundClip = 'text';
      title.style.backgroundClip = 'text';
      title.style.webkitTextFillColor = 'transparent';
      title.style.animation = 'shimmerTitle 1.2s linear infinite';
    });
    title.addEventListener('mouseleave', () => {
      title.style.backgroundImage = '';
      title.style.webkitTextFillColor = '';
      title.style.animation = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — SMOOTH SECTION ENTRANCE WITH CLIP PATH
═══════════════════════════════════════════════════════════════ */
(function initClipReveal() {
  // Add hero__headline-accent data-text for glow effect
  const accent = qs('.hero__headline-accent');
  if (accent) accent.setAttribute('data-text', accent.textContent);
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — PERF: Debounce resize events
═══════════════════════════════════════════════════════════════ */
(function initResizeDebounce() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    document.body.classList.add('resize-in-progress');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.body.classList.remove('resize-in-progress');
    }, 150);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 — MOBILE: disable expensive animations on low-end
═══════════════════════════════════════════════════════════════ */
(function initPerformanceMode() {
  // Detect coarse pointer (touch) device → reduce particle count handled in canvas init
  // Disable cursor on touch
  if (window.matchMedia('(pointer: coarse)').matches) {
    document.body.style.cursor = 'auto';
  }
  // Pause particle canvas when tab hidden
  document.addEventListener('visibilitychange', () => {
    const canvas = qs('#particleCanvas');
    if (canvas) {
      canvas.style.display = document.hidden ? 'none' : '';
    }
  });
})();

console.log(
  '%c✦ AURUM — All 6 Phases Complete ✦',
  'color: #f0d080; font-size: 16px; font-weight: bold; background: #0e0c0a; padding: 8px 20px;'
);

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 FINAL — CINEMATIC PAGE ENTRANCE
   Runs after loader exits — staggers section reveals
═══════════════════════════════════════════════════════════════ */
(function initPageEntrance() {
  // Re-trigger scroll reveal after loader finishes
  const loader = qs('#loader');
  if (!loader) return;

  function triggerInitialReveal() {
    // Force-check any elements already in viewport
    qsa('.reveal, .reveal-left, .reveal-right').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        const delay = el.dataset.delay ? parseFloat(el.dataset.delay) * 1000 : 0;
        setTimeout(() => el.classList.add('visible'), delay);
      }
    });
  }

  // Wait for loader exit
  const obs = new MutationObserver(() => {
    if (loader.classList.contains('loader--done')) {
      setTimeout(triggerInitialReveal, 100);
      obs.disconnect();
    }
  });
  obs.observe(loader, { attributes: true, attributeFilter: ['class'] });

  // Fallback
  setTimeout(triggerInitialReveal, 3500);
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 FINAL — MENU CARD GLOW MOUSE TRACKER
   (Extend tilt glow to all visible cards)
═══════════════════════════════════════════════════════════════ */
(function initCardGlowTracker() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', e => {
    qsa('.menu-card:not(.hidden)').forEach(card => {
      const rect = card.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom
      ) {
        const glow = card.querySelector('.menu-card__glow');
        if (glow) {
          const mx = ((e.clientX - rect.left) / rect.width)  * 100 + '%';
          const my = ((e.clientY - rect.top)  / rect.height) * 100 + '%';
          glow.style.setProperty('--mx', mx);
          glow.style.setProperty('--my', my);
        }
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 FINAL — HERO HEADLINE WORD SPLIT ANIMATION
═══════════════════════════════════════════════════════════════ */
(function initHeroTypography() {
  // Ensure accent data-text is set for the pseudo glow
  const accent = qs('.hero__headline-accent');
  if (accent && !accent.dataset.text) {
    accent.dataset.text = accent.textContent.trim();
  }
})();

/* ═══════════════════════════════════════════════════════════════
   PHASE 6 FINAL — PERFORMANCE: Use requestIdleCallback for
   non-critical setup where supported
═══════════════════════════════════════════════════════════════ */
(function deferNonCritical() {
  const run = window.requestIdleCallback
    ? cb => requestIdleCallback(cb, { timeout: 2000 })
    : cb => setTimeout(cb, 100);

  run(() => {
    // Pre-connect to Unsplash CDN for image perf
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://images.unsplash.com';
    document.head.appendChild(link);
  });
})();

/* ─────────────────────────────────────────────────────────────
   ALL PHASES COMPLETE — Final log
───────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  console.log(
    '%c✦ AURUM Restaurant Website — Fully Loaded ✦\n' +
    '%cDesigned & Developed by Zyvex Premium Web Design\n' +
    'Phases: 1–6 Complete | Files: index.html · style.css · script.js',
    'color: #f0d080; font-size: 15px; font-weight: bold; background: #080706; padding: 10px 20px; border-left: 3px solid #c9a84c;',
    'color: #9a8e7a; font-size: 11px; background: #080706; padding: 4px 20px 10px;'
  );
});
