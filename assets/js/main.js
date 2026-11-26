/* ============ hael — site script ============ */

/* ---- Settings ---- */
const CONFIG = {
  // WhatsApp number in international format, digits only (03 915 796 -> 9613915796).
  whatsapp: '9613915796',
  instagram: 'https://instagram.com/hael_olive_oil_',
  messages: {
    ar: {
      oil: 'مرحباً hael، أودّ طلب زيت الزيتون البكر الممتاز العضوي (ميمس - حاصبيا).',
      paste: 'مرحباً hael، أودّ طلب معجون الزيتون بالزعتر.',
      gift: 'مرحباً hael، أودّ الاستفسار عن مجموعة الإرث للهدايا وتوزيعات المناسبات.',
      general: 'مرحباً hael، أودّ الاستفسار عن منتجاتكم.'
    },
    en: {
      oil: 'Hello hael, I would like to order Organic Extra Virgin Olive Oil (Mimess - Hasbaya).',
      paste: 'Hello hael, I would like to order Olive Paste with Zaatar.',
      gift: 'Hello hael, I would like to inquire about the Heritage Gift Set / event favors.',
      general: 'Hello hael, I would like to ask about your products.'
    }
  }
};

const CATALOG = {
  oil: {
    ar: 'زيت زيتون بكر ممتاز عضوي',
    en: 'Organic Extra Virgin Olive Oil',
    variants: {
      '500ml': { ar: 'قنينة ٥٠٠ مل', en: '500 ml Bottle' },
      '1L': { ar: 'قنينة ١ ليتر', en: '1 Liter Bottle' },
      tin: { ar: 'تنكة عائلية', en: 'Family Tin' }
    }
  },
  paste: {
    ar: 'معجون الزيتون بالزعتر',
    en: 'Olive Paste with Zaatar',
    variants: {
      '250g': { ar: 'مرطبان ٢٥٠ غ', en: '250 g Jar' },
      '500g': { ar: 'مرطبان ٥٠٠ غ', en: '500 g Jar' }
    }
  },
  gift: {
    ar: 'مجموعة الإرث للهدايا',
    en: 'The Heritage Gift Set',
    variants: {
      duo: { ar: 'ثنائي الإرث', en: 'Classic Duo' },
      events: { ar: 'توزيعات ومناسبات', en: 'Events / Bulk' }
    }
  }
};

/* Olive paste comes in six flavours; every flavour is sold in both jar sizes. */
const PASTE_FLAVORS = {
  zaatar: { ar: 'بالزعتر', en: 'With Zaatar' },
  walnut: { ar: 'بالجوز', en: 'With Walnut' },
  spicy: { ar: 'حارّ', en: 'Spicy' },
  sour: { ar: 'حامض', en: 'Sour' },
  cashew: { ar: 'بالكاجو', en: 'With Cashew' },
  black: { ar: 'زيتون أسود', en: 'Black Olive' }
};
(function () {
  const sizes = CATALOG.paste.variants, all = {};
  Object.keys(PASTE_FLAVORS).forEach(f => Object.keys(sizes).forEach(sz => {
    all[f + '-' + sz] = { ar: PASTE_FLAVORS[f].ar + ' · ' + sizes[sz].ar, en: PASTE_FLAVORS[f].en + ' · ' + sizes[sz].en };
  }));
  // bags saved before flavours existed hold plain size keys: they were the zaatar paste
  Object.keys(sizes).forEach(sz => { all[sz] = all['zaatar-' + sz]; });
  CATALOG.paste.variants = all;
  CATALOG.paste.ar = 'معجون الزيتون';
  CATALOG.paste.en = 'Olive Paste';
})();

/* ---- Olive tree emblem (drawn procedurally) ---- */
const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

/* Geometry follows the printed HAEL logo: two olive trees whose trunks are the
   uprights of an "H", joined by a crossbar that carries the letters "ael".
   The right tree is the taller one and arches over the left. */
const TRUNKS = [
  'M150 318 C151 292 149 262 140 236',   // left upright
  'M250 318 C249 290 251 258 256 228'    // right upright
];
const CROSSBAR = 'M150 276 C176 270 224 270 250 276';
const BRANCHES = [
  // [path, width]  — left tree
  ['M141 240 C134 208 116 186 92 172', 3.6],
  ['M134 214 C144 190 148 170 146 148', 3],
  ['M140 236 C116 226 96 226 72 234', 3],
  ['M118 190 C112 172 104 158 98 142', 2.4],
  ['M112 184 C96 184 82 190 70 200', 2.4],
  // right tree
  ['M255 232 C254 186 230 142 190 118 C168 105 146 101 122 108', 3.8],
  ['M247 186 C262 158 268 128 262 96', 3.2],
  ['M256 226 C282 204 306 182 324 152', 3.2],
  ['M257 238 C286 230 312 232 334 244', 3],
  ['M226 148 C220 130 220 110 226 88', 2.6],
  ['M286 198 C302 198 320 206 334 218', 2.4],
  ['M190 118 C194 102 202 90 214 80', 2.4],
  ['M296 178 C300 160 298 144 292 128', 2.4],
  ['M160 104 C150 94 138 90 126 88', 2.2]
];
const ROOTS = [
  ['M150 314 C140 330 118 338 92 342', 4], ['M150 314 C146 336 134 352 118 368', 3.4],
  ['M151 314 C162 332 182 342 200 354', 3.6], ['M250 314 C260 330 284 338 310 342', 4],
  ['M250 314 C254 336 268 352 284 368', 3.4], ['M249 314 C238 332 218 342 200 354', 3.6],
  ['M116 338 C106 346 100 354 96 364', 2], ['M134 350 C131 360 136 368 134 376', 2],
  ['M284 338 C294 346 300 354 304 364', 2], ['M266 350 C269 360 264 368 266 376', 2],
  ['M200 354 C198 364 203 372 200 382', 2.4], ['M200 354 C190 361 184 367 178 375', 2],
  ['M200 354 C210 361 216 367 222 375', 2], ['M172 338 C168 348 170 356 166 364', 1.8],
  ['M228 338 C232 348 230 356 234 364', 1.8]
];
const LEAF = 'M0 0 C5 -7 19 -7 27 0 C19 7 5 7 0 0Z';
const GREENS = ['#5d6f4a', '#7f8f63', '#4a5a3c', '#6c7d55'];

function buildTree(svg) {
  const mode = svg.dataset.tree; // full | mini | label | plain
  const showName = mode === 'full' || mode === 'label' || mode === 'plain';
  svg.setAttribute('viewBox', mode === 'mini' || mode === 'plain' ? '50 60 300 330' : '0 0 400 400');

  const woodG = el('g');
  const foliage = el('g');
  svg.append(woodG, foliage);
  const wood = (d, w, cls = '') => {
    const p = el('path', { d, 'stroke-width': w, class: 'wood ' + cls, pathLength: 1 });
    woodG.append(p);
    return p;
  };

  ROOTS.forEach(([d, w]) => wood(d, w, 'root'));
  let n = 0;
  BRANCHES.forEach(([d, w], bi) => {
    const p = wood(d, w);
    const L = p.getTotalLength();
    let i = 0;
    for (let s = L * 0.3; s <= L; s += 15, i++) {
      const a = p.getPointAtLength(s);
      const b = p.getPointAtLength(Math.min(s + 1, L));
      const c = p.getPointAtLength(Math.max(s - 1, 0));
      const ang = Math.atan2(b.y - c.y, b.x - c.x) * 180 / Math.PI;
      const last = s + 15 > L;
      const rot = last ? ang : ang + (i % 2 ? 46 : -46);
      const size = 0.74 + ((bi * 7 + i * 3) % 5) * 0.075;
      const g = el('g', { transform: `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${size.toFixed(2)})` });
      const leaf = el('path', { d: LEAF, class: 'leaf', fill: GREENS[(bi + i) % GREENS.length] });
      leaf.style.setProperty('--d', (n * 0.016).toFixed(2) + 's');
      g.append(leaf);
      foliage.append(g);
      if ((bi + i) % 3 === 1 && !last) {
        // an olive hanging from a short stalk
        const og = el('g', { class: 'fruit' });
        og.style.setProperty('--d', (0.5 + n * 0.016).toFixed(2) + 's');
        og.append(
          el('path', { d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} v5`, stroke: '#5b4a3a', 'stroke-width': 1, fill: 'none' }),
          el('ellipse', { cx: a.x.toFixed(1), cy: (a.y + 11).toFixed(1), rx: 5, ry: 6.800, fill: '#8d9645', stroke: '#5f6a2c', 'stroke-width': .8 }),
          el('ellipse', { cx: (a.x - 1.6).toFixed(1), cy: (a.y + 8.5).toFixed(1), rx: 1.300, ry: 2, fill: '#fff', opacity: .3 })
        );
        foliage.append(og);
      }
      n++;
    }
  });
  TRUNKS.forEach(d => wood(d, 9, 'trunk'));
  wood(CROSSBAR, 7, 'trunk');

  if (showName) {
    const t = el('text', { x: 200, y: 266, 'text-anchor': 'middle', 'font-size': 52, class: 'name' });
    t.textContent = 'ael';
    svg.append(t);
  }
}
document.querySelectorAll('svg[data-tree]').forEach(buildTree);

/* ---- Language toggle (Arabic default, English in data-en) ---- */
const marquee = document.getElementById('marquee');
marquee.innerHTML += marquee.innerHTML;

const translatable = [...document.querySelectorAll('[data-en]')];
translatable.forEach(n => { n.dataset.ar = n.innerHTML.trim(); });

const placeholders = [...document.querySelectorAll('[data-ph-en]')];
placeholders.forEach(n => { n.dataset.phAr = n.placeholder; });

const TITLES = {
  ar: 'زيت زيتون لبناني بكر ممتاز | HAEL Olive Oil — ميمس، حاصبيا',
  en: 'Lebanese Extra Virgin Olive Oil | HAEL — Mimess, Hasbaya'
};
const langBtn = document.getElementById('langBtn');
let lang = 'ar';

function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  translatable.forEach(n => { n.innerHTML = n.dataset[lang]; });
  placeholders.forEach(n => { n.placeholder = lang === 'ar' ? n.dataset.phAr : n.dataset.phEn; });
  document.title = TITLES[lang];
  langBtn.textContent = lang === 'ar' ? 'EN' : 'ع';
  document.querySelectorAll('.idea__no').forEach((n, i) => {
    n.textContent = lang === 'ar' ? ['١', '٢', '٣'][i] : String(i + 1);
  });
  updateOrderLinks();
  renderCart();
  try { localStorage.setItem('hael-lang', lang); } catch (e) { /* storage unavailable */ }
}

function waUrl(msg) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}

function updateOrderLinks() {
  document.querySelectorAll('[data-order]').forEach(a => {
    if (!CONFIG.whatsapp) { a.setAttribute('href', '#contact'); return; }
    const msg = CONFIG.messages[lang][a.dataset.order] || CONFIG.messages[lang].general;
    a.href = waUrl(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

/* ---- Variant selector ---- */
document.querySelectorAll('.variants').forEach(group => {
  group.addEventListener('click', e => {
    const btn = e.target.closest('.variant');
    if (!btn) return;
    group.querySelectorAll('.variant').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
  });
});

/* ---- Interactive Order Bag (WhatsApp Builder) ---- */
let cart = [];
try {
  const savedCart = JSON.parse(localStorage.getItem('hael-cart') || '[]');
  if (Array.isArray(savedCart)) cart = savedCart;
} catch (e) { /* ignore */ }

const cartDrawer = document.getElementById('cartDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const cartItemsEl = document.getElementById('cartItems');
const cartEmptyEl = document.getElementById('cartEmpty');
const cartCountEl = document.getElementById('cartCount');
const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2400);
}

function saveCart() {
  try { localStorage.setItem('hael-cart', JSON.stringify(cart)); } catch (e) { /* ignore */ }
}

function openDrawer() {
  cartDrawer.classList.add('is-open');
  drawerBackdrop.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function closeDrawer() {
  cartDrawer.classList.remove('is-open');
  drawerBackdrop.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

function renderCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = totalQty;
  cartEmptyEl.style.display = cart.length ? 'none' : 'block';
  cartItemsEl.innerHTML = '';

  cart.forEach((item, idx) => {
    const prod = CATALOG[item.id];
    if (!prod) return;
    const variantLabel = prod.variants[item.variant]?.[lang] || item.variant;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item__info">
        <strong>${prod[lang]}</strong>
        <span>${variantLabel}</span>
      </div>
      <div class="cart-item__qty">
        <button type="button" class="qty-btn" data-qty="-1" data-idx="${idx}" aria-label="Decrease">−</button>
        <span>${item.qty}</span>
        <button type="button" class="qty-btn" data-qty="1" data-idx="${idx}" aria-label="Increase">+</button>
      </div>
    `;
    cartItemsEl.append(li);
  });
}

cartItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('.qty-btn');
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  const delta = Number(btn.dataset.qty);
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
});

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.add;
    const card = btn.closest('.product');
    const activeVar = card.querySelector('.variant.is-active');
    const flavor = card.querySelector('.flavor.is-active');
    let variant = activeVar ? activeVar.dataset.variant : Object.keys(CATALOG[id].variants)[0];
    if (flavor) variant = flavor.dataset.flavor + '-' + variant;

    const existing = cart.find(i => i.id === id && i.variant === variant);
    if (existing) existing.qty += 1;
    else cart.push({ id, variant, qty: 1 });

    saveCart();
    renderCart();
    showToast(lang === 'ar' ? 'تمت الإضافة إلى سلّة الطلب ✓' : 'Added to your order bag ✓');
  });
});

document.getElementById('cartOpenBtn').addEventListener('click', openDrawer);
document.getElementById('cartCloseBtn').addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

document.getElementById('sendOrderBtn').addEventListener('click', () => {
  if (!cart.length) {
    showToast(lang === 'ar' ? 'أضف منتجاً واحداً على الأقل أولاً' : 'Please add at least one product first');
    return;
  }
  const name = document.getElementById('custName').value.trim();
  const area = document.getElementById('custArea').value.trim();
  const note = document.getElementById('custNote').value.trim();

  const lines = [];
  if (lang === 'ar') {
    lines.push('مرحباً hael 🌿، أودّ تأكيد الطلب التالي:');
    cart.forEach(item => {
      const prod = CATALOG[item.id];
      const v = prod.variants[item.variant]?.ar || item.variant;
      lines.push(`• ${prod.ar} (${v}) × ${item.qty}`);
    });
    if (name) lines.push(`الاسم: ${name}`);
    if (area) lines.push(`منطقة التوصيل: ${area}`);
    if (note) lines.push(`ملاحظة / إهداء: ${note}`);
  } else {
    lines.push('Hello hael 🌿, I would like to place the following order:');
    cart.forEach(item => {
      const prod = CATALOG[item.id];
      const v = prod.variants[item.variant]?.en || item.variant;
      lines.push(`• ${prod.en} (${v}) × ${item.qty}`);
    });
    if (name) lines.push(`Name: ${name}`);
    if (area) lines.push(`Delivery Area: ${area}`);
    if (note) lines.push(`Note / Gift Card: ${note}`);
  }

  window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
});

/* ---- Mobile Menu ---- */
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');

function toggleMobileMenu(force) {
  const open = typeof force === 'boolean' ? force : !mobileNav.classList.contains('is-open');
  mobileNav.classList.toggle('is-open', open);
  menuBtn.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  mobileNav.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('no-scroll', open);
}
menuBtn.addEventListener('click', () => toggleMobileMenu());
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMobileMenu(false)));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDrawer();
    toggleMobileMenu(false);
  }
});

/* ---- Init Language ---- */
let saved = null;
try { saved = localStorage.getItem('hael-lang'); } catch (e) { /* storage unavailable */ }
const urlLang = new URLSearchParams(location.search).get('lang');
setLang((urlLang || saved) === 'en' ? 'en' : 'ar');
langBtn.addEventListener('click', () => setLang(lang === 'ar' ? 'en' : 'ar'));

/* ---- Nav state + scroll reveal ---- */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const reveals = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    // Reveal in both directions: elements fade out when they leave the screen
    // and come back from the side they left through.
    entries.forEach(e => {
      const t = e.target;
      if (e.isIntersecting && (e.intersectionRatio >= 0.12 || e.intersectionRect.height > window.innerHeight * 0.3)) {
        t.classList.add('is-in');
      } else if (!e.isIntersecting && !reduceMotion) {
        t.dataset.from = e.boundingClientRect.top < 0 ? 'up' : 'down';
        t.classList.remove('is-in');
      }
    });
  }, { threshold: [0, 0.12] });
  reveals.forEach(n => {
    const sibs = [...n.parentElement.children].filter(c => c.classList.contains('reveal'));
    n.style.setProperty('--rd', (sibs.indexOf(n) * 0.1) + 's');
    io.observe(n);
  });
} else {
  reveals.forEach(n => n.classList.add('is-in'));
}

document.getElementById('year').textContent = new Date().getFullYear();

/* ---- Recipes: one-tap add to the order bag ---- */
function quickAdd(id, variant) {
  const v = variant || Object.keys(CATALOG[id].variants)[0];
  const existing = cart.find(i => i.id === id && i.variant === v);
  if (existing) existing.qty += 1;
  else cart.push({ id, variant: v, qty: 1 });
  saveCart();
  renderCart();
  showToast(lang === 'ar' ? 'تمت الإضافة إلى سلّة الطلب ✓' : 'Added to your order bag ✓');
}
document.querySelectorAll('[data-quick-add]').forEach(b => {
  b.addEventListener('click', () => quickAdd(b.dataset.quickAdd));
});

/* ---- Gift card writer ---- */
(function () {
  const to = document.getElementById('giftTo');
  if (!to) return;
  const from = document.getElementById('giftFrom');
  const msg = document.getElementById('giftMsg');
  const cTo = document.getElementById('cardTo');
  const cMsg = document.getElementById('cardMsg');
  const cFrom = document.getElementById('cardFrom');
  const chips = [...document.querySelectorAll('.occasion')];
  const T = {
    ar: { to: 'إلى ', toGhost: 'إلى من تحبّ', from: '— ', fromGhost: '— اسمك', msgGhost: 'من أرضنا، إلى مائدتكم.' },
    en: { to: 'To ', toGhost: 'To someone you love', from: '— ', fromGhost: '— Your name', msgGhost: 'From our land to your table.' }
  };
  function put(node, value, ghost) {
    node.textContent = value || ghost;
    node.classList.toggle('is-ghost', !value);
  }
  function draw() {
    const t = T[lang];
    put(cTo, to.value.trim() && t.to + to.value.trim(), t.toGhost);
    put(cMsg, msg.value.trim(), t.msgGhost);
    put(cFrom, from.value.trim() && t.from + from.value.trim(), t.fromGhost);
  }
  [to, from, msg].forEach(n => n.addEventListener('input', () => {
    if (n === msg) chips.forEach(c => c.classList.remove('is-active'));
    draw();
  }));
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.toggle('is-active', x === c));
    msg.value = lang === 'ar' ? c.dataset.msgAr : c.dataset.msgEn;
    draw();
  }));
  langBtn.addEventListener('click', () => {
    const active = chips.find(c => c.classList.contains('is-active'));
    if (active) msg.value = lang === 'ar' ? active.dataset.msgAr : active.dataset.msgEn;
    draw();
  });
  function cardLines() {
    const ar = lang === 'ar', out = [];
    const active = chips.find(c => c.classList.contains('is-active'));
    if (active) out.push((ar ? 'المناسبة: ' : 'Occasion: ') + active.textContent.trim());
    if (to.value.trim()) out.push((ar ? 'إلى: ' : 'To: ') + to.value.trim());
    if (msg.value.trim()) out.push((ar ? 'الرسالة: ' : 'Message: ') + msg.value.trim());
    if (from.value.trim()) out.push((ar ? 'من: ' : 'From: ') + from.value.trim());
    return out;
  }
  document.getElementById('giftSend').addEventListener('click', () => {
    const ar = lang === 'ar', card = cardLines();
    const lines = [ar ? 'مرحباً hael 🌿، أودّ طلب مجموعة الإرث للهدايا.' : 'Hello hael 🌿, I would like to order the Heritage Gift Set.'];
    if (card.length) lines.push('', ar ? 'بطاقة الإهداء:' : 'Gift card:', ...card);
    window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
  });
  document.getElementById('giftBag').addEventListener('click', () => {
    const note = document.getElementById('custNote');
    const card = cardLines();
    if (note && card.length) note.value = card.join(' | ');
    quickAdd('gift', 'duo');
    openDrawer();
  });
  draw();
})();

/* ---- Gallery lightbox ---- */
(function () {
  const box = document.getElementById('lightbox');
  const shots = [...document.querySelectorAll('.shotg')];
  if (!box || !shots.length) return;
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCap');
  const no = document.getElementById('lightboxNo');
  shots.forEach(a => { const i = a.querySelector('img'); i.dataset.altAr = i.alt; });
  let at = 0, lastFocus = null, x0 = null;
  const ready = {};                      // full-size files already downloaded
  function preload(i) {
    const a = shots[(i + shots.length) % shots.length];
    if (ready[a.href]) return;
    const im = new Image();
    im.onload = () => { ready[a.href] = true; };
    im.src = a.href;
  }
  function fit() {                       // size the frame from the known dimensions, before the file arrives
    const a = shots[at], w = +a.dataset.fullW, h = +a.dataset.fullH;
    const small = window.innerWidth <= 760;
    const k = Math.min((Math.min(window.innerWidth, 1132) - 32) / w, (window.innerHeight - (small ? 176 : 144)) / h, 1.25);
    img.style.width = Math.round(w * k) + 'px';
    img.style.height = Math.round(h * k) + 'px';
  }
  function show(i) {
    at = (i + shots.length) % shots.length;
    const a = shots[at], t = a.querySelector('img');
    const text = lang === 'ar' ? t.dataset.altAr : t.dataset.altEn;
    const want = a.href;
    fit();
    img.alt = text;
    cap.textContent = text;
    no.textContent = (at + 1) + ' / ' + shots.length;
    if (ready[want]) { img.src = want; img.classList.remove('is-loading'); }
    else {
      // the small photo is already on the page: show it at once, then sharpen when the large one lands
      img.src = t.currentSrc || t.src;
      img.classList.add('is-loading');
      const full = new Image();
      full.onload = () => {
        ready[want] = true;
        if (shots[at].href === want) { img.src = want; img.classList.remove('is-loading'); }
      };
      full.src = want;
    }
    preload(at + 1); preload(at - 1);
  }
  function open(i) {
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => box.classList.add('is-open'));
    show(i);
    box.querySelector('.lightbox__close').focus();
  }
  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { box.hidden = true; img.removeAttribute('src'); }, 350);
    if (lastFocus) lastFocus.focus();
  }
  shots.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); open(i); }));
  shots.forEach((a, i) => {              // start fetching as soon as the visitor shows interest
    a.addEventListener('pointerenter', () => preload(i), { once: true });
    a.addEventListener('touchstart', () => preload(i), { once: true, passive: true });
  });
  window.addEventListener('resize', () => { if (!box.hidden) fit(); });
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-lb]');
    if (b) { b.dataset.lb === 'close' ? close() : show(at + (b.dataset.lb === 'next' ? 1 : -1)); return; }
    if (e.target === box) close();
  });
  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
  });
  box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
  });
  langBtn.addEventListener('click', () => shots.forEach(a => {
    const i = a.querySelector('img'); i.alt = lang === 'ar' ? i.dataset.altAr : i.dataset.altEn;
  }));
})();

/* ---- Olive paste flavour picker ---- */
document.querySelectorAll('.flavors').forEach(group => {
  const card = group.closest('.product');
  const tag = card.querySelector('.tag');
  const art = card.querySelector('.product__art');
  function pick(btn) {
    group.querySelectorAll('.flavor').forEach(b => b.classList.toggle('is-active', b === btn));
    if (tag) { tag.dataset.ar = btn.dataset.tagAr; tag.dataset.en = btn.dataset.tagEn; tag.innerHTML = tag.dataset[lang]; }
    if (art) art.style.setProperty('--flavor', btn.style.getPropertyValue('--fc') + '55');
    // the drawn jar wears the same label as the real one
    const band = card.querySelector('.jar__band'), name = card.querySelector('.jar__flavor'), line = card.querySelector('.jar__line');
    if (band) band.setAttribute('fill', btn.style.getPropertyValue('--fc'));
    if (name) name.textContent = PASTE_FLAVORS[btn.dataset.flavor].en.toUpperCase();
    if (line) line.innerHTML = btn.dataset.tagEn;
  }
  group.addEventListener('click', e => { const b = e.target.closest('.flavor'); if (b) pick(b); });
});

/* ---- Recipes: the bottle comes and pours only when the visitor reaches the plate ---- */
document.querySelectorAll('.recipe').forEach(r => {
  if (r.querySelector('.recipe__plate image')) r.classList.add('recipe--photo');
  if (reduceMotion) { r.classList.add('is-oiled'); return; }
  let busy = false;
  function pour() {
    if (busy) return;
    busy = true;
    r.classList.remove('is-oiled');
    void r.offsetWidth;                 // restart the oil thread from empty
    r.classList.add('is-pouring');
    setTimeout(() => { r.classList.add('is-oiled'); r.classList.remove('is-pouring'); busy = false; }, 4300);
  }
  r.addEventListener('mouseenter', pour);
  r.addEventListener('touchstart', pour, { passive: true });
});

/* ---- Article reader: guide articles open over the page instead of leaving it ---- */
(function () {
  const box = document.getElementById('reader');
  if (!box || !window.fetch || !window.DOMParser || location.protocol === 'file:') return;
  const sheet = document.getElementById('readerSheet');
  const title = document.getElementById('readerTitle');
  const img = document.getElementById('readerImg');
  const body = document.getElementById('readerBody');
  const more = document.getElementById('readerMore');
  const bar = document.getElementById('readerProgress');
  const cache = {};
  let lastFocus = null, pageTitle = document.title;
  const slugOf = href => (href.match(/([a-z0-9-]+)\.html(?:[?#].*)?$/i) || [])[1];

  function load(slug) {
    if (!cache[slug]) {
      cache[slug] = fetch('articles/' + slug + '.html').then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      }).then(t => new DOMParser().parseFromString(t, 'text/html'));
    }
    return cache[slug];
  }
  function render(doc) {
    const main = doc.querySelector('main.article');
    if (!main) throw new Error('no article');
    const pic = main.querySelector('.article__img');
    sheet.dir = doc.documentElement.dir || 'rtl';
    sheet.lang = doc.documentElement.lang || 'ar';
    title.textContent = main.querySelector('h1').textContent;
    img.src = pic ? pic.getAttribute('src').replace(/^\.\.\//, '') : 'assets/img/og.jpg';
    body.innerHTML = main.querySelector('.article__body').innerHTML;
    body.querySelectorAll('a[href^="../"]').forEach(a => a.setAttribute('href', a.getAttribute('href').slice(3) || './'));
    const also = main.querySelector('.article__more');
    more.innerHTML = '';
    if (also) {
      const h = document.createElement('h3');
      h.textContent = also.querySelector('h2').textContent;
      const ul = document.createElement('ul');
      also.querySelectorAll('a').forEach(a => {
        const li = document.createElement('li'), l = document.createElement('a');
        l.href = 'articles/' + a.getAttribute('href');
        l.textContent = a.textContent;
        li.appendChild(l); ul.appendChild(li);
      });
      more.append(h, ul);
    }
    document.title = doc.title;
    sheet.scrollTop = 0;
    bar.style.scale = '0 1';
  }
  function show(slug, push) {
    const wasOpen = !box.hidden;
    if (box.hidden) {
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => box.classList.add('is-open'));
    }
    sheet.classList.add('is-loading');
    // one history entry for the whole reading session: Back (or ×) always returns to the page
    if (push) history[wasOpen ? 'replaceState' : 'pushState']({ reader: slug }, '', '#read-' + slug);
    return load(slug).then(doc => {
      render(doc);
      sheet.classList.remove('is-loading');
      document.getElementById('readerClose').focus({ preventScroll: true });
    }).catch(() => { location.href = 'articles/' + slug + '.html'; });
  }
  function hide() {
    if (box.hidden) return;
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    document.title = pageTitle;
    setTimeout(() => { box.hidden = true; }, 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function close() {
    if (history.state && history.state.reader) history.back();
    else { hide(); history.replaceState(null, '', location.pathname + location.search + '#guide'); }
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!/^articles\/[a-z0-9-]+\.html/i.test(href)) return;
    e.preventDefault();
    show(slugOf(href), true);
  });
  document.getElementById('readerClose').addEventListener('click', close);
  document.getElementById('readerBack').addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });
  sheet.addEventListener('scroll', () => {
    const max = sheet.scrollHeight - sheet.clientHeight;
    bar.style.scale = (max > 0 ? Math.min(sheet.scrollTop / max, 1) : 0) + ' 1';
  }, { passive: true });
  window.addEventListener('popstate', e => {
    if (e.state && e.state.reader) show(e.state.reader, false);
    else hide();
  });
  langBtn.addEventListener('click', () => { pageTitle = TITLES[lang]; });
  const m = location.hash.match(/^#read-([a-z0-9-]+)$/i);
  if (m) { history.replaceState({ reader: m[1] }, '', location.hash); show(m[1], false); }
})();
