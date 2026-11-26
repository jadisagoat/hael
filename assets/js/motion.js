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

/* Hero lead writes itself word by word, like a pen moving across the page */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.CSS || !CSS.registerProperty) return;
  const lead = document.querySelector('.hero__lead');
  if (!lead) return;
  const PER_CHAR = 42, START = 500;
  let mo;
  function write() {
    if (mo) mo.disconnect();
    const words = lead.textContent.trim().split(/\s+/);
    lead.textContent = '';
    let t = START;
    words.forEach((w, i) => {
      const s = document.createElement('span');
      const d = Math.max(w.length * PER_CHAR, 90);
      s.className = 'pen__w';
      s.textContent = w;
      s.style.setProperty('--d', d + 'ms');
      s.style.setProperty('--t', t + 'ms');
      t += d + 50;
      if (i) lead.appendChild(document.createTextNode(' '));
      lead.appendChild(s);
    });
    mo.observe(lead, { childList: true });
  }
  mo = new MutationObserver(write);   // language switch rewrites the text
  write();
})();

/* Journey: an olive rolls along the line with the scroll, lights each step, and becomes oil after the press */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const steps = document.querySelector('.steps');
  if (!steps) return;
  const items = [...steps.querySelectorAll('.step')];
  const nums = items.map(s => s.querySelector('.step__num'));
  if (nums.length < 2) return;
  const NS = 'http://www.w3.org/2000/svg';
  const back = document.createElement('li'), front = document.createElement('li');
  back.className = 'rail'; front.className = 'rail rail--front';
  back.setAttribute('aria-hidden', 'true'); front.setAttribute('aria-hidden', 'true');
  back.innerHTML = '<i class="rail__fill"></i>';
  front.innerHTML = '<div class="rail__runner"><i class="rail__glow"></i>' +
    '<svg class="rail__olive" viewBox="-15 -15 30 30" xmlns="' + NS + '">' +
      '<ellipse rx="9.5" ry="12.5" fill="#6f8a3a"/><ellipse rx="9.5" ry="12.5" fill="url(#railOlive)"/>' +
      '<ellipse cx="-3.4" cy="-5" rx="2.4" ry="4" fill="#fff" opacity=".4" transform="rotate(18 -3.4 -5)"/>' +
      '<path d="M0 -12.5 q1 -4 5 -5" fill="none" stroke="#b3924a" stroke-width="1.4" stroke-linecap="round"/>' +
      '<defs><radialGradient id="railOlive" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#a9c063"/><stop offset=".6" stop-color="#6f8a3a"/><stop offset="1" stop-color="#3f5320"/></radialGradient></defs>' +
    '</svg>' +
    '<svg class="rail__drop" viewBox="-13 -21 26 34" xmlns="' + NS + '">' +
      '<path d="M0 -20 C7 -9 12 -3 12 3 A12 12 0 0 1 -12 3 C-12 -3 -7 -9 0 -20Z" fill="url(#railOil)"/>' +
      '<path d="M-6 2 a7 7 0 0 0 4 6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".65"/>' +
      '<defs><linearGradient id="railOil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe9a0"/><stop offset=".55" stop-color="#e2b93a"/><stop offset="1" stop-color="#b88a18"/></linearGradient></defs>' +
    '</svg></div>';
  steps.prepend(back);
  steps.append(front);
  const fill = back.firstChild, runner = front.firstChild, olive = runner.querySelector('.rail__olive');
  let ticking = false;

  function frame() {
    ticking = false;
    const box = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    if (box.bottom < -200 || box.top > vh + 200) return;
    const cs = nums.map(n => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }; });
    const flat = cs.every(c => Math.abs(c.y - cs[0].y) < 4);
    steps.classList.toggle('has-rail', flat);
    if (!flat) {                       // stacked layout: just light each step as it reaches mid-screen
      items.forEach((s, i) => s.classList.toggle('is-lit', nums[i].getBoundingClientRect().top < vh * 0.62));
      return;
    }
    const lineY = box.top + cs[0].y;
    const p = Math.min(Math.max((vh * 0.86 - lineY) / (vh * 0.52), 0), 1);
    const a = cs[0].x, b = cs[cs.length - 1].x;
    const x = a + (b - a) * p, dir = b > a ? 1 : -1, dist = Math.abs(x - a);
    runner.style.transform = 'translate(' + x.toFixed(1) + 'px, 0)';
    olive.style.rotate = (dir * dist / 12 * 57.3).toFixed(1) + 'deg';      // rolling, not sliding
    fill.style.transform = 'translate(' + Math.min(a, x).toFixed(1) + 'px, 0) scaleX(' + (dist / 100).toFixed(4) + ')';
    fill.style.background = dir < 0 ? 'linear-gradient(270deg, rgba(138,154,91,.9), #e3c77d 55%, #f2d98c)' : '';
    items.forEach((s, i) => s.classList.toggle('is-lit', dir * (x - cs[i].x) >= -2 && p > 0.004));
    runner.classList.toggle('is-oil', dir * (x - cs[Math.min(2, cs.length - 1)].x) >= -2);   // after the press
    runner.style.opacity = p <= 0.004 ? 0 : 1;
  }
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', ask, { passive: true });
  window.addEventListener('resize', ask);
  ask();
})();
