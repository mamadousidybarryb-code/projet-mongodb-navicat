// =====================================================================
//  Pipeline d'agrégation — Bilan qualité des restaurants par quartier
//  Base : projet_nosql   |   Collection : restaurants
//
//  Dans Navicat : projet_nosql → Nouvelle requête → coller ce fichier
//  → Exécuter (Ctrl + R).
//  En ligne de commande :
//      mongosh "mongodb://localhost:27017/projet_nosql" requetes/pipeline.js
// =====================================================================

db = db.getSiblingDB("projet_nosql");

printjson(db.restaurants.aggregate([

  // Étape 1 — On retire les restaurants sans quartier connu
  { $match: { borough: { $ne: "Missing" } } },

  // Étape 2 — On "déplie" le tableau grades : 1 document par inspection
  { $unwind: "$grades" },

  // Étape 3 — On garde seulement les vraies notes A, B, C
  //           (on retire "Not Yet Graded", "P", "Z")
  { $match: { "grades.grade": { $in: ["A", "B", "C"] } } },

  // Étape 4 — On regroupe par quartier et on calcule les indicateurs
  { $group: {
      _id: "$borough",
      restaurants: { $addToSet: "$restaurant_id" },   // restaurants distincts notés A/B/C
      nb_inspections: { $sum: 1 },
      score_moyen: { $avg: "$grades.score" },
      nb_A: { $sum: { $cond: [{ $eq: ["$grades.grade", "A"] }, 1, 0] } },
      nb_C: { $sum: { $cond: [{ $eq: ["$grades.grade", "C"] }, 1, 0] } }
  } },

  // Étape 5 — On met en forme le résultat (pourcentages arrondis)
  { $project: {
      _id: 0,
      quartier: "$_id",
      nb_restaurants: { $size: "$restaurants" },
      nb_inspections: 1,
      score_moyen: { $round: ["$score_moyen", 2] },
      pourcentage_A: { $round: [{ $multiply: [{ $divide: ["$nb_A", "$nb_inspections"] }, 100] }, 1] },
      pourcentage_C: { $round: [{ $multiply: [{ $divide: ["$nb_C", "$nb_inspections"] }, 100] }, 1] }
  } },

  // Étape 6 — Classement : le quartier avec le plus de notes A en premier
  { $sort: { pourcentage_A: -1 } }

]).toArray());
