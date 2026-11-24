/* ============ hael — scroll motion (nature in movement) ============
   Everything here reacts to scrolling in both directions:
   a vine that grows down the page edge, leaves drifting with the scroll,
   soft parallax on photos and products, and a marquee that follows your hand. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (name, attrs = {}) => {
    const n = document.createElementNS(SVGNS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mod = (a, n) => ((a % n) + n) % n;

  /* ---- 1. Growing vine + top progress line ---- */
  const bar = document.createElement('div');
  bar.className = 'scroll-bar';
  const vine = svgEl('svg', { class: 'vine', 'aria-hidden': 'true' });
  document.body.append(bar, vine);

  let stem, tip, stemLen = 0, vineLeaves = [];
  function buildVine() {
    const h = window.innerHeight;
    const top = 96, bottom = h - 104; // stops above the floating WhatsApp button
    vine.replaceChildren();
    vine.setAttribute('viewBox', `0 0 48 ${h}`);
    vine.setAttribute('width', 48);
    vine.setAttribute('height', h);
    const xAt = y => 24 + 8 * Math.sin((y - top) / 70);
    let d = `M${xAt(top).toFixed(1)} ${top}`;
    for (let y = top + 12; y <= bottom; y += 12) d += ` L${xAt(y).toFixed(1)} ${y}`;
    vine.append(svgEl('path', { d, class: 'vine__ghost' }));
    stem = svgEl('path', { d, class: 'vine__stem' });
    vine.append(stem);
    stemLen = stem.getTotalLength();
    stem.style.strokeDasharray = stemLen;

    vineLeaves = [];
    let i = 0;
    for (let y = top + 40; y < bottom - 10; y += 58, i++) {
      const side = i % 2 ? 1 : -1;
      const g = svgEl('g', { transform: `translate(${xAt(y).toFixed(1)} ${y}) rotate(${side > 0 ? -38 : -142})` });
      const leaf = svgEl('path', { d: 'M0 0 C4 -5 13 -5 18 0 C13 5 4 5 0 0Z', class: 'vine__leaf' });
      g.append(leaf);
      if (i % 3 === 1) g.append(svgEl('ellipse', { cx: 9, cy: side * 8, rx: 3.4, ry: 4.4, class: 'vine__leaf vine__olive' }));
      vine.append(g);
      vineLeaves.push({ g, t: (y - top) / (bottom - top) });
    }
    tip = svgEl('circle', { r: 3.2, class: 'vine__tip' });
    vine.append(tip);
  }

  /* ---- 2. Leaves drifting with the scroll ---- */
  const drift = document.createElement('div');
  drift.className = 'drift';
  drift.setAttribute('aria-hidden', 'true');
  const DRIFT = [
    { x: 4, y: .18, depth: .22, spin: .10, size: 22, tone: 'a' },
    { x: 93, y: .34, depth: .34, spin: -.14, size: 18, tone: 'b' },
    { x: 8, y: .72, depth: .16, spin: .07, size: 26, tone: 'c' },
    { x: 88, y: .86, depth: .27, spin: .12, size: 20, tone: 'a' },
    { x: 96, y: .08, depth: .12, spin: -.06, size: 14, tone: 'c' },
    { x: 2, y: .50, depth: .40, spin: -.18, size: 16, tone: 'b' },
    { x: 78, y: .62, depth: .19, spin: .09, size: 13, tone: 'gold' },
    { x: 18, y: .95, depth: .30, spin: -.11, size: 15, tone: 'gold' }
  ].map((c, i) => {
    const el = document.createElement('span');
    el.className = 'drift__leaf drift__leaf--' + c.tone;
    el.style.left = c.x + 'vw';
    el.style.width = c.size + 'px';
    el.style.height = Math.round(c.size * .52) + 'px';
    const inner = document.createElement('i');
    inner.style.animationDelay = (-i * 1.3) + 's';
    el.append(inner);
    drift.append(el);
    return { el, ...c, i };
  });
  document.body.append(drift);

  /* ---- 3. Parallax targets: [element, reference box, strength in px] ---- */
  const parallax = [];
  const addPar = (sel, refSel, strength, alt) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      const ref = refSel ? el.closest(refSel) : el.parentElement;
      if (ref) parallax.push({ el, ref, s: alt && i % 2 ? -strength : strength });
    });
  };
  addPar('.shot img', '.shot', 26);
  addPar('.bottle, .jar, .giftbox', '.product__art', -22);
  addPar('.tiles img', '.tiles', 12, true);
  addPar('.origin__card', '.origin__grid', -22);
  addPar('.idea__no', '.idea', 18);
  addPar('.tree--contact', '.contact__card', -14);

  const emblem = document.querySelector('.emblem');
  const heroText = document.querySelector('.hero__text');
  const hero = document.querySelector('.hero');
  const marqueeTrack = document.getElementById('marquee');
  const footer = document.getElementById('footer');

  /* ---- Frame ---- */
  let ticking = false;
  function frame() {
    ticking = false;
    const sy = window.scrollY;
    const vh = window.innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const p = clamp(sy / max, 0, 1);

    // vine + bar
    bar.style.transform = `scaleX(${p})`;
    if (stem) {
      stem.style.strokeDashoffset = stemLen * (1 - p);
      const pt = stem.getPointAtLength(stemLen * p);
      tip.setAttribute('cx', pt.x);
      tip.setAttribute('cy', pt.y);
      vineLeaves.forEach(l => l.g.classList.toggle('is-on', p >= l.t));
    }

    // drifting leaves
    const span = vh + 120;
    DRIFT.forEach(l => {
      const y = mod(l.y * span - sy * l.depth, span) - 60;
      const x = Math.sin(sy / 260 + l.i * 1.7) * 26;
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(l.i * 47 + sy * l.spin).toFixed(1)}deg)`;
    });

    // hero depth
    if (hero && sy < hero.offsetHeight) {
      if (emblem) emblem.style.translate = `0 ${(sy * 0.14).toFixed(1)}px`;
      if (heroText) {
        heroText.style.translate = `0 ${(sy * -0.07).toFixed(1)}px`;
        heroText.style.opacity = clamp(1 - sy / (hero.offsetHeight * 0.85), 0, 1).toFixed(3);
      }
    }

    // parallax
    parallax.forEach(item => {
      const r = item.ref.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const d = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      item.el.style.translate = `0 ${(d * item.s).toFixed(1)}px`;
    });

    // footer dawn: the sun rises as the footer scrolls into view
    if (footer) {
      const fr = footer.getBoundingClientRect();
      if (fr.top < vh + 50) footer.style.setProperty('--rise', clamp((vh - fr.top) / Math.min(fr.height, vh * 0.9), 0, 1).toFixed(3));
    }

    // marquee follows the scroll direction
    if (marqueeTrack) {
      const half = marqueeTrack.scrollWidth / 2;
      if (half > 0) marqueeTrack.style.translate = `${(-mod(sy * 0.35, half)).toFixed(1)}px 0`;
    }
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

  buildVine();
  frame();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', () => { buildVine(); request(); });
  window.addEventListener('load', request);
})();
