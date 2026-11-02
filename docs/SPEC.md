# Spécification

## Objectif

Donner en quelques secondes la réponse à trois questions face à un sigle ou une situation : **qui est-ce**, **qui décide ou finance quoi**, **sur quel texte**. Public : un étudiant puis jeune professionnel du patrimoine (régie, documentation des collections), utilisateur principal sur téléphone.

## Principes

- Une seule page, autonome, hors ligne une fois chargée (polices Google exceptées).
- Données séparées de l'interface ; toute donnée « actuelle » est datée et sourcée.
- Lisible sur mobile : pas de graphe en toile d'araignée ; les liens n'apparaissent que pour l'élément sélectionné.

## Vues

### Carte mentale (vue d'ouverture)
- Racine « Patrimoine en France » au centre ; les 6 strates d'acteurs à droite (international → collectivités), les 6 strates d'instruments à gauche (statuts → outils).
- Toucher une branche la déplie (groupes et acteurs) et recentre ; la toucher à nouveau la replie. Le nombre d'éléments repliés s'affiche (« +24 »).
- Toucher un acteur : ouvre sa fiche, déplie les branches de tous ses voisins, dessine les liens typés (couleur et pointillés selon le type, flèche vers la cible) et cadre l'ensemble.
- Boutons : Déplier tout, Replier, Recentrer, zoom − et +. Pincer ou molette pour zoomer, glisser pour se déplacer.
- La recherche déplie et met en évidence les résultats.

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

## Recherche
Un champ unique, filtre la vue courante (insensible aux accents). Sur la carte, `Entrée` ouvre le premier résultat. `/` place le curseur dans le champ.

## Navigation
Vue courante dans le hash (`#mindmap` par défaut, `#carte` pour les strates, `#musees`, `#qui`, `#droit`, `#parcours`, `#glossaire`). Sur mobile, changer de vue ferme la fiche.

## Hors périmètre (pour l'instant)
Édition dans l'interface, comptes, synchronisation, données en temps réel.

## Pistes d'évolution (par priorité)

1. **Mode révision des sigles** : cartes « sigle → nom complet → rôle », tirées des nœuds, avec score local.
2. **Annuaire des 13 DRAC** : une fiche par région (adresse, directeur·rice, CRMH, SRA), vérifiée et datée.
3. **Liens profonds vers une fiche** (`#n-drac`) pour partager ou mettre en favori.
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
