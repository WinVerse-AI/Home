# WinVerse™ Home

A responsive static website for WinVerse™ and the SerotoniX™ R&D concept programme.

## What this build does

- Presents all seven supplied SerotoniX™ concept boards.
- Uses immutable, commit-pinned image URLs so later changes in the source repository cannot silently replace the drawings.
- Provides responsive desktop, tablet and mobile layouts.
- Includes keyboard-accessible navigation and a full-resolution image viewer.
- Separates confirmed research context from unverified VNS, performance, standards and product claims.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Evidence boundary

The drawings are development artefacts. They do not establish clinical efficacy, safety certification, regulatory clearance, manufacturing release or commercial availability. Public UHN/KITE material concerns facial-muscle functional electrical stimulation and does not by itself substantiate a vagus-nerve mechanism for the illustrated concept.

## Deployment

The included GitHub Actions workflow validates the page and its pinned image assets, then deploys the repository to GitHub Pages.
