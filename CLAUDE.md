# CLAUDE.md — Carte des acteurs du patrimoine

Instructions pour Claude Code. Lis ce fichier en entier avant toute modification.

## Ce qu'est le projet

Une app web en une seule page, en français, qui cartographie l'écosystème du patrimoine en France : institutions, instances consultatives, statuts et labels, financements, associations, métiers, textes juridiques, musées et personnes clés. Elle sert d'outil d'orientation personnel à un étudiant de Master 2 en gestion du patrimoine culturel (Paris 1), qui croise chaque jour des sigles du ministère de la Culture.

Huit vues : **Carte mentale** (vue d'ouverture : arbre d'ensemble, puis vue « liens » centrée sur un élément), **Strates** (liste par couches + liens dessinés), **Musées**, **Qui est qui** (trombinoscope), **Droit** (légalité patrimoniale), **Parcours** (procédures pas à pas), **Glossaire**, **Images** (photothèque et chercheur d'images). Une fiche latérale (bureau) ou en feuille basse (mobile) s'ouvre sur chaque élément.

## Architecture

```
data/*.json          ← SOURCE DE VÉRITÉ (on modifie ici) ; pictures.json = images
src/template.html    ← interface : HTML + CSS + JS, sans dépendance
scripts/build.mjs    ← valide les données puis les insère dans le template
scripts/find-pictures.mjs ← cherche les images sur Wikipédia/Commons → data/pictures.json
src/sw.js            ← service worker (hors connexion) ; build.mjs y écrit la version
assets/              ← manifest.webmanifest + icônes (icon.svg est la source des PNG), copiés dans dist/
dist/index.html      ← GÉNÉRÉ, autonome (ne jamais éditer à la main, non versionné)
docs/                ← SPEC, modèle de données, sources
```

Seule dépendance externe : **d3 7.9.0** (cdnjs), utilisée uniquement par la carte mentale (module `MM` du template : mise en page `d3.tree`, zoom `d3.zoom`). Les images sont chargées depuis `upload.wikimedia.org` ; le chercheur interroge les API de fr.wikipedia.org et commons.wikimedia.org (`origin=*`). Si d3 ne charge pas, la carte mentale affiche un message et les autres vues fonctionnent.

Le build remplace le marqueur `/*__APP_DATA__*/null` du template par le JSON de tous les fichiers de `data/`. Le résultat est un fichier unique, publiable tel quel (GitHub Pages, Cloudflare Pages, artefact claude.ai).

## Commandes

```bash
npm run check    # valide les données (ids, liens, renvois) sans construire
npm run build    # valide puis écrit dist/index.html
npm run serve    # sert dist/ sur http://localhost:8000
npm run pictures # cherche les images manquantes (voir « Images » ci-dessous)
npm run smoke    # test navigateur (Playwright) ; lancé aussi en CI sur chaque PR
```

Aucune dépendance npm. Node ≥ 18.

**Toujours lancer `npm run build` après une modification de `data/` ou `src/`.** Le build échoue (code 1) si un lien pointe vers un id inexistant ; corrige l'erreur au lieu de contourner la validation.

## Règles sur les données

1. **Le modèle est décrit dans `docs/DATA_MODEL.md`.** Respecte les champs et leur sens.
2. **Ids** : minuscules et chiffres uniquement (`drac`, `loi2002`). Un id ne change jamais une fois créé (les liens et parcours en dépendent).
3. **Sens des liens** : `source` agit sur `target`. `mc → dgpa (tut)` = le ministère a la DGPA sous sa tutelle. `prefreg → mhinscrit (oct)` = le préfet de région prononce l'inscription. `codepat → drac (loi)` = le Code du patrimoine s'applique à la DRAC.
4. **Chaque nouveau nœud doit avoir au moins un lien**, et si c'est une institution, au moins un lien `loi` vers son texte de base (connexion transversale aux textes).
5. **Textes** : les codes, lois et conventions sont des nœuds de la bande `textes`. Pour rattacher un texte à une institution, ajoute un lien `loi` ; n'écris pas seulement la référence dans `law`.
6. **Pas de lorem ipsum, pas d'exemple inventé.** Si une donnée n'est pas vérifiée, ne l'ajoute pas, ou mets-la dans `note` avec la mention « à vérifier ».

## Protocole de vérification (important)

Les organigrammes, les nominations, les chiffres et les réformes changent souvent. Pour tout ce qui décrit l'état actuel :

- **Personnes** (`people.json`, champ `dir` des musées) : vérifier par une recherche web avant d'ajouter ou de modifier ; renseigner `source` (URL) et `since`. Ne jamais déduire un nom d'une source ancienne.
- **Chiffres** (`examples.count`) : citer l'année de référence dans le texte (« 14 863 immeubles classés (2023) »).
- **Réformes en cours** : écrire l'étape vérifiée (« adoptée en première lecture en mars 2025 ») plutôt qu'un état supposé.
- Après une passe de vérification, mettre à jour `meta.verifiedOn` et `meta.verifiedLabel`, et consigner les sources dans `docs/SOURCES.md`.
- Sources de référence : culture.gouv.fr (organigrammes DGPA, chiffres clés du DEPS), legifrance.gouv.fr, whc.unesco.org, ich.unesco.org, communiqués de nomination.

## Règles d'écriture (interface en français)

- Apostrophe typographique `’` et guillemets `« … »` dans tous les textes affichés. Pas de guillemets droits dans les données.
- Phrases courtes et actives, vocabulaire du métier (CRMH, avis conforme, récolement), sans jargon technique d'informatique.
- `acronym` = ce qui s'affiche en gros sur la puce ; `short` = libellé court sous le sigle ; `name` = nom officiel complet.
- Écriture inclusive avec point médian seulement dans les intitulés de fonctions génériques (`Conservateur·rice`).

## Règles d'interface

- **Mobile d'abord** : tester à 390 px de large. Aucun défilement horizontal de la page. La fiche est une feuille basse sous 1000 px, un panneau latéral au-dessus.
- **Deux thèmes** : toutes les couleurs sont des variables CSS définies dans `:root` puis redéfinies pour le sombre (`prefers-color-scheme` et `[data-theme="dark"]`). N'ajoute jamais de couleur en dur dans un composant.
- **Polices** : Spectral (titres), IBM Plex Sans (texte), IBM Plex Mono (sigles, références). Pas de nouvelle police.
- **Couleurs de bandes** `--b-<bande>` et **couleurs de relations** `--r-<type>` : une nouvelle bande ou un nouveau type de lien exige ses deux valeurs (clair et sombre).
- Pas de nouvelle bibliothèque externe sans raison forte (d3 est déjà là) ; version exacte épinglée sur cdnjs.
- Carte mentale, deux modes dans le même SVG (module `MM`) :
  - `tree` : les branches de droite sont les acteurs (`intl` à `coll`, constante `RIGHT`), celles de gauche les instruments. Une nouvelle bande doit être placée d'un côté. Une seule strate ouverte à la fois (sauf « Déplier tout »). Sous 700 px de large, arbre en retrait vertical (`layoutV`).
  - `focus` : l'élément choisi au centre ; à gauche les liens entrants, à droite les sortants, groupés par type (`egoGroups`), 10 éléments par groupe puis « + N autres ». Sous 700 px, entrants en haut et sortants en bas. Sur téléphone, la fiche ne s'ouvre qu'en touchant la carte centrale.
  - Les tailles des pastilles sont mesurées (`tw`, canvas) : si tu changes une police dans le CSS `.mm-*`, change aussi `F` dans `MM`.
- Les liens de la carte sont tracés en SVG à partir de la position réelle des puces (`draw()`), recalculés au redimensionnement : ne pas casser `#links`, `.map` ni les attributs `data-node`.
- Accessibilité : toutes les puces sont des `<button>`, focus visible, `Échap` ferme la fiche, `/` place le curseur dans la recherche.
- App installable : chemins **relatifs** partout (le site est servi sous `/Organigramme-patrimoine-/`). Le service worker n'est enregistré qu'en http(s), pas en `file://`. Si tu changes le logo, régénère les PNG d'`assets/icons/` depuis `icon.svg` (192, 512, maskable 512 plein cadre, apple-touch-icon 180).
- Liens profonds : le hash vaut `#vue` ou `#vue/id` (`syncHash`) ; ne pas casser ce format.

## Images

- Source unique : `data/pictures.json`, clé `n:<id>` (nœud), `m:<slug du nom>` (musée), `p:<slug du nom>` (personne). Slug = nom sans accents, minuscules, tirets.
- `npm run pictures` cherche sur fr.wikipedia.org l'article le plus proche du nom (ou du champ `wiki` s'il existe) et prend son image principale libre, puis récupère auteur, licence et vignette sur Commons. Les entrées trouvées portent `"match": "auto"`.
- **Relire chaque nouvelle entrée** (titre d'article retenu dans `title`) : écarter les erreurs avec `{ "none": true, "why": "…" }`, et ajouter `"checked": "AAAA-MM-JJ"` aux images relues. La page signale « à vérifier » les images automatiques non relues.
- Choix manuel : `{ "file": "Nom_sur_Commons.jpg", "pinned": true }` puis `npm run pictures -- --meta`. Le script ne remplace jamais une entrée `pinned` ou `none`.
- Crédit obligatoire : le build refuse une image sans `artist` ni `license`. N'utilise que des fichiers de Commons sous licence libre ; pas de logo ou de photo copiés d'un site officiel.
- Le champ `photo` d'une personne (chemin local) reste accepté, mais l'image de `pictures.json` est prioritaire.
- Wikimedia limite les requêtes sans User-Agent identifiable : le script en envoie un et attend entre deux appels.

## Avant de rendre une modification

1. `npm run build` passe sans erreur ni avertissement nouveau.
2. La vue modifiée s'affiche à 390 px et à 1400 px, en clair et en sombre, sans erreur dans la console.
3. `npm run smoke` passe : carte mentale (strate → élément → voisin → vue d'ensemble), strates, parcours, Images, lien profond.
4. `docs/` est à jour si le modèle de données ou une vue a changé.
