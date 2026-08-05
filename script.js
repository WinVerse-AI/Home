(() => {
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
    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
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

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
