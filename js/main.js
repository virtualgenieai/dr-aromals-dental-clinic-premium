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
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button'); dot.type='button'; dot.className='ba-dot';
      dot.setAttribute('aria-label', 'Show case ' + (i+1)); dot.addEventListener('click', () => show(i, true));
      dotsHost?.appendChild(dot); return dot;
    });
    function show(index, resetTimer=false) {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide,i) => { slide.classList.toggle('is-active', i===active); slide.classList.toggle('is-before', i===((active-1+slides.length)%slides.length)); slide.setAttribute('aria-hidden', String(i!==active)); });
      dots.forEach((dot,i) => { dot.classList.toggle('active',i===active); dot.setAttribute('aria-current',String(i===active)); });
      if (resetTimer) restart();
    }
    function stop(){ if(timer) clearInterval(timer); timer=null; }
    function start(){ if(reduceMotion || slides.length<2) return; stop(); timer=setInterval(()=>show(active+1),4800); }
    function restart(){ stop(); start(); }
    carousel.querySelector('[data-ba-prev]')?.addEventListener('click',()=>show(active-1,true));
    carousel.querySelector('[data-ba-next]')?.addEventListener('click',()=>show(active+1,true));
    carousel.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY;dragging=true;stop();});
    carousel.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)show(active+(dx<0?1:-1),true);else start();});
    carousel.addEventListener('pointercancel',()=>{dragging=false;start();});
    carousel.addEventListener('mouseenter',stop); carousel.addEventListener('mouseleave',start);
    carousel.addEventListener('focusin',stop); carousel.addEventListener('focusout',start);
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
    show(0); start();
  });

  // Seamless conveyor-belt doctor cards. Clone once for a continuous track.
  document.querySelectorAll('[data-doctor-belt]').forEach(belt => {
    const track=belt.querySelector('.doctor-track'); if(!track || track.dataset.cloned) return;
    const originals=Array.from(track.children); if(originals.length<2) return;
    originals.forEach(card=>{const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));track.appendChild(clone);});
    track.dataset.cloned='true';
    belt.addEventListener('pointerdown',()=>belt.classList.add('is-paused'));
    belt.addEventListener('pointerup',()=>setTimeout(()=>belt.classList.remove('is-paused'),800));
    belt.addEventListener('pointercancel',()=>belt.classList.remove('is-paused'));
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
