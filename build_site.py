from __future__ import annotations

from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
EXCLUDED = {".git", ".github", "dist", "__pycache__"}


def copy_site() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for item in ROOT.iterdir():
        if item.name in EXCLUDED:
            continue
        destination = DIST / item.name
        if item.is_dir():
            shutil.copytree(item, destination)
        else:
            shutil.copy2(item, destination)


def inject_market_navigation(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    if 'href="market.html"' not in html:
        header_link = '<a href="market.html" data-i18n="nav.market">Market</a>'
        footer_link = '<a href="market.html" data-i18n="nav.market">Market</a>'

        header_pattern = re.compile(
            r'(<nav class="site-nav"[^>]*>.*?<a[^>]+href="evidence\.html"[^>]*>.*?</a>)',
            re.DOTALL,
        )
        html, count = header_pattern.subn(rf'\1{header_link}', html, count=1)
        if count != 1:
            raise RuntimeError(f"Could not inject Market header link into {path.name}")

        footer_pattern = re.compile(
            r'(<footer class="site-footer">.*?<nav[^>]*>.*?<a[^>]+href="evidence\.html"[^>]*>.*?</a>)',
            re.DOTALL,
        )
        html, count = footer_pattern.subn(rf'\1{footer_link}', html, count=1)
        if count != 1:
            raise RuntimeError(f"Could not inject Market footer link into {path.name}")

    path.write_text(html, encoding="utf-8")


def inject_typography_stylesheet(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    if 'href="typography.css"' not in html:
        marker = "</head>"
        if marker not in html:
            raise RuntimeError(f"Could not locate head closing tag in {path.name}")
        html = html.replace(
            marker,
            '  <link rel="stylesheet" href="typography.css">\n</head>',
            1,
        )
    path.write_text(html, encoding="utf-8")


def inject_leadership_stylesheet(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    if 'href="leadership.css"' not in html:
        marker = "</head>"
        if marker not in html:
            raise RuntimeError(f"Could not locate head closing tag in {path.name}")
        html = html.replace(
            marker,
            '  <link rel="stylesheet" href="leadership.css">\n</head>',
            1,
        )
    path.write_text(html, encoding="utf-8")


def inject_alessa_portrait(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    if "Alessa Yang" not in html or "team-media-placeholder" not in html:
        return

    pattern = re.compile(
        r'<div class="team-media team-media-placeholder">'
        r'<span class="team-initials" aria-hidden="true">AY</span>'
        r'<span class="portrait-status"[^>]*>Portrait placeholder</span>'
        r'</div>'
    )
    replacement = (
        '<div class="team-media team-media-alessa">'
        '<img class="team-photo team-photo-alessa" '
        'src="assets/alessa-yang-portrait.svg" width="480" height="640" '
        'loading="eager" decoding="async" fetchpriority="high" '
        'alt="Portrait of Alessa Yang">'
        '</div>'
    )
    html, count = pattern.subn(replacement, html, count=1)
    if count != 1:
        raise RuntimeError(f"Could not replace Alessa portrait placeholder in {path.name}")
    path.write_text(html, encoding="utf-8")


def main() -> None:
    copy_site()
    pages = sorted(DIST.glob("*.html"))
    for page in pages:
        inject_market_navigation(page)
        inject_typography_stylesheet(page)
        inject_leadership_stylesheet(page)
        inject_alessa_portrait(page)
    print(f"Built {len(pages)} pages in {DIST}")


if __name__ == "__main__":
    main()
