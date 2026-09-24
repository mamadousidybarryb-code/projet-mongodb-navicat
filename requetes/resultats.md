# Résultats des requêtes

Base `projet_nosql`, collection `restaurants`, 25 359 documents.
Chaque résultat ci-dessous est la sortie de la requête correspondante dans [`requetes.js`](requetes.js).

> Rappel : dans les inspections sanitaires de New York, **un score bas est un bon score** (moins d'infractions).
> Note A = 0 à 13 points, B = 14 à 27, C = 28 et plus. Z / P = note en attente.

## Partie 1 — Découverte du dataset

| # | Question | Résultat |
|---|---|---|
| Q1 | Nombre total de restaurants | **25 359** |
| Q2 | Structure d'un document | voir ci-dessous |
| Q3 | Quartiers | Bronx, Brooklyn, Manhattan, Queens, Staten Island, *Missing* |
| Q4 | Types de cuisine différents | **85** |

Structure d'un document (Q2) :

```json
{
  "address": { "building": "1007", "coord": [-73.856077, 40.848447],
               "street": "Morris Park Ave", "zipcode": "10462" },
  "borough": "Bronx",
  "cuisine": "Bakery",
  "grades": [
    { "date": ISODate("2014-03-03"), "grade": "A", "score": 2 },
    { "date": ISODate("2013-09-11"), "grade": "A", "score": 6 },
    { "date": ISODate("2013-01-24"), "grade": "A", "score": 10 },
    { "date": ISODate("2011-11-23"), "grade": "A", "score": 9 },
    { "date": ISODate("2011-03-10"), "grade": "B", "score": 14 }
  ],
  "name": "Morris Park Bake Shop",
  "restaurant_id": "30075445"
}
```

Points à remarquer : un **document imbriqué** (`address`), un **tableau de documents** (`grades`) et un type **Date** — ce que le modèle relationnel obligerait à répartir sur 3 tables.

## Partie 2 — Filtrage (`find`)

| # | Question | Résultat |
|---|---|---|
| Q5 | Restaurants à Brooklyn | **6 086** |
| Q7 | Chinois ou japonais dans le Queens (`$in`) | **845** |
| Q8 | Nom contenant « pizza » (`$regex`, insensible à la casse) | **1 261** |
| Q9 | Au moins une note C avec un score > 50 (`$elemMatch`) | **310** restaurants |
| Q10 | Quartier inconnu (`Missing`) | **51** |

Q6 — 5 restaurants italiens de Manhattan, triés par nom :

| Nom | Rue |
|---|---|
| 44 Sw Ristorante & Bar | 9 Avenue |
| A Voce | Columbus Circle |
| Abboccato Ristorante | West 55 Street |
| Abottega | Bedford Street |
| Academia Barilla Restaurants | Avenue Of The Americas |

Q9 — 5 premiers résultats : May May Kitchen (Brooklyn, Chinese), Polish National Home (Brooklyn, Polish), Como Pizza (Manhattan, Pizza), Nanni Restaurant (Manhattan, Italian), Cafe Espanol (Manhattan, Spanish).

## Partie 3 — Agrégations

**Q11 — Restaurants par quartier**

| Quartier | Restaurants |
|---|---:|
| Manhattan | 10 259 |
| Brooklyn | 6 086 |
| Queens | 5 656 |
| Bronx | 2 338 |
| Staten Island | 969 |
| Missing | 51 |

**Q12 — Top 10 des cuisines**

| Cuisine | Restaurants |
|---|---:|
| American | 6 183 |
| Chinese | 2 418 |
| Café/Coffee/Tea | 1 214 |
| Pizza | 1 163 |
| Italian | 1 069 |
| Other | 1 011 |
| Latin (Cuban, Dominican, Puerto Rican…) | 850 |
| Japanese | 760 |
| Mexican | 754 |
| Bakery | 691 |

**Q13 — Répartition des notes (93 463 inspections)**

| Note | Inspections | Part |
|---|---:|---:|
| A | 74 656 | 79,9 % |
| B | 12 603 | 13,5 % |
| C | 3 145 | 3,4 % |
| Z | 1 337 | 1,4 % |
| P | 1 197 | 1,3 % |
| Not Yet Graded | 525 | 0,6 % |

**Q14 — Score moyen par quartier** (plus bas = meilleur)

| Quartier | Score moyen | Inspections |
|---|---:|---:|
| Bronx | 11,04 | 8 706 |
| Staten Island | 11,37 | 3 216 |
| Manhattan | 11,42 | 38 622 |
| Brooklyn | 11,45 | 21 963 |
| Queens | 11,63 | 20 877 |

**Q15 — Cuisines les mieux notées** (≥ 500 inspections)

| Cuisine | Score moyen | Inspections |
|---|---:|---:|
| Ice Cream, Gelato, Yogurt, Ices | 8,31 | 1 028 |
| Donuts | 8,31 | 1 855 |
| Café/Coffee/Tea | 8,67 | 4 047 |
| Sandwiches | 8,67 | 1 718 |
| Juice, Smoothies, Fruit Salads | 8,75 | 734 |

**Q16 — Cuisines les moins bien notées** (≥ 500 inspections)

| Cuisine | Score moyen | Inspections |
|---|---:|---:|
| Korean | 13,52 | 1 013 |
| Latin (Cuban, Dominican, Puerto Rican…) | 13,04 | 3 830 |
| Asian | 13,01 | 1 102 |
| Delicatessen | 12,90 | 1 522 |
| Thai | 12,90 | 1 113 |

**Q17 — Inspections par année**

| Année | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 |
|---|---:|---:|---:|---:|---:|---:|
| Inspections | 7 | 8 477 | 22 779 | 27 367 | 32 698 | 2 135 |

(2010 et 2015 sont des années incomplètes dans le dataset.)

**Q18 — Cuisine la plus fréquente par quartier (hors « American », qui est 1ʳᵉ partout)**

| Quartier | Cuisine n°1 | Restaurants |
|---|---|---:|
| Brooklyn | Chinese | 763 |
| Queens | Chinese | 728 |
| Manhattan | Café/Coffee/Tea | 680 |
| Bronx | Chinese | 323 |
| Staten Island | Chinese | 88 |

## Partie 4 — Index et mise à jour

- **Q19** : index composé `borough_1_cuisine_1` créé → index de la collection : `_id_`, `borough_1_cuisine_1`.
- **Q20** : `updateMany` avec pipeline → 25 359 documents modifiés ; ex. *Morris Park Bake Shop* → `nb_inspections: 5`.

## Partie 5 — Pipeline d'agrégation : bilan qualité par quartier

Fichier : [`pipeline.js`](pipeline.js) — 6 étapes : `$match` → `$unwind` → `$match` → `$group` → `$project` → `$sort`.
Seules les notes A, B et C sont comptées ; `nb_restaurants` = restaurants ayant au moins une de ces notes.

| Quartier | Restaurants | Inspections | Score moyen | % de A | % de C |
|---|---:|---:|---:|---:|---:|
| Staten Island | 894 | 3 116 | 11,25 | 84,7 | 2,6 |
| Bronx | 2 217 | 8 418 | 10,98 | 83,4 | 3,4 |
| Manhattan | 9 760 | 37 466 | 11,25 | 83,2 | 3,5 |
| Brooklyn | 5 716 | 21 190 | 11,35 | 81,8 | 3,8 |
| Queens | 5 294 | 20 135 | 11,51 | 81,6 | 3,3 |

→ **Staten Island** a la meilleure proportion de A, **Brooklyn** la plus forte proportion de C ; les écarts restent faibles (3 points).

## Conclusions

1. **Manhattan concentre 40 %** des restaurants (10 259 sur 25 359).
2. La cuisine **American** domine (24 %), suivie de la **Chinese** — qui est la 1ʳᵉ cuisine « étrangère » dans 4 quartiers sur 5.
3. **80 % des inspections donnent un A** ; seules 3,4 % donnent un C.
4. Les établissements simples (glaces, donuts, cafés) ont les meilleurs scores ; les cuisines coréenne, latine et asiatique les moins bons.
5. Les écarts entre quartiers sont faibles (11,0 à 11,6) : le quartier n'influence presque pas la note.
