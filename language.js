(() => {
  'use strict';

  const STORAGE_KEY = 'winverse.language';
  const QUERY_KEY = 'lang';
  const DEFAULT_LANGUAGE = 'en';
  const DICTIONARY_ROOT = 'translations/generated';
  const TRANSLATABLE_ATTRIBUTES = ['aria-label', 'title', 'alt', 'placeholder'];

  const LANGUAGES = {
    en: {
      code: 'en',
      nativeName: 'English',
      englishName: 'English',
      flag: 'assets/flags/gb.svg',
      htmlLang: 'en-GB'
    },
    'zh-CN': {
      code: 'zh-CN',
      nativeName: '中文（简体）',
      englishName: 'Chinese',
      flag: 'assets/flags/cn.svg',
      htmlLang: 'zh-CN'
    },
    ja: {
      code: 'ja',
      nativeName: '日本語',
      englishName: 'Japanese',
      flag: 'assets/flags/jp.svg',
      htmlLang: 'ja'
    },
    fr: {
      code: 'fr',
      nativeName: 'Français',
      englishName: 'French',
      flag: 'assets/flags/fr.svg',
      htmlLang: 'fr'
    },
    de: {
      code: 'de',
      nativeName: 'Deutsch',
      englishName: 'German',
      flag: 'assets/flags/de.svg',
      htmlLang: 'de'
    },
    es: {
      code: 'es',
      nativeName: 'Español',
      englishName: 'Spanish',
      flag: 'assets/flags/es.svg',
      htmlLang: 'es'
    }
  };

  const dictionaryCache = new Map();
  const textRecords = [];
  const attributeRecords = [];
  let activeLanguage = DEFAULT_LANGUAGE;
  let requestSequence = 0;
  let picker = null;
  let trigger = null;
  let menu = null;
  let status = null;

  const validLanguage = (code) => Object.prototype.hasOwnProperty.call(LANGUAGES, code);
  const normalise = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  const safeStorageGet = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (_error) {
      return null;
    }
  };

  const safeStorageSet = (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_error) {
      // Query parameters still preserve the selected language.
    }
  };

  const clearLegacyGoogleState = () => {
    const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `googtrans=;expires=${expires};path=/`;
    document.cookie = `googtrans=;expires=${expires};path=/Home`;
    document.documentElement.classList.remove('translated-ltr', 'translated-rtl');
    document.body?.classList.remove('translated-ltr', 'translated-rtl');
    document.documentElement.style.removeProperty('top');
    document.body?.style.removeProperty('top');
    document.body?.style.removeProperty('margin-top');

    document.querySelectorAll(
      '#google_translate_element, #winverse-google-translate, ' +
      'iframe.goog-te-banner-frame, .goog-te-banner-frame, .goog-te-balloon-frame, ' +
      '#goog-gt-tt, .goog-tooltip, [class^="VIpgJd-"]'
    ).forEach((element) => element.remove());
  };

  const getInitialLanguage = () => {
    const parameter = new URL(window.location.href).searchParams.get(QUERY_KEY);
    if (parameter && validLanguage(parameter)) return parameter;

    const stored = safeStorageGet();
    if (stored && validLanguage(stored)) return stored;

    return DEFAULT_LANGUAGE;
  };

  const updateAddress = (code) => {
    const url = new URL(window.location.href);
    if (code === DEFAULT_LANGUAGE) {
      url.searchParams.delete(QUERY_KEY);
    } else {
      url.searchParams.set(QUERY_KEY, code);
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const syncLocalLinks = (code) => {
    document.querySelectorAll('a[href]').forEach((link) => {
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith(('#', 'mailto:', 'tel:', 'javascript:'))) return;

      let url;
      try {
        url = new URL(raw, window.location.href);
      } catch (_error) {
        return;
      }
      if (url.origin !== window.location.origin || !url.pathname.endsWith('.html')) return;

      if (code === DEFAULT_LANGUAGE) {
        url.searchParams.delete(QUERY_KEY);
      } else {
        url.searchParams.set(QUERY_KEY, code);
      }
      link.setAttribute('href', `${url.pathname.split('/').pop()}${url.search}${url.hash}`);
    });
  };

  const shouldSkipTextNode = (node) => {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(parent.closest(
      'script, style, noscript, code, pre, svg, [data-language-picker], .notranslate, [translate="no"]'
    ));
  };

  const indexDocument = () => {
    const walker = document.createTreeWalker(
      document.documentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (shouldSkipTextNode(node)) return NodeFilter.FILTER_REJECT;
          return normalise(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node = walker.nextNode();
    while (node) {
      const original = node.nodeValue;
      textRecords.push({
        node,
        original,
        key: normalise(original),
        leading: original.match(/^\s*/)?.[0] || '',
        trailing: original.match(/\s*$/)?.[0] || ''
      });
      node = walker.nextNode();
    }

    document.querySelectorAll('*').forEach((element) => {
      if (element.closest('[data-language-picker], .notranslate, [translate="no"]')) return;
      TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
        const original = element.getAttribute(attribute);
        const key = normalise(original);
        if (!key) return;
        attributeRecords.push({ element, attribute, original, key });
      });
    });
  };

  const restoreOriginalDocument = () => {
    textRecords.forEach((record) => {
      if (record.node.isConnected) record.node.nodeValue = record.original;
    });
    attributeRecords.forEach((record) => {
      if (record.element.isConnected) record.element.setAttribute(record.attribute, record.original);
    });
  };

  const applyDictionary = (strings) => {
    textRecords.forEach((record) => {
      if (!record.node.isConnected) return;
      const translated = strings[record.key];
      if (typeof translated !== 'string' || !translated.trim()) return;
      record.node.nodeValue = `${record.leading}${translated.trim()}${record.trailing}`;
    });

    attributeRecords.forEach((record) => {
      if (!record.element.isConnected) return;
      const translated = strings[record.key];
      if (typeof translated === 'string' && translated.trim()) {
        record.element.setAttribute(record.attribute, translated.trim());
      }
    });
  };

  const loadDictionary = async (code) => {
    if (dictionaryCache.has(code)) return dictionaryCache.get(code);

    const response = await window.fetch(`${DICTIONARY_ROOT}/${encodeURIComponent(code)}.json`, {
      credentials: 'same-origin',
      cache: 'force-cache'
    });
    if (!response.ok) throw new Error(`Translation dictionary returned ${response.status}`);

    const payload = await response.json();
    if (!payload || payload.locale !== code || typeof payload.strings !== 'object') {
      throw new Error('Translation dictionary is invalid.');
    }
    dictionaryCache.set(code, payload.strings);
    return payload.strings;
  };

  const announce = (message) => {
    if (status) status.textContent = message;
  };

  const renderCurrentLanguage = () => {
    if (!picker || !trigger || !menu) return;
    const language = LANGUAGES[activeLanguage];
    const flag = trigger.querySelector('[data-language-current-flag]');
    const label = trigger.querySelector('[data-language-current-label]');

    if (flag) {
      flag.src = language.flag;
      flag.alt = '';
    }
    if (label) label.textContent = language.nativeName;

    trigger.setAttribute('aria-label', `Language: ${language.englishName}`);
    picker.dataset.language = activeLanguage;
    document.documentElement.lang = language.htmlLang;

    menu.querySelectorAll('[data-language-code]').forEach((option) => {
      const selected = option.dataset.languageCode === activeLanguage;
      option.setAttribute('aria-checked', String(selected));
      option.classList.toggle('is-active', selected);
    });
  };

  const closeLanguageMenu = () => {
    if (!trigger || !menu) return;
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  };

  const openLanguageMenu = () => {
    if (!trigger || !menu) return;
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    const selected = menu.querySelector('[aria-checked="true"]') || menu.querySelector('button');
    selected?.focus();
  };

  const applyLanguage = async (code, { updateHistory = true } = {}) => {
    if (!validLanguage(code)) return;
    const sequence = ++requestSequence;
    activeLanguage = code;
    safeStorageSet(code);
    if (updateHistory) updateAddress(code);
    syncLocalLinks(code);
    renderCurrentLanguage();
    closeLanguageMenu();
    picker?.classList.add('is-loading');
    trigger?.setAttribute('aria-busy', 'true');

    restoreOriginalDocument();

    try {
      if (code !== DEFAULT_LANGUAGE) {
        announce(`Loading ${LANGUAGES[code].englishName}.`);
        const strings = await loadDictionary(code);
        if (sequence !== requestSequence) return;
        applyDictionary(strings);
      }
      document.documentElement.lang = LANGUAGES[code].htmlLang;
      announce(`Page language changed to ${LANGUAGES[code].englishName}.`);
    } catch (error) {
      if (sequence !== requestSequence) return;
      activeLanguage = DEFAULT_LANGUAGE;
      safeStorageSet(DEFAULT_LANGUAGE);
      updateAddress(DEFAULT_LANGUAGE);
      syncLocalLinks(DEFAULT_LANGUAGE);
      restoreOriginalDocument();
      renderCurrentLanguage();
      announce('The selected translation could not be loaded. The English page has been restored.');
      console.error('[WinVerse language]', error);
    } finally {
      if (sequence === requestSequence) {
        picker?.classList.remove('is-loading');
        trigger?.removeAttribute('aria-busy');
      }
    }
  };

  const buildLanguagePicker = () => {
    const headerInner = document.querySelector('.header-inner');
    if (!headerInner || headerInner.querySelector('[data-language-picker]')) return;

    picker = document.createElement('div');
    picker.className = 'language-picker notranslate';
    picker.dataset.languagePicker = '';
    picker.setAttribute('translate', 'no');

    const options = Object.values(LANGUAGES).map((language) => `
      <button class="language-option" type="button" role="menuitemradio" aria-checked="false" data-language-code="${language.code}">
        <img class="language-flag" src="${language.flag}" width="36" height="24" alt="" aria-hidden="true">
        <span class="language-option-copy">
          <strong>${language.nativeName}</strong>
          <small>${language.englishName}</small>
        </span>
        <span class="language-check" aria-hidden="true">✓</span>
      </button>
    `).join('');

    picker.innerHTML = `
      <button class="language-trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="winverse-language-menu">
        <img class="language-flag" data-language-current-flag src="${LANGUAGES.en.flag}" width="36" height="24" alt="" aria-hidden="true">
        <span class="language-current-label" data-language-current-label>English</span>
        <span class="language-chevron" aria-hidden="true">⌄</span>
      </button>
      <div class="language-menu" id="winverse-language-menu" role="menu" aria-label="Language options" hidden>
        <p class="language-menu-title">Language</p>
        ${options}
        <p class="language-service-note">Translations are loaded locally. No external translation toolbar is used.</p>
      </div>
      <span class="language-status" aria-live="polite" data-language-status></span>
    `;

    headerInner.appendChild(picker);
    trigger = picker.querySelector('.language-trigger');
    menu = picker.querySelector('.language-menu');
    status = picker.querySelector('[data-language-status]');

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      if (expanded) closeLanguageMenu(); else openLanguageMenu();
    });

    menu.querySelectorAll('[data-language-code]').forEach((option) => {
      option.addEventListener('click', () => applyLanguage(option.dataset.languageCode));
      option.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const items = [...menu.querySelectorAll('[data-language-code]')];
        const current = items.indexOf(option);
        let next = current;
        if (event.key === 'ArrowDown') next = (current + 1) % items.length;
        if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = items.length - 1;
        items[next].focus();
      });
    });

    document.addEventListener('click', (event) => {
      if (picker && !picker.contains(event.target)) closeLanguageMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu && !menu.hidden) {
        closeLanguageMenu();
        trigger.focus();
      }
    });
  };

  const initialise = () => {
    clearLegacyGoogleState();
    activeLanguage = getInitialLanguage();
    indexDocument();
    buildLanguagePicker();
    applyLanguage(activeLanguage, { updateHistory: false });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
