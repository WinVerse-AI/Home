(() => {
  if (!document.querySelector('link[href="dimension-record.css"]')) {
    const dimensionStylesheet = document.createElement('link');
    dimensionStylesheet.rel = 'stylesheet';
    dimensionStylesheet.href = 'dimension-record.css';
    document.head.append(dimensionStylesheet);
  }

  const SOURCE_COMMIT = '188646086300cad638d26fbfacde9b1b911b4cc5';
  const SOURCE_BASE = `https://raw.githubusercontent.com/WinVerse-AI/Homepage/${SOURCE_COMMIT}/assets`;
  const assets = {
    hero: `${SOURCE_BASE}/serotonix-mask-hero-2026.webp`,
    exploded: `${SOURCE_BASE}/serotonix-concept-exploded-hires.webp`,
    pcba: `${SOURCE_BASE}/serotonix-controller-pcba-2026.webp`,
    control: `${SOURCE_BASE}/serotonix-system-schematic-hires.webp`,
    specifications: `${SOURCE_BASE}/serotonix-proposed-specifications-hires.webp`,
    colour: `${SOURCE_BASE}/serotonix-colour-finish-2026.webp`,
  };

  const setImage = (container, src, alt) => {
    if (!container) return;
    const image = container.querySelector('img');
    const button = container.querySelector('[data-lightbox-src]');
    if (image) {
      image.src = src;
      image.alt = alt;
    }
    if (button) {
      button.dataset.lightboxSrc = src;
      button.dataset.lightboxAlt = alt;
    }
  };

  setImage(
    document.querySelector('.hero-visual'),
    assets.hero,
    'Arctic white SerotoniX mask-form industrial design study',
  );
  setImage(
    document.querySelector('.architecture-visual'),
    assets.control,
    'SerotoniX system schematic showing electrodes, stimulation driver, controller, sensing, power and communications',
  );

  const galleryCards = [...document.querySelectorAll('.gallery-card')];
  const galleryRecords = [
    {
      src: assets.exploded,
      alt: 'Exploded SerotoniX wearable architecture showing scan-derived geometry, facial interface, electrode cassette and controller enclosure',
      title: 'Exploded wearable architecture',
      text: 'A layered design study linking scan-derived geometry, the flexible facial interface, electrode cassette and controller enclosure. It is an architecture proposal, not proof of fit, targeting, safety or manufacturability.',
    },
    {
      src: assets.pcba,
      alt: 'SerotoniX controller PCBA engineering board',
      title: 'Controller PCBA concept',
      text: 'Layout views, a block diagram, electrical targets, connector pinouts and a proposed four-layer stack. The board is not a released or manufacturing-ready design.',
    },
    {
      src: assets.hero,
      alt: 'Arctic white SerotoniX mask-form industrial design study',
      title: 'Mask-form industrial design',
      text: 'An exterior form study for fit, ventilation, strap routing and component integration. The visual does not establish facial fit, comfort, cleanability or manufacturability.',
    },
    {
      src: assets.specifications,
      alt: 'Preliminary SerotoniX engineering specification and design-target board',
      title: 'Preliminary design envelope',
      text: 'A working record of provisional material, electrical, battery, communications and regulatory assumptions. These are engineering questions, not verified product performance.',
    },
    {
      src: assets.control,
      alt: 'SerotoniX system control schematic',
      title: 'System control schematic',
      text: 'A preliminary functional map connecting the output driver, controller, power management, sensing, logging and wireless interface. It identifies functions to verify; it does not prove closed-loop or fail-safe operation.',
    },
    {
      dimensionRecord: true,
      title: 'Dimensional targets',
      text: 'Nominal targets reconstructed from the supplied dimensional board. They remain subject to anthropometric fit studies, tolerance analysis and controlled CAD release.',
    },
    {
      src: assets.colour,
      alt: 'SerotoniX colour and finish concepts in Arctic White, Graphite Gray and Sage Green',
      title: 'Colour and finish exploration',
      text: 'Three visual identities for design review. “Clinical”, “professional” and “wellness” are exploratory labels, not product classes, channels or regulatory designations.',
    },
  ];

  galleryCards.forEach((card, index) => {
    const record = galleryRecords[index];
    if (!record) return;

    const title = card.querySelector('h3');
    const text = card.querySelector('figcaption p');
    if (title) title.textContent = record.title;
    if (text) text.textContent = record.text;

    if (record.dimensionRecord) {
      const media = card.querySelector('.image-button');
      if (media) {
        const board = document.createElement('div');
        board.className = 'dimension-board';
        board.setAttribute('role', 'img');
        board.setAttribute(
          'aria-label',
          'Concept dimensional targets: 215 millimetres wide, 145 millimetres high, 110 millimetres deep, eye opening 62 by 43 millimetres, mouth and nose opening 72 by 55 millimetres and target mass approximately 180 grams',
        );
        board.innerHTML = `
          <div class="dimension-board-heading">
            <span>Concept dimensional envelope</span>
            <strong>215 × 145 × 110 mm</strong>
          </div>
          <div class="dimension-mask" aria-hidden="true">
            <i class="dimension-eye dimension-eye-left"></i>
            <i class="dimension-eye dimension-eye-right"></i>
            <i class="dimension-mouth"></i>
            <i class="dimension-perforation dimension-perforation-left"></i>
            <i class="dimension-perforation dimension-perforation-right"></i>
          </div>
          <dl class="dimension-stats">
            <div><dt>Eye opening</dt><dd>62 × 43 mm</dd></div>
            <div><dt>Mouth / nose opening</dt><dd>72 × 55 mm</dd></div>
            <div><dt>Target mass</dt><dd>≈180 g</dd></div>
            <div><dt>Status</dt><dd>Nominal R&amp;D targets</dd></div>
          </dl>
        `;
        media.replaceWith(board);
      }
    } else {
      setImage(card, record.src, record.alt);
    }
  });

  const dossierTitle = document.querySelector('.dossier-heading h2');
  const dossierIntro = document.querySelector('.dossier-heading > p');
  if (dossierTitle) dossierTitle.textContent = 'Six verified visual records. One structured dimensional record.';
  if (dossierIntro) {
    dossierIntro.textContent = 'The published WebPs are fully decoded development artefacts from the repaired WinVerse™ source build. The dimensional record is reconstructed from the supplied board because the original CAD and dimension files in the reference repository failed integrity checks. All specifications remain provisional.';
  }

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 18);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton?.setAttribute('aria-expanded', 'false');
      nav?.classList.remove('is-open');
    });
  });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-lightbox-src]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.lightboxSrc || '';
      lightboxImage.alt = button.dataset.lightboxAlt || '';
      if (typeof lightbox.showModal === 'function') lightbox.showModal();
    });
  });

  const closeLightbox = () => {
    if (!lightbox?.open) return;
    lightbox.close();
    lightboxImage?.removeAttribute('src');
  };
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
