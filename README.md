# Projet NoSQL — Analyse des restaurants de New York avec MongoDB et Navicat

Analyse d'un dataset de **25 359 restaurants new-yorkais** et de leurs **93 463 inspections sanitaires** : import dans MongoDB via Navicat, puis 20 requêtes (filtres, agrégations, index, mise à jour).

## Outils

| Outil | Rôle |
|---|---|
| MongoDB Community Server | Base de données NoSQL orientée documents |
| Navicat | Interface graphique : connexion, import, requêtes |
| Git / GitHub | Versionnement et publication du projet |

## Contenu du dépôt

```
projet-mongodb-navicat/
├── README.md             ← ce fichier
├── GUIDE_ETAPES.md       ← toutes les étapes, de l'installation au push
├── data/
│   └── restaurants.json  ← le dataset (JSON, 1 document par ligne)
├── requetes/
│   ├── requetes.js       ← les 20 requêtes MongoDB commentées
│   └── resultats.md      ← les résultats obtenus + conclusions
└── captures/             ← captures d'écran Navicat
```

## Le dataset

- **Source** : dataset officiel des tutoriels MongoDB — [primer-dataset.json](https://raw.githubusercontent.com/mongodb/docs-assets/primer-dataset/primer-dataset.json)
- **Base / collection** : `projet_nosql.restaurants`
- **Champs** : `name`, `borough` (quartier), `cuisine`, `address` (document imbriqué avec coordonnées GPS), `grades` (tableau des inspections : date, note, score), `restaurant_id`

## Requêtes réalisées

| Partie | Requêtes | Opérateurs utilisés |
|---|---|---|
| 1. Découverte | Q1–Q4 | `countDocuments`, `findOne`, `distinct` |
| 2. Filtrage | Q5–Q10 | `find`, projection, `sort`, `limit`, `$in`, `$regex`, `$elemMatch` |
| 3. Agrégation | Q11–Q18 | `$match`, `$group`, `$unwind`, `$sort`, `$limit`, `$avg`, `$sum`, `$first`, `$year` |
| 4. Optimisation | Q19–Q20 | `createIndex`, `updateMany` avec pipeline, `$size` |

Exécution : dans Navicat (*Nouvelle requête*) ou en ligne de commande :

```bash
mongosh "mongodb://localhost:27017/projet_nosql" requetes/requetes.js
```

## Principaux résultats

- **Manhattan** concentre 40 % des restaurants (10 259).
- **American** est la cuisine n°1 (6 183), devant **Chinese** (2 418).
- **80 %** des inspections donnent la note **A**, seulement 3,4 % un **C**.
- Meilleurs scores : glaciers, donuts, cafés (≈ 8,3). Moins bons : coréen (13,5), latino (13,0).
- Le quartier influence peu la note (score moyen de 11,0 à 11,6).

Détail complet : [`requetes/resultats.md`](requetes/resultats.md).

## Auteur

Mamadou Sidy Barry
