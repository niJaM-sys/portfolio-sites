/* ==========================================================================
   CISEAUX & CIE — main.js
   Pas de librairie : tout est fait avec les outils intégrés au navigateur.

   0. Photos manquantes (placeholders automatiques)
   1. Horaires : statut « Ouvert / Fermé » + jour en cours
   2. En-tête et menu mobile
   3. Apparitions au scroll (IntersectionObserver)
   4. Onglets (prestations et réalisations)
   5. Prestations : boutons « + » de réservation
   6. Comparateur avant / après
   7. Carte Google Maps chargée au clic (RGPD)
   8. Fenêtre de réservation (démo)
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PHONE = '04 65 71 48 26';

  /* ------------------------------------------------------------------------
     0. PHOTOS MANQUANTES
     Si une image n'existe pas encore dans assets/img/, on affiche à sa place
     des rayures et le nom du fichier attendu. Inutile de toucher à ce code :
     dès que le fichier est là, la photo s'affiche.
     ------------------------------------------------------------------------ */
  function initMissingImages() {
    const mark = (img) => {
      const box = img.parentElement;
      box.classList.add('has-missing');
      box.dataset.missing = img.getAttribute('src').split('/').pop();
    };
    document.querySelectorAll('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) mark(img); // déjà en échec avant ce script
      img.addEventListener('error', () => mark(img));
      img.addEventListener('load', () => img.parentElement.classList.remove('has-missing'));
    });
  }

  /* ------------------------------------------------------------------------
     1. HORAIRES
     Lus directement dans le tableau HTML (data-open / data-close) :
     une seule source à modifier, utilisée aussi par la réservation.
     ------------------------------------------------------------------------ */
  const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const fromMinutes = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
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

  // { 0: {open:'', close:''}, 1: {...}, ... } (0 = dimanche)
  function readHours() {
    const hours = {};
    document.querySelectorAll('[data-hours] tr[data-day]').forEach((tr) => {
      hours[tr.dataset.day] = { open: tr.dataset.open, close: tr.dataset.close, row: tr };
    });
    return hours;
  }

  function initHours(hours) {
    const now = nowInParis();
    const today = hours[now.day];
    if (today) today.row.classList.add('is-today');

    let label = 'Fermé';
    let isOpen = false;
    if (today && today.open && now.minutes >= toMinutes(today.open) && now.minutes < toMinutes(today.close)) {
      isOpen = true;
      label = `Ouvert aujourd’hui jusqu’à ${formatHour(today.close)}`;
    } else {
      // Fermé : on cherche la prochaine ouverture
      for (let i = 0; i < 7; i++) {
        const day = (now.day + i) % 7;
        const h = hours[day];
        if (!h || !h.open) continue;
        if (i === 0 && now.minutes >= toMinutes(h.open)) continue;
        const when = i === 0 ? 'aujourd’hui' : i === 1 ? 'demain' : DAYS[day];
        label = `Fermé · ouvre ${when} à ${formatHour(h.open)}`;
        break;
      }
    }
    document.querySelectorAll('[data-open-status]').forEach((el) => {
      el.classList.add(isOpen ? 'is-open' : 'is-closed');
      el.querySelector('[data-open-status-text]').textContent = label;
    });
  }

  /* ------------------------------------------------------------------------
     2. EN-TÊTE ET MENU MOBILE
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const burger = document.querySelector('[data-burger]');
    const menu = document.querySelector('[data-menu]');
    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      if (open) menu.querySelector('a').focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); burger.focus(); }
    });
    // Si l'écran s'élargit (rotation d'une tablette), on referme le menu mobile
    window.matchMedia('(min-width: 960px)').addEventListener('change', () => setOpen(false));
  }

  /* ------------------------------------------------------------------------
     3. APPARITIONS AU SCROLL
     IntersectionObserver prévient quand un élément entre à l'écran : on lui
     ajoute .is-visible et le CSS joue la transition. Bien plus léger que
     d'écouter le scroll en continu.
     ------------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------------
     4. ONGLETS (accessibles : flèches du clavier, Début, Fin)
     Sans JS, tous les panneaux restent affichés les uns sous les autres.
     ------------------------------------------------------------------------ */
  function initTabs(container) {
    const tabs = [...container.querySelectorAll(':scope > [role="tablist"] [role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

    const select = (index, byUser) => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        // Panneau ouvert par le visiteur : on l'affiche tout de suite (pas d'apparition retardée)
        if (on && byUser) panels[i].querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, true));
      tab.addEventListener('keydown', (e) => {
        const last = tabs.length - 1;
        const map = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last };
        if (e.key in map) { e.preventDefault(); select(map[e.key], true); tabs[map[e.key]].focus(); }
      });
    });
    select(Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));
  }

  /* ------------------------------------------------------------------------
     5. PRESTATIONS
     On lit la liste dans le HTML (une seule source à modifier) et on ajoute
     un bouton « + » qui ouvre la réservation avec la prestation choisie.
     ------------------------------------------------------------------------ */
  function readServices() {
    return [...document.querySelectorAll('.service')].map((li) => {
      const service = {
        id: li.dataset.id,
        name: li.querySelector('.service__name').textContent.trim(),
        category: li.closest('[data-category]').dataset.category,
        duration: Number(li.dataset.duration) || 30,
        durationText: li.querySelector('.service__time').textContent.trim(),
        priceText: li.querySelector('.service__price').textContent.replace(/\s+/g, ' ').trim(),
      };
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'service__add';
      button.dataset.book = '';
      button.dataset.bookService = service.id;
      button.setAttribute('aria-label', `Réserver : ${service.name}`);
      button.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-plus"></use></svg>';
      li.appendChild(button);
      return service;
    });
  }

  /* ------------------------------------------------------------------------
     6. COMPARATEUR AVANT / APRÈS
     La photo « début » est posée sur la photo « fin » et rognée selon la
     variable CSS --pos. On la pilote au doigt / à la souris (pointer events)
     et au clavier (un input range invisible mais focusable).
     ------------------------------------------------------------------------ */
  function initCompare(figure) {
    const frame = figure.querySelector('.compare__frame');
    const range = figure.querySelector('.compare__range');
    const labelDebut = figure.querySelector('.compare__tag--debut').textContent.trim();
    const labelFin = figure.querySelector('.compare__tag--fin').textContent.trim();
    range.setAttribute('aria-label', `Comparer les photos « ${labelDebut} » et « ${labelFin} »`);

    const set = (value) => {
      const pos = Math.min(100, Math.max(0, value));
      frame.style.setProperty('--pos', `${pos}%`);
      range.value = Math.round(pos);
      range.setAttribute('aria-valuetext', `${Math.round(pos)} % de la photo « ${labelDebut} » visible`);
      frame.classList.toggle('hide-debut', pos < 14);
      frame.classList.toggle('hide-fin', pos > 86);
    };
    const fromPointer = (e) => {
      const rect = frame.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * 100;
    };

    let dragging = false;
    let nudge = 0;
    frame.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      cancelAnimationFrame(nudge);
      dragging = true;
      frame.setPointerCapture(e.pointerId);
      frame.classList.add('is-dragging');
      set(fromPointer(e));
    });
    frame.addEventListener('pointermove', (e) => { if (dragging) set(fromPointer(e)); });
    const stop = () => { dragging = false; frame.classList.remove('is-dragging'); };
    frame.addEventListener('pointerup', stop);
    frame.addEventListener('pointercancel', stop); // ex. : le visiteur scrolle à la verticale
    range.addEventListener('input', () => { cancelAnimationFrame(nudge); set(Number(range.value)); });
    set(50);

    // Petit coup de pouce à la première apparition : la poignée se balance
    // pour montrer qu'on peut la faire glisser.
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now() + 500;
      const tick = (t) => {
        const p = Math.min(1, Math.max(0, (t - start) / 1400));
        set(50 + Math.sin(p * Math.PI * 2) * 14 * (1 - p));
        if (p < 1) nudge = requestAnimationFrame(tick);
      };
      nudge = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(frame);
  }

  /* ------------------------------------------------------------------------
     7. CARTE GOOGLE MAPS « AU CLIC »
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
      iframe.title = 'Carte Google Maps : Ciseaux & Cie, 18 rue d’Austerlitz, Lyon 4e';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      map.appendChild(iframe);
      map.querySelector('.map__overlay').remove();
    });
  }

  /* ------------------------------------------------------------------------
     8. RÉSERVATION (DÉMO)
     4 étapes : prestation → coiffeur → créneau → récap, puis confirmation.
     Rien n'est envoyé. Les créneaux « pris » sont tirés au hasard, mais de
     façon stable (même jour + même coiffeur = mêmes créneaux pris).
     ------------------------------------------------------------------------ */
  function initBooking(services, hours) {
    const dialog = document.querySelector('[data-booking]');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const form = dialog.querySelector('form');
    const body = dialog.querySelector('.booking__body');
    const steps = [...dialog.querySelectorAll('[data-step]')];
    const progress = [...dialog.querySelectorAll('[data-progress] li')];
    const catsBox = dialog.querySelector('[data-cats]');
    const servicesBox = dialog.querySelector('[data-services]');
    const daysBox = dialog.querySelector('[data-days]');
    const slotsBox = dialog.querySelector('[data-slots]');
    const recapBox = dialog.querySelector('[data-recap]');
    const doneText = dialog.querySelector('[data-done-text]');
    const prevBtn = dialog.querySelector('[data-prev]');
    const nextBtn = dialog.querySelector('[data-next]');
    const nextLabel = dialog.querySelector('[data-next-label]');

    let state = {};
    let days = [];
    const byId = (id) => services.find((s) => s.id === id);
    const el = (tag, className, html) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (html !== undefined) node.innerHTML = html;
      return node;
    };
    const escapeHtml = (str) => str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    /* --- Étape 1 : catégories + liste des prestations --- */
    const categories = [...new Set(services.map((s) => s.category))];
    categories.forEach((cat) => {
      const chip = el('button', 'tab', escapeHtml(cat));
      chip.type = 'button';
      chip.dataset.cat = cat;
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', () => showCategory(cat));
      catsBox.appendChild(chip);
    });
    services.forEach((s) => {
      const label = el('label', 'choice choice--service', `
        <input type="radio" name="service" value="${s.id}">
        <span class="choice__name">${escapeHtml(s.name)}</span>
        <span class="choice__meta">${escapeHtml(s.durationText)}</span>
        <span class="choice__price">${escapeHtml(s.priceText)}</span>`);
      label.dataset.cat = s.category;
      servicesBox.appendChild(label);
    });
    function showCategory(cat) {
      catsBox.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
      servicesBox.querySelectorAll('.choice').forEach((c) => { c.hidden = c.dataset.cat !== cat; });
    }

    /* --- Étape 3 : jours ouverts et créneaux --- */
    const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }); // AAAA-MM-JJ
    const fmt = (options) => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', ...options });
    const fmtWeekday = fmt({ weekday: 'short' });
    const fmtDay = fmt({ day: 'numeric' });
    const fmtMonth = fmt({ month: 'short' });
    const fmtLong = fmt({ weekday: 'long', day: 'numeric', month: 'long' });

    function computeDays(duration) {
      const now = nowInParis();
      const list = [];
      for (let i = 0; i < 21 && list.length < 10; i++) {
        const h = hours[(now.day + i) % 7];
        if (!h || !h.open) continue;
        const first = i === 0 ? now.minutes + 60 : 0; // aujourd'hui : pas avant 1 h
        const slots = [];
        for (let t = toMinutes(h.open); t + duration <= toMinutes(h.close); t += 30) {
          if (t >= first) slots.push(fromMinutes(t));
        }
        if (!slots.length) continue;
        const date = new Date(Date.now() + i * 86400000);
        list.push({ key: dateKey.format(date), date, slots });
      }
      return list;
    }

    // Petit hachage de texte → nombre entre 0 et 1 (toujours le même pour le même texte)
    const hash = (str) => {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return (h >>> 0) / 4294967295;
    };
    const isTaken = (day, time) => hash(`${day}|${state.stylist}|${time}`) < (state.stylist === 'any' ? 0.15 : 0.4);

    function renderDays() {
      days = computeDays(byId(state.service).duration);
      daysBox.innerHTML = '';
      days.forEach((d, i) => {
        const label = el('label', 'choice day', `
          <input type="radio" name="day" value="${d.key}" aria-label="${fmtLong.format(d.date)}"${i === 0 ? ' checked' : ''}>
          <span class="day__weekday">${fmtWeekday.format(d.date).replace('.', '')}</span>
          <span class="day__num">${fmtDay.format(d.date)}</span>
          <span class="day__month">${fmtMonth.format(d.date)}</span>`);
        daysBox.appendChild(label);
      });
      state.day = days.length ? days[0].key : null;
      renderSlots();
    }

    function renderSlots() {
      state.slot = null;
      slotsBox.innerHTML = '';
      const day = days.find((d) => d.key === state.day);
      const free = day ? day.slots.filter((t) => !isTaken(day.key, t)) : [];
      if (!free.length) {
        slotsBox.appendChild(el('p', 'slots__empty', 'Complet ce jour-là : essayez un autre jour.'));
        return;
      }
      day.slots.forEach((t) => {
        const taken = isTaken(day.key, t);
        slotsBox.appendChild(el('label', 'choice slot', `
          <input type="radio" name="slot" value="${t}"${taken ? ' disabled' : ''}>
          <span>${formatHour(t)}</span>${taken ? '<span class="visually-hidden"> (déjà pris)</span>' : ''}`));
      });
    }

    /* --- Étape 4 : récapitulatif --- */
    const stylistName = () => form.querySelector(`input[name="stylist"][value="${state.stylist}"]`).dataset.label;
    const dayLong = () => fmtLong.format(days.find((d) => d.key === state.day).date);
    function renderRecap() {
      const s = byId(state.service);
      const rows = [
        ['Prestation', s.name], ['Prix', s.priceText], ['Durée', s.durationText],
        ['Avec', stylistName()], ['Le', dayLong()], ['À', formatHour(state.slot)],
      ];
      recapBox.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHtml(v)}</dd></div>`).join('');
    }

    /* --- Navigation entre les étapes --- */
    const isValid = (n) => ({ 1: !!state.service, 2: !!state.stylist, 3: !!state.slot }[n] ?? true);
    const LABELS = { 1: 'Continuer', 2: 'Continuer', 3: 'Voir le récap', 4: 'Confirmer (démo)', 5: 'Fermer' };

    function updateNav() {
      nextBtn.disabled = !isValid(state.step);
      nextLabel.textContent = LABELS[state.step];
      prevBtn.style.visibility = state.step === 1 || state.step === 5 ? 'hidden' : 'visible';
    }

    function goTo(n) {
      state.step = n;
      if (n === 3) renderDays();
      if (n === 4) renderRecap();
      if (n === 5) {
        const s = byId(state.service);
        const who = state.stylist === 'any' ? '' : ` avec ${stylistName()}`;
        doneText.textContent = `${s.name}, ${dayLong()} à ${formatHour(state.slot)}${who}. Sur un vrai site, vous recevriez un SMS de confirmation. En attendant, une question ? Appelez le ${PHONE}.`;
      }
      steps.forEach((step) => { step.hidden = Number(step.dataset.step) !== n; });
      progress.forEach((li, i) => {
        li.classList.toggle('is-done', i + 1 < n);
        li.classList.toggle('is-current', i + 1 === n);
      });
      body.scrollTop = 0;
      updateNav();
      // Le focus suit l'étape : les lecteurs d'écran annoncent le nouveau titre
      const title = steps[n - 1].querySelector('.step__title');
      if (title) title.focus({ preventScroll: true });
    }

    form.addEventListener('change', (e) => {
      const { name, value } = e.target;
      if (name === 'service') state.service = value;
      if (name === 'stylist') state.stylist = value;
      if (name === 'day') { state.day = value; renderSlots(); }
      if (name === 'slot') state.slot = value;
      updateNav();
    });
    nextBtn.addEventListener('click', () => {
      if (state.step === 5) { dialog.close(); return; }
      if (isValid(state.step)) goTo(state.step + 1);
    });
    prevBtn.addEventListener('click', () => { if (state.step > 1) goTo(state.step - 1); });
    dialog.querySelector('[data-booking-close]').addEventListener('click', () => dialog.close());
    // Clic sur le fond assombri = fermer
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

    /* --- Ouverture (depuis n'importe quel bouton data-book) --- */
    function open({ service, stylist } = {}) {
      form.reset();
      state = { step: 1, service: null, stylist: null, day: null, slot: null };
      daysBox.innerHTML = '';
      slotsBox.innerHTML = '';

      if (service && byId(service)) {
        form.querySelector(`input[name="service"][value="${service}"]`).checked = true;
        state.service = service;
      }
      if (stylist) {
        const radio = form.querySelector(`input[name="stylist"][value="${stylist}"]`);
        if (radio) { radio.checked = true; state.stylist = stylist; }
      }
      // Catégorie affichée : celle de la prestation choisie, sinon l'onglet ouvert sur la page
      const activeTab = document.querySelector('#prestations [role="tab"][aria-selected="true"]');
      const activeCat = activeTab && document.getElementById(activeTab.getAttribute('aria-controls')).dataset.category;
      showCategory(state.service ? byId(state.service).category : activeCat || categories[0]);

      dialog.showModal();
      goTo(!state.service ? 1 : !state.stylist ? 2 : 3); // on saute les étapes déjà remplies
    }

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-book]');
      if (!trigger) return;
      e.preventDefault();
      open({ service: trigger.dataset.bookService, stylist: trigger.dataset.bookStylist });
    });
  }

  /* ------------------------------------------------------------------------
     LANCEMENT
     ------------------------------------------------------------------------ */
  initMissingImages();
  const hours = readHours();
  initHours(hours);
  initHeader();
  const services = readServices();
  document.querySelectorAll('[data-tabs]').forEach(initTabs);
  document.querySelectorAll('[data-compare]').forEach(initCompare);
  initReveal();
  initMap();
  initBooking(services, hours);
})();
