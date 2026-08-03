document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const contactForm = document.getElementById('contactForm');
  const navLinks = document.querySelectorAll('.nav__link');

  // Header scroll effect
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      nav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Contact form
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      contactForm.reset();

      let successMsg = contactForm.querySelector('.form-success');
      if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'form-success';
        contactForm.appendChild(successMsg);
      }

      successMsg.textContent = '¡Mensaje enviado! Nos pondremos en contacto contigo pronto.';
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }, 1500);
  });

  // Image carousel
  initCarousel({
    trackId: 'carouselTrack',
    prevId: 'carouselPrev',
    nextId: 'carouselNext',
    dotsId: 'carouselDots',
    dotClass: 'carousel__dot',
    autoplay: true,
    interval: 5000
  });

  // Reviews slider
  initCarousel({
    trackSelector: '#reviewsTrack .testimonial-card',
    prevId: 'reviewPrev',
    nextId: 'reviewNext',
    dotsId: 'reviewDots',
    dotClass: 'reviews-nav__dot',
    isReviewSlider: true,
    autoplay: true,
    interval: 7000
  });

  // Handle carousel images load/error
  document.querySelectorAll('.carousel__slide img').forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.remove('loaded'));
    }
  });

  // Scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.service-card, .about__feature, .process__step, .contact__item, .carousel, .testimonials__reviews').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });
});

function initCarousel(config) {
  const isReview = config.isReviewSlider;
  let slides, track, current = 0, timer;

  if (isReview) {
    slides = document.querySelectorAll(config.trackSelector);
    slides.forEach((s, i) => s.classList.toggle('active', i === 0));
  } else {
    track = document.getElementById(config.trackId);
    slides = track ? track.children : [];
  }

  const prevBtn = document.getElementById(config.prevId);
  const nextBtn = document.getElementById(config.nextId);
  const dotsContainer = document.getElementById(config.dotsId);

  if (!slides.length) return;

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    Array.from(slides).forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = config.dotClass + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  function goTo(index) {
    current = ((index % slides.length) + slides.length) % slides.length;

    if (isReview) {
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
    } else if (track) {
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    dotsContainer?.querySelectorAll('.' + config.dotClass).forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });

    resetAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  function resetAutoplay() {
    if (!config.autoplay) return;
    clearInterval(timer);
    timer = setInterval(next, config.interval);
  }

  if (config.autoplay) resetAutoplay();

  // Touch swipe support
  let touchStartX = 0;
  const swipeTarget = isReview ? document.querySelector('.testimonials__reviews') : document.getElementById('testimonialCarousel');
  if (swipeTarget) {
    swipeTarget.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    swipeTarget.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    }, { passive: true });
  }
}
