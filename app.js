(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const site = document.getElementById('site');
  const loader = document.getElementById('loader');
  const motionButton = document.getElementById('motion-toggle');
  let paused = reducedMotion.matches;
  let toastTimer;
  let loadingFinished = false;
  let rafId = 0;
  const heroTitle = document.getElementById('hero-title');
  const typedName = document.getElementById('typed-name');
  const nameFonts = ['name-space', 'name-sans', 'name-mono', 'name-serif'];
  let nameFontIndex = 0;
  let nameTimer = 0;
  let namePosition = 6;
  const start = performance.now();
  const minimumLoad = reducedMotion.matches ? 150 : 1600;
  document.body.classList.add('loading');
  site.inert = true;

  // The intro has a time limit, so a blocked font service can never trap a visitor.
  const assetsReady = Promise.allSettled([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    ...Array.from(document.querySelectorAll('.hero img')).map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve())
  ]);
  let ready = false;
  assetsReady.then(() => { ready = true; });
  function finishLoading() {
    if (loadingFinished) return;
    loadingFinished = true;
    document.getElementById('load-bar').style.width = '100%';
    document.getElementById('load-number').textContent = '100%';
    document.getElementById('load-message').textContent = 'Welcome to my world';
    setTimeout(() => {
      loader.classList.add('done');
      loader.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('loading');
      site.inert = false;
      resumeTyping();
    }, reducedMotion.matches ? 0 : 220);
  }
  function loadingFrame(now) {
    const elapsed = now - start;
    const percent = Math.min(94, Math.floor(elapsed / minimumLoad * 92));
    document.getElementById('load-bar').style.width = percent + '%';
    document.getElementById('load-number').textContent = String(percent).padStart(2, '0') + '%';
    document.getElementById('load-message').textContent = percent < 35 ? 'Finding the signal' : percent < 75 ? 'Mapping the orbit' : 'Opening the void';
    if ((ready && elapsed >= minimumLoad) || elapsed >= 4000) finishLoading();
    else requestAnimationFrame(loadingFrame);
  }
  requestAnimationFrame(loadingFrame);
  setTimeout(finishLoading, 4500);

  // Reveal once; content remains readable if the observer is unsupported.
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  } else reveals.forEach(el => el.classList.add('in'));

  // Keep the accessible heading stable while its visual letters and font cycle.
  function stopTyping() {
    clearTimeout(nameTimer);
    nameTimer = 0;
    typedName.textContent = 'Belial';
    namePosition = 6;
    heroTitle.classList.remove('typing');
  }
  function queueTyping(callback, delay) {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(callback, delay);
  }
  function typeNextLetter() {
    if (paused || !heroVisible || document.hidden) return stopTyping();
    namePosition += 1;
    typedName.textContent = 'Belial'.slice(0, namePosition);
    if (namePosition < 6) queueTyping(typeNextLetter, 115);
    else {
      heroTitle.classList.remove('typing');
      queueTyping(eraseNextLetter, 2000);
    }
  }
  function changeNameFont() {
    if (paused || !heroVisible || document.hidden) return stopTyping();
    nameFontIndex = (nameFontIndex + 1) % nameFonts.length;
    typedName.classList.remove(...nameFonts);
    typedName.classList.add(nameFonts[nameFontIndex]);
    namePosition = 0;
    typedName.textContent = '';
    heroTitle.classList.add('typing');
    queueTyping(typeNextLetter, 260);
  }
  function eraseNextLetter() {
    if (paused || !heroVisible || document.hidden) return stopTyping();
    heroTitle.classList.add('typing');
    namePosition -= 1;
    typedName.textContent = 'Belial'.slice(0, namePosition);
    if (namePosition > 0) queueTyping(eraseNextLetter, 62);
    else queueTyping(changeNameFont, 260);
  }
  function resumeTyping() {
    if (paused || !loadingFinished || !heroVisible || document.hidden || nameTimer) return;
    queueTyping(eraseNextLetter, 1700);
  }

  // A defined easing curve makes in-page navigation feel like part of the scene.
  let scrollAnimation = 0;
  let previousScrollBehavior = '';
  function cancelScrollAnimation() {
    if (scrollAnimation) cancelAnimationFrame(scrollAnimation);
    scrollAnimation = 0;
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      cancelScrollAnimation();
      const from = window.scrollY;
      const to = target.getBoundingClientRect().top + from;
      if (paused || Math.abs(to - from) < 2) {
        window.scrollTo(0, to);
      } else {
        previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        const duration = Math.min(1150, Math.max(680, Math.abs(to - from) * .85));
        const started = performance.now();
        function glide(now) {
          const t = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          window.scrollTo(0, from + (to - from) * eased);
          if (t < 1) scrollAnimation = requestAnimationFrame(glide);
          else cancelScrollAnimation();
        }
        scrollAnimation = requestAnimationFrame(glide);
      }
      try { history.pushState(null, '', hash); } catch (_) { /* Local files can restrict history. */ }
    });
  });
  window.addEventListener('wheel', cancelScrollAnimation, { passive: true });
  window.addEventListener('touchstart', cancelScrollAnimation, { passive: true });
  window.addEventListener('keydown', event => {
    if (['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(event.key)) cancelScrollAnimation();
  });

  // A genuinely useful contact interaction without pretending to know a user ID.
  async function copyDiscord() {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText('Belial');
        copied = true;
      }
    } catch (_) { /* Fall through to the local-file compatible path. */ }
    if (!copied) {
      const input = document.createElement('textarea');
      input.value = 'Belial';
      input.style.cssText = 'position:fixed;top:0;left:-9999px';
      document.body.append(input);
      input.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      input.remove();
    }
    if (copied) {
      const toast = document.getElementById('toast');
      clearTimeout(toastTimer);
      toast.classList.add('show');
      toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    } else {
      const dialog = document.getElementById('copy-fallback');
      dialog.showModal();
      dialog.querySelector('input').select();
    }
  }
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', copyDiscord));
  const creditsToggle = document.getElementById('credits-toggle');
  creditsToggle.addEventListener('click', () => {
    const expanded = creditsToggle.getAttribute('aria-expanded') === 'true';
    creditsToggle.setAttribute('aria-expanded', String(!expanded));
    document.getElementById('credits').hidden = expanded;
  });

  // Subtle star drift rendered locally. No background video or external library.
  const canvas = document.getElementById('starfield');
  const context = canvas.getContext('2d');
  let stars = [], width = 0, height = 0, lastFrame = 0, heroVisible = true;
  let pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
  const hero = document.querySelector('.hero');
  function resize() {
    const bounds = hero.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * ratio); canvas.height = Math.floor(height * ratio);
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.round(width / 6) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * .9 + .25, a: Math.random() * .55 + .1,
      speed: Math.random() * .1 + .025, phase: Math.random() * Math.PI * 2
    }));
    drawStars(performance.now());
    updateProgress();
  }
  function drawStars(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    stars.forEach(star => {
      if (!paused && !document.hidden && heroVisible) {
        star.x -= star.speed;
        if (star.x < 0) star.x = width;
      }
      const alpha = paused ? star.a : star.a * (.75 + Math.sin(time * .0007 + star.phase) * .25);
      context.fillStyle = 'rgba(201,183,231,' + alpha + ')';
      context.beginPath(); context.arc(star.x, star.y, star.r, 0, Math.PI * 2); context.fill();
      if (star.r > 1) {
        context.fillStyle = 'rgba(181,151,225,' + alpha * .18 + ')';
        context.fillRect(star.x - 3, star.y - .3, 6, .6);
        context.fillRect(star.x - .3, star.y - 3, .6, 6);
      }
    });
  }
  function animate(time) {
    rafId = 0;
    if (paused || document.hidden || !heroVisible) return;
    if (time - lastFrame > 32) {
      drawStars(time);
      easedX += (pointerX - easedX) * .04; easedY += (pointerY - easedY) * .04;
      const art = document.getElementById('singularity');
      art.style.setProperty('--px', easedX + 'px'); art.style.setProperty('--py', easedY + 'px');
      lastFrame = time;
    }
    rafId = requestAnimationFrame(animate);
  }
  function resumeAnimation() {
    if (!rafId && !paused && !document.hidden && heroVisible) rafId = requestAnimationFrame(animate);
  }
  function setMotion(value) {
    paused = value;
    document.documentElement.classList.toggle('motion-paused', value);
    document.documentElement.classList.toggle('motion-enabled', !value);
    motionButton.setAttribute('aria-pressed', String(value));
    motionButton.setAttribute('aria-label', value ? 'Resume animations' : 'Pause animations');
    motionButton.title = value ? 'Resume animations' : 'Pause animations';
    if (value) {
      stopTyping();
      cancelScrollAnimation();
      cancelAnimationFrame(rafId); rafId = 0;
      document.getElementById('singularity').style.setProperty('--px', '0px');
      document.getElementById('singularity').style.setProperty('--py', '0px');
      document.querySelectorAll('[data-tilt]').forEach(el => el.style.transform = '');
    } else {
      resumeAnimation();
      resumeTyping();
    }
  }
  motionButton.addEventListener('click', () => setMotion(!paused));
  reducedMotion.addEventListener('change', e => setMotion(e.matches));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible) {
        resumeAnimation();
        resumeTyping();
      } else stopTyping();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTyping();
    else {
      resumeAnimation();
      resumeTyping();
    }
  });
  hero.addEventListener('pointermove', e => {
    if (paused || e.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    pointerX = ((e.clientX - bounds.left) / bounds.width - .5) * 15;
    pointerY = ((e.clientY - bounds.top) / bounds.height - .5) * 11;
  });
  hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (paused || e.pointerType !== 'mouse') return;
      const bounds = card.getBoundingClientRect();
      const x = (e.clientX - bounds.left) / bounds.width - .5;
      const y = (e.clientY - bounds.top) / bounds.height - .5;
      card.style.transform = 'perspective(900px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 5) + 'deg)';
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
  function updateProgress() {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const progress = range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)) : 0;
    document.getElementById('scroll-progress').style.transform = 'scaleX(' + progress + ')';
    const links = document.querySelectorAll('.header nav a');
    let current = '';
    links.forEach(link => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section && section.getBoundingClientRect().top < window.innerHeight * .45) current = link.getAttribute('href');
    });
    links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === current));
  }
  let scrollPending = false;
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(() => { updateProgress(); scrollPending = false; });
    }
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize);
  resize();
  setMotion(paused);
})();
