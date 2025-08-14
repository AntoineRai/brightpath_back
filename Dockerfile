# Utilisation d'une image Node.js officielle avec Alpine Linux pour réduire la taille
FROM node:18-alpine AS base

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Définition du répertoire de travail
WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache dumb-init

# Copie des fichiers de dépendances
COPY package*.json ./

# Stage de développement pour installer les dépendances
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Stage de build pour les tests et la compilation si nécessaire
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run test

# Stage de production
FROM base AS production

# Copie des dépendances de production depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copie du code source
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package.json ./

# Copie des fichiers de configuration nécessaires
COPY --from=builder /app/database ./database
COPY --from=builder /app/docs ./docs

# Changement de propriétaire pour la sécurité
RUN chown -R nodejs:nodejs /app

# Passage à l'utilisateur non-root
USER nodejs

# Exposition du port
EXPOSE 3001

# Utilisation de dumb-init pour gérer les signaux correctement
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "server.js"]

# Labels pour la documentation
LABEL maintainer="BrightPath Team"
LABEL version="1.0.0"
LABEL description="API BrightPath avec authentification et fonctionnalités IA"
