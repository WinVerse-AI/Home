from __future__ import annotations

from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
LANGUAGE_ASSET_VERSION = "local-translation-v1"
EXCLUDED = {
    ".git",
    ".github",
    "dist",
    "__pycache__",
    "asset-sources",
    "asset-sources-v3",
}
GLOBAL_STYLESHEETS = (
    "typography.css",
    "leadership.css",
    "layout-polish.css",
    "pillar-image-beauty.css",
    "pillar-image-affective.css",
    "pillar-image-research.css",
    "professional-refinement.css",
    "language.css",
)
GLOBAL_SCRIPTS = (
    "language.js",
)
PAGE_VISUALS = {
    "platform.html": "page-visual-platform",
    "development.html": "page-visual-development",
    "evidence.html": "pillar-image-research",
    "market.html": "pillar-image-beauty",
    "about.html": "page-visual-about",
}


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


def inject_page_context(path: Path) -> None:
    """Add non-copy layout hooks without changing the translation source strings."""
    html = path.read_text(encoding="utf-8")
    page_class = f"page-{path.stem}"

    body_pattern = re.compile(r'<body class="([^"]*)">')
    match = body_pattern.search(html)
    if match and page_class not in match.group(1).split():
        classes = f"{match.group(1)} {page_class}".strip()
        html = body_pattern.sub(f'<body class="{classes}">', html, count=1)

    visual_class = PAGE_VISUALS.get(path.name)
    if visual_class and 'class="page-meta"' in html and "page-meta-visual" not in html:
        html = html.replace(
            '<aside class="page-meta">',
            f'<aside class="page-meta"><span class="page-meta-visual {visual_class}" aria-hidden="true"></span>',
            1,
        )

    if path.name == "overview.html":
        html = html.replace(
            '<div class="prose" style="max-width: 900px;">',
            '<div class="prose overview-thesis">',
            1,
        )

    path.write_text(html, encoding="utf-8")


def versioned_asset(asset: str) -> str:
    if asset in {"language.css", "language.js"}:
        return f"{asset}?v={LANGUAGE_ASSET_VERSION}"
    return asset


def inject_stylesheet(path: Path, stylesheet: str) -> None:
    html = path.read_text(encoding="utf-8")
    if f'href="{stylesheet}"' not in html and f'href="{stylesheet}?' not in html:
        marker = "</head>"
        if marker not in html:
            raise RuntimeError(f"Could not locate head closing tag in {path.name}")
        html = html.replace(
            marker,
            f'  <link rel="stylesheet" href="{versioned_asset(stylesheet)}">\n</head>',
            1,
        )
    path.write_text(html, encoding="utf-8")


def inject_script(path: Path, script: str) -> None:
    html = path.read_text(encoding="utf-8")
    if f'src="{script}"' not in html and f'src="{script}?' not in html:
        marker = "</head>"
        if marker not in html:
            raise RuntimeError(f"Could not locate head closing tag in {path.name}")
        html = html.replace(
            marker,
            f'  <script defer src="{versioned_asset(script)}"></script>\n</head>',
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
        'src="assets/alessa-yang-portrait-20260806.jpg" width="240" height="320" '
        'loading="eager" decoding="sync" fetchpriority="high" '
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
        inject_page_context(page)
        for stylesheet in GLOBAL_STYLESHEETS:
            inject_stylesheet(page, stylesheet)
        for script in GLOBAL_SCRIPTS:
            inject_script(page, script)
        inject_alessa_portrait(page)
    print(
        f"Built {len(pages)} pages in {DIST} with denser professional layouts, "
        "contextual imagery and six local language options"
    )


if __name__ == "__main__":
    main()
