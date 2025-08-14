# 📚 Documentation API BrightPath

Bienvenue dans la documentation de l'API BrightPath ! Cette documentation vous guidera à travers toutes les fonctionnalités disponibles.

## 🗂️ Structure de la documentation

### 📖 Guides principaux
- **[Guide de démarrage](getting-started.md)** - Installation et configuration
- **[Authentification](authentication.md)** - Système JWT et gestion des utilisateurs
- **[Endpoints API](endpoints.md)** - Tous les endpoints disponibles
- **[Intelligence Artificielle](ai-features.md)** - Fonctionnalités IA (ChatGPT)

### 🔧 Guides techniques
- **[Architecture](architecture.md)** - Structure du projet et organisation
- **[Sécurité](security.md)** - Rate limiting, protection contre les attaques
- **[Base de données](database.md)** - Configuration Supabase et schémas
- **[Déploiement](deployment.md)** - Guide de déploiement en production

### 📋 Références
- **[Codes d'erreur](error-codes.md)** - Liste des codes d'erreur et solutions
- **[Exemples d'utilisation](examples.md)** - Exemples concrets d'utilisation
- **[FAQ](faq.md)** - Questions fréquemment posées

## 🚀 Démarrage rapide

### Prérequis
- Node.js 16+ 
- Compte Supabase
- Clé API OpenAI

### Installation
```bash
git clone <repository>
cd brightpath_back
npm install
cp env.example .env
# Configurez vos variables d'environnement
npm run dev
```

### Test rapide
```bash
# Test de connexion
curl http://localhost:3001/

# Création d'un compte
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

## 🎯 Fonctionnalités principales

### 🔐 Authentification JWT
- Tokens d'accès et de rafraîchissement
- Gestion sécurisée des sessions
- Middleware d'authentification

### 📝 Gestion des candidatures
- CRUD complet des candidatures
- Recherche et filtrage
- Statistiques et analyses

### 🤖 Intelligence Artificielle
- Génération de lettres de motivation
- Professionnalisation de textes pour CV
- Intégration ChatGPT

### 🛡️ Sécurité
- Rate limiting adaptatif
- Protection contre les attaques
- Validation des données

## 📞 Support

Pour toute question ou problème :
- Consultez la [FAQ](faq.md)
- Vérifiez les [codes d'erreur](error-codes.md)
- Ouvrez une issue sur GitHub
