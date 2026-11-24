/* ==========================================================================
   GRAIN — main.js
   1. Horaires : statut « Ouvert / Fermé » + jour en cours
   2. Carte Google Maps chargée au clic (RGPD)
   3. Scrollytelling : Lenis (scroll fluide) + GSAP ScrollTrigger (scrub, pin)

   Principe du « scrub » : l'animation n'est pas jouée dans le temps,
   elle est liée à la position du scroll. Scroller vers le bas avance
   l'animation, scroller vers le haut la rembobine.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. HORAIRES
     Les horaires sont lus directement dans le tableau HTML (attributs
     data-open / data-close) : une seule source à modifier.
     ------------------------------------------------------------------------ */
  const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const formatHour = (hhmm) => { const [h, m] = hhmm.split(':'); return `${Number(h)}h${m === '00' ? '' : m}`; };

  // Jour et heure actuels à Lyon, quel que soit le fuseau du visiteur
  function nowInParis() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
      minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
    };
  }

  function initHours() {
    const table = document.querySelector('[data-hours]');
    if (!table) return;
    const rows = {};
    table.querySelectorAll('tr[data-day]').forEach((tr) => { rows[tr.dataset.day] = tr; });

    const now = nowInParis();
    const today = rows[now.day];
    if (today) today.classList.add('is-today');

    const status = document.querySelector('[data-open-status]');
    if (!status) return;
    const text = status.querySelector('.open-status__text');
    const { open, close } = today ? today.dataset : {};

    if (open && close && now.minutes >= toMinutes(open) && now.minutes < toMinutes(close)) {
      status.classList.add('is-open');
      text.textContent = `Ouvert · jusqu’à ${formatHour(close)}`;
      return;
    }
    // Fermé : on cherche la prochaine ouverture
    for (let i = 0; i < 7; i++) {
      const day = (now.day + i) % 7;
      const row = rows[day];
      if (!row || !row.dataset.open) continue;
      if (i === 0 && now.minutes >= toMinutes(row.dataset.open)) continue;
      const when = i === 0 ? 'aujourd’hui' : i === 1 ? 'demain' : DAYS[day];
      text.textContent = `Fermé · ouvre ${when} à ${formatHour(row.dataset.open)}`;
      return;
    }
    text.textContent = 'Fermé';
  }

  /* ------------------------------------------------------------------------
     2. CARTE GOOGLE MAPS « AU CLIC »
     L'iframe Google dépose des cookies : on ne la charge que si le visiteur
     le demande. Pas besoin de bandeau cookies pour le reste du site.
     ------------------------------------------------------------------------ */
  function initMap() {
    const map = document.querySelector('[data-map]');
    const button = map && map.querySelector('[data-map-load]');
    if (!button) return;
    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = map.dataset.mapSrc;
      iframe.title = 'Carte Google Maps : Grain, 14 rue Royale, Lyon';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      map.appendChild(iframe);
      map.querySelector('.map__overlay').remove();
    });
  }

  initHours();
  initMap();

  const endLoading = () => {
    clearTimeout(window.__introFallback);
    root.classList.remove('is-loading');
  };

  /* Pas d'animation si l'utilisateur l'a demandé (réglage système)
     ou si les librairies n'ont pas pu se charger : le site reste complet et lisible. */
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    endLoading();
    return;
  }

  /* ------------------------------------------------------------------------
     3. SCROLLYTELLING
     ------------------------------------------------------------------------ */
  const hasSplit = Boolean(window.SplitText);
  gsap.registerPlugin(ScrollTrigger, ...(hasSplit ? [SplitText] : []));
  root.classList.add('has-motion');

  // Toujours repartir du haut : l'histoire se lit depuis le début
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // Évite les recalculs quand la barre d'adresse mobile apparaît / disparaît
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* --- Lenis : scroll fluide à la molette.
         Sur mobile, Lenis laisse le scroll tactile natif (plus fiable et fluide). --- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);           // ScrollTrigger suit Lenis
    gsap.ticker.add((time) => lenis.raf(time * 1000));  // une seule boucle d'animation
    gsap.ticker.lagSmoothing(0);
    lenis.stop();                                       // bloqué pendant l'intro
  }

  // Liens d'ancre (#carte, #infos…) : défilement doux via Lenis
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      let target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      // Une section épinglée est enveloppée dans un « pin-spacer » : on vise celui-ci
      if (target.parentElement.classList.contains('pin-spacer')) target = target.parentElement;
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;

  /* ======================= INTRO (au chargement) ======================= */
  // États de départ posés tout de suite, cachés derrière le rideau
  gsap.set('.hl__inner', { yPercent: 115, rotate: 8 });
  gsap.set('.hero__media-inner', { scale: 1.35 });
  gsap.set('[data-intro]', { autoAlpha: 0, y: 24 });
  gsap.set('.hero__badge', { scale: 0, rotate: -90 });

  function playIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.intro-curtain__mark', { autoAlpha: 0, y: 20, duration: .6, ease: 'power3.out' })
      .to('.intro-curtain', {
        yPercent: -100, duration: 1.1, ease: 'expo.inOut',
        onComplete: () => { endLoading(); if (lenis) lenis.start(); },
      }, '+=.15')
      .to('.hero__media-inner', { scale: 1, duration: 2.2 }, '<.3')
      .to('.hl__inner', { yPercent: 0, rotate: 0, duration: 1.5, stagger: .07 }, '<.1')
      .to('[data-intro]', { autoAlpha: 1, y: 0, duration: 1.1, stagger: .08 }, '<.45')
      .to('.hero__badge', { scale: 1, rotate: 0, duration: 1.4 }, '<.2');
  }

  /* ======================= 1. HERO ======================= */
  // Au scroll : les lettres de « Grain » s'envolent, la photo se rétracte en cadre,
  // le fond passe du brun espresso au crème.
  function heroScene(isDesktop) {
    const moves = isDesktop
      ? [
          { x: () => -vw() * .3, y: () => -vh() * .15, rotate: -16 },
          { y: () => -vh() * .55, rotate: 9 },
          { x: () => -vw() * .05, y: () => -vh() * .32, rotate: -7 },
          { y: () => -vh() * .78, rotate: 12 },
          { x: () => vw() * .3, y: () => -vh() * .2, rotate: 16 },
        ]
      : [ // mobile : mouvements verticaux uniquement, plus légers
          { y: () => -vh() * .25 },
          { y: () => -vh() * .45 },
          { y: () => -vh() * .3 },
          { y: () => -vh() * .55 },
          { y: () => -vh() * .35 },
        ];

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: isDesktop ? '+=130%' : '+=90%',
        pin: true,
        scrub: isDesktop ? 1 : .6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to('.hero__top, .hero__bottom, .hero__badge, .hero__scroll', { autoAlpha: 0, y: -40, duration: .3 }, 0)
      // Le cadre se resserre autour de la tasse (tiers droit sur desktop, haut de l'écran sur mobile)
      .to('.hero__media', {
        clipPath: isDesktop ? 'inset(10% 5% 28% 50% round 28px)' : 'inset(13% 6% 34% 6% round 20px)',
        duration: 1,
      }, 0)
      .to('.hero__media img', {
        scale: 1.15,
        transformOrigin: isDesktop ? '74% 35%' : '50% 34%',
        duration: 1,
      }, 0)
      .to('.hero', { backgroundColor: '#F3EBDD', duration: .55 }, .45);

    gsap.utils.toArray('.hl').forEach((letter, i) => {
      tl.to(letter, { ...moves[i], autoAlpha: 0, duration: .75 }, .04 + i * .04);
    });
  }

  /* ======================= 2. HISTOIRE ======================= */
  // Section épinglée : le texte s'éclaire mot à mot, puis les chiffres comptent.
  function histoireScene(isDesktop) {
    const words = hasSplit ? SplitText.create('.manifesto', { type: 'words' }).words : ['.manifesto'];

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.histoire',
        start: 'top top',
        end: isDesktop ? '+=170%' : '+=130%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    tl.fromTo(words, { opacity: .12 }, { opacity: 1, stagger: .1, duration: .6 }, 0);
    tl.from('.chiffres li', { autoAlpha: 0, y: 40, stagger: .25, duration: 1 }, '-=1.2');

    // Compteurs : de 0 à la valeur de data-count
    gsap.utils.toArray('.chiffres strong').forEach((el) => {
      const counter = { value: 0 };
      const suffix = el.dataset.suffix || '';
      tl.to(counter, {
        value: Number(el.dataset.count),
        duration: 1.4,
        ease: 'power1.out',
        onUpdate: () => { el.textContent = Math.round(counter.value) + suffix; },
      }, '<');
    });

    // Photos qui traversent l'écran à des vitesses différentes (parallaxe)
    if (isDesktop) {
      const total = tl.duration();
      tl.fromTo('.histoire__fig--1', { y: () => vh() * .45, rotate: -4 }, { y: () => -vh() * .95, rotate: 3, duration: total }, 0)
        .fromTo('.histoire__fig--2', { y: () => vh() * .25 }, { y: () => -vh() * .45, duration: total }, 0);
    }
  }

  /* ======================= 2 bis. SAVOIR-FAIRE ======================= */
  // Le scroll vertical fait défiler les panneaux horizontalement.
  function savoirScene(isDesktop) {
    const section = document.querySelector('.savoir');
    const track = section.querySelector('.savoir__track');
    const distance = () => track.scrollWidth - vw();

    const horizontal = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: isDesktop ? 1 : .5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    gsap.to('.savoir__progress span', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + distance(), scrub: true, invalidateOnRefresh: true },
    });

    // Animations à l'intérieur de chaque panneau, synchronisées sur le défilement horizontal
    gsap.utils.toArray('.panel').forEach((panel) => {
      const inPanel = { trigger: panel, containerAnimation: horizontal, scrub: true };

      gsap.from(panel.querySelector('.panel__text'), {
        y: 60, autoAlpha: .2, ease: 'none',
        scrollTrigger: { ...inPanel, start: 'left 85%', end: 'left 35%' },
      });

      if (isDesktop) {
        gsap.fromTo(panel.querySelector('.panel__media img'), { xPercent: -8 }, {
          xPercent: 8, ease: 'none',
          scrollTrigger: { ...inPanel, start: 'left right', end: 'right left' },
        });
        gsap.fromTo(panel.querySelector('.panel__num'), { x: 120 }, {
          x: -40, ease: 'none',
          scrollTrigger: { ...inPanel, start: 'left right', end: 'right left' },
        });
      }
    });
  }

  /* ======================= 3. LA CARTE ======================= */
  function carteScene(isDesktop) {
    // Titre « La carte » : les lettres montent, puis s'épaississent comme un grain qui torréfie
    if (hasSplit) {
      const chars = SplitText.create('.carte__title', { type: 'chars', charsClass: 'char' }).chars;
      gsap.fromTo(chars, { yPercent: 70, opacity: 0, rotate: 10 }, {
        yPercent: 0, opacity: 1, rotate: 0, stagger: .06, ease: 'none',
        scrollTrigger: { trigger: '.carte__header', start: 'top 90%', end: 'top 40%', scrub: 1 },
      });
      if (isDesktop) {
        gsap.fromTo(chars, { fontWeight: 300 }, {
          fontWeight: 760, stagger: .05, ease: 'none',
          scrollTrigger: { trigger: '.carte__header', start: 'top 50%', end: 'bottom top', scrub: 1 },
        });
      }
    }

    gsap.utils.toArray('.cat').forEach((cat) => {
      const media = cat.querySelector('.cat__media');

      // La photo s'ouvre comme un hublot et se dézoome
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: media, start: 'top 90%', end: 'top 30%', scrub: 1 },
      })
        .fromTo(media, { clipPath: 'inset(28% 14% 28% 14% round 400px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)' }, 0)
        .fromTo(media.querySelector('img'), { scale: 1.4 }, { scale: 1 }, 0);

      // Le titre et les lignes du menu se dessinent au fil du scroll
      const list = cat.querySelector('.cat__body');
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: list,
          start: 'top 85%',
          end: isDesktop ? 'top 30%' : 'bottom 80%',
          scrub: 1,
        },
      })
        .from(cat.querySelector('.cat__title'), { yPercent: 60, opacity: 0, duration: .4 }, 0)
        .from(cat.querySelectorAll('.item'), { x: isDesktop ? 50 : 24, opacity: 0, stagger: .1, duration: .4 }, .1)
        .from(cat.querySelectorAll('.item__line'), { scaleX: 0, stagger: .1, duration: .5 }, .2);
    });
  }

  /* ======================= 4. LE MOMENT « WOW » ======================= */
  // Section épinglée : le grain change de couleur, la température monte,
  // il craque, gonfle, puis se fend et se décompose en mouture.
  function roastScene(isDesktop) {
    const section = document.querySelector('.roast');
    const steps = gsap.utils.toArray('.roast__steps li');
    const temps = steps.map((li) => Number(li.dataset.temp));
    const colors = steps.map((li) => li.dataset.color);
    const fills = section.querySelectorAll('.bean__fill');
    const body = section.querySelector('.bean__body');
    const left = section.querySelector('.bean__half--left');
    const right = section.querySelector('.bean__half--right');
    const cracks = section.querySelectorAll('.bean__cracks path');
    const tempEl = section.querySelector('[data-temp-value]');
    const thermoFill = section.querySelector('.thermo__fill');

    // Fragments de mouture créés en JS (moins nombreux sur mobile)
    const fragGroup = section.querySelector('.fragments');
    const fragments = [];
    const count = isDesktop ? 40 : 16;
    for (let i = 0; i < count; i++) {
      const s = gsap.utils.random(5, 12);
      const frag = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      frag.setAttribute('d', `M0,${-s} L${s * .9},${s * .4} L${-s * .7},${s * .7} Z`);
      frag.setAttribute('fill', gsap.utils.random(['#7E4B2C', '#9A6B47', '#B07A45', '#C79A6B']));
      fragGroup.appendChild(frag);
      fragments.push(frag);
    }
    gsap.set(fragments, { x: 100, y: 140, scale: 0, transformOrigin: '50% 50%' });

    // États de départ
    gsap.set(steps.slice(1), { autoAlpha: 0, y: 40 });
    gsap.set(fills, { fill: colors[0] });
    cracks.forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });

    const temperature = { value: temps[0] };
    const renderTemp = () => {
      tempEl.textContent = Math.round(temperature.value);
      thermoFill.style.transform = `scaleY(${(temperature.value - 20) / 200})`;
    };
    renderTemp();

    // La scène est construite dans « tl », puis placée dans une timeline
    // pilotée par le scroll, avec une courte pause au début pour lire l'étape 1.
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isDesktop ? '+=560%' : '+=420%',
        pin: true,
        scrub: isDesktop ? 1 : .6,
        anticipatePin: 1,
      },
    }).to({}, { duration: .5 }).add(tl);

    // Rotation lente et continue du grain pendant toute la scène
    tl.fromTo('.bean', { rotate: -14 }, { rotate: 8, duration: 5.5 }, 0)
      .to('.roast__glow', { opacity: .95, scale: 1.25, duration: 4 }, 0);

    // Étapes 1 → 5 : couleur + température + texte
    for (let i = 1; i < steps.length; i++) {
      const at = i - 1;
      if (temps[i] !== temps[i - 1] || colors[i] !== colors[i - 1]) {
        tl.to(fills, { fill: colors[i], duration: 1 }, at)
          .to(temperature, { value: temps[i], duration: 1, onUpdate: renderTemp }, at);
      }
      tl.to(steps[i - 1], { autoAlpha: 0, y: -40, duration: .3 }, at + .55)
        .to(steps[i], { autoAlpha: 1, y: 0, duration: .3 }, at + .7);
    }

    // La vapeur apparaît au séchage
    tl.to('.steam', { opacity: 1, duration: .6 }, 1.1)
      .fromTo('.steam path', { y: 25 }, { y: -35, stagger: .25, duration: 3 }, 1.1);

    // Premier crack : fissures + secousse + le grain gonfle
    tl.to('.bean__cracks', { opacity: 1, duration: .05 }, 2.5)
      .to(cracks, { strokeDashoffset: 0, stagger: .08, duration: .3 }, 2.5)
      .to(body, { keyframes: { x: [0, -7, 6, -5, 4, -2, 0] }, duration: .6 }, 2.5)
      .to(body, { scale: 1.16, transformOrigin: '50% 50%', duration: .8 }, 2.6);

    // Mouture : le grain se fend, ses moitiés s'écartent et s'effritent
    if (isDesktop) tl.to('.thermo', { autoAlpha: .25, duration: .4 }, 4);
    tl.to('.bean__cracks, .bean__crease, .steam', { opacity: 0, duration: .25 }, 4)
      .to(left, { x: -55, rotation: -30, transformOrigin: '100% 50%', duration: .6 }, 4.05)
      .to(right, { x: 55, rotation: 30, transformOrigin: '0% 50%', duration: .6 }, 4.05)
      .to([left, right], { opacity: 0, scale: .5, duration: .4 }, 4.5);

    fragments.forEach((frag) => {
      const start = 4.2 + gsap.utils.random(0, .25);
      // 1. explosion vers l'extérieur…
      tl.to(frag, {
        x: 100 + gsap.utils.random(-170, 170),
        y: 140 + gsap.utils.random(-140, 120),
        rotation: gsap.utils.random(-360, 360),
        scale: gsap.utils.random(.7, 1.5),
        duration: .5,
      }, start)
      // 2. …puis les fragments retombent en petit tas
        .to(frag, {
          x: 100 + gsap.utils.random(-70, 70),
          y: 275 + gsap.utils.random(-25, 10),
          rotation: '+=' + gsap.utils.random(-120, 120),
          duration: .5,
        }, start + .5);
    });

    tl.to({}, { duration: .4 }); // courte pause avant de libérer la section

    // Nettoyage si on change de taille d'écran (mobile ↔ desktop)
    return () => fragments.forEach((f) => f.remove());
  }

  /* ======================= 5. AVIS ======================= */
  function avisScene(isDesktop) {
    // On duplique les avis pour que les rangées soient assez longues
    const clones = [];
    document.querySelectorAll('.avis__row').forEach((row) => {
      [...row.children].forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        row.appendChild(clone);
        clones.push(clone);
      });
    });

    // Les deux rangées glissent en sens opposés pendant la traversée de la section
    const st = { trigger: '.avis', start: 'top bottom', end: 'bottom top', scrub: isDesktop ? 1 : .5 };
    gsap.fromTo('.avis__row--1', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { ...st } });
    gsap.fromTo('.avis__row--2', { xPercent: -35 }, { xPercent: 0, ease: 'none', scrollTrigger: { ...st } });

    // Les étoiles se remplissent
    gsap.fromTo('.stars__fill', { width: '0%' }, {
      width: '98%', ease: 'none',
      scrollTrigger: { trigger: '.rating', start: 'top 90%', end: 'top 55%', scrub: true },
    });

    return () => clones.forEach((c) => c.remove());
  }

  /* ======================= 6. INFOS ======================= */
  function infosScene() {
    // Un cercle vert sauge s'ouvre depuis le haut et révèle la section
    gsap.fromTo('.infos__bg', { clipPath: 'circle(4% at 50% 0%)' }, {
      clipPath: 'circle(145% at 50% 0%)', ease: 'none',
      scrollTrigger: { trigger: '.infos', start: 'top 95%', end: 'top 10%', scrub: true },
    });
    gsap.from('.infos__grid > *', {
      y: 70, autoAlpha: 0, stagger: .12, ease: 'none',
      scrollTrigger: { trigger: '.infos', start: 'top 75%', end: 'top 5%', scrub: true },
    });
  }

  /* ======================= 7. FOOTER ======================= */
  function footerScene() {
    // Les lettres géantes « Grain » remontent : la boucle est bouclée avec le hero
    gsap.from('.footer__giant span', {
      yPercent: 100, rotate: 8, stagger: .08, ease: 'none',
      scrollTrigger: { trigger: '.site-footer', start: 'top 85%', end: 'bottom bottom', scrub: 1 },
    });
  }

  /* ======================= Éléments globaux ======================= */
  function globalScene() {
    // Barre de progression qui « torréfie » : vert → jaune → caramel → brun
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { start: 0, end: 'max', scrub: .3 } })
      .to('.roast-progress span', { scaleX: 1, duration: 1 }, 0)
      .to('.roast-progress span', { keyframes: { backgroundColor: ['#9FAE7A', '#D2B86C', '#B07A45', '#7E4B2C'] }, duration: 1 }, 0);

    // En-tête : fond crème après le hero, se cache quand on descend, revient quand on remonte
    const header = document.querySelector('.site-header');
    ScrollTrigger.create({
      trigger: '.histoire',
      start: 'top 70px',
      end: 'max',
      onToggle: (self) => header.classList.toggle('is-solid', self.isActive),
    });
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        header.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > vh() * .6);
      },
    });
  }

  /* ======================= Lancement ======================= */
  // On attend les polices (max 1,5 s) : SplitText doit découper le texte dans sa police finale
  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);

  fontsReady.then(() => {
    // gsap.matchMedia : des animations différentes selon la taille d'écran.
    // Si on passe de mobile à desktop (rotation, redimensionnement), tout est
    // automatiquement annulé puis recréé avec la bonne version.
    const mm = gsap.matchMedia();
    mm.add({ isDesktop: '(min-width: 768px)', isMobile: '(max-width: 767px)' }, (context) => {
      const { isDesktop } = context.conditions;
      // ⚠️ L'ordre compte : les sections épinglées sont créées de haut en bas
      heroScene(isDesktop);
      histoireScene(isDesktop);
      savoirScene(isDesktop);
      carteScene(isDesktop);
      const cleanRoast = roastScene(isDesktop);
      const cleanAvis = avisScene(isDesktop);
      infosScene();
      footerScene();
      globalScene();
      return () => { cleanRoast(); cleanAvis(); };
    });

    playIntro();

    // Recalcule les positions une fois toutes les images chargées
    if (document.readyState === 'complete') ScrollTrigger.refresh();
    else window.addEventListener('load', () => ScrollTrigger.refresh());
  });
})();
