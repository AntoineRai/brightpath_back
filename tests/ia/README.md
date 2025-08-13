# Tests IA

Ce dossier contient les tests unitaires et d'intégration pour le module d'intelligence artificielle.

## Structure des Tests

### 1. `aiController.test.js`
Tests unitaires pour le contrôleur IA.

**Fonctionnalités testées :**
- ✅ Génération de lettre de motivation (`generateCoverLetter`)
- ✅ Professionnalisation de texte (`professionalizeText`)

**Cas de test couverts :**
- Succès des opérations de génération IA
- Gestion des erreurs de validation des données
- Gestion des erreurs de l'API OpenAI
- Validation des champs requis
- Gestion des erreurs générales
- Structure des réponses JSON

### 2. `aiRoutes.test.js`
Tests unitaires pour les routes IA.

**Routes testées :**
- ✅ `POST /ai/cover-letter` - Génération de lettre de motivation
- ✅ `POST /ai/professionalize-text` - Professionnalisation de texte

**Cas de test couverts :**
- Validation des données d'entrée
- Gestion des rate limiters
- Codes de statut HTTP appropriés
- Réponses JSON correctes
- Authentification requise
- Gestion des erreurs de validation
- Validation des Content-Type

### 3. `aiUtils.test.js`
Tests unitaires pour les utilitaires IA.

**Fonctionnalités testées :**
- ✅ Génération de contenu (`generateContent`)
- ✅ Remplacement de variables (`replaceVariables`)
- ✅ Génération de lettre de motivation (`generateCoverLetter`)
- ✅ Professionnalisation de texte (`professionalizeText`)

**Cas de test couverts :**
- Génération de contenu avec succès
- Gestion des erreurs de l'API OpenAI
- Gestion des types de prompt non reconnus
- Remplacement de variables dans les templates
- Gestion des variables manquantes
- Validation des champs requis
- Gestion des erreurs de génération

### 4. `integration.test.js`
Tests d'intégration pour les workflows IA complets.

**Scénarios testés :**
- ✅ Workflow complet de génération de lettre de motivation
- ✅ Workflow complet de professionnalisation de texte
- ✅ Gestion des tentatives multiples avec rate limiting
- ✅ Gestion des textes longs et courts
- ✅ Gestion des autorisations et rôles
- ✅ Gestion des erreurs avancées
- ✅ Validation des structures de réponses

## Exécution des Tests

### Tous les tests IA
```bash
npm test -- tests/ia/
```

### Tests spécifiques
```bash
# Tests du contrôleur uniquement
npm test -- tests/ia/aiController.test.js

# Tests des routes uniquement
npm test -- tests/ia/aiRoutes.test.js

# Tests des utilitaires uniquement
npm test -- tests/ia/aiUtils.test.js

# Tests d'intégration uniquement
npm test -- tests/ia/integration.test.js
```

## Couverture de Code

Les tests couvrent :
- **Contrôleur** : 100% des méthodes publiques
- **Routes** : 100% des endpoints
- **Utilitaires** : 100% des fonctions
- **Intégration** : Workflows complets et cas d'erreur

## Mocks Utilisés

### Contrôleur
- `AIUtils` - Mocké pour isoler la logique métier

### Routes
- `aiController` - Mocké pour tester le routage
- `rateLimiters` - Mocké pour éviter les limitations
- `authenticateToken` - Mocké pour tester l'authentification

### Utilitaires
- `openai` - Mocké pour tester les appels à l'API OpenAI
- `defaultPrompts` - Configuration des prompts utilisée dans les tests

### Intégration
- Même mocks que les routes pour tester les workflows complets

## Cas de Test Importants

### Sécurité
- ✅ Authentification requise pour toutes les routes IA
- ✅ Rate limiting pour éviter les abus
- ✅ Validation des données d'entrée
- ✅ Gestion des erreurs d'API externes
- ✅ Protection contre les requêtes malveillantes

### Validation
- ✅ Champs requis pour la génération de lettre de motivation
- ✅ Format des données d'entrée
- ✅ Validation du texte à professionnaliser
- ✅ Gestion des données manquantes ou invalides

### Gestion d'Erreurs
- ✅ Erreurs 400 pour validation
- ✅ Erreurs 401 pour authentification
- ✅ Erreurs 429 pour rate limiting
- ✅ Erreurs 500 pour erreurs serveur
- ✅ Erreurs 503 pour service indisponible
- ✅ Erreurs 408 pour timeouts

### Fonctionnalités Métier
- ✅ Génération de lettres de motivation personnalisées
- ✅ Professionnalisation de textes pour CV
- ✅ Gestion des tokens d'utilisation OpenAI
- ✅ Suivi des modèles utilisés
- ✅ Horodatage des générations

## Configuration OpenAI

### Variables d'Environnement Testées
- `OPENAI_API_KEY` - Clé API OpenAI (mockée)
- Modèles disponibles : `gpt-3.5-turbo`, `gpt-4`

### Paramètres de Génération
- `max_tokens: 1000` - Limite de tokens par génération
- `temperature: 0.7` - Créativité modérée
- `top_p: 0.9` - Contrôle de la diversité

### Prompts Testés
- **Lettre de motivation** : Template avec variables {position}, {company}, {nom}, {prenom}, etc.
- **Professionnalisation** : Template pour améliorer les textes CV

## Notes Techniques

### Messages d'Erreur
Les messages d'erreur dans la console sont normaux et attendus pour les tests qui vérifient la gestion d'erreurs.

### API OpenAI
- Les tests utilisent des mocks pour éviter les appels réels à l'API
- Les réponses sont simulées pour tester différents scénarios
- Les erreurs d'API sont testées pour la robustesse

### Rate Limiting
- Les rate limiters sont mockés pour éviter les limitations pendant les tests
- Les tests vérifient que les limiters sont appliqués aux routes IA
- Simulation des limites de taux pour tester la gestion des erreurs 429

### Validation des Données
- Tests de validation des champs requis pour les lettres de motivation
- Tests de validation du texte à professionnaliser
- Gestion des données vides ou mal formatées

### Structure des Réponses
- Validation de la structure JSON des réponses
- Vérification des propriétés requises (message, content, usage, model, generatedAt)
- Validation des types de données retournées

## Fonctionnalités Testées

### Génération de Lettre de Motivation
- **Champs requis** : position, company, nom, prenom, email, telephone, adresse
- **Validation** : Vérification de la présence de tous les champs
- **Génération** : Appel à l'API OpenAI avec les données formatées
- **Réponse** : Lettre personnalisée avec métadonnées d'utilisation

### Professionnalisation de Texte
- **Champ requis** : originalText
- **Validation** : Vérification de la présence du texte
- **Génération** : Amélioration du texte via IA
- **Réponse** : Texte professionnalisé avec métadonnées

### Gestion des Erreurs
- **Erreurs de validation** : Champs manquants ou invalides
- **Erreurs d'API** : Problèmes avec OpenAI
- **Erreurs de service** : Indisponibilité temporaire
- **Erreurs de timeout** : Délais d'attente dépassés

## Améliorations Futures

1. **Tests de Performance** : Tests de charge pour les appels IA
2. **Tests de Sécurité** : Tests de vulnérabilités (injection de prompts, etc.)
3. **Tests de Modèles** : Tests avec différents modèles OpenAI
4. **Tests de Prompts** : Tests avec des prompts personnalisés
5. **Tests de Tokens** : Tests de gestion des limites de tokens
6. **Tests de Cache** : Tests pour la mise en cache des réponses
7. **Tests de Logs** : Tests pour la journalisation des appels IA
8. **Tests de Métriques** : Tests pour le suivi des utilisations
9. **Tests de Fallback** : Tests pour les mécanismes de secours
10. **Tests de Coût** : Tests pour le suivi des coûts d'utilisation 