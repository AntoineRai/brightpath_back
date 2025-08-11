const rateLimit = require('express-rate-limit');

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
  100, // 100 requêtes par 15 minutes
  'Trop de requêtes depuis cette IP. Veuillez réessayer plus tard.',
  true // Ignore les requêtes réussies
);

// Rate limiter pour l'authentification (plus strict)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 tentatives de connexion par 15 minutes
  'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
  false // Compte toutes les tentatives
);

// Rate limiter pour l'inscription (très strict)
const registerLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 heure
  3, // 3 tentatives d'inscription par heure
  'Trop de tentatives d\'inscription. Veuillez réessayer dans 1 heure.',
  false // Compte toutes les tentatives
);

// Rate limiter pour les routes API protégées
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requêtes par 15 minutes
  'Trop de requêtes API. Veuillez réessayer plus tard.',
  true // Ignore les requêtes réussies
);

// Rate limiter pour les routes sensibles (profil, etc.)
const sensitiveLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // 50 requêtes par 15 minutes
  'Trop de requêtes sur cette route sensible. Veuillez réessayer plus tard.',
  true // Ignore les requêtes réussies
);

// Rate limiter pour les erreurs 4xx/5xx (protection contre les attaques)
const errorLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // 20 erreurs par 15 minutes
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