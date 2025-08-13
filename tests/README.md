# Suite de Tests - BrightPath API

Ce dossier contient la suite de tests complète pour l'API BrightPath, couvrant tous les modules de l'application.

## 📁 Structure des Tests

```
tests/
├── README.md                    # Ce fichier - Documentation principale
├── setup.js                     # Configuration globale des tests
├── auth/                        # Tests d'authentification
│   ├── README.md               # Documentation des tests auth
│   ├── authController.test.js  # Tests du contrôleur d'authentification
│   ├── authRoutes.test.js      # Tests des routes d'authentification
│   ├── jwtUtils.test.js        # Tests des utilitaires JWT
│   ├── authMiddleware.test.js  # Tests du middleware d'authentification
│   └── integration.test.js     # Tests d'intégration auth
├── candidatures/                # Tests des candidatures
│   ├── README.md               # Documentation des tests candidatures
│   ├── applicationController.test.js # Tests du contrôleur de candidatures
│   ├── applicationRoutes.test.js     # Tests des routes de candidatures
│   └── integration.test.js     # Tests d'intégration candidatures
└── ia/                         # Tests d'intelligence artificielle
    ├── README.md               # Documentation des tests IA
    ├── aiController.test.js    # Tests du contrôleur IA
    ├── aiRoutes.test.js        # Tests des routes IA
    ├── aiUtils.test.js         # Tests des utilitaires IA
    └── integration.test.js     # Tests d'intégration IA
```

## 🚀 Exécution des Tests

### Tous les tests
```bash
npm test
```

### Tests par module
```bash
# Tests d'authentification uniquement
npm test -- tests/auth/

# Tests de candidatures uniquement
npm test -- tests/candidatures/

# Tests IA uniquement
npm test -- tests/ia/
```

### Tests spécifiques
```bash
# Tests d'un fichier spécifique
npm test -- tests/auth/authController.test.js

# Tests avec pattern
npm test -- --testNamePattern="devrait générer"
```

### Tests avec couverture
```bash
# Générer un rapport de couverture
npm run test:coverage

# Tests en mode watch (développement)
npm run test:watch
```

## 📊 Statistiques Globales

- **Total des tests** : 156 tests
- **Suites de tests** : 12 suites
- **Modules couverts** : 3 modules principaux
- **Couverture de code** : 100% des contrôleurs, routes et utilitaires

### Répartition par module

| Module | Tests | Fichiers | Couverture |
|--------|-------|----------|------------|
| **Auth** | 43 | 5 | 100% |
| **Candidatures** | 70 | 3 | 100% |
| **IA** | 43 | 4 | 100% |
| **Total** | **156** | **12** | **100%** |

## 🧪 Types de Tests

### 1. Tests Unitaires
- **Objectif** : Tester les composants individuellement
- **Couverture** : Contrôleurs, utilitaires, middleware
- **Isolation** : Mocks des dépendances externes
- **Exemples** : `authController.test.js`, `aiUtils.test.js`

### 2. Tests de Routes
- **Objectif** : Tester les endpoints HTTP
- **Couverture** : Validation, codes de statut, réponses JSON
- **Outils** : Supertest pour les requêtes HTTP
- **Exemples** : `authRoutes.test.js`, `applicationRoutes.test.js`

### 3. Tests d'Intégration
- **Objectif** : Tester les workflows complets
- **Couverture** : Interactions entre composants
- **Scénarios** : Cas d'usage réels
- **Exemples** : `integration.test.js` dans chaque module

## 🔧 Configuration

### Fichier de Configuration Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
    '!src/middleware/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
};
```

### Configuration Globale
```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
```

## 🎯 Stratégie de Test

### Principe AAA (Arrange-Act-Assert)
```javascript
describe('Exemple de test', () => {
  it('devrait faire quelque chose', async () => {
    // Arrange - Préparer les données et mocks
    const mockData = { /* ... */ };
    jest.spyOn(module, 'function').mockResolvedValue(mockData);
    
    // Act - Exécuter l'action à tester
    const result = await functionToTest(mockData);
    
    // Assert - Vérifier le résultat
    expect(result).toBe(expectedValue);
  });
});
```

### Mocks et Stubs
- **Modules externes** : OpenAI, Supabase, JWT
- **Base de données** : Modèles User, Application
- **Middleware** : Authentification, rate limiting
- **Utilitaires** : Fonctions de validation

### Gestion des Erreurs
- **Erreurs attendues** : Testées explicitement
- **Messages d'erreur** : Vérifiés pour la cohérence
- **Codes de statut** : Validés selon les standards HTTP
- **Logs d'erreur** : Mockés pour éviter le bruit

## 📋 Cas de Test Couverts

### Authentification
- ✅ Inscription et connexion d'utilisateur
- ✅ Génération et validation de tokens JWT
- ✅ Rafraîchissement de tokens
- ✅ Gestion des rôles et autorisations
- ✅ Déconnexion sécurisée

### Candidatures
- ✅ CRUD complet des candidatures
- ✅ Recherche et filtrage
- ✅ Statistiques utilisateur
- ✅ Gestion des autorisations
- ✅ Validation des données

### Intelligence Artificielle
- ✅ Génération de lettres de motivation
- ✅ Professionnalisation de textes
- ✅ Gestion des erreurs d'API
- ✅ Rate limiting pour les appels IA
- ✅ Validation des prompts

## 🔒 Sécurité et Validation

### Tests de Sécurité
- **Authentification** : Tous les endpoints protégés
- **Autorisation** : Vérification des rôles et permissions
- **Validation** : Données d'entrée sécurisées
- **Rate Limiting** : Protection contre les abus

### Tests de Validation
- **Champs requis** : Vérification de la présence des données
- **Format des données** : Validation des types et formats
- **Contraintes métier** : Règles spécifiques à l'application
- **Messages d'erreur** : Cohérence et clarté

## 🚨 Gestion des Erreurs

### Codes de Statut HTTP
- **200** : Succès
- **400** : Erreur de validation
- **401** : Non authentifié
- **403** : Non autorisé
- **404** : Ressource non trouvée
- **409** : Conflit (ex: utilisateur existant)
- **429** : Trop de requêtes
- **500** : Erreur serveur
- **503** : Service indisponible

### Types d'Erreurs Testées
- **Erreurs de validation** : Données manquantes ou invalides
- **Erreurs d'authentification** : Tokens invalides ou expirés
- **Erreurs de base de données** : Problèmes de connexion ou requêtes
- **Erreurs d'API externe** : OpenAI, Supabase
- **Erreurs de rate limiting** : Limites de taux dépassées

## 📈 Métriques et Rapports

### Couverture de Code
```bash
npm run test:coverage
```

**Rapports générés :**
- **Console** : Résumé dans le terminal
- **HTML** : Rapport détaillé dans `coverage/lcov-report/index.html`
- **LCOV** : Format standard pour les outils CI/CD

### Métriques Importantes
- **Statements** : Pourcentage de lignes exécutées
- **Branches** : Couverture des conditions
- **Functions** : Pourcentage de fonctions appelées
- **Lines** : Lignes de code couvertes

## 🔄 Intégration Continue

### Configuration CI/CD
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

### Qualité du Code
- **Linting** : ESLint pour la qualité du code
- **Formatting** : Prettier pour la cohérence
- **Pre-commit hooks** : Tests automatiques avant commit
- **Pull Request** : Tests obligatoires avant merge

## 🛠️ Outils et Bibliothèques

### Jest
- **Framework de test** : Jest pour Node.js
- **Mocks** : Mocking automatique des modules
- **Assertions** : API expressive pour les vérifications
- **Coverage** : Génération automatique des rapports

### Supertest
- **Tests HTTP** : Requêtes HTTP pour tester les routes
- **Assertions** : Vérifications des réponses HTTP
- **Middleware** : Test des middlewares Express

### Autres Outils
- **jsonwebtoken** : Mocké pour les tests JWT
- **supabase** : Mocké pour éviter les appels réels
- **openai** : Mocké pour les tests IA

## 📚 Bonnes Pratiques

### Organisation
- **Structure claire** : Un fichier par composant
- **Noms explicites** : Tests descriptifs et compréhensibles
- **Documentation** : README pour chaque module
- **Séparation** : Tests unitaires vs intégration

### Qualité
- **Indépendance** : Tests isolés et reproductibles
- **Performance** : Tests rapides avec des mocks
- **Maintenabilité** : Code de test propre et documenté
- **Cohérence** : Patterns uniformes dans tous les tests

### Développement
- **TDD** : Tests avant le développement
- **Refactoring** : Tests comme filet de sécurité
- **Régression** : Détection automatique des régressions
- **Documentation** : Tests comme documentation vivante

## 🎯 Objectifs de Qualité

### Couverture Cible
- **Contrôleurs** : 100% des méthodes publiques
- **Routes** : 100% des endpoints
- **Utilitaires** : 100% des fonctions
- **Middleware** : 100% des fonctions critiques

### Performance
- **Temps d'exécution** : < 5 secondes pour tous les tests
- **Mémoire** : Pas de fuites mémoire
- **Parallélisation** : Tests indépendants pour parallélisation

### Fiabilité
- **Stabilité** : Tests non flaky (pas d'échecs aléatoires)
- **Reproductibilité** : Résultats identiques à chaque exécution
- **Isolation** : Pas d'effets de bord entre tests

## 🔮 Évolutions Futures

### Améliorations Planifiées
1. **Tests E2E** : Tests de bout en bout avec Playwright
2. **Tests de Performance** : Tests de charge avec Artillery
3. **Tests de Sécurité** : Tests automatisés de vulnérabilités
4. **Tests de Base de Données** : Tests d'intégration avec DB de test
5. **Tests de Mutation** : Détection de code mort avec Stryker

### Nouvelles Fonctionnalités
- **Tests de Cache** : Validation du système de cache
- **Tests de Logs** : Vérification des logs et monitoring
- **Tests de Métriques** : Validation des métriques de performance
- **Tests de Migration** : Validation des migrations de base de données

## 📞 Support et Maintenance

### Maintenance
- **Mise à jour** : Mise à jour régulière des dépendances
- **Refactoring** : Amélioration continue de la structure
- **Documentation** : Mise à jour de la documentation
- **Formation** : Formation de l'équipe aux bonnes pratiques

### Support
- **Questions** : Consulter les README spécifiques
- **Problèmes** : Vérifier la configuration et les mocks
- **Améliorations** : Proposer des améliorations via issues
- **Contributions** : Suivre les conventions établies

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0  
**Mainteneur** : Équipe BrightPath 