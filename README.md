# All About Glass — website

Static marketing site for บริษัท ออล อะเบ้าท์ กลาส จำกัด (ศรีราชา, ชลบุรี).

Implemented from the Claude Design project
[All About Glass website](https://claude.ai/design/p/ffbe7aa9-f5a7-4f78-b3e1-62586fe4f542).

## Run

```bash
python -m http.server 4321
```

Then open <http://localhost:4321>. No build step, no dependencies.

## Layout

```
index.html                      the site (all six pages)
assets/css/styles.css           design tokens + layout + responsive rules
assets/js/app.js                hash router, mobile nav, enquiry form
uploads/…_1.jpg                 AAG logo (also used as favicon / og:image)

All About Glass.dc.html         imported design source — reference only
support.js                      dc-runtime for the design source — not used by the site
```

`All About Glass.dc.html` and `support.js` are the untouched import from Claude Design.
The shipping site is `index.html`; editing the `.dc.html` does not change it.

## Re-importing after a design change

When the Claude Design project is edited, ask Claude Code to pull it again — it re-reads
project `ffbe7aa9-f5a7-4f78-b3e1-62586fe4f542`, overwrites the two import files, and ports
the diff into `index.html` / `assets/`. Nothing under `assets/` is generated, so the port
is a deliberate edit each time, not a regeneration.

## How it works

Seven pages live as `<section data-page="…">` in `index.html`. `app.js` shows one at a
time based on the URL hash, so pages are linkable, bookmarkable, and the browser back
button works. An unknown hash falls back to home.

| page | hash |
| --- | --- |
| หน้าแรก | `#/` |
| เกี่ยวกับเรา | `#/about` |
| สินค้า | `#/products` |
| บริการ | `#/services` |
| ผลงาน | `#/gallery` |
| บทความ | `#/articles` |
| ติดต่อเรา | `#/contact` |

**Two separate nav elements, not one CSS-reflowed nav.** `#primary-nav` (desktop, shown
above the nav breakpoint) has the `สินค้าและบริการ` hover/focus dropdown over the products
and services pages, plus a standalone "ขอใบเสนอราคา" CTA button. `#mobile-nav` (shown below
it) is a flat list with no dropdown — สินค้า and บริการต่างๆ appear as plain sibling links,
and ติดต่อเรา merges with the CTA into one bold `.mobile-nav__cta` link. This mirrors the
design's own `isDesktopNav`/`isMobileNav` split (two conditionally-rendered `<nav>` blocks),
which replaced an earlier revision where the drawer was the desktop nav's markup reflowed
by CSS. `[data-route]` lives on links in both navs, so `aria-current` stays in sync in
whichever one is currently visible.

Without JavaScript every section renders stacked on one page and the dropdown falls back
to CSS `:hover`/`:focus-within`; the mobile nav (JS-toggled `hidden`) stays closed, but its
links are still in the document and reachable.

**Two independent responsive breakpoints, not one.** Content layout (section padding,
heading size, grid columns) switches at 860px and 700px — copied exactly from the design's
own `isMobile`/`isNarrow` JS thresholds (`styles.css`, "Layout tiers"). The nav, however,
switches to the hamburger at **940px**, not 860px: measured in-browser that at the design's
19px nav font plus gap plus "สินค้าและบริการ" plus บทความ, the desktop nav row wraps to two
lines in the 900–920px band if it's still asked to render there. Below 940px there's no
wrap risk because the desktop nav is gone entirely (hidden, hamburger shown instead) — so
the fix is a nav-switch breakpoint independent of the content-layout ones, not a shared
value. This means content already uses the 860px tier's smaller padding for roughly 80px
(860–940px) before the header itself switches to hamburger; that's intentional, not a bug.
See the comments above the relevant media queries in `styles.css` before changing either.

Design tokens (colours, spacing, radii) are CSS custom properties at the top of
`styles.css` and match the design source exactly. Body font is Sarabun — the design makes
this swappable via an editor prop (Sarabun / Prompt / Noto Sans Thai / Kanit / Mitr) for
previewing in Claude Design, but a static site has no prop system to hang that on, so only
the default font is shipped and loaded. The header logo is a fixed 58px crop of a 104px-tall
render (trims whitespace from the source file) at every breakpoint — the design doesn't
vary it by screen size, so this build doesn't either.

**Floating speed-dial CTA** (bottom-right, all pages) expands to phone / LINE / Facebook
buttons. Opens on hover for mouse users, and on click and Escape for touch and keyboard —
hover alone isn't reachable on either, so `app.js` adds those independently of the design
source, which only wired hover.

## Still to wire up

**Photography.** The design ships with placeholder tiles and so does this build —
the hero image, the about image, eight gallery tiles, and three article thumbnails.
Each is marked with an HTML comment. Replace the `.frame` divs with `<img>` when real
photos are available.

**Contact form.** There is no backend. The form validates client-side, then tells the
visitor to call or LINE instead. To enable real submissions, set the endpoint on the
form in `index.html`:

```html
<form class="contact__form" id="enquiry-form" novalidate data-endpoint="https://…">
```

`app.js` then POSTs JSON (`name`, `phone`, `detail`) if no file is attached, or
`multipart/form-data` (via `new FormData(form)`) if one is, and handles the
success/failure states either way.

**File attachment — security is entirely unimplemented, by design, until there's a
backend.** The form has an optional file field (images, PDF, or DWG; 10 MB cap). The
10 MB check runs in the visitor's browser — it stops accidental oversized uploads,
nothing more. It is not a security boundary: a spammer can skip it, and the `accept`
attribute is a picker hint, not enforcement. Before wiring `data-endpoint` to a real
backend, that backend must independently: cap request/file size, check file content
(magic bytes, not just extension or the client-reported MIME type), store uploads
outside any web-executable path, and rate-limit submissions. None of that exists yet.

**Social links.** The design lists the LINE ID (`allaboutglass`) and Facebook handle
(`allaboutglassth`) as plain text. They are linked here to
`https://line.me/ti/p/~allaboutglass` and `https://www.facebook.com/allaboutglassth` —
worth confirming both resolve before going live.
