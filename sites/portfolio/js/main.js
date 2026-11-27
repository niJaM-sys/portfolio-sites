/* ==========================================================================
   Ulysse Delourme — portfolio
   1. Petits détails (année, heure à Lyon, en-tête)
   2. Formulaire de contact (Netlify Forms, envoi sans quitter la page)
   3. Animations (GSAP + ScrollTrigger + SplitText, scroll fluide Lenis)
   ========================================================================== */

const racine = document.documentElement;
const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Petits détails ---------- */

// Année du copyright, toujours à jour
document.querySelectorAll('[data-annee]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// « Il est 11:34 à Lyon » : petit signe d'ancrage local dans le hero
const heure = document.querySelector('[data-heure-lyon]');
if (heure) {
  const format = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });
  const majHeure = () => { heure.textContent = `${format.format(new Date())} à Lyon`; };
  majHeure();
  heure.hidden = false;
  setInterval(majHeure, 30000);
}

// En-tête : une fine ligne apparaît dès qu'on a quitté le haut de page
const entete = document.querySelector('.entete');
const majEntete = () => entete.classList.toggle('est-defile', window.scrollY > 8);
majEntete();
window.addEventListener('scroll', majEntete, { passive: true });


/* ---------- 2. Formulaire de contact ----------
   Sans JavaScript, le formulaire s'envoie normalement et Netlify redirige vers
   merci.html. Ici, on l'envoie « en arrière-plan » (fetch) pour afficher la
   confirmation directement sous le bouton. */
const formulaire = document.querySelector('[data-formulaire]');
if (formulaire) {
  const statut = formulaire.querySelector('[data-statut]');
  const bouton = formulaire.querySelector('button[type="submit"]');
  const texteBouton = bouton.innerHTML;

  const afficherStatut = (type, html) => {
    statut.className = `formulaire__statut est-${type}`;
    statut.innerHTML = html;
  };

  formulaire.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!formulaire.checkValidity()) {
      formulaire.reportValidity();
      return;
    }

    bouton.disabled = true;
    bouton.textContent = 'Envoi…';
    statut.className = 'formulaire__statut';
    statut.textContent = '';

    try {
      const reponse = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(formulaire)).toString(),
      });
      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);

      formulaire.reset();
      afficherStatut('succes', '<strong>Merci, votre message est bien parti.</strong> Je vous réponds sous 48 heures.');
    } catch (erreur) {
      afficherStatut('erreur',
        'Oups, l’envoi n’a pas fonctionné. Écrivez-moi directement à ' +
        '<a href="mailto:ulyssepro.web@outlook.fr">ulyssepro.web@outlook.fr</a>.');
    } finally {
      bouton.disabled = false;
      bouton.innerHTML = texteBouton;
    }
  });
}


/* ---------- 3. Animations ---------- */
function lancerAnimations() {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (mouvementReduit || !gsap || !ScrollTrigger || !SplitText) {
    racine.classList.add('sans-anim');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  racine.classList.add('anim-ok');

  /* Scroll fluide (Lenis), synchronisé avec ScrollTrigger.
     Sur téléphone, Lenis laisse le scroll tactile natif (plus naturel). */
  let lenis = null;
  if (Lenis) {
    lenis = new Lenis({ lerp: 0.11 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((temps) => lenis.raf(temps * 1000));
    gsap.ticker.lagSmoothing(0);

    // Liens internes (#projets, #contact…) : défilement fluide, sous l'en-tête
    document.querySelectorAll('a[href^="#"]').forEach((lien) => {
      lien.addEventListener('click', (e) => {
        const id = lien.getAttribute('href');
        const cible = id.length > 1 ? document.querySelector(id) : null;
        if (!cible) return;
        e.preventDefault();
        const decalage = id === '#haut' ? -200 : -(entete.offsetHeight + 16);
        lenis.scrollTo(cible, { offset: decalage, duration: 1.2 });
        history.replaceState(null, '', id);
        // Accessibilité : le focus clavier suit le défilement (sinon la touche Tab
        // repartirait de l'endroit où l'on a cliqué)
        if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
        cible.focus({ preventScroll: true });
      });
    });
  }

  /* Hero : le titre monte ligne par ligne, puis le reste apparaît */
  const titre = document.querySelector('.hero__titre');
  let introJouee = false;
  SplitText.create(titre, {
    type: 'lines',
    mask: 'lines',          // chaque ligne est « masquée » : elle sort de nulle part
    autoSplit: true,        // redécoupe si la police change ou si l'écran est redimensionné
    onSplit(self) {
      titre.style.visibility = 'visible';
      // Redécoupage après l'intro (rotation du téléphone…) : on ne rejoue pas l'animation
      if (introJouee) return undefined;
      // L'animation renvoyée est gérée par SplitText (annulée proprement s'il redécoupe)
      return gsap.from(self.lines, {
        yPercent: 105,
        duration: 1.3,
        stagger: 0.09,
        delay: 0.1,
        ease: 'expo.out',
        onComplete: () => { introJouee = true; },
      });
    },
  });
  gsap.timeline({ delay: 0.55, defaults: { duration: 1.2, stagger: 0.12 } })
    .to('[data-hero]', { opacity: 1, ease: 'power2.out' }, 0)
    .from('[data-hero]', { y: 24, ease: 'expo.out' }, 0);

  /* Titres de section : apparition douce en arrivant à l'écran */
  gsap.utils.toArray('.section__entete').forEach((bloc) => {
    gsap.from(bloc.children, {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: bloc, start: 'top 85%', once: true },
    });
  });

  /* Projets : le navigateur monte en fondu, puis le téléphone glisse en place */
  gsap.utils.toArray('.projet').forEach((projet) => {
    const ecran = projet.querySelector('.navigateur');
    const telephone = projet.querySelector('.telephone');
    const infos = projet.querySelector('.projet__infos');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: projet, start: 'top 80%', once: true },
      defaults: { ease: 'expo.out' },
    });
    // Uniquement des déplacements et des fondus : la capture n'est jamais recadrée ni zoomée
    tl.from(ecran, { y: 50, autoAlpha: 0, duration: 1.3 })
      .from(telephone, { yPercent: 20, autoAlpha: 0, duration: 1.3 }, 0.25)
      .from(infos.children, { y: 30, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.4);
  });

  /* Ordinateur seulement : léger effet de profondeur (le téléphone remonte plus vite) */
  gsap.matchMedia().add('(min-width: 960px)', () => {
    gsap.utils.toArray('.projet').forEach((projet) => {
      gsap.to(projet.querySelector('.telephone'), {
        y: -50,
        ease: 'none',
        scrollTrigger: { trigger: projet, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });

  /* Offres, FAQ, À propos : apparitions en cascade */
  const cascade = (selecteur, declencheur) => {
    const elements = gsap.utils.toArray(selecteur);
    if (!elements.length) return;
    gsap.from(elements, {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: declencheur || elements[0], start: 'top 85%', once: true },
    });
  };
  cascade('.offre', '.offres');
  cascade('.faq__item', '.faq');
  cascade('.apropos > *', '.apropos');
  cascade('.contact__grille > *', '.contact__grille');

  /* Méthode : l'étape au milieu de l'écran s'allume (numéro bleu) */
  gsap.utils.toArray('.etape').forEach((etape) => {
    gsap.from(etape, {
      y: 30,
      autoAlpha: 0,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: { trigger: etape, start: 'top 90%', once: true },
    });
    ScrollTrigger.create({
      trigger: etape,
      start: 'top 60%',
      end: 'bottom 40%',
      toggleClass: 'est-active',
    });
  });

  /* Pied de page : le grand nom glisse depuis la droite */
  gsap.from('.pied__nom', {
    xPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: '.pied', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });

  // Recalcule les positions une fois les images chargées (hauteurs définitives)
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// Les librairies sont chargées en « defer » : elles sont prêtes à ce moment-là.
lancerAnimations();
