# 📡 Endpoints API

Guide complet de tous les endpoints disponibles dans l'API BrightPath.

## 🎯 Vue d'ensemble

### Types d'endpoints
- **Routes publiques** : Accessibles sans authentification
- **Routes protégées** : Nécessitent un token JWT
- **Routes IA** : Fonctionnalités d'intelligence artificielle

### Base URL
```
http://localhost:3001
```

## 🌐 Routes publiques

### 1. Page d'accueil
```http
GET /
```

**Réponse :**
```json
{
  "message": "Bienvenue sur l'API BrightPath!",
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "info": "Cette route est publique. Les autres routes nécessitent une authentification JWT.",
  "endpoints": {
    "public": ["GET /", "POST /api/auth/register", "POST /api/auth/login", "POST /api/auth/refresh"],
    "protected": ["GET /api/hello", "POST /api/data", "GET /api/data", "GET /api/auth/me", "POST /api/auth/logout"]
  }
}
```

## 🔐 Routes d'authentification

### 2. Inscription
```http
POST /api/auth/register
```

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nom Utilisateur"
}
```

### 3. Connexion
```http
POST /api/auth/login
```

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 4. Rafraîchissement de token
```http
POST /api/auth/refresh
```

**Body :**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🔒 Routes protégées

*Toutes les routes suivantes nécessitent le header : `Authorization: Bearer <access_token>`*

### 5. Endpoint Hello
```http
GET /api/hello?name=Alice
```

**Réponse :**
```json
{
  "message": "Bonjour Alice! (Utilisateur authentifié: Admin)",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoint": "/api/hello",
  "method": "GET",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@brightpath.com",
    "role": "admin"
  }
}
```

### 6. Création de données
```http
POST /api/data
```

**Body :**
```json
{
  "title": "Mon titre",
  "description": "Ma description"
}
```

### 7. Récupération de données
```http
GET /api/data
```

### 8. Récupération d'une donnée spécifique
```http
GET /api/data/:id
```

### 9. Profil utilisateur
```http
GET /api/auth/me
```

### 10. Déconnexion
```http
POST /api/auth/logout
```

## 📝 Routes des candidatures

### 11. Créer une candidature
```http
POST /api/applications
```

**Body :**
```json
{
  "company": "TechCorp",
  "position": "Développeur Full Stack",
  "application_date": "2024-01-15",
  "status": "pending",
  "location": "Paris, France",
  "salary": "45k-55k€",
  "contact_person": "Jean Dupont",
  "contact_email": "jean.dupont@techcorp.com",
  "job_description": "Développement d'applications web modernes"
}
```

### 12. Récupérer toutes les candidatures
```http
GET /api/applications?status=pending&limit=10&offset=0
```

**Paramètres de requête :**
- `status` : Filtre par statut
- `limit` : Nombre de résultats (défaut: 100)
- `offset` : Pagination (défaut: 0)
- `orderBy` : Tri par champ (défaut: application_date)
- `orderDirection` : Direction du tri (asc/desc, défaut: desc)

### 13. Récupérer une candidature spécifique
```http
GET /api/applications/:id
```

### 14. Mettre à jour une candidature
```http
PUT /api/applications/:id
```

### 15. Supprimer une candidature
```http
DELETE /api/applications/:id
```

### 16. Statistiques des candidatures
```http
GET /api/applications/stats
```

**Réponse :**
```json
{
  "total": 25,
  "byStatus": {
    "pending": 10,
    "interview": 5,
    "accepted": 3,
    "rejected": 7
  },
  "successRate": 12.0
}
```

### 17. Rechercher des candidatures
```http
GET /api/applications/search?company=TechCorp&position=Développeur
```

**Paramètres de requête :**
- `company` : Nom de l'entreprise
- `position` : Poste recherché
- `status` : Statut de la candidature
- `dateFrom` : Date de début (YYYY-MM-DD)
- `dateTo` : Date de fin (YYYY-MM-DD)

### 18. Candidatures récentes
```http
GET /api/applications/recent?days=30
```

### 19. Compteurs par statut
```http
GET /api/applications/count
```

## 🤖 Routes Intelligence Artificielle

### 20. Génération de lettres de motivation
```http
POST /api/ai/cover-letter
```

**Body :**
```json
{
  "position": "Développeur Full Stack React/Node.js",
  "company": "TechStartup",
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "telephone": "06 12 34 56 78",
  "adresse": "123 Rue de la Paix, 75001 Paris",
  "destinataire": "Mme Martin, Responsable RH"
}
```

### 21. Professionnalisation de texte pour CV
```http
POST /api/ai/professionalize-text
```

**Body :**
```json
{
  "originalText": "Pendant mon alternance à Cap Habitat j'ai eu l'occasion de bosser dans plusieurs domaines",
  "context": "Développeur web, alternance"
}
```

## ⚠️ Codes de statut HTTP

### Succès
- **200** : Requête réussie
- **201** : Ressource créée avec succès

### Erreurs client
- **400** : Requête malformée
- **401** : Non authentifié
- **403** : Non autorisé
- **404** : Ressource non trouvée
- **429** : Trop de requêtes (rate limiting)

### Erreurs serveur
- **500** : Erreur interne du serveur
- **502** : Erreur de passerelle
- **503** : Service indisponible

## 🔍 Exemples d'utilisation

### Workflow complet d'authentification
```bash
# 1. Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# 2. Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 3. Utilisation avec token
curl -X GET http://localhost:3001/api/hello \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Gestion des candidatures
```bash
# Créer une candidature
curl -X POST http://localhost:3001/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"company": "TechCorp", "position": "Développeur", "status": "pending"}'

# Récupérer les candidatures
curl -X GET http://localhost:3001/api/applications \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Utilisation des fonctionnalités IA
```bash
# Générer une lettre de motivation
curl -X POST http://localhost:3001/api/ai/cover-letter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"position": "Développeur", "company": "TechCorp", "nom": "Dupont", "prenom": "Jean", "email": "jean@email.com", "telephone": "0123456789", "adresse": "Paris"}'
``` 