(() => {
  const languages = ['en', 'zh-CN', 'ja', 'fr', 'de', 'es'];
  const languageNames = {
    en: 'English',
    'zh-CN': '中文',
    ja: '日本語',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
  };

  const loadDictionary = (language) => new Promise((resolve) => {
    if (window.WINVERSE_TRANSLATIONS?.[language]) return resolve();
    const script = document.createElement('script');
    script.src = `i18n/${language}.js`;
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });

  const first = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const bind = (selector, key, root = document) => {
    const element = first(selector, root);
    if (element) element.dataset.i18n = key;
    return element;
  };
  const bindAttr = (selector, value, root = document) => {
    const element = first(selector, root);
    if (element) element.dataset.i18nAttr = value;
    return element;
  };
  const bindLeadingText = (selector, key, root = document) => {
    const element = first(selector, root);
    if (!element || element.querySelector(':scope > [data-i18n]')) return element;
    const node = [...element.childNodes].find(
      (child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim(),
    );
    if (!node) return element;
    const label = document.createElement('span');
    label.dataset.i18n = key;
    label.textContent = node.textContent.trim();
    element.replaceChild(label, node);
    return element;
  };

  const normaliseLanguage = (value, available) => {
    if (!value) return null;
    const candidate = String(value).trim().toLowerCase();
    if (candidate === 'zh' || candidate.startsWith('zh-')) return available.includes('zh-CN') ? 'zh-CN' : null;
    return available.find((language) => language.toLowerCase() === candidate)
      || available.find((language) => candidate.startsWith(`${language.toLowerCase()}-`))
      || null;
  };

  const prepareBrand = () => {
    const brand = first('.brand');
    if (!brand) return;
    brand.classList.add('brand-with-tagline');
    brand.dataset.i18nAttr = 'aria-label:brand.home';
    if (!first('.brand-tagline', brand)) {
      const tagline = document.createElement('span');
      tagline.className = 'brand-tagline';
      tagline.dataset.i18n = 'brand.tagline';
      tagline.textContent = 'Pulse of Innovation';
      brand.appendChild(tagline);
    }
  };

  const prepareLanguageSelector = () => {
    const headerInner = first('.header-inner');
    const menuButton = first('[data-menu-button]');
    if (!headerInner) return null;

    let controls = first('.header-controls', headerInner);
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'header-controls';
      headerInner.appendChild(controls);
    }

    let select = first('[data-language-select]', controls);
    if (!select) {
      const label = document.createElement('label');
      label.className = 'language-control';
      label.htmlFor = 'language-select';

      const accessibleLabel = document.createElement('span');
      accessibleLabel.className = 'sr-only';
      accessibleLabel.dataset.i18n = 'language.label';
      accessibleLabel.textContent = 'Language';

      select = document.createElement('select');
      select.id = 'language-select';
      select.className = 'language-select';
      select.dataset.languageSelect = '';
      select.dataset.i18nAttr = 'aria-label:language.label';
      select.setAttribute('aria-label', 'Language');

      languages.forEach((language) => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = languageNames[language];
        select.appendChild(option);
      });

      const chevron = document.createElement('span');
      chevron.className = 'language-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.textContent = '⌄';
      label.append(accessibleLabel, select, chevron);
      controls.appendChild(label);
    }

    if (menuButton && menuButton.parentElement !== controls) {
      const menuLabel = first('span:first-child', menuButton);
      if (menuLabel) {
        menuLabel.classList.add('menu-label');
        menuLabel.dataset.i18n = 'nav.menu';
      }
      controls.appendChild(menuButton);
    }
    return select;
  };

  const prepareBindings = () => {
    bind('.skip-link', 'skip.content');
    bindAttr('.site-nav', 'aria-label:nav.primary');
    [
      ['#overview', 'nav.overview'], ['#platform', 'nav.platform'],
      ['#development', 'nav.development'], ['#evidence', 'nav.evidence'],
      ['#about', 'nav.about'], ['#contact', 'nav.contact'],
    ].forEach(([href, key]) => bind(`.site-nav a[href="${href}"]`, key));

    bind('.hero-copy .eyebrow', 'hero.locations');
    bind('.hero-copy h1', 'hero.title');
    bind('.hero-copy .hero-lede', 'hero.lede');
    bind('.hero-actions .button-primary', 'hero.cta.platform');
    bind('.hero-actions .button-secondary', 'hero.cta.evidence');
    bindAttr('.hero-panel', 'aria-label:hero.snapshot.aria');
    bind('.hero-panel .panel-label', 'hero.snapshot.label');
    const snapshotKeys = [
      ['hero.snapshot.programme.label', 'hero.snapshot.programme.value'],
      ['hero.snapshot.stage.label', 'hero.snapshot.stage.value'],
      ['hero.snapshot.principle.label', 'hero.snapshot.principle.value'],
    ];
    all('.snapshot-row').forEach((row, index) => {
      if (!snapshotKeys[index]) return;
      bind('strong', snapshotKeys[index][0], row);
      bind('p', snapshotKeys[index][1], row);
    });
    bindLeadingText('.scroll-cue', 'hero.continue');
    bindAttr('.scroll-cue', 'aria-label:hero.continue.aria');

    bind('#overview .section-heading .eyebrow', 'overview.eyebrow');
    bind('#overview .section-heading h2', 'overview.title');
    bind('#overview .section-copy .lead', 'overview.lead');
    bind('#overview .section-copy p:not(.lead)', 'overview.copy');
    const principleKeys = [
      ['principles.define.title', 'principles.define.copy'],
      ['principles.engineer.title', 'principles.engineer.copy'],
      ['principles.evidence.title', 'principles.evidence.copy'],
    ];
    all('.principle-card').forEach((card, index) => {
      if (!principleKeys[index]) return;
      bind('h3', principleKeys[index][0], card);
      bind('p', principleKeys[index][1], card);
    });

    bind('#platform .section-heading .eyebrow', 'platform.eyebrow');
    bind('#platform .section-heading .lead', 'platform.lead');
    bindLeadingText('#platform .text-link', 'platform.pathway');
    const platformKeys = [
      ['platform.interface.title', 'platform.interface.copy'],
      ['platform.stimulation.title', 'platform.stimulation.copy'],
      ['platform.control.title', 'platform.control.copy'],
      ['platform.evidence.title', 'platform.evidence.copy'],
    ];
    all('.platform-row').forEach((row, index) => {
      if (!platformKeys[index]) return;
      bind('h3', platformKeys[index][0], row);
      bind('p', platformKeys[index][1], row);
    });

    bind('#development .section-heading .eyebrow', 'development.eyebrow');
    bind('#development .section-heading h2', 'development.title');
    bind('#development .section-copy .lead', 'development.lead');
    bindAttr('#development .pathway', 'aria-label:development.aria');
    const pathwayKeys = [
      ['development.define.state', 'development.define.title', 'development.define.copy', 'status.active'],
      ['development.build.state', 'development.build.title', 'development.build.copy', 'status.planned'],
      ['development.verify.state', 'development.verify.title', 'development.verify.copy', 'status.planned'],
      ['development.validate.state', 'development.validate.title', 'development.validate.copy', 'status.future'],
      ['development.scale.state', 'development.scale.title', 'development.scale.copy', 'status.future'],
    ];
    all('.pathway-item').forEach((item, index) => {
      if (!pathwayKeys[index]) return;
      bind('.pathway-state', pathwayKeys[index][0], item);
      bind('h3', pathwayKeys[index][1], item);
      bind('p:last-child', pathwayKeys[index][2], item);
      bind('.status', pathwayKeys[index][3], item);
    });

    bind('#evidence .section-heading .eyebrow', 'evidence.eyebrow');
    bind('#evidence .section-heading h2', 'evidence.title');
    const evidenceKeys = [
      ['evidence.support.label', 'evidence.support.1', 'evidence.support.2', 'evidence.support.3', 'evidence.support.4'],
      ['evidence.limit.label', 'evidence.limit.1', 'evidence.limit.2', 'evidence.limit.3', 'evidence.limit.4'],
    ];
    all('.boundary-card').forEach((card, index) => {
      if (!evidenceKeys[index]) return;
      bind('.boundary-label', evidenceKeys[index][0], card);
      all('li', card).forEach((item, itemIndex) => {
        item.dataset.i18n = evidenceKeys[index][itemIndex + 1];
      });
    });

    bind('#about .section-heading .eyebrow', 'about.eyebrow');
    bind('#about .section-heading h2', 'about.title');
    bind('#about .section-copy .lead', 'about.lead');
    bind('#about .section-copy p:not(.lead)', 'about.copy');
    bindAttr('.team-grid', 'aria-label:team.aria');
    const cards = all('.team-card');
    if (cards[0]) {
      bind('.portrait-status', 'team.portrait.placeholder', cards[0]);
      bind('.team-role', 'team.alessa.role', cards[0]);
      bind('.team-content > p:last-child', 'team.alessa.bio', cards[0]);
    }
    if (cards[1]) {
      bind('.team-role', 'team.zen.role', cards[1]);
      bind('.team-content > p:not(.team-role)', 'team.zen.bio', cards[1]);
      bindAttr('img', 'alt:team.zen.alt', cards[1]);
      bindLeadingText('.profile-links a', 'team.linkedin', cards[1]);
    }
    if (cards[2]) {
      bind('.team-role', 'team.milos.role', cards[2]);
      bind('.team-content h3', 'team.milos.name', cards[2]);
      bind('.team-content > p:not(.team-role)', 'team.milos.bio', cards[2]);
      bindAttr('img', 'alt:team.milos.alt', cards[2]);
      const links = all('.profile-links a', cards[2]);
      if (links[0]) bindLeadingText('.profile-links a:first-child', 'team.linkedin', cards[2]);
      if (links[1]) bindLeadingText('.profile-links a:nth-child(2)', 'team.official', cards[2]);
    }

    bind('#contact .eyebrow', 'contact.eyebrow');
    bind('#contact h2', 'contact.title');
    bind('#contact .button-light', 'contact.cta');
    bindLeadingText('#contact .text-link', 'contact.back');

    const footer = first('.site-footer');
    if (footer) {
      const paragraph = first('p', footer);
      const rightsNode = paragraph && [...paragraph.childNodes].find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.includes('All rights reserved'),
      );
      if (rightsNode) {
        const rights = document.createElement('span');
        rights.dataset.i18n = 'footer.rights';
        rights.textContent = 'All rights reserved.';
        rightsNode.replaceWith(document.createTextNode(' '), rights);
      }
      bindAttr('nav', 'aria-label:footer.nav', footer);
      bind('a[href="#evidence"]', 'nav.evidence', footer);
      bind('a[href="#about"]', 'nav.about', footer);
      bind('a[href="#contact"]', 'nav.contact', footer);
    }
  };

  const injectStyles = () => {
    if (first('#winverse-language-style')) return;
    const style = document.createElement('style');
    style.id = 'winverse-language-style';
    style.textContent = `
      .sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      .brand-with-tagline{flex-direction:column;justify-content:center;gap:3px}
      .brand-tagline{display:block;color:var(--green-dark);font-size:clamp(.46rem,.55vw,.58rem);font-weight:700;letter-spacing:.2em;line-height:1;text-align:center;text-transform:uppercase;white-space:nowrap}
      .header-controls{display:flex;flex:0 0 auto;align-items:center;gap:11px}
      .language-control{position:relative;display:inline-flex;align-items:center}
      .language-select{width:104px;min-height:38px;appearance:none;padding:8px 27px 8px 10px;border:1px solid var(--line);border-radius:var(--radius);background:rgba(255,255,255,.78);color:var(--ink);cursor:pointer;font-size:.72rem;font-weight:700;line-height:1.2}
      .language-select:hover{border-color:#9eaaa2}.language-select:focus-visible{outline:3px solid #89b89b;outline-offset:3px}
      .language-chevron{position:absolute;right:9px;color:var(--green);font-size:.74rem;line-height:1;pointer-events:none}
      html[lang="zh-CN"] body{font-family:Inter,"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif}
      html[lang="ja"] body{font-family:Inter,"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP",Arial,sans-serif}
      html[lang="zh-CN"] .eyebrow,html[lang="ja"] .eyebrow,html[lang="zh-CN"] .brand-tagline,html[lang="ja"] .brand-tagline{letter-spacing:.1em}
      @media(max-width:1180px) and (min-width:1101px){.site-nav{gap:13px;font-size:.76rem}.brand-logo{width:155px}.language-select{width:92px}}
      @media(max-width:1100px){
        :root{--header-height:70px}.menu-button{display:inline-flex;align-items:center;gap:10px;padding:10px 0 10px 8px;font-size:.78rem;font-weight:700}.header-controls{margin-left:auto;gap:9px}
        .site-nav{position:fixed;inset:var(--header-height) 0 auto;display:grid;gap:0;padding:12px 18px 22px;border-bottom:1px solid var(--line);background:var(--paper);box-shadow:0 18px 40px rgba(18,32,24,.08);transform:translateY(-130%);opacity:0;visibility:hidden;transition:transform 220ms ease,opacity 220ms ease,visibility 220ms ease}
        .site-nav.is-open{transform:translateY(0);opacity:1;visibility:visible}.site-nav a{padding:14px 6px;border-bottom:1px solid var(--line)}.site-nav a::after{display:none}.site-nav .nav-cta{margin-top:12px;padding:13px 14px;border:0;text-align:center}
      }
      @media(max-width:680px){.header-inner{gap:9px}.brand-with-tagline{align-items:flex-start;gap:2px}.brand-logo{width:126px}.brand-tagline{font-size:.4rem;letter-spacing:.13em}.language-select{width:82px;min-height:36px;padding:7px 23px 7px 8px;font-size:.68rem}.language-chevron{right:7px}.menu-label{display:none}.menu-button{padding-left:2px}}
    `;
    document.head.appendChild(style);
  };

  const initialise = () => {
    const translations = window.WINVERSE_TRANSLATIONS || {};
    const available = languages.filter((language) => translations[language]);
    if (!available.length) return;

    prepareBrand();
    const select = prepareLanguageSelector();
    prepareBindings();
    injectStyles();

    const translate = (language, key) => translations[language]?.[key] ?? translations.en?.[key] ?? key;
    const stored = () => {
      try { return normaliseLanguage(localStorage.getItem('winverse-language'), available); }
      catch { return null; }
    };
    const browserLanguage = () => {
      const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
      for (const preference of preferences) {
        const language = normaliseLanguage(preference, available);
        if (language) return language;
      }
      return available.includes('en') ? 'en' : available[0];
    };
    const query = normaliseLanguage(new URLSearchParams(location.search).get('lang'), available);

    const applyAttributes = (language) => {
      all('[data-i18n-attr]').forEach((element) => {
        element.dataset.i18nAttr.split(';').forEach((declaration) => {
          const split = declaration.indexOf(':');
          if (split < 1) return;
          const attribute = declaration.slice(0, split).trim();
          const key = declaration.slice(split + 1).trim();
          if (attribute && key) element.setAttribute(attribute, translate(language, key));
        });
      });
    };

    const applyLanguage = (requested, updateUrl = false) => {
      const language = normaliseLanguage(requested, available) || 'en';
      document.documentElement.lang = language;
      document.body.dataset.language = language;
      all('[data-i18n]').forEach((element) => {
        element.textContent = translate(language, element.dataset.i18n);
      });
      applyAttributes(language);
      document.title = translate(language, 'meta.title');
      const description = translate(language, 'meta.description');
      first('meta[name="description"]')?.setAttribute('content', description);
      first('meta[property="og:title"]')?.setAttribute('content', translate(language, 'meta.title'));
      first('meta[property="og:description"]')?.setAttribute('content', description);
      if (select) select.value = language;
      try { localStorage.setItem('winverse-language', language); } catch { /* no-op */ }
      if (updateUrl && history.replaceState) {
        const url = new URL(location.href);
        url.searchParams.set('lang', language);
        history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      }
    };

    select?.addEventListener('change', (event) => applyLanguage(event.target.value, true));
    applyLanguage(query || stored() || browserLanguage());

    const year = first('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    const header = first('[data-header]');
    const menuButton = first('[data-menu-button]');
    const nav = first('[data-nav]');
    const closeMenu = () => {
      if (!menuButton || !nav) return;
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };
    menuButton?.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      nav?.classList.toggle('is-open', !open);
    });
    nav?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (innerWidth > 1100) closeMenu(); });

    const updateHeader = () => header?.classList.toggle('is-scrolled', scrollY > 8);
    updateHeader();
    addEventListener('scroll', updateHeader, { passive: true });

    const revealItems = all('.reveal');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        });
      }, { threshold: .12, rootMargin: '0px 0px -40px' });
      revealItems.forEach((item) => observer.observe(item));
    } else revealItems.forEach((item) => item.classList.add('is-visible'));

    const sections = all('main section[id]');
    const navLinks = all('.site-nav a[href^="#"]');
    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => link.classList.toggle(
          'is-active', link.getAttribute('href') === `#${visible.target.id}`,
        ));
      }, { threshold: [.2, .45, .7], rootMargin: '-20% 0px -65%' });
      sections.forEach((section) => observer.observe(section));
    }
  };

  Promise.allSettled(languages.map(loadDictionary)).then(initialise);
})();
