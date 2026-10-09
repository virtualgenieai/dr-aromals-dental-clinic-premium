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

  // Hero video: the designed poster/placeholder stays visible until video playback starts.
  document.querySelectorAll('.hero-video').forEach(video => {
    const wrapper = video.closest('.hero-video-media');
    const markReady = () => wrapper?.classList.add('video-ready');
    const markFallback = () => wrapper?.classList.remove('video-ready');
    video.addEventListener('playing', markReady);
    video.addEventListener('error', markFallback);
    video.addEventListener('stalled', markFallback);
    if (!reduceMotion) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(markFallback);
    } else {
      video.pause();
      markFallback();
    }
  });

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
  // 3D before/after carousel: autoplay, controls, pointer/touch swipe, pause on interaction.
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

  // Reviews: optionally load from a secure server-side proxy endpoint. Never embed Google API keys here.
  const reviewTrack=document.querySelector('[data-reviews-track]');
  const reviewStatus=document.querySelector('[data-reviews-status]');
  const reviewsEndpoint=window.SITE_CONFIG?.reviewsEndpoint;
  const googleLink=window.SITE_CONFIG?.googleReviewsUrl;
  const googleReviewsLink=document.querySelector('[data-google-reviews-link]');
  if(googleLink && googleReviewsLink){googleReviewsLink.href=googleLink;googleReviewsLink.target='_blank';googleReviewsLink.rel='noopener';googleReviewsLink.textContent='Read Google reviews ↗';}
  function typeReviewText(element, text, speed=17){
    if(!element) return; if(reduceMotion){element.textContent=text;return;}
    element.textContent=''; let i=0; const tick=()=>{if(!element.isConnected)return;element.textContent=text.slice(0,i);i++;if(i<=text.length) setTimeout(tick,speed);};tick();
  }
  if(reviewTrack){
    // Touch/mouse drag for the review marquee. Dragging scrubs the existing CSS animation
    // timeline, so the carousel resumes from the user's chosen position without jumping.
    const reviewWindow = reviewTrack.closest('.reviews-track-window');
    if (reviewWindow) {
      reviewWindow.setAttribute('tabindex', '0');
      reviewWindow.setAttribute('aria-label', 'Patient reviews carousel. Swipe or drag to browse reviews.');
      reviewWindow.style.touchAction = 'pan-y';
      let pointerId = null, startX = 0, lastX = 0, startTime = 0, moved = false, reviewAnimation = null;
      const getAnimation = () => reviewTrack.getAnimations().find(a => a.animationName === 'review-drift') || reviewTrack.getAnimations()[0];
      reviewWindow.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        pointerId = e.pointerId; startX = lastX = e.clientX; startTime = performance.now(); moved = false;
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
    // Animate clearly marked placeholders until a verified live feed is configured.
    reviewTrack.querySelectorAll('[data-type-text]').forEach((el,i)=>setTimeout(()=>typeReviewText(el,el.dataset.typeText,13),i*650));
    if(reviewsEndpoint){
      fetch(reviewsEndpoint,{headers:{Accept:'application/json'}}).then(res=>{if(!res.ok)throw new Error('Review feed unavailable');return res.json();}).then(data=>{
        const reviews=Array.isArray(data)?data:data.reviews;
        if(!Array.isArray(reviews)||!reviews.length)throw new Error('No reviews returned');
        reviewTrack.innerHTML='';
        reviews.slice(0,8).forEach((review,index)=>{
          const card=document.createElement('article');card.className='review-card';
          const rating=document.createElement('div');rating.className='review-stars';const stars=Math.max(0,Math.min(5,Number(review.rating)||0));rating.textContent='★'.repeat(Math.round(stars))+'☆'.repeat(5-Math.round(stars));rating.setAttribute('aria-label',stars+' out of 5 stars');
          const quote=document.createElement('p');quote.className='review-text';quote.textContent='';
          const author=document.createElement('div');author.className='review-author';author.textContent=String(review.author_name||review.author||'Google reviewer');
          const source=document.createElement('span');source.textContent='Google review';author.appendChild(source);
          card.append(rating,quote,author);reviewTrack.appendChild(card);setTimeout(()=>typeReviewText(quote,String(review.text||review.comment||''),12),index*400);
        });
        // Duplicate cards to make the marquee seamless without changing the review content.
        Array.from(reviewTrack.children).forEach(card=>{const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');reviewTrack.appendChild(clone);});
        if(reviewStatus)reviewStatus.textContent='Google review feed connected · latest reviews supplied by the configured endpoint.';
      }).catch(()=>{if(reviewStatus)reviewStatus.textContent='Live review feed could not be loaded. Showing clearly marked placeholders instead.';});
    }
  }

});

/* =========================================================
   REVIEW CAROUSEL — MANUAL SWIPE + LETTER-BY-LETTER TEXT
========================================================= */
(() => {
  function initManualReviews() {
    const track = document.querySelector('[data-reviews-track]');
    if (!track || track.dataset.manualReviewsReady === 'true') return;

    const viewport = track.closest('.reviews-track-window');
    if (!viewport) return;

    track.dataset.manualReviewsReady = 'true';

    // Disable any existing automatic review-track animation.
    track.style.animation = 'none';
    track.style.transform = 'none';

    viewport.style.overflowX = 'auto';
    viewport.style.overflowY = 'hidden';
    viewport.style.scrollSnapType = 'x mandatory';

    const cards = Array.from(track.querySelectorAll('.review-card'))
      .filter(card => card.getAttribute('aria-hidden') !== 'true');

    if (!cards.length) return;

    cards.forEach(card => {
      card.style.scrollSnapAlign = 'center';
    });

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const timers = new WeakMap();
    let activeCard = null;

    function typeReview(card) {
      if (!card || card === activeCard) return;
      activeCard = card;

      const text = card.querySelector('[data-type-text], .review-text');
      if (!text) return;

      clearTimeout(timers.get(text));

      // Prefer the original full text stored in the data attribute.
      const fullText = text.dataset.typeText || text.textContent.trim();

      if (reduceMotion) {
        text.textContent = fullText;
        return;
      }

      text.textContent = '';
      text.classList.add('is-typing');

      let index = 0;
      const typeNext = () => {
        if (!text.isConnected || activeCard !== card) {
          text.classList.remove('is-typing');
          return;
        }

        text.textContent = fullText.slice(0, index);
        index++;

        if (index <= fullText.length) {
          timers.set(text, setTimeout(typeNext, 22));
        } else {
          text.classList.remove('is-typing');
        }
      };

      typeNext();
    }

    // Find the card closest to the centre of the visible carousel.
    function updateActiveReview() {
      const viewportRect = viewport.getBoundingClientRect();
      const centre = viewportRect.left + viewportRect.width / 2;

      let closest = null;
      let closestDistance = Infinity;

      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - centre);

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = card;
        }
      });

      typeReview(closest);
    }

    let scrollTimer;
    viewport.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateActiveReview, 100);
    }, { passive: true });

    // Mouse drag on desktop; native touch scrolling remains enabled.
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;

    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      if (event.target.closest('a, button')) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = viewport.scrollLeft;
      dragged = false;
    });

    viewport.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return;

      if (Math.abs(event.clientX - startX) > 5) {
        dragged = true;
        viewport.classList.add('is-dragging');
        viewport.scrollLeft = startScroll - (event.clientX - startX);
      }
    });

    function endDrag(event) {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      viewport.classList.remove('is-dragging');

      if (dragged) {
        // Keep the final position; don't restart an autoplay animation.
        setTimeout(updateActiveReview, 80);
      }
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('lostpointercapture', endDrag);

    // Start typing the first visible review.
    requestAnimationFrame(updateActiveReview);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManualReviews, {
      once: true
    });
  } else {
    initManualReviews();
  }
})();
