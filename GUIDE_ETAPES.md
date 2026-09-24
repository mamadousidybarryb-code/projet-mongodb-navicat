# Guide pas à pas — de l'installation au push GitHub

Système visé : **Windows 10/11** (les étapes sont identiques sur macOS à part l'installateur).

---

## Étape 1 — Télécharger le dataset

Dataset choisi : **Restaurants de New York** (dataset officiel des tutoriels MongoDB).

- Lien : <https://raw.githubusercontent.com/mongodb/docs-assets/primer-dataset/primer-dataset.json>
- Clic droit → *Enregistrer sous…* → `restaurants.json`
- Taille : 11,9 Mo — 25 359 documents (1 document JSON par ligne)

Il est aussi déjà présent dans ce dépôt : `data/restaurants.json`.

📸 *Capture à faire : le fichier dans l'explorateur Windows.*

## Étape 2 — Installer MongoDB Community Server

1. Aller sur <https://www.mongodb.com/try/download/community>
2. Version : dernière stable, Plateforme : **Windows**, Package : **msi** → *Download*
3. Lancer l'installateur → *Complete* → cocher **Install MongoDB as a Service**
4. (Optionnel) cocher *Install MongoDB Compass*
5. Vérifier : ouvrir **Services** Windows → `MongoDB Server` doit être *En cours d'exécution*

Le serveur écoute sur `localhost:27017`.

📸 *Capture : le service MongoDB démarré.*

## Étape 3 — Installer Navicat

1. Aller sur <https://www.navicat.com/en/download/navicat-premium> (ou *Navicat for MongoDB*)
2. Télécharger la version Windows → installer (essai gratuit 14 jours)
3. Ouvrir Navicat

> Alternative gratuite : **Navicat Premium Lite**, qui gère aussi MongoDB.

## Étape 4 — Connecter Navicat à MongoDB

1. **Connexion** (en haut à gauche) → **MongoDB**
2. Remplir :
   - Nom de connexion : `MongoDB_Local`
   - Type : **Standalone**
   - Hôte : `localhost` — Port : `27017`
   - Authentification : **None**
3. **Tester la connexion** → message *Connexion réussie*
4. **OK** → la connexion apparaît dans le panneau de gauche → double-clic pour l'ouvrir

📸 *Capture : la fenêtre de connexion + « Connexion réussie ».*

## Étape 5 — Créer la base et importer le dataset

1. Clic droit sur `MongoDB_Local` → **Nouvelle base de données** → nom : `projet_nosql`
2. Double-clic sur `projet_nosql` → clic droit sur **Collections** → **Nouvelle collection** → `restaurants` → enregistrer
3. Clic droit sur la collection `restaurants` → **Assistant d'importation** (Import Wizard)
4. Format : **JSON (\*.json)** → Suivant
5. Choisir `restaurants.json` → Suivant
6. Laisser les options par défaut (Navicat détecte `$date` automatiquement) → Suivant jusqu'à **Démarrer**
7. Résultat attendu : **25 359 enregistrements importés**, 0 erreur

📸 *Capture : le rapport d'import et la collection ouverte en vue grille / arbre.*

<details>
<summary>Méthode alternative en ligne de commande</summary>

Installer les *MongoDB Database Tools*, puis :

```bash
mongoimport --db projet_nosql --collection restaurants --file data/restaurants.json
```
</details>

## Étape 6 — Explorer les données dans Navicat

- Vue **Grille** : voir les champs comme un tableau
- Vue **Arbre** : voir les documents imbriqués (`address`) et le tableau `grades`
- Vue **JSON** : voir le document brut

## Étape 7 — Exécuter les requêtes d'analyse

1. Clic sur `projet_nosql` → bouton **Nouvelle requête** (ou *MongoDB Shell*)
2. Copier les requêtes de `requetes/requetes.js` (une partie à la fois)
3. Sélectionner une requête → **Exécuter** (Ctrl + R)
4. Comparer avec `requetes/resultats.md`

Astuce Navicat : l'onglet **Aggregate** permet aussi de construire un pipeline étape par étape (`$match`, `$group`, `$sort`…) avec un aperçu du résultat à chaque étape — très pratique pour la démo.

📸 *Capture : 2 ou 3 requêtes avec leur résultat (ex. Q11, Q13, Q15).*

## Étape 7 bis — Le pipeline d'agrégation (bilan qualité par quartier)

Fichier : `requetes/pipeline.js`.

1. Dans Navicat, clic sur `projet_nosql` → **Nouvelle requête**
2. Ouvrir `requetes/pipeline.js`, **tout copier** et coller dans l'éditeur
3. **Exécuter** (Ctrl + R)
4. Résultat attendu : 5 lignes (une par quartier), Staten Island en premier avec 84,7 % de A — voir `requetes/resultats.md`, partie 5

Pour montrer le pipeline **étape par étape** : ouvrir la collection `restaurants` → **Aggregate** (générateur d'agrégation) → ajouter les étapes une par une (`$match`, `$unwind`, `$match`, `$group`, `$project`, `$sort`) en collant le contenu de chaque étape depuis `pipeline.js`, et regarder l'aperçu changer.

📸 *Capture : le pipeline et son résultat.*

## Étape 8 — Publier sur GitHub

### 8.1 Préparer
- Installer Git : <https://git-scm.com/download/win>
- Créer un compte sur <https://github.com> si ce n'est pas fait
- Configurer Git (une seule fois) :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@exemple.com"
```

### 8.2 Créer le dépôt sur GitHub
- **New repository** → nom : `projet-mongodb-navicat` → *Public* → **ne pas** cocher « Add a README » → **Create repository**

### 8.3 Pousser le projet
Ouvrir **Git Bash** dans le dossier du projet :

```bash
git init
git add .
git commit -m "Projet MongoDB + Navicat : dataset restaurants, requêtes et analyse"
git branch -M main
git remote add origin https://github.com/VOTRE_PSEUDO/projet-mongodb-navicat.git
git push -u origin main
```

À la première connexion, une fenêtre GitHub demande de s'authentifier dans le navigateur.

### 8.4 Ajouter les captures d'écran plus tard

```bash
git add captures/
git commit -m "Ajout des captures d'écran"
git push
```

📸 *Capture : la page du dépôt sur GitHub.*

---

## Problèmes fréquents

| Problème | Solution |
|---|---|
| Navicat : *Connection refused* | Le service MongoDB n'est pas démarré → Services → MongoDB Server → Démarrer |
| Import : dates importées en texte | Utiliser `mongoimport` (gère `$date`) ou vérifier le type du champ dans l'assistant |
| `git push` refusé : *rejected* | Le dépôt GitHub contient déjà un README → `git pull origin main --allow-unrelated-histories` puis `git push` |
| `remote origin already exists` | `git remote set-url origin https://github.com/VOTRE_PSEUDO/projet-mongodb-navicat.git` |
