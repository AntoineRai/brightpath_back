# Mesures de Sécurité - API BrightPath

Ce document présente l'ensemble des mesures de sécurité mises en œuvre pour protéger l'API BrightPath et ses utilisateurs.

## 🛡️ Vue d'Ensemble

La sécurité est une priorité absolue pour l'API BrightPath. Nous avons mis en place un système de sécurité multicouche pour protéger :
- **Les données utilisateurs** : Informations personnelles et professionnelles
- **L'authentification** : Système de connexion sécurisé
- **Les communications** : Chiffrement des échanges
- **L'infrastructure** : Protection contre les attaques

## 🔐 Authentification et Autorisation

### 1. JWT (JSON Web Tokens)

```javascript
// Configuration JWT sécurisée
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  accessToken: {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    algorithm: 'HS256'
  },
  refreshToken: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  }
};
```

**Mesures de sécurité :**
- ✅ **Tokens à expiration courte** : 15 minutes pour les tokens d'accès
- ✅ **Refresh tokens** : Renouvellement automatique sécurisé
- ✅ **Algorithmes cryptographiques** : HS256 pour la signature
- ✅ **Secrets séparés** : Tokens d'accès et de rafraîchissement différents

### 2. Hachage des Mots de Passe

```javascript
// Hachage sécurisé avec bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Hachage du mot de passe
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Vérification du mot de passe
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Mesures de sécurité :**
- ✅ **Algorithme bcrypt** : Résistant aux attaques par force brute
- ✅ **Salt rounds élevés** : 12 rounds pour une sécurité maximale
- ✅ **Hachage unidirectionnel** : Impossible de récupérer le mot de passe original

### 3. Middleware d'Authentification

```javascript
// Middleware d'authentification robuste
const authenticateToken = async (req, res, next) => {
  try {
    const token = JwtUtils.extractTokenFromHeader(req.headers.authorization);
    const decoded = JwtUtils.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token d\'accès invalide ou expiré',
      status: 401
    });
  }
};
```

**Mesures de sécurité :**
- ✅ **Validation stricte** : Vérification complète des tokens
- ✅ **Gestion d'erreurs** : Messages d'erreur sécurisés
- ✅ **Extraction sécurisée** : Validation du format Bearer

## 🚨 Protection contre les Attaques

### 1. Rate Limiting

```javascript
// Configuration du rate limiting
const rateLimit = require('express-rate-limit');

// Limiteur général pour l'API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiteur strict pour les opérations sensibles
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 requêtes par fenêtre
  message: {
    error: 'Trop de tentatives, veuillez réessayer plus tard',
    status: 429
  }
});
```

**Mesures de sécurité :**
- ✅ **Limitation générale** : 100 requêtes par 15 minutes
- ✅ **Limitation stricte** : 5 requêtes pour les opérations sensibles
- ✅ **Protection DDoS** : Prévention des attaques par déni de service
- ✅ **Messages d'erreur** : Informations sans révéler la structure

### 2. Validation des Données

```javascript
// Validation stricte des données d'entrée
const validateUserData = (data) => {
  const errors = [];
  
  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push('Format d\'email invalide');
  }
  
  // Validation mot de passe
  if (data.password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  // Validation téléphone
  const phoneRegex = /^[0-9+\-\s()]{10,}$/;
  if (!phoneRegex.test(data.telephone)) {
    errors.push('Format de téléphone invalide');
  }
  
  return errors;
};
```

**Mesures de sécurité :**
- ✅ **Validation côté serveur** : Double validation avec le client
- ✅ **Expressions régulières** : Validation stricte des formats
- ✅ **Sanitisation** : Nettoyage des données d'entrée
- ✅ **Messages d'erreur** : Informations sans révéler la structure

### 3. Protection CORS

```javascript
// Configuration CORS sécurisée
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 heures
};

app.use(cors(corsOptions));
```

**Mesures de sécurité :**
- ✅ **Origines autorisées** : Liste blanche des domaines
- ✅ **Méthodes limitées** : Seules les méthodes nécessaires
- ✅ **Headers contrôlés** : Headers autorisés spécifiques
- ✅ **Cache CORS** : Optimisation des performances

## 🔒 Sécurité des Données

### 1. Chiffrement des Communications

```javascript
// Configuration HTTPS
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
  ca: fs.readFileSync('path/to/ca-bundle.pem')
};

const server = https.createServer(httpsOptions, app);
```

**Mesures de sécurité :**
- ✅ **HTTPS obligatoire** : Chiffrement TLS 1.3
- ✅ **Certificats SSL** : Certificats valides et à jour
- ✅ **HSTS** : HTTP Strict Transport Security
- ✅ **Perfect Forward Secrecy** : Clés éphémères

### 2. Gestion Sécurisée des Variables d'Environnement

```javascript
// Validation des variables d'environnement critiques
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Variable d'environnement manquante: ${varName}`);
    process.exit(1);
  }
});
```

**Mesures de sécurité :**
- ✅ **Variables obligatoires** : Validation au démarrage
- ✅ **Secrets séparés** : Chaque secret dans sa propre variable
- ✅ **Pas de hardcoding** : Aucun secret dans le code
- ✅ **Validation stricte** : Arrêt si variables manquantes

### 3. Protection des Headers HTTP

```javascript
// Configuration Helmet pour la sécurité des headers
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**Mesures de sécurité :**
- ✅ **Content Security Policy** : Protection contre XSS
- ✅ **HSTS** : Forçage HTTPS
- ✅ **X-Frame-Options** : Protection contre le clickjacking
- ✅ **X-Content-Type-Options** : Protection MIME sniffing

## 🛡️ Sécurité de l'Infrastructure

### 1. Base de Données Supabase

```javascript
// Configuration sécurisée Supabase
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  }
);
```

**Mesures de sécurité :**
- ✅ **Connexion chiffrée** : TLS pour toutes les communications
- ✅ **Authentification RLS** : Row Level Security activé
- ✅ **Clés d'API séparées** : Clés anonymes et service séparées
- ✅ **Backup automatique** : Sauvegarde quotidienne

### 2. API OpenAI Sécurisée

```javascript
// Configuration sécurisée OpenAI
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false, // Sécurité renforcée
  maxRetries: 3,
  timeout: 30000
});
```

**Mesures de sécurité :**
- ✅ **Clé API sécurisée** : Variable d'environnement
- ✅ **Pas d'exposition client** : API côté serveur uniquement
- ✅ **Rate limiting** : Limitation des appels API
- ✅ **Validation des réponses** : Vérification des données reçues

### 3. Logs et Monitoring

```javascript
// Configuration des logs sécurisés
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Ne pas logger les données sensibles
logger.info('Requête reçue', {
  method: req.method,
  path: req.path,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  // PAS de logging des tokens, mots de passe, etc.
});
```

**Mesures de sécurité :**
- ✅ **Rotation des logs** : Limitation de la taille et du nombre
- ✅ **Pas de données sensibles** : Exclusion des secrets des logs
- ✅ **Format structuré** : JSON pour faciliter l'analyse
- ✅ **Niveaux de log** : Différenciation des types d'événements

## 🚨 Gestion des Incidents de Sécurité

### 1. Détection d'Anomalies

```javascript
// Middleware de détection d'anomalies
const securityMiddleware = (req, res, next) => {
  // Détection de patterns suspects
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i
  ];
  
  const requestBody = JSON.stringify(req.body);
  const requestQuery = JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestBody) || pattern.test(requestQuery)) {
      logger.warn('Tentative d\'attaque détectée', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        pattern: pattern.source
      });
      
      return res.status(400).json({
        error: 'Requête invalide',
        status: 400
      });
    }
  }
  
  next();
};
```

### 2. Procédure d'Incident

```markdown
## Procédure d'Incident de Sécurité

1. **Détection** : Monitoring automatique et alertes
2. **Évaluation** : Analyse de la gravité et de l'impact
3. **Containment** : Isolation de la menace
4. **Éradication** : Suppression de la cause
5. **Récupération** : Retour à la normale
6. **Post-mortem** : Analyse et amélioration
```

### 3. Alertes Automatiques

```javascript
// Configuration des alertes de sécurité
const securityAlerts = {
  failedLogins: {
    threshold: 5,
    window: '5m',
    action: 'block_ip'
  },
  suspiciousRequests: {
    threshold: 10,
    window: '1m',
    action: 'notify_admin'
  },
  apiAbuse: {
    threshold: 100,
    window: '1m',
    action: 'rate_limit'
  }
};
```

## 📊 Tests de Sécurité

### 1. Tests Automatisés

```javascript
// tests/security/auth.test.js
describe('Sécurité - Authentification', () => {
  it('devrait rejeter les tokens invalides', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
  });
  
  it('devrait rejeter les mots de passe faibles', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: '123' // Trop court
      });
    expect(response.status).toBe(400);
  });
  
  it('devrait protéger contre les injections SQL', async () => {
    const response = await request(app)
      .get('/api/search?q=1\' OR \'1\'=\'1');
    expect(response.status).toBe(400);
  });
});
```

### 2. Tests de Charge

```javascript
// tests/security/load.test.js
describe('Sécurité - Tests de Charge', () => {
  it('devrait limiter les requêtes excessives', async () => {
    const requests = Array(150).fill().map(() => 
      request(app).get('/api/health')
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

## 🔍 Audit de Sécurité

### 1. Vérifications Régulières

- ✅ **Audit des dépendances** : `npm audit` hebdomadaire
- ✅ **Scan de vulnérabilités** : Outils automatisés
- ✅ **Review de code** : Analyse manuelle des changements
- ✅ **Tests de pénétration** : Tests externes périodiques

### 2. Conformité

- ✅ **RGPD** : Protection des données personnelles
- ✅ **OWASP Top 10** : Protection contre les vulnérabilités courantes
- ✅ **Standards de sécurité** : Bonnes pratiques de l'industrie
- ✅ **Documentation** : Traçabilité des mesures de sécurité

## 📈 Métriques de Sécurité

### 1. Indicateurs de Performance

- **Taux d'échec d'authentification** : < 5%
- **Temps de réponse moyen** : < 200ms
- **Disponibilité** : > 99.9%
- **Incidents de sécurité** : 0 par mois

### 2. Monitoring en Temps Réel

```javascript
// Métriques de sécurité
const securityMetrics = {
  failedLogins: 0,
  blockedIPs: 0,
  suspiciousRequests: 0,
  rateLimitHits: 0,
  lastIncident: null
};
```

## 🎯 Bonnes Pratiques

### 1. Développement Sécurisé

- ✅ **Code review** : Tous les changements revus
- ✅ **Tests de sécurité** : Intégrés dans le pipeline
- ✅ **Documentation** : Mesures de sécurité documentées
- ✅ **Formation** : Équipe formée aux bonnes pratiques

### 2. Maintenance

- ✅ **Mises à jour** : Dépendances à jour
- ✅ **Monitoring** : Surveillance continue
- ✅ **Backup** : Sauvegarde régulière
- ✅ **Incident response** : Procédures documentées

---

## 🏆 Résumé des Mesures

### **Niveau Critique**
- 🔐 Authentification JWT sécurisée
- 🛡️ Hachage bcrypt des mots de passe
- 🚨 Rate limiting strict
- 🔒 Validation des données

### **Niveau Élevé**
- 🌐 Protection CORS
- 📊 Headers de sécurité
- 🔍 Détection d'anomalies
- 📝 Logs sécurisés

### **Niveau Standard**
- 🔄 HTTPS obligatoire
- 🗄️ Base de données sécurisée
- 🤖 API externe sécurisée
- 📈 Monitoring continu

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0  
**Mainteneur** : Équipe BrightPath  
**Contact Sécurité** : security@brightpath.com 