# Modèle de données

Tous les fichiers sont dans `data/`, en JSON UTF-8. `scripts/build.mjs` les valide puis les fusionne en un objet `DATA` injecté dans la page.

| Fichier | Contenu |
|---|---|
| `meta.json` | Titre, date de vérification, avertissement, fonctions clés par niveau |
| `bands.json` | Les 12 strates, dans l'ordre d'affichage (les 6 premières à droite de la carte mentale, les 6 suivantes à gauche) |
| `nodes.json` | Tous les éléments de la carte (institutions, statuts, fonds, textes…) |
| `edges.json` | Les liens typés entre nœuds |
| `parcours.json` | Procédures pas à pas |
| `legal.json` | Thèmes de la vue Droit |
| `glossary.json` | Termes hors nœuds : anciens sigles, notions juridiques |
| `people.json` | Qui est qui (trombinoscope) |
| `museums.json` | Vue Musées |
| `pictures.json` | Images (généré par `scripts/find-pictures.mjs`, relu à la main) |

## meta.json

```json
{
  "title": "Carte des acteurs du patrimoine",
  "verifiedOn": "2026-11-02",
  "verifiedLabel": "2 novembre 2026",
  "disclaimer": "Outil d’orientation, pas une source juridique…",
  "keyRoles": [
    { "level": "Région", "roles": [
      { "title": "Préfet·e de région", "node": "prefreg", "why": "Signe inscriptions MH, prescriptions archéologiques…" }
    ]}
  ]
}
```

## bands.json

| Champ | Type | Rôle |
|---|---|---|
| `id` | string | `intl`, `etat`, `consult`, `op`, `deconc`, `coll`, `statut`, `fin`, `assoc`, `metier`, `textes`, `outils` |
| `name` | string | Titre de la strate |
| `desc` | string | Une phrase d'explication |

Chaque `id` a une couleur `--b-<id>` dans le template (clair et sombre).

## nodes.json

| Champ | Obligatoire | Rôle |
|---|---|---|
| `id` | oui | Identifiant stable, `[a-z0-9]+` |
| `band` | oui | Id de la strate |
| `group` | oui | Sous-groupe dans la strate (libellé affiché) |
| `acronym` | oui | Sigle ou nom court affiché en gros |
| `name` | oui | Nom officiel complet |
| `type` | oui | Nature juridique ou fonction (« Établissement public administratif », « Label de l’État »…) |
| `desc` | oui | 1 à 3 phrases |
| `short` | non | Libellé court sous le sigle (sinon `name`) |
| `roles` | non | Liste « À retenir » |
| `law` | non | Référence précise (« Code du patrimoine, art. L.621-1 ») |
| `note` | non | « À savoir » : anciens noms, homonymes, points à vérifier |
| `url` | non | Site officiel (https) |
| `examples` | non | `{ count?, items?, registry?: { label, url } }` pour les statuts, labels et listes |
| `wiki` | non | Titre exact de l'article fr.wikipedia.org à utiliser pour chercher l'image (sinon : recherche sur `name`) |

Exemple :

```json
{
  "id": "mhclasse", "band": "statut", "group": "Monuments & objets",
  "acronym": "MH classé", "name": "Monument historique classé",
  "type": "Protection (servitude d’utilité publique)",
  "desc": "Le plus haut niveau de protection…",
  "law": "Code du patrimoine, art. L.621-1 et suivants (loi du 31 déc. 1913)",
  "examples": { "count": "14 863 immeubles classés (2023)", "items": ["Pont du Gard"],
                "registry": { "label": "Base Mérimée (POP)", "url": "https://pop.culture.gouv.fr" } }
}
```

## edges.json

```json
{ "source": "prefreg", "target": "archprev", "type": "oct", "label": "prescrit" }
```

`source` agit sur `target`. `label` (facultatif) précise la relation et s'affiche en italique.

| `type` | Sens source → cible | Libellé côté cible | Style |
|---|---|---|---|
| `tut` | a sous sa tutelle | Sous la tutelle de | trait plein |
| `oct` | accorde, prononce, nomme | Accordé ou prononcé par | trait plein |
| `avis` | rend un avis sur | Avis rendu par | trait plein |
| `ges` | gère, instruit, met en œuvre | Géré ou instruit par | trait plein |
| `fin` | finance | Financé par | trait plein |
| `res` | regroupe, fédère | Membre de | trait plein |
| `loi` | (texte) s'applique à | Textes applicables | tirets |
| `lien` | en lien avec (symétrique) | En lien avec | pointillés |

Ajouter un type exige : la constante `REL` du template, deux couleurs `--r-<type>`, une classe `.ln-<type>`, la liste `REL_TYPES` de `build.mjs`.

## parcours.json

```json
{ "id": "mh", "title": "Protéger un bâtiment au titre des MH", "intro": "…",
  "steps": [ { "node": "crmh", "text": "La conservation régionale des MH instruit le dossier…" } ] }
```

L'ordre des étapes est l'ordre de la procédure. Un même nœud peut revenir à plusieurs étapes.

## legal.json

```json
{ "id": "domaine", "title": "Domaine public : inaliénable, imprescriptible",
  "summary": "…", "points": ["…"], "texts": ["cgppp", "codepat"], "actors": ["mdf", "an"] }
```

`texts` et `actors` sont des ids de nœuds. Les fiches affichent automatiquement « Dans la vue Droit » pour chaque thème qui les cite.

## glossary.json

```json
{ "term": "AVAP", "name": "Aire de mise en valeur de l’architecture et du patrimoine",
  "def": "Ancien dispositif (2010-2016), devenu SPR.", "see": ["spr"] }
```

Les sigles des nœuds entrent automatiquement dans le glossaire : n'ajoutez ici que les termes qui ne sont pas des nœuds.

## people.json

| Champ | Obligatoire | Rôle |
|---|---|---|
| `name` | oui | Nom |
| `role` | oui | Fonction exacte |
| `level` | oui | Regroupement dans la vue (« Gouvernement », « Ministère de la Culture »…) |
| `node` | non | Id du nœud rattaché (la personne apparaît dans sa fiche) |
| `since` | non | Date ou période vérifiée |
| `source` | recommandé | URL de la source de vérification |
| `note` | non | Réserve, point à vérifier |
| `photo` | non | Chemin d'image local ; `pictures.json` est prioritaire ; à défaut, initiales |
| `wiki` | non | Titre exact de l'article Wikipédia pour la recherche d'image |

## museums.json

| Champ | Obligatoire | Rôle |
|---|---|---|
| `name` | oui | Nom du musée |
| `family` | oui | Famille de statut (titre de section) |
| `city` | oui | Ville |
| `status` | oui | Statut juridique |
| `owner` | non | Id du nœud de rattachement |
| `dir` | non | Direction, seulement si vérifiée |
| `mdf` | non | `true` si appellation Musée de France |
| `note`, `url` | non | Complément, site officiel |
| `wiki` | non | Titre exact de l'article Wikipédia pour la recherche d'image |

## pictures.json

Un objet dont les clés désignent l'élément illustré : `n:<id du nœud>`, `m:<slug du nom du musée>`, `p:<slug du nom de la personne>` (slug : sans accents, minuscules, mots séparés par `-`, ex. `m:musee-du-louvre`).

```json
{
  "n:mc": {
    "file": "Ministère_de_la_Culture.svg",
    "title": "Ministère de la Culture (France)",
    "match": "auto",
    "checked": "2026-11-02",
    "thumb": "https://upload.wikimedia.org/…/400px-….png",
    "commons": "https://commons.wikimedia.org/wiki/File:…",
    "artist": "Gouvernement de la République française",
    "license": "Licence Ouverte",
    "licenseUrl": "https://www.etalab.gouv.fr/licence-ouverte-open-licence"
  },
  "n:dgpa": { "none": true, "why": "portrait d’un ancien directeur" },
  "n:drac": { "file": "Choisi_sur_Commons.jpg", "pinned": true }
}
```

| Champ | Rôle |
|---|---|
| `file` | Nom du fichier sur Wikimedia Commons |
| `title` | Article Wikipédia d'où vient l'image (recherche automatique) |
| `match` | `auto` (recherche sur le nom) ou `wiki` (champ `wiki` de l'élément) |
| `checked` | Date de relecture humaine ; sans elle, une image `auto` est marquée « à vérifier » |
| `pinned` | Choix manuel : le script ne change pas le fichier, il complète crédits et vignette (`--meta`) |
| `none` | Pas d'image (le script ne cherche plus) ; `why` explique pourquoi |
| `thumb`, `w`, `h` | Vignette (400 px) et dimensions |
| `commons`, `artist`, `license`, `licenseUrl` | Crédit affiché sous l'image (obligatoire pour le build) |
