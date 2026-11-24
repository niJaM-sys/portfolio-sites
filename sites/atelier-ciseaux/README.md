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
5. Réalisations : comparateur à glisser (souris, doigt, flèches du clavier)
6. Avis : bulles de BD, qu'on fait défiler d'un geste sur mobile
7. Infos : adresse, téléphone, horaires (jour en cours surligné), carte chargée au clic
8. Footer : crédit portfolio, Instagram, mentions légales
9. **Fenêtre de réservation (démo)** : prestation → coiffeur → créneau → récapitulatif → confirmation. Rien n'est envoyé.

Aucune librairie : les apparitions au scroll utilisent `IntersectionObserver` et la fenêtre utilise l'élément natif `<dialog>`.
**`prefers-reduced-motion`** : toutes les animations sont coupées, le contenu reste visible et utilisable.

## Modifier le contenu
- **Prix, durées, prestations** : les `<li class="service">` dans `index.html`. Le formulaire de réservation les lit tout seul.
- **Horaires** : le tableau `data-hours` (attributs `data-open` / `data-close`), plus le JSON-LD dans le `<head>`. Le badge « Ouvert / Fermé » et les créneaux se calculent à partir de ce tableau.
- **Réalisations** : pour chaque `<figure class="compare">`, modifie les libellés des deux `<span class="compare__tag">` (« Avant » ou « Pendant », puis « Après »), le nom de l'onglet et la légende. Les textes d'accessibilité suivent automatiquement.
- **Équipe** : les cartes `.member`. Si tu changes un prénom, mets aussi à jour la fenêtre de réservation (étape 2) et `data-book-stylist`.

## Photos à fournir
Dépose-les dans `assets/img/` **avec exactement ces noms**. Tant qu'un fichier manque, le site affiche à sa place des rayures avec le nom attendu. Originaux dans `assets/brut/` (non versionnés), versions du site en WebP qualité 75–80.

| Fichier | Format | Sujet |
|---|---|---|
| `hero-salon.webp` | 1000×1250 (4:5) | Coiffeur·se en action, client·e qui sourit, salon lumineux |
| `hero-barbe.webp` | 600×600 (carré) | Gros plan barbe / rasage, serviette ou blaireau |
| `equipe-ines.webp` | 800×1000 (4:5) | Portrait coloriste, souriante |
| `equipe-malik.webp` | 800×1000 (4:5) | Portrait barbier |
| `equipe-jo.webp` | 800×1000 (4:5) | Portrait coiffeur·se, ciseaux à la main |
| `realisation-1-debut.webp` / `-fin.webp` | 900×1125 (4:5) | Balayage : avant / après |
| `realisation-2-debut.webp` / `-fin.webp` | 900×1125 (4:5) | Dégradé : pendant / après |
| `realisation-3-debut.webp` / `-fin.webp` | 900×1125 (4:5) | Carré court : avant / après |
| `realisation-4-debut.webp` / `-fin.webp` | 900×1125 (4:5) | Barbe : pendant / après |
| `infos-salon.webp` | 1200×900 (4:3) | Devanture ou intérieur du salon |
| `og-image.jpg` | 1200×630 | Aperçu réseaux sociaux (peut être tiré du hero) |

Pour le comparateur, les deux photos d'une paire doivent avoir **le même cadrage** (même personne, même angle) : recadre-les ensemble.

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
- `<meta name="robots" content="noindex">` : Google n'indexe pas ce salon fictif. **À retirer sur un vrai site client.**
- Téléphone en `04 65 71 …` : tranche réservée par l'ARCEP aux œuvres de fiction. E-mail en `@ciseaux-et-cie.example` (domaine réservé).
- Réservation : sur un vrai site, on la remplace par l'outil du salon (Planity, Calendly…), le plus souvent un simple lien ou un widget.

## État
- [x] Structure, contenu, animations, réservation démo
- [ ] Vraies photos
- [ ] Mise en ligne sur Netlify
