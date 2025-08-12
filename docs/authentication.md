# 🔐 Authentification JWT

L'API BrightPath utilise un système d'authentification JWT (JSON Web Token) sécurisé avec deux types de tokens.

## 🎯 Vue d'ensemble

### Types de tokens
- **Access Token** : Valide 15 minutes, utilisé pour les requêtes API
- **Refresh Token** : Valide 7 jours, utilisé pour renouveler l'access token

### Sécurité
- Tokens signés avec des secrets sécurisés
- Validation automatique sur toutes les routes protégées
- Gestion automatique de l'expiration

## 📝 Endpoints d'authentification

### 1. Inscription
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

**Réponse :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nom Utilisateur",
    "role": "user"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Connexion
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

**Réponse :** Même format que l'inscription

### 3. Rafraîchissement de token
```http
POST /api/auth/refresh
```

**Body :**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse :**
```json
{
  "message": "Token renouvelé avec succès",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Déconnexion
```http
POST /api/auth/logout
```

**Headers :** `Authorization: Bearer <access_token>`

### 5. Profil utilisateur
```http
GET /api/auth/me
```

**Headers :** `Authorization: Bearer <access_token>`

**Réponse :**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nom Utilisateur",
    "role": "user"
  }
}
```

## 🔧 Utilisation des tokens

### Headers requis
Pour toutes les routes protégées, ajoutez le header :
```http
Authorization: Bearer <access_token>
```

### Exemple avec curl
```bash
curl -X GET http://localhost:3001/api/hello \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## ⚠️ Gestion des erreurs

### Token expiré (401)
```json
{
  "error": "Token d'accès expiré",
  "status": 401
}
```

**Solution :** Utilisez le refresh token pour obtenir un nouveau access token.

### Token invalide (401)
```json
{
  "error": "Token d'accès invalide",
  "status": 401
}
```

**Solution :** Reconnectez-vous pour obtenir de nouveaux tokens.

### Refresh token expiré (401)
```json
{
  "error": "Refresh token expiré",
  "status": 401
}
```

**Solution :** L'utilisateur doit se reconnecter.

## 🔄 Workflow d'authentification

### 1. Première connexion
```mermaid
sequenceDiagram
    Client->>API: POST /auth/login
    API->>DB: Vérifier credentials
    API->>Client: Access Token + Refresh Token
```

### 2. Utilisation normale
```mermaid
sequenceDiagram
    Client->>API: Request + Access Token
    API->>Client: Response
```

### 3. Token expiré
```mermaid
sequenceDiagram
    Client->>API: Request + Expired Token
    API->>Client: 401 Unauthorized
    Client->>API: POST /auth/refresh
    API->>Client: New Access Token
    Client->>API: Request + New Token
    API->>Client: Response
```

## 🛡️ Bonnes pratiques

### Côté client
- Stockez les tokens de manière sécurisée
- Surveillez l'expiration des tokens
- Utilisez automatiquement le refresh token
- Gérez les erreurs d'authentification

### Côté serveur
- Tokens signés avec des secrets forts
- Expiration courte pour les access tokens
- Validation automatique sur toutes les routes protégées
- Logs de sécurité pour les tentatives d'accès

## 🔍 Utilisateurs de test

Après avoir exécuté les scripts SQL, vous aurez accès à :
- **Admin:** `admin@brightpath.com` / `password`
- **User:** `user@brightpath.com` / `password` 