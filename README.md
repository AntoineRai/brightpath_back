# API Express Simple - BrightPath

Une API Express simple avec des endpoints de base.

## Installation

```bash
npm install
```

## Démarrage

### Mode développement (avec auto-reload)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## Endpoints disponibles

### 1. Route de base
- **URL:** `GET /`
- **Description:** Page d'accueil de l'API
- **Réponse:**
```json
{
  "message": "Bienvenue sur l'API BrightPath!",
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Endpoint Hello
- **URL:** `GET /api/hello`
- **Paramètres de requête:** `name` (optionnel)
- **Description:** Endpoint de salutation personnalisable
- **Exemple:** `GET /api/hello?name=Alice`
- **Réponse:**
```json
{
  "message": "Bonjour Alice!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "endpoint": "/api/hello",
  "method": "GET"
}
```

### 3. Endpoint de création de données
- **URL:** `POST /api/data`
- **Body:** JSON avec `title` (requis) et `description` (optionnel)
- **Description:** Crée une nouvelle entrée de données
- **Exemple:**
```json
{
  "title": "Mon titre",
  "description": "Ma description"
}
```
- **Réponse:**
```json
{
  "message": "Données créées avec succès",
  "data": {
    "id": 1704067200000,
    "title": "Mon titre",
    "description": "Ma description",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Test de l'API

### Avec curl

```bash
# Test de la route de base
curl http://localhost:3001/

# Test de l'endpoint hello
curl http://localhost:3001/api/hello
curl "http://localhost:3001/api/hello?name=Alice"

# Test de l'endpoint POST
curl -X POST http://localhost:3001/api/data \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Description de test"}'
```

### Avec un navigateur
Ouvrez simplement `http://localhost:3001` dans votre navigateur pour voir la réponse JSON.

## Structure du projet

```
brightpath_back/
├── package.json      # Dépendances et scripts
├── server.js         # Serveur Express principal
└── README.md         # Documentation
```

## Technologies utilisées

- **Express.js** - Framework web pour Node.js
- **CORS** - Middleware pour gérer les requêtes cross-origin
- **Nodemon** - Outil de développement pour auto-reload 