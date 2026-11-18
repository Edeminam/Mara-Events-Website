#!/usr/bin/env python3
"""
Mara Events site builder.

The site is plain HTML in /public, deployed to Firebase exactly as it sits on
disk. Markup shared by every page lives once in /src/partials and is copied
into each page between marker comments:

    <!-- build:head -->   ... <!-- /build:head -->
    <!-- build:nav -->    ... <!-- /build:nav -->
    <!-- build:footer --> ... <!-- /build:footer -->

Edit the partial, run this script, and every page is updated. Never edit the
content between markers inside a page: the next build overwrites it.

The script also stamps every /assets/ CSS and JS URL with a short content hash
(?v=1a2b3c4d), so browsers can cache those files for a year and still pick up
changes the moment a file is edited.

Usage:
    python3 tools/build.py           # update pages in place
    python3 tools/build.py --check   # list out-of-date pages, exit 1 if any
"""

from __future__ import annotations

import datetime
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
PARTIALS = ROOT / "src" / "partials"

# Where each page's "Book Your Event" buttons point. Pages with their own
# enquiry form scroll to it; every other page sends visitors to the homepage form.
BOOK_HREF = {
    "/": "#book",
    "/event-services": "#enquire",
}
DEFAULT_BOOK_HREF = "/#book"

# The homepage navbar starts transparent over the hero photo; the others start solid.
NAVBAR_CLASS = {"/": "navbar"}
DEFAULT_NAVBAR_CLASS = "navbar scrolled"

MARKER = re.compile(
    r"(?P<open><!-- build:(?P<name>[\w-]+) -->)\n(?:.*?\n)?(?P<indent>[ \t]*)(?P<close><!-- /build:(?P=name) -->)",
    re.S,
)
ASSET_URL = re.compile(r"""(?P<q>["'])/assets/(?P<path>(?:css|js)/[\w.-]+\.(?:css|js))(?:\?v=[\w.]+)?(?P=q)""")


def page_url(path: Path) -> str:
    """public/blog/foo.html -> /blog/foo, public/index.html -> /"""
    rel = path.relative_to(PUBLIC).with_suffix("").as_posix()
    return "/" if rel == "index" else "/" + rel


def asset_hashes() -> dict[str, str]:
    return {
        p.relative_to(PUBLIC / "assets").as_posix(): hashlib.md5(p.read_bytes()).hexdigest()[:8]
        for p in (PUBLIC / "assets").rglob("*")
        if p.suffix in {".css", ".js"}
    }


def render_partial(name: str, url: str) -> str:
    html = (PARTIALS / f"{name}.html").read_text().rstrip("\n")
    html = (
        html.replace("{{book_href}}", BOOK_HREF.get(url, DEFAULT_BOOK_HREF))
        .replace("{{navbar_class}}", NAVBAR_CLASS.get(url, DEFAULT_NAVBAR_CLASS))
        .replace("{{year}}", str(datetime.date.today().year))
    )
    if name == "nav" and url != "/":
        # Tell browsers and assistive tech which link is the current page
        html = re.sub(rf'<a href="{re.escape(url)}"(?=[ >])', f'<a href="{url}" aria-current="page"', html)
    return html


def build_page(path: Path, hashes: dict[str, str]) -> str:
    url = page_url(path)
    html = path.read_text()

    def fill(m: re.Match) -> str:
        if not (PARTIALS / f"{m['name']}.html").exists():
            sys.exit(f"{path.relative_to(ROOT)}: no partial named '{m['name']}'")
        return f"{m['open']}\n{render_partial(m['name'], url)}\n{m['indent']}{m['close']}"

    html = MARKER.sub(fill, html)

    def stamp(m: re.Match) -> str:
        version = hashes.get(m["path"])
        if version is None:
            sys.exit(f"{path.relative_to(ROOT)}: links to missing file /assets/{m['path']}")
        return f"{m['q']}/assets/{m['path']}?v={version}{m['q']}"

    return ASSET_URL.sub(stamp, html)


def main() -> int:
    check_only = "--check" in sys.argv[1:]
    hashes = asset_hashes()
    pages = sorted(PUBLIC.glob("*.html")) + sorted(PUBLIC.glob("blog/*.html"))
    stale = []

    for path in pages:
        new = build_page(path, hashes)
        if new != path.read_text():
            stale.append(path.relative_to(ROOT).as_posix())
            if not check_only:
                path.write_text(new)

    if check_only:
        for p in stale:
            print(f"out of date: {p}")
        if stale:
            print("Run: python3 tools/build.py")
        return 1 if stale else 0

    print(f"Built {len(pages)} pages ({len(stale)} changed).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
