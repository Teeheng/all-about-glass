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
index.html                      the site (all eight pages)
assets/css/styles.css           design tokens + layout + responsive rules
assets/js/app.js                hash router, mobile nav, enquiry form
uploads/…_1.jpg                 AAG logo (also used as favicon / og:image)

All About Glass.dc.html         imported design source — reference only
support.js                      dc-runtime for the design source — not used by the site
image-slot.js                   Claude Design's drag-drop image-placeholder component —
                                 reference only, not used by the site (see below)
```

`All About Glass.dc.html`, `support.js`, and `image-slot.js` are the untouched import from
Claude Design. The shipping site is `index.html`; editing the `.dc.html` does not change it.

**`image-slot.js` is never loaded by `index.html`.** The design now places images via a
custom `<image-slot>` element — a drag-and-drop placeholder tied to Claude Design's
`window.omelette` runtime bridge (persists drops to a `.image-slots.state.json` sidecar
file next to the `.dc.html`). Its own docs say outright: "Outside the omelette runtime the
slot is read-only." None of that exists on a plain static site, so wherever the design uses
`<image-slot>`, this build keeps using the pre-existing `.frame` placeholder `<div>` pattern
instead — same visual treatment, no dependency on tooling that only exists inside the
design canvas.

## Re-importing after a design change

When the Claude Design project is edited, ask Claude Code to pull it again — it re-reads
project `ffbe7aa9-f5a7-4f78-b3e1-62586fe4f542`, overwrites the two import files, and ports
the diff into `index.html` / `assets/`. Nothing under `assets/` is generated, so the port
is a deliberate edit each time, not a regeneration.

## How it works

Eleven pages live as `<section data-page="…">` in `index.html`. `app.js` shows one at a
time based on the URL hash, so pages are linkable, bookmarkable, and the browser back
button works. An unknown hash falls back to home.

| page | hash |
| --- | --- |
| หน้าแรก | `#/` |
| เกี่ยวกับเรา | `#/about` |
| สินค้าและบริการ (hub) | `#/overview` |
| สินค้า | `#/products` |
| บริการ | `#/services` |
| ผลงาน | `#/gallery` |
| บทความ (listing) | `#/articles` |
| — วิธีเลือกกระจกให้เหมาะกับบ้าน | `#/article-choosing-glass` |
| — เทมเปอร์ vs ลามิเนต | `#/article-tempered-laminated` |
| — ไอเดียตกแต่งบ้านด้วยกระจก | `#/article-decor-ideas` |
| ติดต่อเรา | `#/contact` |

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
source, which only wired hover.

**Visual language**: pills, not sharp corners. Buttons, the nav CTA, the eyebrow badge,
and card number badges are all `border-radius: var(--radius-pill)` (9999px) now; cards and
images use `var(--radius-lg)` (8px); the hero lost its gradient + diagonal grain texture in
favour of a flat `#0a1f3d`; h1/h2 dropped from weight 700 to 300 with slight letter-spacing;
service/product/article cards moved from white-with-border to a flat `#f5f7fa`, no border.
These are CSS-token changes only — `:root` in `styles.css` gained `--radius-lg` and
`--radius-pill` alongside the existing `--radius`/`--radius-sm`.

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
