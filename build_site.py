from __future__ import annotations

import base64
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
EXCLUDED = {".git", ".github", "dist", "__pycache__", "asset-sources"}
HIGH_RES_ASSETS = {
    "pillar-premium-beauty.webp": "pillar-premium-beauty",
    "pillar-affective-experience.webp": "pillar-affective-experience",
    "pillar-claim-research.webp": "pillar-claim-research",
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


def hydrate_high_resolution_assets() -> None:
    target_dir = DIST / "assets"
    target_dir.mkdir(exist_ok=True)
    for filename, source_name in HIGH_RES_ASSETS.items():
        source_dir = ROOT / "asset-sources" / source_name
        parts = sorted(source_dir.glob("*.part"))
        if not parts:
            raise RuntimeError(f"Missing encoded asset parts for {filename}")
        encoded = "".join(part.read_text(encoding="ascii").strip() for part in parts)
        data = base64.b64decode(encoded, validate=True)
        if len(data) < 30000 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
            raise RuntimeError(f"Invalid high-resolution WebP payload for {filename}")
        (target_dir / filename).write_bytes(data)


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


def inject_stylesheet(path: Path, stylesheet: str) -> None:
    html = path.read_text(encoding="utf-8")
    if f'href="{stylesheet}"' not in html:
        marker = "</head>"
        if marker not in html:
            raise RuntimeError(f"Could not locate head closing tag in {path.name}")
        html = html.replace(
            marker,
            f'  <link rel="stylesheet" href="{stylesheet}">\n</head>',
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
    hydrate_high_resolution_assets()
    pages = sorted(DIST.glob("*.html"))
    for page in pages:
        inject_market_navigation(page)
        inject_stylesheet(page, "typography.css")
        inject_stylesheet(page, "leadership.css")
        inject_stylesheet(page, "layout-polish.css")
        inject_alessa_portrait(page)
    print(f"Built {len(pages)} pages in {DIST} with high-resolution pillar assets")


if __name__ == "__main__":
    main()
