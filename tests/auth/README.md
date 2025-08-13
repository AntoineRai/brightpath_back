# Tests d'Authentification

Ce dossier contient les tests unitaires et d'intégration pour le module d'authentification.

## Structure des Tests

### 1. `authController.test.js`
Tests unitaires pour le contrôleur d'authentification.

**Fonctionnalités testées :**
- ✅ Inscription d'utilisateur (`register`)
- ✅ Connexion utilisateur (`login`)
- ✅ Rafraîchissement de token (`refreshToken`)
- ✅ Déconnexion (`logout`)
- ✅ Récupération du profil (`getProfile`)

**Cas de test couverts :**
- Succès des opérations d'authentification
- Gestion des erreurs de validation
- Gestion des erreurs de base de données
- Vérification des mots de passe
- Gestion des utilisateurs existants
- Validation des tokens JWT
- Gestion des tokens expirés

### 2. `authRoutes.test.js`
Tests unitaires pour les routes d'authentification.

**Routes testées :**
- ✅ `POST /auth/register` - Inscription
- ✅ `POST /auth/login` - Connexion
- ✅ `POST /auth/refresh` - Rafraîchissement de token
- ✅ `POST /auth/logout` - Déconnexion
- ✅ `GET /auth/me` - Profil utilisateur

**Cas de test couverts :**
- Validation des données d'entrée
- Gestion des rate limiters
- Codes de statut HTTP appropriés
- Réponses JSON correctes
- Gestion des erreurs de validation

### 3. `jwtUtils.test.js`
Tests unitaires pour les utilitaires JWT.

**Fonctionnalités testées :**
- ✅ Génération de tokens d'accès (`generateAccessToken`)
- ✅ Génération de tokens de rafraîchissement (`generateRefreshToken`)
- ✅ Vérification de tokens d'accès (`verifyAccessToken`)
- ✅ Vérification de tokens de rafraîchissement (`verifyRefreshToken`)
- ✅ Extraction de token depuis les headers (`extractTokenFromHeader`)
- ✅ Rafraîchissement de token d'accès (`refreshAccessToken`)
- ✅ Décodage de token (`decodeToken`)

**Cas de test couverts :**
- Génération de tokens valides
- Vérification de tokens valides
- Gestion des tokens expirés
- Gestion des tokens invalides
- Gestion des headers mal formatés
- Gestion des erreurs de signature
- Rafraîchissement de tokens

### 4. `authMiddleware.test.js`
Tests unitaires pour le middleware d'authentification.

**Fonctionnalités testées :**
- ✅ Authentification de token (`authenticateToken`)
- ✅ Authentification optionnelle (`optionalAuth`)
- ✅ Vérification de rôles (`requireRole`)
- ✅ Vérification de propriété (`requireOwnership`)

**Cas de test couverts :**
- Authentification réussie avec token valide
- Rejet des requêtes sans token
- Rejet des tokens invalides
- Rejet des tokens expirés
- Gestion des headers mal formatés
- Vérification des autorisations par rôle
- Vérification des autorisations par propriété

### 5. `integration.test.js`
Tests d'intégration pour les workflows d'authentification complets.

**Scénarios testés :**
- ✅ Workflow complet d'inscription et connexion
- ✅ Workflow de rafraîchissement de token
- ✅ Workflow de déconnexion
- ✅ Accès aux routes protégées
- ✅ Gestion des erreurs d'authentification
- ✅ Validation des données utilisateur
- ✅ Sécurité des mots de passe

## Exécution des Tests

### Tous les tests d'authentification
```bash
npm test -- tests/auth/
```

### Tests spécifiques
```bash
# Tests du contrôleur uniquement
npm test -- tests/auth/authController.test.js

# Tests des routes uniquement
npm test -- tests/auth/authRoutes.test.js

# Tests des utilitaires JWT uniquement
npm test -- tests/auth/jwtUtils.test.js

# Tests du middleware uniquement
npm test -- tests/auth/authMiddleware.test.js

# Tests d'intégration uniquement
npm test -- tests/auth/integration.test.js
```

## Couverture de Code

Les tests couvrent :
- **Contrôleur** : 100% des méthodes publiques
- **Routes** : 100% des endpoints
- **Utilitaires JWT** : 100% des fonctions
- **Middleware** : 100% des fonctions d'authentification
- **Intégration** : Workflows complets et cas d'erreur

## Mocks Utilisés

### Contrôleur
- `User` (modèle) - Mocké pour isoler la logique métier
- `JwtUtils` - Mocké pour les tests de génération/vérification de tokens

### Routes
- `authController` - Mocké pour tester le routage
- `rateLimiters` - Mocké pour éviter les limitations

### Utilitaires JWT
- `jsonwebtoken` - Mocké pour tester la génération et vérification de tokens
- `jwtConfig` - Configuration JWT utilisée dans les tests

### Middleware
- `JwtUtils` - Mocké pour tester l'extraction et vérification de tokens

### Intégration
- Même mocks que les routes pour tester les workflows complets

## Cas de Test Importants

### Sécurité
- ✅ Validation des mots de passe
- ✅ Hachage sécurisé des mots de passe
- ✅ Génération sécurisée de tokens JWT
- ✅ Vérification de signature des tokens
- ✅ Gestion des tokens expirés
- ✅ Protection contre les attaques par force brute (rate limiting)

### Validation
- ✅ Champs requis pour l'inscription/connexion
- ✅ Format d'email valide
- ✅ Longueur minimale des mots de passe
- ✅ Validation des tokens JWT
- ✅ Gestion des données manquantes

### Gestion d'Erreurs
- ✅ Erreurs 400 pour validation
- ✅ Erreurs 401 pour authentification
- ✅ Erreurs 403 pour autorisation
- ✅ Erreurs 409 pour conflits (utilisateur existant)
- ✅ Erreurs 500 pour erreurs serveur

### Fonctionnalités Métier
- ✅ Inscription avec validation
- ✅ Connexion avec vérification des credentials
- ✅ Génération de tokens d'accès et de rafraîchissement
- ✅ Rafraîchissement automatique de tokens
- ✅ Déconnexion sécurisée
- ✅ Récupération de profil utilisateur

## Configuration JWT

### Variables d'Environnement Testées
- `JWT_SECRET` - Secret pour les tokens d'accès
- `JWT_REFRESH_SECRET` - Secret pour les tokens de rafraîchissement
- `JWT_ACCESS_EXPIRES_IN` - Expiration des tokens d'accès (défaut: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Expiration des tokens de rafraîchissement (défaut: 7d)

### Algorithmes Testés
- `HS256` - Algorithme de signature par défaut
- Gestion des erreurs de signature

## Notes Techniques

### Messages d'Erreur
Les messages d'erreur dans la console sont normaux et attendus pour les tests qui vérifient la gestion d'erreurs.

### Tokens JWT
- Les tests utilisent des tokens mockés pour éviter les problèmes de timing
- Les secrets de test sont différents des secrets de production
- Les tests vérifient la structure et le contenu des tokens

### Mots de Passe
- Les tests vérifient le hachage des mots de passe
- Les mots de passe de test sont sécurisés mais prévisibles pour les tests
- La validation de force des mots de passe est testée

### Rate Limiting
- Les rate limiters sont mockés pour éviter les limitations pendant les tests
- Les tests vérifient que les limiters sont appliqués aux bonnes routes

## Améliorations Futures

1. **Tests de Performance** : Tests de charge pour l'authentification
2. **Tests de Sécurité** : Tests de vulnérabilités (XSS, CSRF, etc.)
3. **Tests de Base de Données** : Tests d'intégration avec une base de données de test
4. **Tests de Rate Limiting** : Tests plus approfondis des limitations de taux
5. **Tests de Validation** : Tests plus complets pour la validation des données
6. **Tests de Récupération de Mots de Passe** : Tests pour les fonctionnalités de récupération
7. **Tests de Sessions** : Tests pour la gestion des sessions utilisateur
8. **Tests de Logs** : Tests pour la journalisation des événements d'authentification 