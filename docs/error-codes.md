# ⚠️ Codes d'erreur

Guide complet des codes d'erreur et des solutions pour l'API BrightPath.

## 🎯 Vue d'ensemble

### Structure des réponses d'erreur
Toutes les erreurs suivent le même format :
```json
{
  "error": "Description de l'erreur",
  "status": 400,
  "details": "Informations supplémentaires (optionnel)"
}
```

## 🔢 Codes de statut HTTP

### 2xx - Succès
- **200 OK** : Requête réussie
- **201 Created** : Ressource créée avec succès

### 4xx - Erreurs client

#### 400 Bad Request
**Description :** Requête malformée ou données invalides

**Causes courantes :**
- Champs requis manquants
- Format JSON invalide
- Types de données incorrects
- Validation échouée

**Exemple :**
```json
{
  "error": "Champs requis manquants: email, password",
  "status": 400
}
```

**Solutions :**
- Vérifiez que tous les champs requis sont présents
- Validez le format JSON
- Consultez la documentation de l'endpoint

#### 401 Unauthorized
**Description :** Authentification requise ou échouée

**Causes courantes :**
- Token JWT manquant
- Token JWT expiré
- Token JWT invalide
- Refresh token expiré

**Exemples :**
```json
{
  "error": "Token d'accès requis",
  "status": 401
}
```

```json
{
  "error": "Token d'accès expiré",
  "status": 401
}
```

**Solutions :**
- Ajoutez le header `Authorization: Bearer <token>`
- Utilisez le refresh token pour obtenir un nouveau access token
- Reconnectez-vous si le refresh token est expiré

#### 403 Forbidden
**Description :** Accès interdit

**Causes courantes :**
- Permissions insuffisantes
- Ressource appartenant à un autre utilisateur

**Solution :**
- Vérifiez vos permissions
- Contactez l'administrateur

#### 404 Not Found
**Description :** Ressource non trouvée

**Causes courantes :**
- Endpoint inexistant
- ID de ressource invalide
- Route mal orthographiée

**Exemple :**
```json
{
  "error": "Route non trouvée",
  "path": "/api/invalid-endpoint",
  "status": 404
}
```

**Solutions :**
- Vérifiez l'URL de l'endpoint
- Consultez la documentation des endpoints
- Vérifiez que l'ID de ressource existe

#### 413 Payload Too Large
**Description :** Données trop volumineuses

**Causes courantes :**
- Fichier trop grand
- Body de requête trop volumineux

**Exemple :**
```json
{
  "error": "Payload trop volumineux",
  "status": 413,
  "maxSize": "10MB"
}
```

**Solutions :**
- Réduisez la taille des données
- Compressez les fichiers si nécessaire

#### 415 Unsupported Media Type
**Description :** Type de contenu non supporté

**Causes courantes :**
- Header `Content-Type` manquant ou incorrect
- Format de données non supporté

**Exemple :**
```json
{
  "error": "Type de contenu non supporté. Utilisez application/json",
  "status": 415
}
```

**Solutions :**
- Ajoutez `Content-Type: application/json`
- Vérifiez le format des données

#### 429 Too Many Requests
**Description :** Trop de requêtes (rate limiting)

**Causes courantes :**
- Dépassement des limites de rate limiting
- Comportement de spam détecté

**Exemple :**
```json
{
  "error": "Trop de requêtes. Veuillez réessayer plus tard.",
  "status": 429,
  "retryAfter": 60,
  "limit": 100,
  "windowMs": 900000
}
```

**Solutions :**
- Attendez le temps indiqué dans `retryAfter`
- Réduisez la fréquence des requêtes
- Implémentez une logique de retry avec backoff

### 5xx - Erreurs serveur

#### 500 Internal Server Error
**Description :** Erreur interne du serveur

**Causes courantes :**
- Erreur de base de données
- Erreur de configuration
- Bug dans le code

**Exemple :**
```json
{
  "error": "Erreur lors de la génération de la lettre de motivation",
  "status": 500
}
```

**Solutions :**
- Réessayez la requête
- Contactez l'équipe de support
- Vérifiez les logs du serveur

## 🔍 Erreurs spécifiques par domaine

### Authentification

#### Erreur de connexion
```json
{
  "error": "Email ou mot de passe incorrect",
  "status": 401
}
```

**Solution :** Vérifiez vos identifiants

#### Utilisateur déjà existant
```json
{
  "error": "Un utilisateur avec cet email existe déjà",
  "status": 400
}
```

**Solution :** Utilisez un autre email ou connectez-vous

### Candidatures

#### Candidature non trouvée
```json
{
  "error": "Candidature non trouvée",
  "status": 404
}
```

**Solution :** Vérifiez l'ID de la candidature

#### Validation des données
```json
{
  "error": "Les champs company, position et application_date sont requis",
  "status": 400
}
```

**Solution :** Remplissez tous les champs obligatoires

### Intelligence Artificielle

#### Clé API manquante
```json
{
  "error": "Clé API OpenAI manquante",
  "status": 500
}
```

**Solution :** Configurez la variable `OPENAI_API_KEY`

#### Erreur OpenAI
```json
{
  "error": "Erreur lors de la génération de contenu: Rate limit exceeded",
  "status": 500
}
```

**Solution :** Attendez et réessayez, ou vérifiez vos crédits OpenAI

## 🛠️ Dépannage

### Vérifications générales

1. **Vérifiez l'URL** : Assurez-vous que l'endpoint est correct
2. **Vérifiez les headers** : `Content-Type` et `Authorization` si nécessaire
3. **Vérifiez le body** : Format JSON valide et champs requis
4. **Vérifiez l'authentification** : Token JWT valide et non expiré

### Logs de débogage

En mode développement, les erreurs incluent plus de détails :
```json
{
  "error": "Erreur de validation",
  "status": 400,
  "stack": "Error: Validation failed...",
  "details": { ... }
}
```

### Outils de test

Utilisez ces commandes pour tester les endpoints :

```bash
# Test de connexion
curl -v http://localhost:3001/

# Test d'authentification
curl -v -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## 📞 Support

Si vous rencontrez une erreur non documentée :

1. **Consultez les logs** du serveur
2. **Vérifiez la documentation** de l'endpoint
3. **Ouvrez une issue** sur GitHub avec :
   - Code d'erreur complet
   - Requête qui cause l'erreur
   - Logs du serveur (si disponibles) 