# API Express avec JWT, Supabase et Sécurité - BrightPath

Une API Express sécurisée avec authentification JWT, base de données Supabase, rate limiting et protection contre les attaques.

## Installation

```bash
npm install
```

## Configuration Supabase

### 1. Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `SUPABASE_URL` et `SUPABASE_ANON_KEY`

### 2. Configurer la base de données
1. Dans votre projet Supabase, allez dans l'éditeur SQL
2. Exécutez le script `database/schema.sql` pour créer la table `users`

### 3. Variables d'environnement
1. Copiez le fichier `env.example` vers `.env`
2. Remplissez les variables avec vos informations Supabase et OpenAI :

```bash
# Configuration Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon-supabase

# Configuration JWT
JWT_SECRET=votre-secret-jwt-super-securise
JWT_REFRESH_SECRET=votre-refresh-secret-super-securise

# Configuration OpenAI (pour les fonctionnalités IA)
OPENAI_API_KEY=votre-clé-api-openai
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

## 🔐 Authentification JWT

L'API utilise un système d'authentification JWT (JSON Web Token) avec deux types de tokens :
- **Access Token** : Valide 15 minutes, utilisé pour les requêtes API
- **Refresh Token** : Valide 7 jours, utilisé pour renouveler l'access token

### Utilisateurs de test
Après avoir exécuté le script SQL, vous aurez accès à :
- **Admin:** `admin@brightpath.com` / `password`
- **User:** `user@brightpath.com` / `password`

## 🛡️ Système de Sécurité

### Rate Limiting
L'API est protégée par plusieurs niveaux de rate limiting qui s'adaptent à l'environnement :

#### Mode Développement (`NODE_ENV=development`)
- **Global** : 10 000 requêtes par 15 minutes par IP
- **Authentification** : 100 tentatives de connexion par 15 minutes
- **Inscription** : 50 tentatives par heure
- **API protégée** : 10 000 requêtes par 15 minutes (utilisateurs authentifiés)
- **Routes sensibles** : 1 000 requêtes par 15 minutes

#### Mode Production (`NODE_ENV=production`)
- **Global** : 100 requêtes par 15 minutes par IP
- **Authentification** : 5 tentatives de connexion par 15 minutes
- **Inscription** : 3 tentatives par heure
- **API protégée** : 1 000 requêtes par 15 minutes (utilisateurs authentifiés)
- **Routes sensibles** : 50 requêtes par 15 minutes

### Protection contre les attaques
- **Headers de sécurité** (Helmet)
- **Validation des types de contenu**
- **Limitation de taille des requêtes** (10MB max)
- **Détection de tentatives d'attaque** (XSS, SQL Injection, etc.)
- **CORS configuré**
- **Protection XSS et CSRF**

## Endpoints disponibles

### 📍 Routes publiques (pas besoin d'authentification)

#### 1. Route de base
- **URL:** `GET /`
- **Description:** Page d'accueil de l'API avec documentation
- **Réponse:**
```json
{
  "message": "Bienvenue sur l'API BrightPath!",
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "info": "Cette route est publique. Les autres routes nécessitent une authentification JWT.",
  "endpoints": {
    "public": ["GET /", "POST /api/auth/register", "POST /api/auth/login", "POST /api/auth/refresh"],
    "protected": ["GET /api/hello", "POST /api/data", "GET /api/data", "GET /api/data/:id", "GET /api/auth/me", "POST /api/auth/logout"]
  }
}
```

#### 2. Inscription
- **URL:** `POST /api/auth/register`
- **Body:** JSON avec `email`, `password`, `name` (tous requis)
- **Description:** Crée un nouveau compte utilisateur
- **Exemple:**
```json
{
  "email": "nouveau@example.com",
  "password": "motdepasse123",
  "name": "Nouveau Utilisateur"
}
```

#### 3. Connexion
- **URL:** `POST /api/auth/login`
- **Body:** JSON avec `email` et `password`
- **Description:** Authentifie un utilisateur et retourne les tokens
- **Exemple:**
```json
{
  "email": "admin@brightpath.com",
  "password": "password"
}
```
- **Réponse:**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "email": "admin@brightpath.com",
    "name": "Admin",
    "role": "admin"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4. Rafraîchissement de token
- **URL:** `POST /api/auth/refresh`
- **Body:** JSON avec `refreshToken`
- **Description:** Renouvelle l'access token avec le refresh token

### 🔒 Routes protégées (nécessitent JWT)

**Header requis:** `Authorization: Bearer <access_token>`

#### 5. Endpoint Hello protégé
- **URL:** `GET /api/hello`
- **Paramètres de requête:** `name` (optionnel)
- **Description:** Endpoint de salutation avec informations utilisateur
- **Réponse:**
```json
{
  "message": "Bonjour Alice! (Utilisateur authentifié: Admin)",
  "timestamp": "2024-01-01T12:00:00.000Z",
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

#### 6. Création de données
- **URL:** `POST /api/data`
- **Body:** JSON avec `title` (requis) et `description` (optionnel)
- **Description:** Crée une nouvelle entrée de données avec l'utilisateur connecté
- **Réponse:**
```json
{
  "message": "Données créées avec succès",
  "data": {
    "id": 1704067200000,
    "title": "Mon titre",
    "description": "Ma description",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "createdBy": {
      "id": 1,
      "name": "Admin"
    }
  }
}
```

#### 7. Récupération de données
- **URL:** `GET /api/data`
- **Description:** Récupère toutes les données de l'utilisateur connecté

#### 8. Récupération d'une donnée spécifique
- **URL:** `GET /api/data/:id`
- **Description:** Récupère une donnée spécifique par ID

#### 9. Profil utilisateur
- **URL:** `GET /api/auth/me`
- **Description:** Récupère le profil de l'utilisateur connecté

#### 10. Déconnexion
- **URL:** `POST /api/auth/logout`
- **Description:** Déconnecte l'utilisateur

### 📝 Gestion des Candidatures

#### 11. Créer une candidature
- **URL:** `POST /api/applications`
- **Body:** JSON avec les champs de la candidature
- **Description:** Crée une nouvelle candidature pour l'utilisateur connecté
- **Exemple:**
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

#### 12. Récupérer toutes les candidatures
- **URL:** `GET /api/applications`
- **Paramètres de requête:** `status`, `limit`, `offset`, `orderBy`, `orderDirection`
- **Description:** Récupère toutes les candidatures de l'utilisateur connecté

#### 13. Récupérer une candidature spécifique
- **URL:** `GET /api/applications/:id`
- **Description:** Récupère une candidature spécifique par ID

#### 14. Mettre à jour une candidature
- **URL:** `PUT /api/applications/:id`
- **Body:** JSON avec les champs à mettre à jour
- **Description:** Met à jour une candidature existante

#### 15. Supprimer une candidature
- **URL:** `DELETE /api/applications/:id`
- **Description:** Supprime une candidature

#### 16. Statistiques des candidatures
- **URL:** `GET /api/applications/stats`
- **Description:** Récupère les statistiques des candidatures (total, par statut, taux de réussite)

#### 17. Rechercher des candidatures
- **URL:** `GET /api/applications/search`
- **Paramètres de requête:** `company`, `position`, `status`, `dateFrom`, `dateTo`
- **Description:** Recherche des candidatures avec filtres

#### 18. Candidatures récentes
- **URL:** `GET /api/applications/recent`
- **Paramètres de requête:** `days` (défaut: 30)
- **Description:** Récupère les candidatures des derniers jours

#### 19. Compteurs par statut
- **URL:** `GET /api/applications/count`
- **Description:** Récupère le nombre de candidatures par statut

### 🤖 Intelligence Artificielle (ChatGPT)

L'API intègre des fonctionnalités d'IA pour assister les candidats dans leur recherche d'emploi. Toutes les routes IA nécessitent une authentification JWT et sont protégées par un rate limiting strict.

#### 20. Génération de lettres de motivation
- **URL:** `POST /api/ai/cover-letter`
- **Description:** Génère une lettre de motivation personnalisée et professionnelle
- **Body requis:**
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
- **Réponse:**
```json
{
  "message": "Lettre de motivation générée avec succès",
  "content": "Jean Dupont\n123 Rue de la Paix\n75001 Paris\njean.dupont@email.com\n06 12 34 56 78\n\n[Date]\n\nMme Martin\nResponsable RH\nTechStartup\n\nObjet : Candidature au poste de Développeur Full Stack React/Node.js\n\nMadame,\n\nSuite à votre annonce pour le poste de Développeur Full Stack React/Node.js, je me permets de vous présenter ma candidature...\n\n[Lettre complète générée par l'IA]",
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 312,
    "total_tokens": 557
  },
  "model": "gpt-3.5-turbo",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Test de l'API

### Avec curl

```bash
# Test de la route de base (publique)
curl http://localhost:3001/

# Test de connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@brightpath.com", "password": "password"}'

# Test d'inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# Test d'un endpoint protégé (nécessite le token)
# Remplacez <ACCESS_TOKEN> par le token reçu lors de la connexion
curl -X GET http://localhost:3001/api/hello \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Test de création de données (nécessite le token)
curl -X POST http://localhost:3001/api/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"title": "Test", "description": "Description de test"}'

# Test du profil utilisateur
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Test de génération de lettre de motivation (nécessite le token)
curl -X POST http://localhost:3001/api/ai/cover-letter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "position": "Développeur Full Stack React/Node.js",
    "company": "TechStartup",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@email.com",
    "telephone": "06 12 34 56 78",
    "adresse": "123 Rue de la Paix, 75001 Paris",
    "destinataire": "Mme Martin, Responsable RH"
  }'


```

### Avec un navigateur
Ouvrez simplement `http://localhost:3001` dans votre navigateur pour voir la documentation de l'API.

### Exemple de workflow complet

1. **Connexion pour obtenir un token:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@brightpath.com", "password": "password"}'
```

2. **Utiliser le token pour accéder aux routes protégées:**
```bash
# Remplacez <ACCESS_TOKEN> par le token reçu
curl -X GET http://localhost:3001/api/hello \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Structure du projet

```
brightpath_back/
├── package.json              # Dépendances et scripts
├── server.js                 # Serveur Express principal
├── README.md                 # Documentation
├── env.example               # Exemple de variables d'environnement
├── database/
│   ├── schema.sql            # Script SQL pour Supabase
│   └── applications_schema.sql # Script SQL pour les candidatures
└── src/
    ├── config/
    │   ├── jwt.js            # Configuration JWT
    │   ├── supabase.js       # Configuration Supabase
    │   ├── openai.js         # Configuration OpenAI et prompts IA
    │   └── rateLimit.js      # Configuration rate limiting
    ├── controllers/
    │   ├── authController.js # Contrôleur d'authentification
    │   ├── applicationController.js # Contrôleur des candidatures
    │   └── aiController.js   # Contrôleur des fonctionnalités IA
    ├── models/
    │   ├── User.js           # Modèle User pour Supabase
    │   └── Application.js    # Modèle Application pour Supabase
    ├── middleware/
    │   ├── auth.js           # Middleware d'authentification JWT
    │   ├── security.js       # Middleware de sécurité
    │   └── errorHandler.js   # Gestionnaire d'erreurs
    ├── routes/
    │   ├── authRoutes.js     # Routes d'authentification
    │   ├── apiRoutes.js      # Routes API protégées
    │   ├── applicationRoutes.js # Routes des candidatures
    │   └── aiRoutes.js       # Routes des fonctionnalités IA
    └── utils/
        ├── jwtUtils.js       # Utilitaires JWT
        └── aiUtils.js        # Utilitaires pour les fonctionnalités IA
```

## Technologies utilisées

- **Express.js** - Framework web pour Node.js
- **CORS** - Middleware pour gérer les requêtes cross-origin
- **JWT (jsonwebtoken)** - Authentification par tokens
- **bcryptjs** - Hachage sécurisé des mots de passe
- **Supabase** - Base de données PostgreSQL hébergée
- **express-rate-limit** - Protection contre les spams et attaques
- **Helmet** - Headers de sécurité
- **dotenv** - Gestion des variables d'environnement
- **Nodemon** - Outil de développement pour auto-reload
- **OpenAI** - Intelligence artificielle pour la génération de contenu 