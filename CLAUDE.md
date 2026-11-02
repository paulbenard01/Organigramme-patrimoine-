# CLAUDE.md — Carte des acteurs du patrimoine

Instructions pour Claude Code. Lis ce fichier en entier avant toute modification.

## Ce qu'est le projet

Une app web en une seule page, en français, qui cartographie l'écosystème du patrimoine en France : institutions, instances consultatives, statuts et labels, financements, associations, métiers, textes juridiques, musées et personnes clés. Elle sert d'outil d'orientation personnel à un étudiant de Master 2 en gestion du patrimoine culturel (Paris 1), qui croise chaque jour des sigles du ministère de la Culture.

Sept vues : **Carte mentale** (vue d'ouverture, arbre dépliable avec liens transversaux), **Strates** (liste par couches + liens dessinés), **Musées**, **Qui est qui** (trombinoscope), **Droit** (légalité patrimoniale), **Parcours** (procédures pas à pas), **Glossaire**. Une fiche latérale (bureau) ou en feuille basse (mobile) s'ouvre sur chaque élément.

## Architecture

```
data/*.json          ← SOURCE DE VÉRITÉ (on modifie ici)
src/template.html    ← interface : HTML + CSS + JS, sans dépendance
scripts/build.mjs    ← valide les données puis les insère dans le template
dist/index.html      ← GÉNÉRÉ, autonome (ne jamais éditer à la main)
docs/                ← SPEC, modèle de données, sources
```

Seule dépendance externe : **d3 7.9.0** (cdnjs), utilisée uniquement par la carte mentale (module `MM` du template : mise en page `d3.tree` de chaque côté de la racine, zoom `d3.zoom`). Si d3 ne charge pas, la carte mentale affiche un message et les autres vues fonctionnent.

Le build remplace le marqueur `/*__APP_DATA__*/null` du template par le JSON de tous les fichiers de `data/`. Le résultat est un fichier unique, publiable tel quel (GitHub Pages, Cloudflare Pages, artefact claude.ai).

## Commandes

```bash
npm run check    # valide les données (ids, liens, renvois) sans construire
npm run build    # valide puis écrit dist/index.html
npm run serve    # sert dist/ sur http://localhost:8000
python3 scripts/smoke.py   # test navigateur optionnel (Playwright)
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
- Carte mentale : les branches de droite sont les acteurs (`intl` à `coll`), celles de gauche les instruments (`statut` à `outils`) ; voir `RIGHT` et `OFF` dans le module `MM`. Une nouvelle bande doit être placée d'un côté.
- Les liens de la carte sont tracés en SVG à partir de la position réelle des puces (`draw()`), recalculés au redimensionnement : ne pas casser `#links`, `.map` ni les attributs `data-node`.
- Accessibilité : toutes les puces sont des `<button>`, focus visible, `Échap` ferme la fiche, `/` place le curseur dans la recherche.

## Photos du trombinoscope

Le champ facultatif `photo` d'une personne accepte un chemin relatif (ex. `assets/people/nom.jpg`). Sans photo, la carte affiche les initiales. Si des images sont ajoutées, les placer dans `assets/people/` et les copier dans `dist/` au build (à implémenter dans `build.mjs` si besoin).

## Avant de rendre une modification

1. `npm run build` passe sans erreur ni avertissement nouveau.
2. La vue modifiée s'affiche à 390 px et à 1400 px, en clair et en sombre, sans erreur dans la console.
3. Sur la carte mentale, toucher une branche la déplie et toucher un acteur dessine ses liens et ouvre la fiche ; sur les strates, cliquer une puce fait de même ; « Afficher sur la carte » d'un parcours numérote les étapes.
4. `docs/` est à jour si le modèle de données ou une vue a changé.
