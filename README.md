# Mara Events website

Static site for [mara-events.com](https://mara-events.com), served by Firebase Hosting.
Every push to `main` deploys `public/` as-is (see `.github/workflows/`). There is no
compile step in CI: what is in `public/` is what goes live.

## Layout

```
public/                 Deployed site (Firebase "public" dir, clean URLs: /training → training.html)
  *.html                Pages
  blog/*.html           Blog articles
  assets/css/           styles.css (shared) + one stylesheet per page type
  assets/js/            nav.js + site.js (shared) + one script per page type
  images/               Images; og/ holds 1200×630 social-share cards
  files/                Downloads (brochure)
  sitemap.xml, robots.txt
src/partials/           Markup shared by every page (edit these, not the copies in pages)
  head.html             Meta basics, fonts, icons, favicons, base CSS, analytics
  nav.html              Navbar + mobile menu
  footer.html           Footer
  scripts.html          nav.js + site.js
tools/build.py          Copies partials into pages and version-stamps CSS/JS URLs
firebase.json           Hosting config: redirects, caching and security headers
```

## Everyday workflow

1. Edit a page in `public/`, a partial in `src/partials/`, or a file in `public/assets/`.
2. Run the build (Python 3, no dependencies):

   ```sh
   python3 tools/build.py
   ```

3. Commit and push to `main`.

**Always run the build after changing any CSS or JS file.** It rewrites
`/assets/...?v=<hash>` in every page. Those files are cached by browsers for a year,
so a page that still points at the old hash will keep serving the old file.

`python3 tools/build.py --check` lists pages that are out of date without changing anything.

### Shared markup

Each page contains marker pairs such as:

```html
<!-- build:nav -->
  ...generated, do not edit...
<!-- /build:nav -->
```

Everything between the markers is overwritten on the next build. To change the
navbar, footer or `<head>` basics, edit the file in `src/partials/` instead.
The build also marks the current page's nav link with `aria-current="page"`.

Per-page variations live in `tools/build.py` (`BOOK_HREF`, `NAVBAR_CLASS`).

### Page-specific things stay in the page

Title, meta description, canonical URL, Open Graph tags, JSON-LD structured data,
page stylesheets and page scripts go *outside* the markers, directly in each page.

## Common tasks

| Task | Where |
| --- | --- |
| New Mara Academy cohort / announcement text | `ACADEMY` object at the top of `public/assets/js/nav.js`, plus copy and JSON-LD dates in `public/training.html` |
| Navbar or footer links | `src/partials/nav.html`, `src/partials/footer.html` |
| Analytics / tracking tags | `src/partials/head.html` |
| New page | Copy an existing page with the same layout, change its head and content, add it to `sitemap.xml`, run the build |
| New blog post | Copy a post in `public/blog/`, update head + `BlogPosting` JSON-LD + breadcrumb, add to `blog.html` and `sitemap.xml` |
| Renamed or removed URL | Add a 301 to `redirects` in `firebase.json` so search rankings carry over |

## SEO checklist for every page

- `<title>` up to ~60 characters, main keyword first, ending in `| Mara Events`.
- `<meta name="description">` 120–160 characters.
- `<link rel="canonical">` with the clean URL (no `.html`).
- One `<h1>`.
- Open Graph + Twitter tags with a 1200×630 image in `images/og/`.
- JSON-LD that matches what is visible on the page (FAQ answers, prices, dates).
- Every `<img>` has `alt`, `width` and `height` (prevents layout shift); below-the-fold
  images also get `loading="lazy"`.
- Internal links are root-relative (`/images/...`, `/training`).
- Business facts stay consistent everywhere: founded **2021**, based in Abuja,
  official planner for AICCEES (4 editions).
