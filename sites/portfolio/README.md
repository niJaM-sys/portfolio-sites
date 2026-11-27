# Portfolio — Ulysse Delourme

Mon site à moi : le lien que j'envoie quand je démarche un commerçant.
Il doit comprendre **en 10 secondes** ce que je fais, voir mes réalisations, et avoir envie de me contacter.

Contrairement aux sites d'exemple, **ce site est indexé par Google** (pas de `noindex`).

## Direction artistique : « Grille éditoriale »
Sobre, précise, sûre d'elle : le site s'efface pour laisser les projets prendre la couleur.
Grille stricte, très gros titres, sections numérotées (01 → 06), filets fins, un seul accent bleu utilisé avec parcimonie. Le contact et le footer passent en fond sombre pour marquer la fin de la page.

| Rôle | Couleur |
|---|---|
| Papier (fond) | `#F3F2EE` |
| Papier foncé (barre d’url) | `#E8E6E0` |
| Encre (titres, fond sombre) | `#121212` |
| Texte courant | `#2A2A2A` |
| Gris secondaire | `#5C5C5C` |
| Accent bleu outremer | `#2B3BFF` |
| Accent sur fond sombre | `#9AA2FF` |

**Polices** : Geist (titres et texte) + Geist Mono (numéros, étiquettes).

## Structure
| Section | Contenu | Animation |
|---|---|---|
| Hero | Phrase d'accroche, « Me contacter » / « Voir mes projets », disponibilité + heure à Lyon, 3 repères (pour qui, où, comment) | Le titre monte ligne par ligne (SplitText) |
| 01 Projets | Grain, Ciseaux & Cie : capture ordinateur dans un cadre navigateur + capture mobile dans un cadre téléphone | L'écran se dévoile, le téléphone remonte plus vite que la page (ordinateur) |
| 02 Offres | Site vitrine, refonte, maintenance mensuelle, « Sur devis » | Apparition en cascade |
| 03 Méthode | Échange → proposition (acompte) → allers-retours → mise en ligne → suivi | L'étape au centre de l'écran s'allume |
| 04 À propos | Portrait (4:5, recadré poitrine → tête) + présentation | Apparition |
| 05 FAQ | 4 questions en accordéon (`<details>` natif) | Ouverture en douceur (navigateurs récents) |
| 06 Contact | Formulaire Netlify Forms + e-mail + Instagram | Apparition |
| Footer | Grand nom, liens, mentions légales | Le nom glisse au scroll |

Pages annexes : `mentions-legales.html`, `merci.html` (confirmation d'envoi si JavaScript est désactivé).

**Scroll fluide** : Lenis (sur ordinateur ; le scroll tactile reste natif).
**`prefers-reduced-motion`** : aucune animation, tout le contenu reste visible.
**Filet de sécurité** : si les librairies ne se chargent pas en 4 secondes, tout s'affiche sans animation.

## Modifier le contenu
Tous les endroits à modifier sont signalés par ✏️ dans le code.

- **Ajouter un projet** : dans `index.html`, copie un bloc `<article class="projet">` (mode d'emploi en commentaire juste au-dessus). Mets les projets clients **avant** les exemples. Pour un vrai client, supprime ou remplace l'étiquette « Projet d'exemple ».
- **Captures d'un nouveau projet** (3 fichiers dans `assets/img/`) :
  - `nom-desktop-1440.webp` (1440×900) et `nom-desktop-900.webp` (900×563) : capture ordinateur en 1440×900, zoom 100 %, après la fin des animations d’entrée ;
  - `nom-mobile.webp` (600×1298) : capture téléphone en 390×844.
  Les captures de Grain et Ciseaux ont été faites sur les copies locales (pas de badge Netlify), puis converties avec ffmpeg :
  ```
  ffmpeg -i capture.png -c:v libwebp -quality 82 nom-desktop-1440.webp
  ```
- **Disponibilité** (« Disponible pour de nouveaux projets ») : en haut du hero.
- **Offres, étapes, FAQ** : textes directement dans `index.html`, une section = un bloc commenté.
- **Acompte** : étape 02 de la méthode (adapte le pourcentage / le moment du solde si tu veux le préciser).
- **Délai de réponse** (48 h) : section contact **et** message de confirmation dans `js/main.js`.

## À compléter plus tard
- [x] **Photo** : `assets/img/photo-ulysse.webp` (800×1000) et `photo-ulysse-480.webp` (480×600), recadrées depuis `assets/brut/ULYSSE.jpg` (zone 2240×2800 à partir de x 905, y 430).
- [ ] **SIRET** (et adresse professionnelle) dans `mentions-legales.html` une fois la micro-entreprise créée.
- [ ] **Adresse du site** : `ulysse-studio.netlify.app` est provisoire. Si tu en choisis une autre (ou un nom de domaine), fais un rechercher/remplacer dans `index.html`, `mentions-legales.html`, `robots.txt` et `sitemap.xml`.
- [ ] Premiers projets clients 🎉

## Formulaire (Netlify Forms)
- Le formulaire `contact` est détecté par Netlify **au déploiement**. Sur un nouveau site, il faut l'activer une fois : *Netlify → ton site → Forms → Enable form detection*, puis redéployer.
- Pour recevoir les messages par e-mail : *Forms → Form notifications → Add notification → Email notification* (ulyssepro.web@outlook.fr).
- Anti-spam : champ piège invisible (`bot-field`). Netlify filtre aussi le spam de son côté.
- **En local, l'envoi échoue** (message « Oups… » avec ton e-mail) : c'est normal, il n'y a pas de Netlify sur ton ordinateur.
- Offre gratuite Netlify : 100 envois de formulaire par mois, largement suffisant.

## SEO
- `title`, `meta description`, Open Graph + image d'aperçu `assets/img/og-image.jpg` (1200×630).
- Données structurées JSON-LD `ProfessionalService` (nom, ville, e-mail, Instagram, services).
- `robots.txt` + `sitemap.xml`. Après la mise en ligne : ajoute le site dans **Google Search Console** et envoie le sitemap, pour être indexé plus vite.
- Les mentions légales et la page merci sont en `noindex` (inutiles dans Google).

## Prévisualiser
```
cd sites/portfolio
python -m http.server 8002
```
Puis ouvre http://localhost:8002

## Déployer
Même méthode que les autres sites : `outils/preparer-netlify.ps1 portfolio`, puis glisser `_deploy/portfolio` sur Netlify Drop, ou relier le dépôt GitHub avec « Base directory » = `sites/portfolio`.
Netlify (offre gratuite) ajoute un badge en bas à droite : la variable CSS `--badge-space` (64 px) garde le bas du footer dégagé.

## Fichiers bruts
`assets/brut/` (non versionné) : captures PNG d'origine et source de l'image Open Graph.
