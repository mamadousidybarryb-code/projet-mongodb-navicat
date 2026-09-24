// =====================================================================
//  Projet NoSQL — Analyse du dataset "restaurants" (New York)
//  Base : projet_nosql   |   Collection : restaurants
//  A exécuter dans Navicat (Nouvelle requête / MongoDB Shell) ou mongosh :
//      mongosh "mongodb://localhost:27017/projet_nosql" requetes.js
// =====================================================================

db = db.getSiblingDB("projet_nosql");

function titre(t) { print("\n==================== " + t + " ===================="); }

// ---------------------------------------------------------------------
// PARTIE 1 — Découverte du dataset
// ---------------------------------------------------------------------

titre("Q1 - Nombre total de restaurants");
printjson(db.restaurants.countDocuments({}));

titre("Q2 - Structure d'un document");
printjson(db.restaurants.findOne({}, { _id: 0 }));

titre("Q3 - Liste des quartiers (borough)");
printjson(db.restaurants.distinct("borough"));

titre("Q4 - Nombre de types de cuisine différents");
printjson(db.restaurants.distinct("cuisine").length);

// ---------------------------------------------------------------------
// PARTIE 2 — Requêtes de filtrage (find)
// ---------------------------------------------------------------------

titre("Q5 - Nombre de restaurants à Brooklyn");
printjson(db.restaurants.countDocuments({ borough: "Brooklyn" }));

titre("Q6 - 5 restaurants italiens de Manhattan (nom + rue), triés par nom");
printjson(db.restaurants.find(
  { borough: "Manhattan", cuisine: "Italian" },
  { _id: 0, name: 1, "address.street": 1 }
).sort({ name: 1 }).limit(5).toArray());

titre("Q7 - Restaurants chinois OU japonais dans le Queens ($in)");
printjson(db.restaurants.countDocuments({
  borough: "Queens",
  cuisine: { $in: ["Chinese", "Japanese"] }
}));

titre("Q8 - Restaurants dont le nom contient 'Pizza' ($regex)");
printjson(db.restaurants.countDocuments({ name: { $regex: "pizza", $options: "i" } }));

titre("Q9 - Restaurants ayant eu au moins une note 'C' avec un score > 50 ($elemMatch)");
printjson(db.restaurants.find(
  { grades: { $elemMatch: { grade: "C", score: { $gt: 50 } } } },
  { _id: 0, name: 1, borough: 1, cuisine: 1 }
).limit(5).toArray());

titre("Q10 - Restaurants sans quartier connu ('Missing')");
printjson(db.restaurants.countDocuments({ borough: "Missing" }));

// ---------------------------------------------------------------------
// PARTIE 3 — Analyse avec le pipeline d'agrégation
// ---------------------------------------------------------------------

titre("Q11 - Nombre de restaurants par quartier");
printjson(db.restaurants.aggregate([
  { $group: { _id: "$borough", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]).toArray());

titre("Q12 - Top 10 des cuisines les plus représentées");
printjson(db.restaurants.aggregate([
  { $group: { _id: "$cuisine", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
]).toArray());

titre("Q13 - Répartition des notes d'inspection (A, B, C...)");
printjson(db.restaurants.aggregate([
  { $unwind: "$grades" },
  { $group: { _id: "$grades.grade", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]).toArray());

titre("Q14 - Score moyen d'inspection par quartier (score bas = meilleur)");
printjson(db.restaurants.aggregate([
  { $match: { borough: { $ne: "Missing" } } },
  { $unwind: "$grades" },
  { $group: {
      _id: "$borough",
      score_moyen: { $avg: "$grades.score" },
      nb_inspections: { $sum: 1 }
  } },
  { $sort: { score_moyen: 1 } }
]).toArray());

titre("Q15 - Top 5 cuisines les mieux notées (min. 500 inspections)");
printjson(db.restaurants.aggregate([
  { $unwind: "$grades" },
  { $group: {
      _id: "$cuisine",
      score_moyen: { $avg: "$grades.score" },
      nb_inspections: { $sum: 1 }
  } },
  { $match: { nb_inspections: { $gte: 500 } } },
  { $sort: { score_moyen: 1 } },
  { $limit: 5 }
]).toArray());

titre("Q16 - Top 5 cuisines les moins bien notées (min. 500 inspections)");
printjson(db.restaurants.aggregate([
  { $unwind: "$grades" },
  { $group: {
      _id: "$cuisine",
      score_moyen: { $avg: "$grades.score" },
      nb_inspections: { $sum: 1 }
  } },
  { $match: { nb_inspections: { $gte: 500 } } },
  { $sort: { score_moyen: -1 } },
  { $limit: 5 }
]).toArray());

titre("Q17 - Nombre d'inspections par année");
printjson(db.restaurants.aggregate([
  { $unwind: "$grades" },
  { $group: { _id: { $year: "$grades.date" }, total: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]).toArray());

titre("Q18 - Cuisine la plus fréquente dans chaque quartier (hors 'American')");
printjson(db.restaurants.aggregate([
  { $match: { borough: { $ne: "Missing" }, cuisine: { $ne: "American" } } },
  { $group: { _id: { borough: "$borough", cuisine: "$cuisine" }, total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $group: { _id: "$_id.borough", cuisine_top: { $first: "$_id.cuisine" }, total: { $first: "$total" } } },
  { $sort: { total: -1 } }
]).toArray());

// ---------------------------------------------------------------------
// PARTIE 4 — Optimisation et mise à jour
// ---------------------------------------------------------------------

titre("Q19 - Création d'index sur borough + cuisine");
printjson(db.restaurants.createIndex({ borough: 1, cuisine: 1 }));
printjson(db.restaurants.getIndexes().map(i => i.name));

titre("Q20 - Mise à jour : ajouter un champ 'nb_inspections' à chaque restaurant");
printjson(db.restaurants.updateMany({}, [ { $set: { nb_inspections: { $size: "$grades" } } } ]).modifiedCount);
printjson(db.restaurants.findOne({ name: "Morris Park Bake Shop" }, { _id: 0, name: 1, nb_inspections: 1 }));
