/* ══════════════════════════════════════════════════
   All About Glass — path routing, mobile nav, enquiry form
   No dependencies. Progressive enhancement: without JS
   every section renders stacked on one page.
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SITE_NAME = 'All About Glass';
  var SITE_URL  = 'https://all-about-glass.vercel.app';
  var DEFAULT_DESC = 'All About Glass จำหน่ายและติดตั้งกระจกและอลูมิเนียมครบวงจร กรุงเทพฯ ปริมณฑล และภาคตะวันออก กระจกใส กระจกเงา กระจกเทมเปอร์ กระจกลามิเนต ราวกันตก บานเฟอร์นิเจอร์ ให้คำปรึกษาฟรี';

  // Each page has its own real URL (served by the rewrites in vercel.json),
  // so Google can index every page — and every article — separately.
  // Keep paths in sync with vercel.json and sitemap.xml.
  var ROUTES = {
    home:     { path: '/',         title: SITE_NAME + ' - รับติดตั้งกระจก อลูมิเนียม กรุงเทพฯ ปริมณฑล และภาคตะวันออก', desc: DEFAULT_DESC },
    about:    { path: '/about',    title: 'เกี่ยวกับเรา — ' + SITE_NAME, desc: 'รู้จักบริษัท ออล อะเบ้าท์ กลาส จำกัด ผู้เชี่ยวชาญงานกระจก ขายและติดตั้งในเจ้าเดียว ราคาชัดเจน ไม่บวกเกินจริง' },
    overview: { path: '/overview', title: 'สินค้าและบริการ — ' + SITE_NAME, desc: 'กระจกทุกประเภทและบริการติดตั้งกระจก-อลูมิเนียมครบวงจร โดย All About Glass' },
    services: { path: '/services', title: 'บริการ — ' + SITE_NAME, desc: 'บริการติดตั้งบานอลูมิเนียม บานเฟอร์นิเจอร์กระจก กระจกอาคาร ผนังกระจก และราวกันตก กรุงเทพฯ ปริมณฑล และภาคตะวันออก' },
    products: { path: '/products', title: 'สินค้า — ' + SITE_NAME, desc: 'กระจกใส กระจกเงา กระจกเทมเปอร์นิรภัย กระจกลามิเนต กระจกฝ้า และกระจกสี เลือกได้ 3 ระดับราคา' },
    gallery:  { path: '/gallery',  title: 'ผลงาน — ' + SITE_NAME, desc: 'ตัวอย่างผลงานติดตั้งกระจกและอลูมิเนียมของ All About Glass' },
    articles: { path: '/articles', title: 'บทความ — ' + SITE_NAME, desc: 'สาระความรู้เรื่องกระจกและอลูมิเนียมสำหรับเจ้าของบ้าน' },
    'article-choosing-glass':     { path: '/articles/choosing-glass',        title: 'วิธีเลือกกระจกให้เหมาะกับบ้านของคุณ — ' + SITE_NAME, desc: 'แนะนำการเลือกกระจกใส เทมเปอร์ ฝ้า และลามิเนต ให้เหมาะกับแต่ละพื้นที่ในบ้าน' },
    'article-tempered-laminated': { path: '/articles/tempered-vs-laminated', title: 'กระจกเทมเปอร์ vs กระจกลามิเนต — ' + SITE_NAME, desc: 'เปรียบเทียบกระจกเทมเปอร์และกระจกลามิเนต ต่างกันอย่างไร ควรใช้จุดไหนในบ้าน' },
    'article-decor-ideas':        { path: '/articles/glass-decor-ideas',     title: 'ไอเดียตกแต่งบ้านด้วยงานกระจก — ' + SITE_NAME, desc: 'รวมไอเดียผนังกระจก ราวกันตกกระจก กระจกเงา และเฟอร์นิเจอร์กระจก เพิ่มความโปร่งโล่งให้บ้าน' },
    contact:  { path: '/contact',  title: 'ติดต่อเรา — ' + SITE_NAME, desc: 'ติดต่อ All About Glass โทร 062-964-6492 LINE: allaboutglass ขอใบเสนอราคาฟรี' }
  };

  var ROUTE_BY_PATH = {};
  Object.keys(ROUTES).forEach(function (name) { ROUTE_BY_PATH[ROUTES[name].path] = name; });

  var DEFAULT_ROUTE = 'home';

  // Matches the max-width in styles.css that switches the header from the
  // desktop dropdown nav to the hamburger + mobile-nav panel.
  var NAV_BREAKPOINT = 940;

  var pages    = Array.prototype.slice.call(document.querySelectorAll('[data-page]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-route]'));
  var nav      = document.getElementById('mobile-nav');
  var toggle   = document.querySelector('.nav-toggle');
  // Parent items that stay highlighted for any of several routes (the
  // สินค้าและบริการ dropdown covers both services and products).
  var groupLinks = Array.prototype.slice.call(document.querySelectorAll('[data-active-for]'));

  var speedDial      = document.getElementById('speed-dial');
  var dialToggle      = speedDial && speedDial.querySelector('.speed-dial__toggle');
  var dialSatellites  = speedDial ? Array.prototype.slice.call(speedDial.querySelectorAll('.speed-dial__satellite')) : [];
  var dialHideTimer;

  /* ── Router ─────────────────────────────────── */

  function normalisePath(pathname) {
    var p = pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
    return p === '' ? '/' : p;
  }

  function routeFromLocation() {
    return ROUTE_BY_PATH[normalisePath(location.pathname)] || DEFAULT_ROUTE;
  }

  function setMeta(selector, attr, value) {
    var el = document.head.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  function render(route, opts) {
    pages.forEach(function (page) {
      page.hidden = page.dataset.page !== route;
    });

    navLinks.forEach(function (link) {
      if (link.dataset.route === route) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    groupLinks.forEach(function (link) {
      var covers = link.dataset.activeFor.split(/\s+/);
      link.classList.toggle('is-active', covers.indexOf(route) !== -1);
    });

    var r = ROUTES[route];
    var url = SITE_URL + r.path;
    document.title = r.title;
    setMeta('meta[name="description"]', 'content', r.desc);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', r.title);
    setMeta('meta[property="og:description"]', 'content', r.desc);

    if (!opts || opts.scroll !== false) {
      window.scrollTo(0, 0);
    }
  }

  function onRouteChange() {
    closeNav();
    closeSubmenus();
    setDialOpen(false);
    render(routeFromLocation());
  }

  function go(path) {
    if (normalisePath(location.pathname) !== path) history.pushState(null, '', path);
    onRouteChange();
  }

  // Internal links are plain <a href="/about"> — they work without JS (the
  // server returns this same page). With JS, swap pages without a reload.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.origin !== location.origin) return;
    var path = normalisePath(a.pathname);
    if (!ROUTE_BY_PATH[path] || a.hash) return;
    e.preventDefault();
    go(path);
  });

  /* ── Mobile nav ─────────────────────────────── */

  function openNav() {
    if (!nav || !toggle) return;
    nav.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'ปิดเมนู');
  }

  function closeNav() {
    if (!nav || !toggle) return;
    nav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'เปิดเมนู');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') closeNav();
      else openNav();
    });
  }

  // Clicking the link of the page already showing changes nothing — close manually.
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
  }

  // Resizing past the breakpoint (e.g. rotating a tablet, or a resized
  // desktop window) should drop the panel even without another interaction —
  // otherwise it can be left open-but-hidden and reappear at a narrower width.
  window.addEventListener('resize', function () {
    if (window.innerWidth > NAV_BREAKPOINT) closeNav();
  });

  /* ── สินค้าและบริการ dropdown ────────────────── */
  // CSS already reveals the panel on :hover / :focus-within so it works without
  // JS; this only keeps aria-expanded honest for assistive tech.

  var subs = Array.prototype.slice.call(document.querySelectorAll('.has-sub'));

  subs.forEach(function (sub) {
    var trigger = sub.querySelector('a[aria-haspopup]');

    function setOpen(open) {
      sub.classList.toggle('is-open', open);
      if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    sub.addEventListener('mouseenter', function () { setOpen(true); });
    sub.addEventListener('mouseleave', function () { setOpen(false); });
    sub.addEventListener('focusin',    function () { setOpen(true); });
    sub.addEventListener('focusout',   function () {
      // focusout fires before focus lands on the next element
      setTimeout(function () {
        if (!sub.contains(document.activeElement)) setOpen(false);
      }, 0);
    });
  });

  function closeSubmenus() {
    subs.forEach(function (sub) {
      sub.classList.remove('is-open');
      var trigger = sub.querySelector('a[aria-haspopup]');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (sub.contains(document.activeElement)) document.activeElement.blur();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeNav(); closeSubmenus(); }
  });

  document.addEventListener('click', function (e) {
    if (!nav || nav.hidden) return;
    if (e.target.closest('#mobile-nav') || e.target.closest('.nav-toggle')) return;
    closeNav();
  });

  /* ── Floating speed-dial CTA ──────────────────── */
  // Opens on hover for mouse users (matches the design) and on click/Enter
  // for touch and keyboard, since hover alone is unreachable on either.

  function setDialOpen(open) {
    if (!speedDial || !dialToggle) return;
    clearTimeout(dialHideTimer);
    speedDial.classList.toggle('is-open', open);
    dialToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // Keep hidden satellites out of the Tab order rather than just invisible.
    dialSatellites.forEach(function (a) { a.tabIndex = open ? 0 : -1; });
  }

  if (speedDial && dialToggle) {
    speedDial.addEventListener('mouseenter', function () { setDialOpen(true); });
    speedDial.addEventListener('mouseleave', function () {
      // Short delay so crossing from the toggle to a satellite doesn't snap shut.
      dialHideTimer = setTimeout(function () { setDialOpen(false); }, 150);
    });

    dialToggle.addEventListener('click', function () {
      setDialOpen(dialToggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dialToggle.getAttribute('aria-expanded') === 'true') {
        setDialOpen(false);
        dialToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (speedDial.contains(e.target)) return;
      setDialOpen(false);
    });
  }

  /* ── Enquiry form ───────────────────────────── */

  var form = document.getElementById('enquiry-form');

  if (form) {
    var status = form.querySelector('.form-status');

    var rules = {
      name:   function (v) { return v.trim().length >= 2; },
      phone:  function (v) { return (v.replace(/\D/g, '').length >= 9); },
      detail: function (v) { return v.trim().length >= 5; }
    };

    function setFieldError(field, invalid) {
      var msg = form.querySelector('[data-error-for="' + field.name + '"]');
      field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      if (msg) {
        msg.hidden = !invalid;
        field.setAttribute('aria-describedby', invalid ? 'err-' + field.name : '');
        msg.id = 'err-' + field.name;
      }
    }

    function validate() {
      var firstInvalid = null;

      Object.keys(rules).forEach(function (name) {
        var field = form.elements[name];
        if (!field) return;
        var ok = rules[name](field.value);
        setFieldError(field, !ok);
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      return firstInvalid;
    }

    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true' && rules[name](field.value)) {
          setFieldError(field, false);
        }
      });
    });

    function say(message, state) {
      if (!status) return;
      status.textContent = message;
      status.dataset.state = state || 'info';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = validate();
      if (firstInvalid) {
        say('กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง', 'error');
        firstInvalid.focus();
        return;
      }

      var endpoint = form.dataset.endpoint;

      if (!endpoint) {
        // No backend wired yet — point the visitor at a channel that works today.
        say('ขณะนี้ระบบส่งข้อความออนไลน์ยังไม่เปิดใช้งาน กรุณาติดต่อเราโดยตรงที่ 062-964-6492 หรือ LINE: allaboutglass', 'error');
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      say('กำลังส่งข้อความ…');

      // Accept: application/json asks Formspree (and similar form backends)
      // to reply with JSON instead of redirecting, which is what res.ok below
      // expects.
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name:    form.elements.name.value.trim(),
          phone:   form.elements.phone.value.trim(),
          line_id: form.elements.line_id.value.trim(),
          detail:  form.elements.detail.value.trim()
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          say('ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด');
        })
        .catch(function () {
          say('ส่งข้อความไม่สำเร็จ กรุณาโทร 062-964-6492 หรือ LINE: allaboutglass', 'error');
        })
        .then(function () {
          button.disabled = false;
        });
    });
  }

  /* ── Boot ───────────────────────────────────── */

  // Old links shared before clean URLs (e.g. …/#/contact on Facebook) still
  // land on the right page: translate the hash route to its new path.
  if (location.hash.indexOf('#/') === 0) {
    var legacy = location.hash.slice(2).replace(/\/+$/, '');
    var name = Object.prototype.hasOwnProperty.call(ROUTES, legacy) ? legacy : DEFAULT_ROUTE;
    history.replaceState(null, '', ROUTES[name].path);
  }

  window.addEventListener('popstate', onRouteChange);
  render(routeFromLocation(), { scroll: false });
})();
