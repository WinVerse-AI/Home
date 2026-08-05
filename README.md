# WinVerse™ Home

A responsive static website for WinVerse™ and the SerotoniX™ R&D concept programme.

## What this build does

- Presents six fully decoded SerotoniX™ visual records plus one structured dimensional record reconstructed from the supplied board.
- Pins the published WebPs to the repaired `WinVerse-AI/Homepage` source commit so later source changes cannot silently replace them.
- Provides responsive desktop, tablet and mobile layouts.
- Includes keyboard-accessible navigation, reduced-motion support and a full-resolution image viewer.
- Separates confirmed facial-muscle FES research context from unverified VNS, performance, standards and product claims.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Evidence boundary

The visuals are development artefacts. They do not establish clinical efficacy, safety certification, regulatory clearance, manufacturing release or commercial availability. Public UHN/KITE material concerns facial-muscle functional electrical stimulation and does not by itself substantiate a vagus-nerve mechanism for the illustrated concept.

The historical CAD, dimensions and schematic WebPs referenced by an earlier source build were truncated or invalid. This website uses the repaired, fully decoded source assets. The dimensional target record is deliberately rendered as structured HTML rather than presenting a corrupt binary as an engineering drawing.

## Validation and deployment

The GitHub Actions workflow checks the website structure and JavaScript syntax, downloads all six published source boards, fully decodes them with Pillow, verifies their expected dimensions, audits the external evidence links and then deploys the static site to GitHub Pages.
