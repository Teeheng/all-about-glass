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

  // Each page is its own HTML file, generated from src/index.html by
  // scripts/build.py with that page's <title>, description and share preview
  // baked in. The titles/descriptions below are the single source of truth:
  // build.py reads them from here. Keep paths in sync with sitemap.xml.
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
    faq:      { path: '/faq',      title: 'คำถามที่พบบ่อย และขั้นตอนการทำงาน — ' + SITE_NAME, desc: 'ตอบคำถามก่อนทำงานกระจก: คิดราคาอย่างไร มีกี่ระดับราคา เลือกกระจกชนิดไหนดี พื้นที่บริการ และขั้นตอนตั้งแต่ปรึกษาจนติดตั้งเสร็จ' },
    privacy:  { path: '/privacy',  title: 'นโยบายความเป็นส่วนตัว — ' + SITE_NAME, desc: 'นโยบายความเป็นส่วนตัวและการใช้คุกกี้ของเว็บไซต์ All About Glass' },
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

  function hasPage(route) {
    return pages.some(function (page) { return page.dataset.page === route; });
  }

  function render(route, opts) {
    // A generated page file holds only its own section; fall back to whatever
    // section this file has (e.g. the home file served for an unknown path).
    if (!hasPage(route) && pages.length) route = pages[0].dataset.page;

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

    // Each generated file already carries its own title/meta; only update
    // them when switching sections inside one file (the all-pages source
    // opened directly, or no-build local preview).
    var r = ROUTES[route];
    if (pages.length > 1 && r) {
      var url = SITE_URL + r.path;
      document.title = r.title;
      setMeta('meta[name="description"]', 'content', r.desc);
      setMeta('link[rel="canonical"]', 'href', url);
      setMeta('meta[property="og:url"]', 'content', url);
      setMeta('meta[property="og:title"]', 'content', r.title);
      setMeta('meta[property="og:description"]', 'content', r.desc);
    }

    if (!opts || opts.scroll !== false) {
      window.scrollTo(0, 0);
    }
  }

  function onRouteChange(route) {
    closeNav();
    closeSubmenus();
    setDialOpen(false);
    render(typeof route === 'string' ? route : routeFromLocation());
  }

  function go(path) {
    var changed = normalisePath(location.pathname) !== path;
    // Update title/meta first: GA4 (enhanced measurement) logs a page_view
    // the moment pushState runs, reading document.title at that instant.
    onRouteChange(ROUTE_BY_PATH[path]);
    if (changed) {
      history.pushState(null, '', path);
      fbPageView();
    }
  }

  // GA4 counts pushState page changes by itself; Meta Pixel does not.
  // Pixel calls go out only after ยอมรับ — not even queued before that.
  function fbReady() {
    return typeof window.fbq === 'function' && readConsent() === 'granted';
  }

  function fbPageView() {
    if (fbReady()) window.fbq('track', 'PageView');
  }

  // Internal links are plain <a href="/about">. On the live site each page is
  // its own file, so links to other pages load normally (that is what makes
  // every page's share preview and title correct). Only when the target
  // section is in this same file do we swap without a reload.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.origin !== location.origin) return;
    var path = normalisePath(a.pathname);
    if (!ROUTE_BY_PATH[path] || a.hash || !hasPage(ROUTE_BY_PATH[path])) return;
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
          track('generate_lead', { method: 'contact_form' });
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

  /* ── Analytics events ───────────────────────── */
  // GA4 is loaded in <head>. Clicks on phone / LINE / Facebook links anywhere
  // (contact page, speed-dial) become events — mark click_call, click_line and
  // generate_lead as Key events in GA4 to count them as leads.

  // Meta standard events for the same actions: calls and LINE taps are
  // "Contact", a sent enquiry form is "Lead" — usable as ad optimisation goals.
  var FB_EVENTS = {
    click_call:    ['Contact', { method: 'phone' }],
    click_line:    ['Contact', { method: 'line' }],
    generate_lead: ['Lead',    { method: 'contact_form' }]
  };

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    var fb = FB_EVENTS[name];
    if (fb && fbReady()) window.fbq('track', fb[0], fb[1]);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    var page = a.closest('[data-page]');
    var where = a.closest('#speed-dial') ? 'speed_dial' : (page ? page.dataset.page : 'other');
    if (href.indexOf('tel:') === 0)               track('click_call',     { link_location: where });
    else if (href.indexOf('line.me') !== -1)      track('click_line',     { link_location: where });
    else if (href.indexOf('facebook.com') !== -1) track('click_facebook', { link_location: where });
  });

  /* ── Cookie consent (PDPA) ──────────────────── */
  // The banner shows until the visitor chooses; the choice is applied to GA4
  // Consent Mode and remembered. /privacy has a button to choose again.

  var consentBar = document.getElementById('consent');

  function readConsent() {
    try { return localStorage.getItem('aag-consent'); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem('aag-consent', value); } catch (e) {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: value, ad_storage: value, ad_user_data: value, ad_personalization: value });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('consent', value === 'granted' ? 'grant' : 'revoke');
      // The load-time PageView was held back by the revoke — count this page now.
      if (value === 'granted') fbPageView();
    }
    if (consentBar) consentBar.hidden = true;
  }

  if (consentBar) {
    if (!readConsent()) consentBar.hidden = false;
    consentBar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (b) setConsent(b.dataset.consent);
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-consent-reset]') || !consentBar) return;
    try { localStorage.removeItem('aag-consent'); } catch (err) {}
    consentBar.hidden = false;
    var accept = consentBar.querySelector('[data-consent="granted"]');
    if (accept) accept.focus();
  });

  /* ── Boot ───────────────────────────────────── */

  // Old links shared before clean URLs (e.g. …/#/contact on Facebook) still
  // land on the right page: translate the hash route to its new path.
  if (location.hash.indexOf('#/') === 0) {
    var legacy = location.hash.slice(2).replace(/\/+$/, '');
    var name = Object.prototype.hasOwnProperty.call(ROUTES, legacy) ? legacy : DEFAULT_ROUTE;
    if (hasPage(name)) history.replaceState(null, '', ROUTES[name].path);
    else location.replace(ROUTES[name].path);
  }

  window.addEventListener('popstate', function () {
    var route = routeFromLocation();
    if (!hasPage(route)) { location.reload(); return; }
    onRouteChange(route);
    fbPageView();
  });
  render(routeFromLocation(), { scroll: false });
})();
