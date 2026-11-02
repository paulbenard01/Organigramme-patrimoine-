# Carte des acteurs du patrimoine

Une carte interactive, en français, de l'écosystème du patrimoine en France : qui protège, qui décide, qui finance, et sur quel texte.

- **216** acteurs, statuts, dispositifs et textes, **434** liens typés
- Vues : Carte mentale · Strates · Musées · Qui est qui · Droit · Parcours · Glossaire
- Une seule page HTML autonome, mobile d'abord, thèmes clair et sombre

## Démarrage

```bash
npm run build     # valide data/ et génère dist/index.html
npm run serve     # http://localhost:8000
```

Ouvrir `dist/index.html` directement dans un navigateur fonctionne aussi.

## Modifier le contenu

Tout le contenu est dans `data/*.json` (voir `docs/DATA_MODEL.md`). Après modification : `npm run build`. Le build refuse les liens cassés.

## Travailler avec Claude Code

Ouvrez le dossier dans Claude Code : il lit `CLAUDE.md` (conventions, protocole de vérification, règles d'interface). Exemples de demandes :

- « Ajoute les 13 DRAC avec leur directeur·rice, en vérifiant chaque nom sur culture.gouv.fr. »
- « Crée le mode révision des sigles décrit dans docs/SPEC.md. »
- « Relie chaque institution de la bande opérateurs à son décret de création. »

## Déployer

- **GitHub Pages** : le workflow `.github/workflows/pages.yml` construit et publie `dist/` à chaque push sur `main` (activer Pages > Source : GitHub Actions).
- **Cloudflare Pages** : commande de build `node scripts/build.mjs`, dossier de sortie `dist`.

## Structure

```
data/        contenu (JSON)
src/         template.html (interface)
scripts/     build.mjs (validation + build), smoke.py (test navigateur)
dist/        page générée
docs/        SPEC, DATA_MODEL, SOURCES
```

Outil d'orientation personnel, pas une source juridique : vérifier les textes sur Légifrance.
