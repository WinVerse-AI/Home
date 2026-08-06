(() => {
  'use strict';

  const STORAGE_KEY = 'winverse.language';
  const QUERY_KEY = 'lang';
  const COOKIE_NAME = 'googtrans';
  const DEFAULT_LANGUAGE = 'en';
  const GOOGLE_SCRIPT_ID = 'winverse-google-translate';
  const GOOGLE_ELEMENT_ID = 'google_translate_element';

  const LANGUAGES = {
    en: {
      code: 'en',
      googleCode: 'en',
      nativeName: 'English',
      englishName: 'English',
      flag: 'assets/flags/gb.svg',
      htmlLang: 'en-GB'
    },
    'zh-CN': {
      code: 'zh-CN',
      googleCode: 'zh-CN',
      nativeName: '中文（简体）',
      englishName: 'Chinese',
      flag: 'assets/flags/cn.svg',
      htmlLang: 'zh-CN'
    },
    ja: {
      code: 'ja',
      googleCode: 'ja',
      nativeName: '日本語',
      englishName: 'Japanese',
      flag: 'assets/flags/jp.svg',
      htmlLang: 'ja'
    },
    fr: {
      code: 'fr',
      googleCode: 'fr',
      nativeName: 'Français',
      englishName: 'French',
      flag: 'assets/flags/fr.svg',
      htmlLang: 'fr'
    },
    de: {
      code: 'de',
      googleCode: 'de',
      nativeName: 'Deutsch',
      englishName: 'German',
      flag: 'assets/flags/de.svg',
      htmlLang: 'de'
    },
    es: {
      code: 'es',
      googleCode: 'es',
      nativeName: 'Español',
      englishName: 'Spanish',
      flag: 'assets/flags/es.svg',
      htmlLang: 'es'
    }
  };

  let activeLanguage = DEFAULT_LANGUAGE;
  let picker = null;
  let trigger = null;
  let menu = null;
  let status = null;

  const validLanguage = (code) => Object.prototype.hasOwnProperty.call(LANGUAGES, code);

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
      // The selector still works through the query string and translation cookie.
    }
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

  const setTranslationCookie = (code) => {
    const value = `/en/${code}`;
    document.cookie = `${COOKIE_NAME}=${value};path=/;SameSite=Lax`;
    document.cookie = `${COOKIE_NAME}=${value};path=/Home;SameSite=Lax`;
  };

  const clearTranslationCookie = () => {
    const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `${COOKIE_NAME}=;expires=${expires};path=/`;
    document.cookie = `${COOKIE_NAME}=;expires=${expires};path=/Home`;
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

  const announce = (message) => {
    if (status) status.textContent = message;
  };

  const applyGoogleLanguage = (code, attempt = 0) => {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      if (combo.value !== code) {
        combo.value = code;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      }
      announce(`Page language changed to ${LANGUAGES[code].englishName}.`);
      return;
    }

    if (attempt < 60) {
      window.setTimeout(() => applyGoogleLanguage(code, attempt + 1), 100);
    } else {
      announce('Translation service is temporarily unavailable. Please try again.');
    }
  };

  const initialiseGoogleTranslate = () => {
    if (!window.google?.translate?.TranslateElement) return;

    const host = document.getElementById(GOOGLE_ELEMENT_ID);
    if (!host || host.dataset.initialised === 'true') return;

    host.dataset.initialised = 'true';
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'zh-CN,ja,fr,de,es',
        autoDisplay: false,
        multilanguagePage: true
      },
      GOOGLE_ELEMENT_ID
    );

    if (activeLanguage !== DEFAULT_LANGUAGE) {
      window.setTimeout(() => applyGoogleLanguage(LANGUAGES[activeLanguage].googleCode), 100);
    }
  };

  const loadGoogleTranslate = () => {
    if (activeLanguage === DEFAULT_LANGUAGE) return;

    if (!document.getElementById(GOOGLE_ELEMENT_ID)) {
      const host = document.createElement('div');
      host.id = GOOGLE_ELEMENT_ID;
      host.className = 'translation-engine notranslate';
      host.setAttribute('translate', 'no');
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
    }

    window.googleTranslateElementInit = initialiseGoogleTranslate;

    if (window.google?.translate?.TranslateElement) {
      initialiseGoogleTranslate();
      applyGoogleLanguage(LANGUAGES[activeLanguage].googleCode);
      return;
    }

    if (!document.getElementById(GOOGLE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.referrerPolicy = 'no-referrer-when-downgrade';
      script.onerror = () => announce('Translation service is temporarily unavailable. Please try again.');
      document.head.appendChild(script);
    }
  };

  const chooseLanguage = (code) => {
    if (!validLanguage(code)) return;
    const previousLanguage = activeLanguage;
    activeLanguage = code;
    safeStorageSet(code);
    updateAddress(code);
    renderCurrentLanguage();
    closeLanguageMenu();

    if (code === DEFAULT_LANGUAGE) {
      clearTranslationCookie();
      announce('Returning to the original English page.');
      if (previousLanguage !== DEFAULT_LANGUAGE || document.documentElement.classList.contains('translated-ltr')) {
        window.location.reload();
      }
      return;
    }

    setTranslationCookie(LANGUAGES[code].googleCode);
    announce(`Loading ${LANGUAGES[code].englishName} translation.`);
    loadGoogleTranslate();
    applyGoogleLanguage(LANGUAGES[code].googleCode);
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
        <p class="language-service-note">Non-English pages use automated translation.</p>
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
      option.addEventListener('click', () => chooseLanguage(option.dataset.languageCode));
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

    renderCurrentLanguage();
  };

  const initialise = () => {
    activeLanguage = getInitialLanguage();
    buildLanguagePicker();

    if (activeLanguage === DEFAULT_LANGUAGE) {
      clearTranslationCookie();
      document.documentElement.lang = LANGUAGES.en.htmlLang;
    } else {
      setTranslationCookie(LANGUAGES[activeLanguage].googleCode);
      loadGoogleTranslate();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
