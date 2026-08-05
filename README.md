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

## Validation and deployment

The GitHub Actions workflow checks the required HTML, CSS, JavaScript and mark files, downloads all seven commit-pinned concept boards, verifies their WebP containers and then packages the static site for GitHub Pages. Main-branch pushes trigger the Pages deployment job; pull requests run the same pre-deployment validation gate.
