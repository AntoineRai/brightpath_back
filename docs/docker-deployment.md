# 🐳 Déploiement Docker - BrightPath API

Ce guide explique comment déployer l'API BrightPath en utilisant Docker.

## 📋 Prérequis

- Docker installé sur votre machine
- Docker Compose installé
- Variables d'environnement configurées

## 🚀 Déploiement rapide

### 1. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Copiez le fichier d'exemple
cp env.example .env
```

Modifiez le fichier `.env` avec vos vraies valeurs :

```env
# Configuration du serveur
PORT=3001
NODE_ENV=production

# Configuration JWT (GÉNÉREZ DES SECRETS SÉCURISÉS !)
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi-en-production
JWT_REFRESH_SECRET=votre-refresh-secret-super-securise-changez-moi-en-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Configuration Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon-supabase

# Configuration OpenAI
OPENAI_API_KEY=votre-clé-api-openai

# Configuration CORS
CORS_ORIGIN=*
```

### 2. Construction et démarrage avec Docker Compose

```bash
# Construction de l'image et démarrage des services
docker-compose up --build

# Ou en mode détaché (en arrière-plan)
docker-compose up --build -d
```

### 3. Vérification du déploiement

```bash
# Vérifier que le conteneur fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f brightpath-api

# Tester l'API
curl http://localhost:3001/
```

## 🔧 Commandes Docker utiles

### Construction de l'image manuellement

```bash
# Construction de l'image
docker build -t brightpath-api .

# Exécution du conteneur
docker run -p 3001:3001 --env-file .env brightpath-api
```

### Gestion des conteneurs

```bash
# Arrêter les services
docker-compose down

# Redémarrer les services
docker-compose restart

# Supprimer les conteneurs et volumes
docker-compose down -v

# Voir les logs en temps réel
docker-compose logs -f
```

### Nettoyage

```bash
# Supprimer les images non utilisées
docker image prune

# Supprimer tous les conteneurs arrêtés
docker container prune

# Nettoyage complet
docker system prune -a
```

## 🏗️ Architecture Docker

Le Dockerfile utilise une approche multi-stage pour optimiser la taille de l'image :

1. **Stage base** : Image Node.js Alpine avec utilisateur non-root
2. **Stage deps** : Installation des dépendances de production
3. **Stage builder** : Tests et compilation
4. **Stage production** : Image finale optimisée

### Caractéristiques de sécurité

- ✅ Utilisateur non-root (nodejs:1001)
- ✅ dumb-init pour la gestion des signaux
- ✅ Image Alpine Linux (plus légère et sécurisée)
- ✅ Variables d'environnement externalisées
- ✅ Health checks intégrés

## 📊 Monitoring et logs

### Health Check

Le conteneur inclut un health check qui vérifie l'endpoint `/` :

```bash
# Vérifier le statut de santé
docker inspect brightpath-api | grep Health -A 10
```

### Logs structurés

```bash
# Suivre les logs en temps réel
docker-compose logs -f brightpath-api

# Logs avec timestamps
docker-compose logs -f --timestamps brightpath-api
```

## 🔒 Sécurité en production

### Variables d'environnement sensibles

⚠️ **IMPORTANT** : Ne jamais commiter le fichier `.env` dans Git !

```bash
# Utiliser des secrets Docker en production
docker secret create jwt_secret ./secrets/jwt_secret.txt
docker secret create supabase_key ./secrets/supabase_key.txt
```

### Configuration réseau

```yaml
# Dans docker-compose.prod.yml
services:
  brightpath-api:
    networks:
      - internal
      - external

networks:
  internal:
    internal: true
  external:
    driver: bridge
```

## 🚀 Déploiement en production

### Avec Docker Swarm

```bash
# Initialiser Docker Swarm
docker swarm init

# Déployer le stack
docker stack deploy -c docker-compose.yml brightpath
```

### Avec Kubernetes

```bash
# Créer les secrets Kubernetes
kubectl create secret generic brightpath-secrets \
  --from-file=jwt_secret=./secrets/jwt_secret.txt \
  --from-file=supabase_key=./secrets/supabase_key.txt

# Déployer l'application
kubectl apply -f k8s/
```

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé** :
   ```bash
   # Changer le port dans docker-compose.yml
   ports:
     - "3002:3001"
   ```

2. **Variables d'environnement manquantes** :
   ```bash
   # Vérifier les variables
   docker-compose config
   ```

3. **Permissions de fichiers** :
   ```bash
   # Corriger les permissions
   sudo chown -R $USER:$USER .
   ```

### Debug du conteneur

```bash
# Accéder au conteneur en mode interactif
docker-compose exec brightpath-api sh

# Vérifier les processus
docker-compose exec brightpath-api ps aux

# Vérifier les variables d'environnement
docker-compose exec brightpath-api env
```

## 📚 Ressources supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Alpine Linux](https://alpinelinux.org/)
