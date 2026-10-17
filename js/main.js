document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Compact the translucent header after the first scroll without layout thrashing.
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Accessible mobile navigation.
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  // Reveal elements once as they enter view; reduced-motion users see content immediately.
  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    revealItems.forEach(item => observer.observe(item));
  }

  // The redesigned hero is a lightweight static illustration; no legacy video is loaded.

  // Location-first appointment enquiry flow.
  const modal = document.querySelector('.modal-backdrop');
  const result = document.querySelector('.booking-result');
  let selected = '';
  let lastTrigger = null;
  const openModal = event => {
    lastTrigger = event?.currentTarget || document.activeElement;
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
    modal?.querySelector('.modal-close')?.focus();
  };
  const closeModal = () => {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    result?.classList.remove('show');
    lastTrigger?.focus?.();
  };
  document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', openModal));
  document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal?.classList.contains('open')) closeModal(); });

  document.querySelectorAll('[data-clinic-choice]').forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.clinicChoice;
    const clinic = window.SITE_CONFIG?.clinics?.[selected];
    const label = document.querySelector('#selected-clinic-label');
    if (label) label.textContent = clinic?.name || (selected === 'one' ? 'Clinic One' : 'Clinic Two');
    result?.classList.add('show');
  }));
  const selectedClinic = () => window.SITE_CONFIG?.clinics?.[selected];
  document.querySelector('[data-book-call]')?.addEventListener('click', () => {
    const phone = selectedClinic()?.phone;
    if (phone) window.location.href = 'tel:' + phone.replace(/[^\d+]/g, '');
    else alert('Add the verified clinic phone in js/config.js before launch.');
  });
  document.querySelector('[data-book-whatsapp]')?.addEventListener('click', () => {
    const number = window.SITE_CONFIG?.whatsappNumber || selectedClinic()?.phone?.replace(/\D/g, '');
    if (!number) { alert('Add the verified WhatsApp number in js/config.js before launch.'); return; }
    window.open('https://wa.me/' + number + '?text=' + encodeURIComponent('Hello, I would like to enquire about an appointment at ' + (selectedClinic()?.name || 'the clinic') + '.'), '_blank', 'noopener');
  });
  document.querySelectorAll('[data-team-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-team-filter]').forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-team-location]').forEach(group => { group.hidden = button.dataset.teamFilter !== 'all' && group.dataset.teamLocation !== button.dataset.teamFilter; });
  }));
  document.querySelectorAll('[data-year]').forEach(item => item.textContent = new Date().getFullYear());


  // Native cross-document View Transitions are enabled in CSS where supported.
  // Case carousel controls remain manual; no automatic rotation.
  document.querySelectorAll('[data-ba-carousel]').forEach(carousel => {
    const slides = Array.from(carousel.querySelectorAll('[data-ba-slide]'));
    const dotsHost = carousel.querySelector('[data-ba-dots]');
    if (!slides.length) return;
    let active = 0, timer = null, startX = 0, startY = 0, dragging = false;
    const positions = ['is-far-left', 'is-left', 'is-active', 'is-right', 'is-far-right'];
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button'; dot.className = 'ba-dot';
      dot.setAttribute('aria-label', 'Show case ' + (i + 1));
      dot.addEventListener('click', () => show(i, true));
      dotsHost?.appendChild(dot);
      return dot;
    });
    function show(index, resetTimer = false) {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.remove(...positions);
        let distance = i - active;
        if (distance > slides.length / 2) distance -= slides.length;
        if (distance < -slides.length / 2) distance += slides.length;
        if (distance === 0) slide.classList.add('is-active');
        else if (distance === 1 || (slides.length === 2 && distance === -1)) slide.classList.add('is-right');
        else if (distance === -1) slide.classList.add('is-left');
        else if (distance > 0) slide.classList.add('is-far-right');
        else slide.classList.add('is-far-left');
        slide.setAttribute('aria-hidden', String(distance !== 0));
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === active);
        if (i === active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (resetTimer) restart();
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function start() {
      if (reduceMotion || slides.length < 2 || document.hidden) return;
      stop(); timer = setInterval(() => show(active + 1), 4300);
    }
    function restart() { stop(); start(); }
    carousel.querySelector('[data-ba-prev]')?.addEventListener('click', () => show(active - 1, true));
    carousel.querySelector('[data-ba-next]')?.addEventListener('click', () => show(active + 1, true));
    carousel.addEventListener('pointerdown', e => {
      if (e.target.closest('button, a')) return;
      startX = e.clientX; startY = e.clientY; dragging = true; stop();
    });
    carousel.addEventListener('pointerup', e => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.15) show(active + (dx < 0 ? 1 : -1), true);
      else start();
    });
    carousel.addEventListener('pointercancel', () => { dragging = false; start(); });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    show(0); start();
  });

  // Build a wide enough first run, then duplicate that exact run for a seamless conveyor.
  document.querySelectorAll('[data-doctor-belt]').forEach(belt => {
    const track = belt.querySelector('.doctor-track');
    if (!track || track.dataset.cloned) return;
    const initial = Array.from(track.children);
    if (!initial.length) return;
    let guard = 0;
    while (track.scrollWidth < belt.clientWidth + (initial[0].getBoundingClientRect().width || 250) && guard < 12) {
      Array.from(track.children).forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        track.appendChild(clone);
      });
      guard++;
    }
    const firstRun = Array.from(track.children);
    firstRun.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      track.appendChild(clone);
    });
    track.dataset.cloned = 'true';
    belt.addEventListener('pointerdown', () => belt.classList.add('is-paused'));
    const resume = () => belt.classList.remove('is-paused');
    belt.addEventListener('pointerup', () => setTimeout(resume, 500));
    belt.addEventListener('pointercancel', resume);
    belt.addEventListener('pointerleave', resume);
  });

  // Reviews: typewriter animation is purely visual and runs locally; no API fetch is used.
  const reviewTrack=document.querySelector('[data-reviews-track]');
  const reviewStatus=document.querySelector('[data-reviews-status]');
  const googleLink=window.SITE_CONFIG?.googleReviewsUrl;
  const googleReviewsLink=document.querySelector('[data-google-reviews-link]');
  if(googleLink && googleReviewsLink){googleReviewsLink.href=googleLink;googleReviewsLink.target='_blank';googleReviewsLink.rel='noopener';googleReviewsLink.textContent='Read Google reviews ↗';}
  function typeReviewText(element, text, speed=24){
    if(!element) return;
    if(reduceMotion){element.textContent=text;return;}
    element.textContent='';
    let i=0;
    const tick=()=>{
      if(!element.isConnected)return;
      element.textContent=text.slice(0,i);
      i++;
      if(i<=text.length) setTimeout(tick,speed);
    };
    tick();
  }
  if(reviewTrack){
    if(reviewStatus) reviewStatus.textContent='Reviews revealed with a typing animation';
    // Touch/mouse drag scrubs the existing marquee timeline so it resumes without jumping.
    const reviewWindow = reviewTrack.closest('.reviews-track-window');
    if (reviewWindow) {
      reviewWindow.setAttribute('tabindex', '0');
      reviewWindow.setAttribute('aria-label', 'Patient reviews carousel. Swipe or drag to browse reviews.');
      reviewWindow.style.touchAction = 'pan-y';
      let pointerId = null, startX = 0, lastX = 0, moved = false, reviewAnimation = null;
      const getAnimation = () => reviewTrack.getAnimations().find(a => a.animationName === 'review-drift') || reviewTrack.getAnimations()[0];
      reviewWindow.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        pointerId = e.pointerId; startX = lastX = e.clientX; moved = false;
        reviewAnimation = getAnimation();
        if (reviewAnimation) reviewAnimation.pause();
        reviewWindow.classList.add('is-dragging');
        try { reviewWindow.setPointerCapture(pointerId); } catch (_) {}
      });
      reviewWindow.addEventListener('pointermove', e => {
        if (pointerId !== e.pointerId || !reviewAnimation) return;
        const dx = e.clientX - lastX;
        if (Math.abs(e.clientX - startX) > 4) moved = true;
        if (moved) {
          const duration = Number(reviewAnimation.effect?.getTiming().duration) || 36000;
          const width = Math.max(1, reviewTrack.scrollWidth);
          const deltaTime = (-dx / width) * duration;
          const current = Number(reviewAnimation.currentTime) || 0;
          reviewAnimation.currentTime = ((current + deltaTime) % duration + duration) % duration;
        }
        lastX = e.clientX;
      });
      const finishReviewDrag = e => {
        if (pointerId === null || (e && e.pointerId !== undefined && e.pointerId !== pointerId)) return;
        if (reviewAnimation) reviewAnimation.play();
        pointerId = null; reviewWindow.classList.remove('is-dragging');
      };
      reviewWindow.addEventListener('pointerup', finishReviewDrag);
      reviewWindow.addEventListener('pointercancel', finishReviewDrag);
      reviewWindow.addEventListener('lostpointercapture', finishReviewDrag);
      reviewWindow.addEventListener('keydown', e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault(); const animation = getAnimation(); if (!animation) return;
        const duration = Number(animation.effect?.getTiming().duration) || 36000;
        const width = Math.max(1, reviewTrack.scrollWidth);
        animation.currentTime = ((Number(animation.currentTime)||0) + (e.key === 'ArrowLeft' ? -1 : 1) * duration * 0.12 + duration) % duration;
      });
    }
    // Animate each supplied review's text with a typewriter effect. Replace placeholders with genuine reviews.
    reviewTrack.querySelectorAll('[data-type-text]').forEach((el,i)=>setTimeout(()=>typeReviewText(el,el.dataset.typeText,24),i*900));
    // Duplicate cards for seamless marquee movement; this does not fetch or generate review content.
    Array.from(reviewTrack.children).forEach(card=>{const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');reviewTrack.appendChild(clone);});
  }

});
