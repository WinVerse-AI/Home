(() => {
  const translations = window.WINVERSE_TRANSLATIONS || {};
  const supportedLanguages = Object.keys(translations);
  const languageSelect = document.querySelector('[data-language-select]');
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const year = document.querySelector('[data-year]');

  const normaliseLanguage = (value) => {
    if (!value) return null;
    const candidate = String(value).trim().toLowerCase();
    if (candidate === 'zh' || candidate.startsWith('zh-')) return 'zh-CN';
    return supportedLanguages.find((language) => language.toLowerCase() === candidate)
      || supportedLanguages.find((language) => candidate.startsWith(`${language.toLowerCase()}-`))
      || null;
  };

  const readStoredLanguage = () => {
    try {
      return normaliseLanguage(window.localStorage.getItem('winverse-language'));
    } catch {
      return null;
    }
  };

  const detectBrowserLanguage = () => {
    const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const preference of preferences) {
      const match = normaliseLanguage(preference);
      if (match) return match;
    }
    return 'en';
  };

  const queryLanguage = normaliseLanguage(new URLSearchParams(window.location.search).get('lang'));
  const initialLanguage = queryLanguage || readStoredLanguage() || detectBrowserLanguage();

  const translate = (language, key) => translations[language]?.[key] ?? translations.en[key] ?? key;

  const updateTranslatedAttributes = (language) => {
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      const declarations = element.dataset.i18nAttr.split(';');
      declarations.forEach((declaration) => {
        const separator = declaration.indexOf(':');
        if (separator < 1) return;
        const attribute = declaration.slice(0, separator).trim();
        const key = declaration.slice(separator + 1).trim();
        if (attribute && key) element.setAttribute(attribute, translate(language, key));
      });
    });
  };

  const updateMetadata = (language) => {
    document.title = translate(language, 'meta.title');
    const description = translate(language, 'meta.description');
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (descriptionMeta) descriptionMeta.setAttribute('content', description);
    if (ogTitle) ogTitle.setAttribute('content', translate(language, 'meta.title'));
    if (ogDescription) ogDescription.setAttribute('content', description);
  };

  const persistLanguage = (language) => {
    try {
      window.localStorage.setItem('winverse-language', language);
    } catch {
      // The language still applies for this visit when storage is unavailable.
    }
  };

  const updateLanguageQuery = (language) => {
    if (!window.history?.replaceState) return;
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const applyLanguage = (language, options = {}) => {
    const resolvedLanguage = normaliseLanguage(language) || 'en';
    document.documentElement.lang = resolvedLanguage;
    document.body.dataset.language = resolvedLanguage;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = translate(resolvedLanguage, element.dataset.i18n);
    });

    updateTranslatedAttributes(resolvedLanguage);
    updateMetadata(resolvedLanguage);

    if (languageSelect) languageSelect.value = resolvedLanguage;
    persistLanguage(resolvedLanguage);
    if (options.updateUrl) updateLanguageQuery(resolvedLanguage);
  };

  if (languageSelect) {
    languageSelect.addEventListener('change', (event) => {
      applyLanguage(event.target.value, { updateUrl: true });
    });
  }

  applyLanguage(initialLanguage);

  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1100) closeMenu();
    });
  }

  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
      });
    }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-20% 0px -65%' });

    sections.forEach((section) => sectionObserver.observe(section));
  }
})();
