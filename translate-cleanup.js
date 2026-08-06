(() => {
  'use strict';

  const ENGINE_ID = 'google_translate_element';
  const UI_SELECTORS = [
    'body > .skiptranslate',
    'body > iframe.skiptranslate',
    'iframe.goog-te-banner-frame',
    '.goog-te-banner-frame',
    '.goog-te-balloon-frame',
    '.goog-te-menu-frame',
    '.goog-te-spinner-pos',
    '#goog-gt-tt',
    '.goog-tooltip',
    '.VIpgJd-ZVi9od-ORHb-OEVmcd',
    '.VIpgJd-ZVi9od-aZ2wEe-wOHMyf',
    '.VIpgJd-ZVi9od-aZ2wEe-OiiCO',
    '.VIpgJd-yAWNEb-L7lbkb'
  ];

  const isTranslationEngine = (element) => {
    if (!(element instanceof Element)) return false;
    return element.id === ENGINE_ID || Boolean(element.closest(`#${ENGINE_ID}`));
  };

  const pinPageToTop = (element) => {
    if (!element) return;
    const current = element.style.getPropertyValue('top');
    const priority = element.style.getPropertyPriority('top');
    if (current !== '0px' || priority !== 'important') {
      element.style.setProperty('top', '0px', 'important');
    }
  };

  const suppressGoogleInterface = () => {
    pinPageToTop(document.documentElement);
    pinPageToTop(document.body);

    if (document.body) {
      const margin = document.body.style.getPropertyValue('margin-top');
      const priority = document.body.style.getPropertyPriority('margin-top');
      if (margin !== '0px' || priority !== 'important') {
        document.body.style.setProperty('margin-top', '0px', 'important');
      }
    }

    document.querySelectorAll(UI_SELECTORS.join(',')).forEach((element) => {
      if (isTranslationEngine(element)) return;
      element.remove();
    });

    document.querySelectorAll('[class^="VIpgJd-ZVi9od-ORHb"], [class*=" VIpgJd-ZVi9od-ORHb"], [class^="VIpgJd-ZVi9od-aZ2wEe"], [class*=" VIpgJd-ZVi9od-aZ2wEe"], [class^="VIpgJd-yAWNEb-L7lbkb"], [class*=" VIpgJd-yAWNEb-L7lbkb"]').forEach((element) => {
      if (isTranslationEngine(element)) return;
      element.remove();
    });
  };

  let scheduled = false;
  const scheduleCleanup = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      suppressGoogleInterface();
    });
  };

  const start = () => {
    suppressGoogleInterface();

    const observer = new MutationObserver(scheduleCleanup);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    let passes = 0;
    const initialSweep = window.setInterval(() => {
      suppressGoogleInterface();
      passes += 1;
      if (passes >= 40) window.clearInterval(initialSweep);
    }, 250);

    window.addEventListener('load', suppressGoogleInterface, { once: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
