/* ══════════════════════════════════════════════════
   All About Glass — routing, mobile nav, enquiry form
   No dependencies. Progressive enhancement: without JS
   every section renders stacked on one page.
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SITE_NAME = 'All About Glass';

  var ROUTES = {
    home:     { hash: '#/',         title: SITE_NAME + ' - รับติดตั้งกระจก อลูมิเนียม กรุงเทพฯ ปริมณฑล และภาคตะวันออก' },
    about:    { hash: '#/about',    title: 'เกี่ยวกับเรา — ' + SITE_NAME },
    overview: { hash: '#/overview', title: 'สินค้าและบริการ — ' + SITE_NAME },
    services: { hash: '#/services', title: 'บริการ — ' + SITE_NAME },
    products: { hash: '#/products', title: 'สินค้า — ' + SITE_NAME },
    gallery:  { hash: '#/gallery',  title: 'ผลงาน — ' + SITE_NAME },
    articles: { hash: '#/articles', title: 'บทความ — ' + SITE_NAME },
    'article-choosing-glass':     { hash: '#/article-choosing-glass',     title: 'วิธีเลือกกระจกให้เหมาะกับบ้านของคุณ — ' + SITE_NAME },
    'article-tempered-laminated': { hash: '#/article-tempered-laminated', title: 'กระจกเทมเปอร์ vs กระจกลามิเนต — ' + SITE_NAME },
    'article-decor-ideas':        { hash: '#/article-decor-ideas',        title: 'ไอเดียตกแต่งบ้านด้วยงานกระจก — ' + SITE_NAME },
    contact:  { hash: '#/contact',  title: 'ติดต่อเรา — ' + SITE_NAME }
  };

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

  function routeFromHash() {
    var path = (location.hash || '').replace(/^#\/?/, '').replace(/\/+$/, '');
    return Object.prototype.hasOwnProperty.call(ROUTES, path) ? path : DEFAULT_ROUTE;
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

    document.title = ROUTES[route].title;

    if (!opts || opts.scroll !== false) {
      window.scrollTo(0, 0);
    }
  }

  function onRouteChange() {
    closeNav();
    closeSubmenus();
    setDialOpen(false);
    render(routeFromHash());
  }

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

  // Clicking a link whose hash is already active fires no hashchange — close manually.
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

  window.addEventListener('hashchange', onRouteChange);
  render(routeFromHash(), { scroll: false });
})();
