# Ciseaux & Cie — coiffeur mixte & barbier (Lyon 4e, Croix-Rousse)

Site d'exemple pour le portfolio. **Commerce fictif** : adresse, téléphone, e-mail, équipe, prix et avis sont inventés.

## Ambiance
Claire, joyeuse et moderne, à l'opposé de Grain. Le site s'inspire du **poteau de barbier** (rouge, bleu, blanc) : on retrouve ses rayures animées dans le logo, le hero, le favicon et le footer. Le style « sticker » repose sur des contours bleu nuit épais, des ombres dures décalées, des formes arrondies (arches, pilules, ronds) et des micro-animations à ressort.
Objectif : **faire réserver**. Le bouton « Réserver » reste toujours visible : dans l'en-tête sur ordinateur, dans une barre fixe en bas de l'écran sur mobile.

## Palette
| Rôle | Couleur |
|---|---|
| Fond crème | `#FFF8EE` |
| Encre (texte) | `#16163A` |
| Bleu électrique (actions) | `#2F4BFF` |
| Vermillon (accent) | `#FF4A2B` (jamais de texte blanc dessus : contraste insuffisant) |
| Bleu pâle / vermillon pâle | `#E6EAFF` / `#FFE3DB` |

## Polices
- **Bricolage Grotesque** 500–800 (titres, boutons)
- **DM Sans** (texte)

## Structure
1. Hero : accroche mot par mot, Réserver / Appeler, statut « Ouvert / Fermé » en direct
2. Bandeau défilant
3. Prestations : onglets Femme · Homme · Barbe · Couleur · Enfants, avec un bouton « + » par ligne qui ouvre la réservation sur la bonne prestation
4. Équipe : 3 cartes, avec un bouton « Réserver avec… » qui présélectionne le coiffeur
5. Réalisations : 3 paires avant / après dans un comparateur à glisser (souris, doigt, flèches du clavier), onglets avec miniatures
6. Avis : bulles de BD, qu'on fait défiler d'un geste sur mobile
7. Infos : adresse, téléphone, horaires (jour en cours surligné), carte chargée au clic
8. Footer : crédit portfolio, Instagram, mentions légales
9. **Fenêtre de réservation (démo)** : prestation → coiffeur → créneau → récapitulatif → confirmation. Rien n'est envoyé.

Aucune librairie : les apparitions au scroll utilisent `IntersectionObserver` et la fenêtre utilise l'élément natif `<dialog>`.
**`prefers-reduced-motion`** : toutes les animations sont coupées, le contenu reste visible et utilisable.

## Modifier le contenu
- **Prix, durées, prestations** : les `<li class="service">` dans `index.html`. Le formulaire de réservation les lit tout seul.
- **Horaires** : le tableau `data-hours` (attributs `data-open` / `data-close`), plus le JSON-LD dans le `<head>`. Le badge « Ouvert / Fermé » et les créneaux se calculent à partir de ce tableau.
- **Réalisations** (3 paires) : pour chaque `<figure class="compare">`, les libellés des deux `<span class="compare__tag">` (« Avant » / « Après »), les textes `alt` et la légende ; dans les onglets, le nom et la miniature. Les textes d'accessibilité du curseur suivent automatiquement.
- **Équipe** : les cartes `.member`. Si tu changes un prénom, mets aussi à jour la fenêtre de réservation (étape 2) et `data-book-stylist`.

## Photos
Originaux dans `assets/brut/` (non versionnés, à ne pas mettre en ligne). Versions du site dans `assets/img/`, en WebP qualité 80, générées avec **ffmpeg** (installé via winget). Si une photo manque, le site affiche à sa place des rayures avec le nom du fichier attendu.

| Fichier du site | Taille | Original | Recadrage |
|---|---|---|---|
| `hero-salon.webp` | 1000×1250 | `hero-salon.jpg` | Sur le miroir et le sourire ; l'affiche avec un visage (en haut) est hors cadre |
| `hero-barbe.webp` | 600×600 | `hero barbe.jpg` | Carré sur la tête et la barbe ; le logo de la cape est hors cadre |
| `equipe-ines.webp` / `-malik` / `-jo` | 800×1000 | `equipe-*.webp` | 4:5 centré ; sur mobile, le cadre carré garde le visage (`object-position`) |
| `realisation-1-debut.webp` / `-fin.webp` | 900×1125 | `realisation1-*.webp` | Balayage châtain foncé → caramel |
| `realisation-2-debut.webp` / `-fin.webp` | 900×1125 | `realisation2-*.webp` | Cheveux longs → dégradé + barbe |
| `realisation-3-debut.webp` / `-fin.webp` | 900×1125 | `realisation3-*.webp` | Cheveux longs → carré court |
| `realisation-1/2/3-mini.webp` | 120×120 | photo « après » de chaque paire | Miniature ronde des onglets |
| `infos-salon.webp` | 1200×900 | `infos-salon.webp` (image générée, 1200×896) | Rognée de 3 px de chaque côté pour un 4:3 exact |
| `og-image.jpg` | 1200×630 | `hero-salon.jpg` | Bande horizontale autour du sourire |

**Paires avant / après** : les deux photos d'une paire sont recadrées exactement de la même façon. Leur alignement a été mesuré sur le décor (haut et côtés de l'image) : décalage de 0 px pour les trois paires. Pour en ajouter une, garde ce principe : même séance, même cadrage, même recadrage.

Pour changer une photo : remplace le fichier dans `assets/img/` en gardant le même nom et les mêmes proportions.

## Prévisualiser
Lance un petit serveur local depuis le dossier `Sites` :
```
python -m http.server 8001 --directory sites/atelier-ciseaux
```
Puis ouvre http://localhost:8001

## Mise en ligne (Netlify)
Adresse prévue : **https://ciseaux-et-cie-lyon.netlify.app** (utilisée dans les balises canonical, Open Graph et JSON-LD). Si tu choisis un autre nom, remplace-la partout dans `index.html`.

- **Depuis GitHub** : Netlify → *Add new site → Import an existing project* → dépôt `portfolio-sites` → *Base directory* : `sites/atelier-ciseaux`.
- **Glisser-déposer** : `powershell -ExecutionPolicy Bypass -File .\outils\preparer-netlify.ps1 atelier-ciseaux`, puis glisser `_deploy/atelier-ciseaux` sur https://app.netlify.com/drop.

## Particularités du site d'exemple
- Netlify (offre gratuite) ajoute à chaque page un badge en bas à droite, un commentaire HTML et des URL sans `.html`. La variable CSS `--badge-space` (64 px) remonte la barre « Réserver » mobile et le bas du footer pour que le badge ne recouvre rien.
- `<meta name="robots" content="noindex">` : Google n'indexe pas ce salon fictif. **À retirer sur un vrai site client.**
- Téléphone en `04 65 71 …` : tranche réservée par l'ARCEP aux œuvres de fiction. E-mail en `@ciseaux-et-cie.example` (domaine réservé).
- Réservation : sur un vrai site, on la remplace par l'outil du salon (Planity, Calendly…), le plus souvent un simple lien ou un widget.

## État
- [x] Structure, contenu, animations, réservation démo
- [x] Vraies photos (recadrées et converties en WebP)
- [x] Mise en ligne sur Netlify : https://ciseaux-et-cie-lyon.netlify.app
