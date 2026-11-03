# Spécification

## Objectif

Donner en quelques secondes la réponse à trois questions face à un sigle ou une situation : **qui est-ce**, **qui décide ou finance quoi**, **sur quel texte**. Public : un étudiant puis jeune professionnel du patrimoine (régie, documentation des collections), utilisateur principal sur téléphone.

## Principes

- Une seule page, autonome, hors ligne une fois chargée (polices Google exceptées).
- Données séparées de l'interface ; toute donnée « actuelle » est datée et sourcée.
- Lisible sur mobile : pas de graphe en toile d'araignée ; les liens n'apparaissent que pour l'élément sélectionné.

## Vues

### Carte mentale (vue d'ouverture)
Deux modes. Une phrase au-dessus de la carte dit toujours comment la lire.

**Vue d'ensemble (arbre)**
- Racine « Patrimoine en France » au centre ; « Les acteurs · qui agit » à droite (international → collectivités), « Les instruments · avec quoi » à gauche (statuts → outils).
- Strates en pastilles colorées avec leur nombre d'éléments ; groupes ; éléments en étiquettes (sigle + libellé court).
- Toucher une strate l'ouvre et referme les autres (une seule à la fois), affiche sa description et cadre la branche. « Déplier tout » ouvre tout.
- Sous 700 px de large : arbre en retrait, de haut en bas (acteurs puis instruments), lisible sans zoomer.
- La recherche ouvre les branches des résultats et les surligne ; `Entrée` ouvre le premier.

**Vue « liens » (un élément au centre)**
- Toucher un élément : il passe au centre (sigle, nom, nature, image si disponible).
- À gauche, ce qui agit sur lui ; à droite, ce sur quoi il agit. Chaque type de relation est une étiquette colorée (« Sous la tutelle de », « Accorde ou prononce », « Textes applicables »…) avec ses éléments en dessous et la précision du lien en italique.
- Plus de 12 éléments dans un groupe : 10 affichés, puis « + N autres ».
- Toucher un voisin s'y déplace ; le fil d'Ariane (« ← Vue d'ensemble › MC › DGPA ») permet de revenir.
- Sous 700 px : relations entrantes en haut, sortantes en bas. Sur téléphone, la fiche ne s'ouvre qu'en touchant la carte centrale.
- Boutons : Recentrer, zoom − et +. Pincer ou molette pour zoomer, glisser pour se déplacer.

### Strates
- 12 strates horizontales de l'international au local, puis statuts, financements, société civile, métiers, textes, outils.
- Chaque élément est une puce (sigle + libellé court), regroupée par sous-groupe.
- Toucher une puce : elle passe en sombre, ses voisins sont surlignés de la couleur de la relation, les autres s'estompent, des courbes SVG relient la puce à chacun de ses voisins (flèche vers la cible), la fiche s'ouvre.
- Légende des 8 types de liens ; barre « Aller à » vers chaque strate.
- Mode parcours : les puces des étapes reçoivent leurs numéros, une ligne relie les étapes dans l'ordre, un bandeau permet de quitter.

### Fiche (panneau)
Ordre : strate et groupe, sigle, nom, nature juridique, description, À retenir, Qui dirige, Exemples et registre, Textes applicables, S'applique à (pour un texte), Musées rattachés, relations par type (entrantes puis sortantes), Dans la vue Droit, À savoir, Site officiel, Voir sur la carte.

### Musées
Familles de statut (nationaux EP, nationaux SCN, manufactures, Armées, recherche, Ville de Paris, territoriaux, associations et fondations), filtre par famille, recherche. Chaque musée : ville, statut, direction si vérifiée, mention Musée de France, rattachement cliquable.

### Qui est qui
Trombinoscope par niveau (international, gouvernement, ministère, commissions, opérateurs, collectivités, société civile) avec initiales ou photo, fonction, date, lien vers la fiche, source. Puis « Les fonctions à connaître à chaque niveau » (postes génériques par niveau territorial).

### Droit
14 thèmes de légalité patrimoniale (socle, domaine public, servitudes, travaux, archéologie, musées de France, circulation, restitutions, archives, cultes, PCI, pénal, fiscalité, international), chacun avec résumé, points clés, textes et acteurs cliquables. Puis un tableau « Textes et institutions concernées » qui liste, pour chaque texte, les nœuds auxquels il s'applique.

### Parcours
8 procédures numérotées : protéger un MH, travaux en abords, appellation Musée de France, archéologie préventive, PCI vers l'UNESCO, patrimoine mondial, financer une église communale, prêter une œuvre.

### Glossaire
Tous les sigles des nœuds + termes hors nœuds (anciens sigles, notions juridiques), classés par lettre.

### Images
- Photothèque des images libres (Wikipédia / Wikimedia Commons) associées aux nœuds, musées et personnes, filtrable (institutions, musées, personnes, sans image) et liste complète des crédits.
- Toucher une vignette ouvre une visionneuse : image, auteur, licence, article source, lien vers la fiche, et un **chercheur** en direct (Articles Wikipédia ou Wikimedia Commons).
- « Utiliser » garde une image dans le navigateur (mention « choix local ») ; « Copier » donne la ligne JSON à ajouter à `data/pictures.json`.
- **Recherche web** (onglet par défaut pour une personne sans image) : boutons vers Google Images, Bing, DuckDuckGo et Qwant avec le nom et la fonction ; on rapporte l'image par son adresse (https, vérifiée avant d'être gardée) ou en choisissant une photo de l'appareil (réduite à 480 px). Ces images restent locales, marquées « droits non vérifiés, usage personnel », et ne se copient pas vers `pictures.json`.
- Les images apparaissent aussi dans la fiche, la vue « liens », les musées et le trombinoscope.

## Application installable
Manifeste (`assets/manifest.webmanifest`), icônes, service worker (`src/sw.js`). Bandeau « Installer » sur Android/Chrome, rappel « Partager → Sur l'écran d'accueil » sur iPhone ; masquable, absent une fois installée. Hors connexion : la page et ses données, d3 et les polices sont servies depuis le cache ; les images Wikimedia et le chercheur demandent une connexion.

## Recherche
Un champ unique, filtre la vue courante (insensible aux accents). Sur la carte, `Entrée` ouvre le premier résultat. `/` place le curseur dans le champ.

## Navigation
Vue courante dans le hash (`#mindmap` par défaut, `#carte` pour les strates, `#musees`, `#qui`, `#droit`, `#parcours`, `#glossaire`, `#images`), suivie de l'élément ouvert : `#mindmap/drac`. Sur mobile, changer de vue ferme la fiche.

## Hors périmètre (pour l'instant)
Édition dans l'interface, comptes, synchronisation, données en temps réel.

## Pistes d'évolution (par priorité)

1. **Mode révision des sigles** : cartes « sigle → nom complet → rôle », tirées des nœuds, avec score local.
2. **Annuaire des 13 DRAC** : une fiche par région (adresse, directeur·rice, CRMH, SRA), vérifiée et datée.
3. ~~Liens profonds vers une fiche~~ : fait (`#mindmap/drac`).
4. **Filtre par type de lien** sur la carte (n'afficher que « finance », par exemple).
5. **Frise des réorganisations** : DAPA → DGP → DGPA, DG2TDC → DGDCER, CRPS → CRPA, etc.
6. **Liens Légifrance par article** dans les fiches et la vue Droit.
7. **Chiffres automatiques** depuis data.culture.gouv.fr (Mérimée, Muséofile) au moment du build.
8. **Version anglaise** (champs `name_en`, `desc_en`).
9. **Notes personnelles par fiche** (stockage local du navigateur).
10. **Feuille de style d'impression** pour une fiche ou un parcours.

## Limites connues
- Les tutelles sont simplifiées (une flèche par tutelle principale ; co-tutelles signalées par l'étiquette).
- Les listes de musées et de personnes sont sélectives, pas exhaustives.
- Les chiffres datent des dernières publications du DEPS disponibles au moment de la vérification.
