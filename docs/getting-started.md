# 🚀 Guide de démarrage

Ce guide vous accompagne dans l'installation et la configuration de l'API BrightPath.

## 📋 Prérequis

### Logiciels requis
- **Node.js** 16.0.0 ou supérieur
- **npm** ou **yarn** pour la gestion des dépendances
- **Git** pour cloner le repository

### Comptes externes
- **Supabase** : Base de données PostgreSQL hébergée
- **OpenAI** : API pour les fonctionnalités d'IA

## 🔧 Installation

### 1. Cloner le repository
```bash
git clone <repository-url>
cd brightpath_back
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement
```bash
cp env.example .env
```

Éditez le fichier `.env` avec vos informations :

```env
# Configuration du serveur
PORT=3001
NODE_ENV=development

# Configuration JWT
JWT_SECRET=votre-secret-jwt-super-securise
JWT_REFRESH_SECRET=votre-refresh-secret-super-securise
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Configuration Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon-supabase

# Configuration OpenAI
OPENAI_API_KEY=votre-clé-api-openai
```

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `SUPABASE_URL` et `SUPABASE_ANON_KEY`

### 2. Configurer la base de données
1. Dans votre projet Supabase, allez dans l'éditeur SQL
2. Exécutez le script `database/schema.sql` pour créer la table `users`
3. Exécutez le script `database/applications_schema.sql` pour créer la table `applications`

## 🤖 Configuration OpenAI

### 1. Obtenir une clé API
1. Allez sur [platform.openai.com](https://platform.openai.com)
2. Créez un compte ou connectez-vous
3. Générez une nouvelle clé API
4. Ajoutez-la dans votre fichier `.env`

## 🚀 Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## ✅ Vérification de l'installation

### 1. Test de connexion
```bash
curl http://localhost:3001/
```

Réponse attendue :
```json
{
  "message": "Bienvenue sur l'API BrightPath!",
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Test de la base de données
Le serveur affiche automatiquement le statut de connexion à Supabase au démarrage.

### 3. Test de l'IA
Le serveur affiche automatiquement le statut de connexion à OpenAI au démarrage.

## 🔍 Dépannage

### Problèmes courants

#### Erreur de connexion à Supabase
- Vérifiez vos clés Supabase dans `.env`
- Assurez-vous que votre projet Supabase est actif

#### Erreur de connexion à OpenAI
- Vérifiez votre clé API OpenAI dans `.env`
- Assurez-vous d'avoir des crédits disponibles

#### Port déjà utilisé
- Changez le port dans `.env` : `PORT=3002`
- Ou arrêtez le processus qui utilise le port 3001

## 📚 Prochaines étapes

- Consultez le guide [Authentification](authentication.md)
- Explorez les [Endpoints API](endpoints.md)
- Découvrez les [Fonctionnalités IA](ai-features.md) 