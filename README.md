# Carte des acteurs du patrimoine

Une carte interactive, en français, de l'écosystème du patrimoine en France : qui protège, qui décide, qui finance, et sur quel texte.

**En ligne : https://paulbenard01.github.io/Organigramme-patrimoine-/**

- **294** acteurs, statuts, dispositifs et textes, **633** liens typés, **100** images libres créditées
- Vues : Carte mentale · Strates · Musées · Qui est qui · Droit · Parcours · Glossaire · Images
- Une seule page HTML autonome, mobile d'abord, thèmes clair et sombre
- Liens partageables vers une fiche : `#mindmap/drac`, `#carte/mhclasse`…
- **Installable sur téléphone** et consultable hors connexion une fois ouverte

## Installer sur le téléphone

- **Android (Chrome)** : ouvrez le site, touchez « Installer » dans le bandeau (ou menu ⋮ → « Installer l'application »).
- **iPhone (Safari)** : touchez Partager (carré avec une flèche) → « Sur l'écran d'accueil ».

L'app s'ouvre en plein écran depuis son icône. Hors connexion, tout fonctionne sauf les images Wikimedia et le chercheur d'images.

## La carte mentale

- **Vue d'ensemble** : les acteurs (qui agit) à droite, les instruments (avec quoi) à gauche. Une strate s'ouvre à la fois ; sur téléphone, l'arbre s'affiche en retrait, de haut en bas.
- **Vue « liens »** : touchez un élément. Il passe au centre ; à gauche, ce qui agit sur lui ; à droite, ce sur quoi il agit, regroupé par relation (tutelle, accorde, avis, gère, finance, réseau, textes, lien). Touchez un voisin pour vous y déplacer ; le fil d'Ariane garde le chemin parcouru.

## Démarrage

```bash
npm run build     # valide data/ et génère dist/index.html
npm run serve     # http://localhost:8000
npm run smoke     # test navigateur (Playwright, facultatif)
```

Ouvrir `dist/index.html` directement dans un navigateur fonctionne aussi.

## Modifier le contenu

Tout le contenu est dans `data/*.json` (voir `docs/DATA_MODEL.md`). Après modification : `npm run build`. Le build refuse les liens cassés.

## Images

Les images viennent de Wikipédia et Wikimedia Commons, avec auteur et licence affichés.

```bash
npm run pictures                 # cherche une image pour ce qui n'en a pas encore
npm run pictures -- --only n:drac,m:musee-rodin
npm run pictures -- --meta       # complète crédits et vignettes (après un choix manuel)
```

Le script écrit `data/pictures.json`. Relisez les nouvelles entrées : une recherche automatique peut se tromper d'article. Pour écarter une image, remplacez l'entrée par `{ "none": true }`.

Dans la page, la vue **Images** et le bouton « Chercher une image » de chaque fiche ouvrent un chercheur en direct (Wikipédia, Commons ou **recherche web**). La recherche web ouvre Google Images, Bing, DuckDuckGo ou Qwant ; on rapporte l'image en collant son adresse ou en choisissant une photo enregistrée sur l'appareil. Ces images restent dans le navigateur (droits non vérifiés, usage personnel) et ne sont pas publiées. « Utiliser » garde l'image dans votre navigateur ; « Copier » donne la ligne à coller dans `data/pictures.json` (`"pinned": true`) pour la publier.

## Déployer

- **GitHub Pages** : le workflow `.github/workflows/pages.yml` construit et publie `dist/` à chaque push sur `main`. À faire une fois : *Settings → Pages → Build and deployment → Source : GitHub Actions*.
- **Vérification** : `.github/workflows/check.yml` lance le build et le test navigateur sur chaque pull request.
- **Cloudflare Pages** : commande de build `node scripts/build.mjs`, dossier de sortie `dist`.

## Travailler avec Claude Code

Ouvrez le dossier dans Claude Code : il lit `CLAUDE.md` (conventions, protocole de vérification, règles d'interface). Exemples de demandes :

- « Ajoute les 13 DRAC avec leur directeur·rice, en vérifiant chaque nom sur culture.gouv.fr. »
- « Crée le mode révision des sigles décrit dans docs/SPEC.md. »
- « Cherche des images pour les musées qui n'en ont pas et relis-les. »

## Structure

```
data/        contenu (JSON), dont pictures.json (images)
src/         template.html (interface), sw.js (service worker hors connexion)
assets/      manifeste et icônes de l'app installable (copiés dans dist/)
scripts/     build.mjs (validation + build), find-pictures.mjs (images), smoke.py (test navigateur)
dist/        page générée (non versionnée)
docs/        SPEC, DATA_MODEL, SOURCES
```

Outil d'orientation personnel, pas une source juridique : vérifier les textes sur Légifrance.
