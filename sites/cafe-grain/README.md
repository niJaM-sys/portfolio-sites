# Grain — café de spécialité & torréfacteur (Lyon)

Site d'exemple pour le portfolio. **Commerce fictif** : adresse, téléphone, e-mail et avis sont inventés.

## Ambiance
Chaleureuse et premium : un torréfacteur artisan, calme et précis. Expérience **scrollytelling** sur une seule page : c'est le scroll qui fait avancer l'histoire, du grain vert jusqu'à la tasse. Une texture « grain photo » discrète couvre tout le site, en clin d'œil au nom.

## Palette
| Rôle | Couleur |
|---|---|
| Crème (fond) | `#F3EBDD` |
| Ivoire | `#FBF7F0` |
| Espresso (texte, fonds sombres) | `#2B1D14` |
| Caramel (décor) / caramel texte | `#9A6B47` / `#85583A` |
| Sauge (décor) / sauge profond | `#8E9C80` / `#4F5B45` |

## Polices
- **Fraunces** (titres, police variable : sa graisse est animée sur le titre de la carte)
- **Manrope** (texte)

## Structure et animations
| Section | Ce qui se passe au scroll |
|---|---|
| Hero | Intro au chargement (rideau, lettres qui montent). Puis section épinglée : les lettres s'envolent, la photo se rétracte en cadre, le fond passe au crème |
| Histoire | Épinglée : le texte s'éclaire mot à mot, les chiffres comptent, les photos traversent en parallaxe |
| Savoir-faire | Épinglée : 4 panneaux défilent à l'horizontale |
| La carte | Les photos s'ouvrent comme un hublot ; les lignes du menu se dessinent |
| Torréfaction (wow) | Épinglée : le grain SVG passe du vert au brun, le thermomètre monte, il craque, gonfle, puis se fend en mouture |
| Avis | Deux rangées qui glissent en sens opposés, étoiles qui se remplissent |
| Infos | Un cercle vert sauge s'ouvre et révèle la section |
| Footer | « Grain » géant qui remonte |

**Mobile** : mêmes scènes, en version allégée (mouvements verticaux seulement dans le hero, pas de parallaxe, 16 fragments au lieu de 40, sections épinglées plus courtes, scroll tactile natif).
**`prefers-reduced-motion`** : aucune animation ; tout le contenu reste affiché et lisible.

## Modifier le contenu
- **Horaires** : le tableau dans `index.html` (attributs `data-open` / `data-close`), plus le JSON-LD dans le `<head>`. Le statut « Ouvert / Fermé » du hero se calcule tout seul.
- **Carte et prix** : les blocs `<li class="item">` dans `index.html`.
- **Étapes de torréfaction** : `data-temp` et `data-color` sur chaque `<li>` de la section `#torrefaction`.

## Prévisualiser
Ouvre `index.html` dans le navigateur, ou lance un petit serveur local (recommandé) :
```
cd sites/cafe-grain
python -m http.server 8000
```
Puis ouvre http://localhost:8000

## Photos
Les originaux sont dans `assets/brut/` (ne pas mettre en ligne : 31 Mo). Les versions du site sont dans `assets/img/`, en WebP qualité 78.

| Fichier du site | Taille | Original | Traitement |
|---|---|---|---|
| `hero-barista-versement.webp` | 1600×1000 | `hero barista versament.jpg` | Fond sombre étendu pour placer la tasse sur le tiers droit, au-dessus du titre |
| `hero-barista-versement-mobile.webp` | 900×1600 | idem | Version portrait, tasse centrée en haut (servie via `<picture>`) |
| `histoire-mains-grains-verts.webp` | 600×800 | `notre histoire 1.webp` | Recadrage 3:4 |
| `histoire-tasse-grains-torrefies.webp` | 600×733 | `notre histoire 2.webp` | Recadrage 9:11 |
| `savoir-sourcer-cerises.webp` | 1000×1250 | `cerises.jpg` | Portrait centré sur les deux grappes du milieu |
| `savoir-torrefier-machine.webp` | 1000×1250 | `torrefaction.jpg` | Bas coupé (plus de texte sur la cuve) |
| `savoir-reposer-sacs.webp` | 1000×1250 | `Sacs kraft de café torréfié.png` | Redimensionnement |
| `savoir-extraire-espresso.webp` | 1000×1250 | `savoir exrtaire expresso.jpg` | Recadrage 4:5 |
| `carte-espresso-lait.webp` | 900×1100 | `carte espresso lait.jpg` | Recadrage |
| `carte-methodes-douces.webp` | 900×1100 | `carte methode douce.jpg` | Recadrage |
| `carte-froid.webp` | 900×1100 | `carte froid.jpg` | Resserré sur le verre |
| `carte-patisseries.webp` | 900×1100 | `cinnamon roll.jpg` | Centré sur le roll net, flou du bas limité |
| `infos-interieur-cafe.webp` | 1020×765 | `interieur cafe.webp` | Taille d'origine (pas d'agrandissement) ; aucun filigrane visible |
| `og-image.jpg` | 1200×630 | hero | Aperçu pour les réseaux sociaux |

Pour changer une photo : remplace le fichier dans `assets/img/` en gardant le même nom et les mêmes proportions.

## À remplacer avant de publier
- Le nom de domaine `cafe-grain.fr` (balises canonical, Open Graph, JSON-LD)
- Ton nom dans le footer, et le lien Instagram
- Les champs `[À COMPLÉTER]` de `mentions-legales.html`

## État
- [x] Structure, contenu et animations
- [x] Vraies photos (recadrées et converties en WebP)
- [ ] Mise en ligne (Netlify / Vercel / GitHub Pages)
