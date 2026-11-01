# All About Glass — website

Static marketing site for บริษัท ออล อะเบ้าท์ กลาส จำกัด (ศรีราชา, ชลบุรี).

Implemented from the Claude Design project
[All About Glass website](https://claude.ai/design/p/ffbe7aa9-f5a7-4f78-b3e1-62586fe4f542).

## Run

```bash
python -m http.server 4321
```

Then open <http://localhost:4321>. No dependencies.

## Editing pages — always rebuild

**Edit `src/index.html`, never the generated files.** Every page is its own HTML file
(`index.html`, `about/index.html`, `articles/choosing-glass/index.html`, …), generated from
the one source file by:

```bash
python scripts/build.py
```

Run it after any change to `src/index.html` or to `ROUTES` in `assets/js/app.js`, and commit
the generated files together with the source. Vercel serves them as-is (no build step there).

Why separate files: Facebook, LINE and search engines read a page's `<title>`, description
and share preview straight from the HTML without running JavaScript. With one shared
`index.html`, every shared link previewed as the home page. Each generated file has its
own title/description/canonical/`og:*`, exactly one `<h1>`, and only its own section.

`build.py` also:
- reads page titles and descriptions from `ROUTES` in `app.js` (the single place they live);
- rewrites the `rewrites` list in `vercel.json` and regenerates `sitemap.xml`;
- adds FAQPage structured data to `/faq` from its `<details class="faq-item">` blocks, so
  the structured data always matches the visible answers.

To add a page: add a `<!-- ══ NAME ══ -->` comment + `<section class="page …" data-page="…">`
inside `<main>` in `src/index.html`, add the route to `ROUTES` in `app.js`, then rebuild.

## Layout

```
src/index.html                  SOURCE — all pages in one file (edit this)
index.html, */index.html        GENERATED — one file per page (don't edit)
scripts/build.py                generator (see above)
assets/css/styles.css           design tokens + layout + responsive rules
assets/js/app.js                ROUTES (titles/descriptions), mobile nav, enquiry form, analytics
uploads/aag-logo.png            AAG logo (header + speed-dial)
uploads/LINE_ALBUM_…_1.jpg      old logo copy — only the .dc.html design source still uses it
uploads/og-image.jpg            1200×630 link-share image; favicon.png, apple-touch-icon.png
vercel.json                     clean URL → generated file + upload caching
robots.txt, sitemap.xml         for search engines

All About Glass.dc.html         imported design source — reference only
support.js                      dc-runtime for the design source — not used by the site
image-slot.js                   Claude Design's drag-drop image-placeholder component —
                                 reference only, not used by the site (see below)
```

`All About Glass.dc.html`, `support.js`, and `image-slot.js` are the untouched import from
Claude Design. The shipping site is built from `src/index.html`; editing the `.dc.html` does
not change it.

**`image-slot.js` is never loaded by the site.** The design places images via a
custom `<image-slot>` element — a drag-and-drop placeholder tied to Claude Design's
`window.omelette` runtime bridge. Outside that runtime the slot is read-only, so wherever
the design uses `<image-slot>`, this build keeps using the `.frame` placeholder `<div>`
pattern instead.

## Re-importing after a design change

When the Claude Design project is edited, ask Claude Code to pull it again — it re-reads
project `ffbe7aa9-f5a7-4f78-b3e1-62586fe4f542`, overwrites the two import files, and ports
the diff into `src/index.html` / `assets/`, then runs `scripts/build.py`. Nothing under `assets/` is generated, so the port
is a deliberate edit each time, not a regeneration.

## How it works

Sixteen pages live as `<section data-page="…">` in `src/index.html`; `build.py` writes each
one to its own file at its real URL. Internal links are plain `<a href="/about">` and load
the page normally. (`app.js` can still swap sections without a reload when several are in one
file — e.g. if `src/index.html` is opened directly — but the live site doesn't use that.)

| page | path |
| --- | --- |
| หน้าแรก | `/` |
| เกี่ยวกับเรา | `/about` |
| สินค้าและบริการ (hub) | `/overview` |
| สินค้า | `/products` |
| บริการ | `/services` |
| ผลงาน — **hidden**: not in nav/sitemap, `noindex` until real photos (see `NOINDEX` in build.py) | `/gallery` |
| บทความ (listing) | `/articles` |
| — วิธีเลือกกระจกให้เหมาะกับบ้าน | `/articles/choosing-glass` |
| — เทมเปอร์ vs ลามิเนต | `/articles/tempered-vs-laminated` |
| — ไอเดียตกแต่งบ้านด้วยกระจก | `/articles/glass-decor-ideas` |
| พื้นที่ให้บริการ (hub) | `/service-area` |
| — ศรีราชา | `/service-area/sriracha` |
| — ชลบุรีและภาคตะวันออก | `/service-area/chonburi` |
| — กรุงเทพฯ และปริมณฑล | `/service-area/bangkok` |
| คำถามที่พบบ่อย + ขั้นตอนการทำงาน | `/faq` |
| นโยบายความเป็นส่วนตัว | `/privacy` |
| ติดต่อเรา | `/contact` |

**Adding a page means editing three places:** the `ROUTES` map in `app.js`, the
`rewrites` list in `vercel.json`, and `sitemap.xml`. Unknown paths are a real 404 (no
catch-all rewrite), so Google doesn't index soft-404 duplicates of the home page.

**Old hash links still work.** Links shared before the switch (e.g. `…/#/contact` or
`…/?fbclid=…#/article-choosing-glass` on Facebook) are translated on load with
`history.replaceState` to the matching path. Asset URLs in `index.html` are root-absolute
(`/assets/…`, `/uploads/…`) so they resolve from nested paths like `/articles/…`.

**SEO files:** `robots.txt`, `sitemap.xml`, and a schema.org `HomeAndConstructionBusiness`
JSON-LD block in `<head>` (name, phone, email, address, area served, social links — no
opening hours or ratings, since none are published).

**Analytics + PDPA consent.** GA4 (`G-HVJC0WM71K`) loads in `<head>` with Consent Mode
v2: everything defaults to `denied` (cookieless pings only) until the visitor clicks
ยอมรับ on the cookie bar (`#consent`). The choice is stored in `localStorage`
(`aag-consent`) and re-applied on each visit; `/privacy` has a button that clears it and
re-opens the bar. GA4 enhanced measurement counts page changes from `history.pushState` —
`app.js` updates the title *before* pushing, so each page_view carries the right title.
Custom events from `app.js`: `click_call`, `click_line`, `click_facebook` (with
`link_location`: page name or `speed_dial`) and `generate_lead` on a successful form send.
Mark `click_call`, `click_line` and `generate_lead` as **Key events** in GA4 admin.

**Meta Pixel** (dataset "AAG Website", `1096669096523880`, linked to AAG's ad account
`1676731489917505` — never TPG's) loads in `<head>` under the same consent rule: `fbq('consent',
'revoke')` until ยอมรับ, and `app.js` (`fbReady()`) sends nothing to Meta before that. Because
pages change without reloading, `app.js` fires `PageView` on each page change and once on
accept. Standard events: `Contact` (`method: phone|line`) for call/LINE taps and `Lead` for a
sent form — use these as optimisation goals when boosting posts.

**Brand assets:** `uploads/aag-logo.png` is the official logo file (same square framing as
the old LINE-album JPG, so the header's whitespace crop is unchanged).
`uploads/favicon.png` / `apple-touch-icon.png` are the "AAG" letter mark only;
`uploads/og-image.jpg` (1200×630) is the link-share image. `--navy` is the Brand Guideline
navy `#00285B`.

Each article listing card (`.article-card`) is itself an `<a>` to one of the three detail
pages — same pattern as `.overview-card`: link-color inheritance is neutralized by setting
an explicit `color` on the child `h3`/`p`, not by resetting color on the card itself. The
nav's "บทความ" link uses `data-active-for="articles article-choosing-glass …"` (the
multi-route group-highlight mechanism `/overview`'s dropdown trigger also uses) so it stays
highlighted while reading an article, not just on the listing.

`/overview` is a hub page — two large link-cards routing to `/products` and `/services`.
The desktop nav's "สินค้าและบริการ" label now routes here (previously it went straight to
`/services`); its hover dropdown still links directly to `/products` and `/services`. The
mobile nav collapsed to a single "สินค้าและบริการ" → `/overview` link — no more separate
สินค้า/บริการต่างๆ rows. Both link elements use `data-active-for="services products
overview"` so the parent stays highlighted on any of the three pages.

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
source, which only wired hover. The main toggle button shows the company logo (`.speed-dial__logo`,
the same file as the header) rather than an icon that swaps between an open/closed state —
the design dropped that swap in favour of a single wiggle animation on hover
(`speed-dial-wiggle`, a five-step rotate shake, `0.4s`), which this build ported exactly.

**Visual language**: pills, not sharp corners. Buttons, the nav CTA, the eyebrow badge,
and card number badges are all `border-radius: var(--radius-pill)` (9999px) now; cards and
images use `var(--radius-lg)` (8px); the hero lost its gradient + diagonal grain texture in
favour of a flat `#0a1f3d`; h1/h2 dropped from weight 700 to 300 with slight letter-spacing;
service/product/article cards moved from white-with-border to a flat `#f5f7fa`, no border.
These are CSS-token changes only — `:root` in `styles.css` gained `--radius-lg` and
`--radius-pill` alongside the existing `--radius`/`--radius-sm`.

**Not ported: fixed pixel dimensions on the hero.** A later pull of the design source had
`width: 619px; height: 188px` baked into the h1's inline style, `width: 519px; height: 125px`
on the lead paragraph, and `width: 443px; height: 438px` on the `<video>` — on top of the
existing responsive `h1Size`/`gridCols2` values, not replacing them. These read as leftover
artifacts from resizing an element by hand in the design canvas, not a deliberate move away
from the responsive hero that's been tuned across several syncs (including the 1:1 media-box
fix so the video doesn't letterbox — see the earlier commit). Applying them literally would
have broken that at every breakpoint. Confirmed with the user and pushed the correction back
to the Claude Design project via DesignSync — source and site are in sync on this again.

**Hero h1 first line never wraps.** `รับติดตั้งกระจกและอลูมิเนียม` (before the `<br>`) is
wrapped in `.hero__nowrap` (`white-space: nowrap`) at the user's request. That alone doesn't
guarantee it fits — nowrap text ignores its container and just overflows if too wide, which
`body`'s `overflow-x: hidden` then clips silently instead of showing a scrollbar. Measured
in-browser: at the existing 32px narrow-tier size the phrase is 373px wide but only ~335px
is available below 430px viewports, so it was quietly losing its right edge. Added one more
font-size step (24px below 429px, `styles.css`) sized with margin for a 320px viewport, not
just the 375px one tested — check both if this phrase or its font-size changes again.

**Service-area copy is Bangkok/vicinity + Eastern region, not Sriracha-specific.** Per
request, every marketing mention of "ศรีราชา ชลบุรี" as the target area (`<title>`, meta
description/keywords, og tags, hero h1/lead, About h2, Services h2, and the matching
`app.js` route title) now reads "กรุงเทพฯ ปริมณฑล และภาคตะวันออก" instead. The **contact
section's street address is unchanged** — `127/26 ต.สุรศักดิ์ อ.ศรีราชา จ.ชลบุรี 20110` is
the company's real registered location, not a marketing claim, so it stays regardless of
which area the copy is pitching to. `ชลบุรี` alone is kept as one meta keyword since the
new area still includes it (part of ภาคตะวันออก) and it's where the company is actually
based — only the headline positioning moved away from naming Sriracha specifically.

## Still to wire up

**Photography.** The design ships with placeholder tiles and so does this build —
the about image and eight gallery tiles still need real photos.

**Article images are done** (`uploads/articles/*.jpg`) — AI-generated per article
(prompts written to match the site's navy/white palette and each article's topic,
images made externally, then dropped in and wired up here), converted from the
original ~2-3 MB PNGs to ~150-270 KB JPEGs at 1280px wide. `.frame__img` fills the
existing `.frame frame--wide` placeholder box via `object-fit: cover`, reused for both
the listing thumbnail and the detail-page cover of the same article — the source images
are already close to 16:10, so this crops only slightly. Any remaining `.frame` div
without an `<img>` inside is still a genuine placeholder; replace it with `<img
class="frame__img" src="…">` inside the existing wrapper when a real photo lands.

**Hero intro video** (`uploads/intro AAG.mp4`, ~204 KB, 5.9s, 540×540) autoplays, loops,
and is muted (loop requires muted to autoplay in Chrome/Safari) in the hero's media box,
which is sized to the video's own 1:1 ratio so it fills edge-to-edge — the design's box was
4:5, sized for a portrait photo, and would letterbox this square video with bars top and
bottom. `DesignSync`'s file read is capped at 256 KiB, well under the original ~450 KB
source — every fetch through it came back truncated and unplayable, so the file was
instead copied directly from the source network share.

The source file also had ~0.12s of solid black baked into its last frames (confirmed by
sampling frame brightness via canvas at second-level precision, not guessed) — invisible on
a single playthrough, but a visible black flash every time `loop` restarted it. Re-encoded
with ffmpeg (`-t 5.9`, trimming just past the last bright frame at ~5.95s) to remove it, so
looping is seamless. If the source video is ever replaced, re-check for the same trailing
black frames — it's a common fade-out left over from export, not specific to this file.

**Contact form** submits to Formspree (`data-endpoint="https://formspree.io/f/mvzedodb"`
in `index.html`). `app.js` POSTs JSON (`name`, `phone`, `detail`) and shows a success or
failure message based on the response. If `data-endpoint` is ever cleared, it falls back
to telling the visitor to call or LINE instead rather than silently failing.

**No file attachment.** The design includes an optional file field on this form, but
Formspree's free plan rejects any submission containing a file outright — confirmed by
testing a real submission, not just reading their docs (`{"error":"File Uploads Not
Permitted"}`). Shipping the field would have made every attachment attempt fail with a
generic "ส่งข้อความไม่สำเร็จ" error, so it's removed from `index.html` entirely rather
than left half-working. To bring it back: upgrade to Formspree Gold, or switch to a
form backend that supports uploads on its free tier (e.g. Web3Forms).

**Social links.** The design lists the LINE ID (`allaboutglass`) and Facebook handle
(`allaboutglassth`) as plain text. They are linked here to
`https://line.me/ti/p/~allaboutglass` and `https://www.facebook.com/allaboutglassth` —
worth confirming both resolve before going live.
