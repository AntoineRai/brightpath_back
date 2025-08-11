const rateLimit = require('express-rate-limit');

// Détecter l'environnement
const isDevelopment = process.env.NODE_ENV === 'development';

// Configuration générale du rate limiter
const createRateLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs, // Fenêtre de temps en millisecondes
    max, // Nombre maximum de requêtes par fenêtre
    message: {
      error: message,
      status: 429,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Retourne les headers `RateLimit-*` dans la réponse
    legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
    skipSuccessfulRequests, // Ignore les requêtes réussies
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        status: 429,
        retryAfter: Math.ceil(windowMs / 1000),
        limit: max,
        windowMs: windowMs
      });
    }
  });
};

// Rate limiter global (toutes les routes)
const globalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  isDevelopment ? 10000 : 100, // 10000 en dev, 100 en prod
  'Trop de requêtes depuis cette IP. Veuillez réessayer plus tard.',
  true // Ignore les requêtes réussies
);

// Rate limiter pour l'authentification (plus strict)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  isDevelopment ? 100 : 5, // 100 en dev, 5 en prod
  'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
  false // Compte toutes les tentatives
);

// Rate limiter pour l'inscription (très strict)
const registerLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 heure
  isDevelopment ? 50 : 3, // 50 en dev, 3 en prod
  'Trop de tentatives d\'inscription. Veuillez réessayer dans 1 heure.',
  false // Compte toutes les tentatives
);

// Rate limiter pour les routes API protégées
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  isDevelopment ? 10000 : 1000, // 10000 en dev, 1000 en prod
  'Trop de requêtes API. Veuillez réessayer plus tard.',
  true // Ignore les requêtes réussies
);

// Rate limiter pour les routes sensibles (profil, etc.)
const sensitiveLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  isDevelopment ? 1000 : 50, // 1000 en dev, 50 en prod
  'Trop de requêtes sur cette route sensible. Veuillez réessayer plus tard.',
  true // Ignore les requêtes réussies
);

// Rate limiter pour les erreurs 4xx/5xx (protection contre les attaques)
const errorLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  isDevelopment ? 500 : 20, // 500 en dev, 20 en prod
  'Trop d\'erreurs détectées. Veuillez réessayer plus tard.',
  false // Compte toutes les erreurs
);

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  apiLimiter,
  sensitiveLimiter,
  errorLimiter
}; 