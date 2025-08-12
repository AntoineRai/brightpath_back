# 🤖 Fonctionnalités Intelligence Artificielle

L'API BrightPath intègre des fonctionnalités d'IA basées sur ChatGPT pour assister les candidats dans leur recherche d'emploi.

## 🎯 Vue d'ensemble

### Technologies utilisées
- **OpenAI GPT-3.5-turbo** : Modèle principal pour la génération de contenu
- **Prompts optimisés** : Templates spécialisés pour chaque fonctionnalité
- **Rate limiting** : Protection contre l'abus des ressources IA

### Fonctionnalités disponibles
1. **Génération de lettres de motivation**
2. **Professionnalisation de textes pour CV**

## 📝 Génération de lettres de motivation

### Endpoint
```http
POST /api/ai/cover-letter
```

### Paramètres requis
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

### Exemple de réponse
```json
{
  "message": "Lettre de motivation générée avec succès",
  "content": "Objet : Candidature au poste de Développeur Full Stack React/Node.js\n\nMadame,\n\nSuite à votre annonce pour le poste de Développeur Full Stack React/Node.js, je me permets de vous présenter ma candidature...",
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 312,
    "total_tokens": 557
  },
  "model": "gpt-3.5-turbo",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Caractéristiques
- **Personnalisation** : Adaptée au poste et à l'entreprise
- **Structure professionnelle** : Introduction, développement, conclusion
- **Ton approprié** : Professionnel mais chaleureux
- **Longueur optimale** : 300-400 mots

## 🔧 Professionnalisation de textes pour CV

### Endpoint
```http
POST /api/ai/professionalize-text
```

### Paramètres requis
```json
{
  "originalText": "Pendant mon alternance à Cap Habitat j'ai eu l'occasion de bosser dans plusieurs domaines",
  "context": "Développeur web, alternance"
}
```

### Exemple de réponse
```json
{
  "message": "Texte professionnalisé avec succès",
  "content": "Dans le cadre de mon alternance chez Cap Habitat, j'ai pu développer une expertise polyvalente en intervenant sur divers projets techniques et fonctionnels.",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 28,
    "total_tokens": 73
  },
  "model": "gpt-3.5-turbo",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Transformations effectuées
- **Vocabulaire** : Familier → Professionnel
- **Verbes d'action** : Amélioration de l'impact
- **Termes techniques** : Adaptation au secteur
- **Structure** : Phrases plus percutantes

## ⚙️ Configuration

### Variables d'environnement
```env
OPENAI_API_KEY=votre-clé-api-openai
```

### Modèles disponibles
- **gpt-3.5-turbo** : Modèle par défaut (rapide et économique)
- **gpt-4** : Modèle avancé (plus précis mais plus cher)
- **gpt-4-turbo-preview** : Dernière version (expérimental)

## 🛡️ Sécurité et limitations

### Rate limiting
- **Routes IA** : Limites plus strictes que les autres endpoints
- **Protection** : Évite l'abus des ressources coûteuses
- **Adaptation** : Limites différentes selon l'environnement

### Validation
- **Paramètres requis** : Vérification des champs obligatoires
- **Contenu** : Validation de la qualité des entrées
- **Longueur** : Limitation de la taille des textes

## 💰 Coûts et optimisation

### Facteurs de coût
- **Nombre de tokens** : Plus le texte est long, plus c'est cher
- **Modèle utilisé** : GPT-4 coûte plus cher que GPT-3.5
- **Complexité** : Prompts complexes = plus de tokens

### Optimisation
- **Prompts efficaces** : Templates optimisés pour réduire les tokens
- **Modèle adapté** : GPT-3.5 pour la plupart des cas
- **Cache** : Possibilité d'implémenter un système de cache

## 🔍 Exemples d'utilisation

### Lettre de motivation
```bash
curl -X POST http://localhost:3001/api/ai/cover-letter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "position": "Développeur Full Stack",
    "company": "TechCorp",
    "nom": "Martin",
    "prenom": "Sophie",
    "email": "sophie.martin@email.com",
    "telephone": "06 12 34 56 78",
    "adresse": "456 Avenue des Champs, 75008 Paris",
    "destinataire": "M. Dupont, Directeur Technique"
  }'
```

### Professionnalisation
```bash
curl -X POST http://localhost:3001/api/ai/professionalize-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "originalText": "J'ai fait du développement web avec React et Node.js",
    "context": "Développeur web, 2 ans d'expérience"
  }'
```

## 🚀 Extensions futures

### Fonctionnalités prévues
- **Optimisation de CV** : Analyse et suggestions d'amélioration
- **Préparation d'entretien** : Questions et réponses types
- **Email de suivi** : Génération d'emails post-entretien
- **Analyse de sentiment** : Évaluation des réponses d'employeurs

### Améliorations techniques
- **Cache intelligent** : Réutilisation des réponses similaires
- **Modèles personnalisés** : Adaptation aux secteurs spécifiques
- **Feedback utilisateur** : Amélioration continue des prompts 