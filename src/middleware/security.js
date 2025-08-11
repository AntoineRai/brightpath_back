const helmet = require('helmet');

// Middleware de sécurité avec Helmet
const securityMiddleware = helmet({
  // Configuration personnalisée de Helmet
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  // Désactiver certaines protections pour l'API
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Middleware pour ajouter des headers de sécurité personnalisés
const customSecurityHeaders = (req, res, next) => {
  // Headers de sécurité supplémentaires
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Header pour indiquer que c'est une API
  res.setHeader('X-API-Version', '1.0.0');
  
  next();
};

// Middleware pour limiter la taille des requêtes
const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Payload trop volumineux',
      status: 413,
      maxSize: '10MB'
    });
  }
  
  next();
};

// Middleware pour valider les types de contenu
const contentTypeValidator = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Type de contenu non supporté. Utilisez application/json',
        status: 415
      });
    }
  }
  
  next();
};

// Middleware pour logger les tentatives d'attaque
const attackLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i
  ];
  
  const userAgent = req.headers['user-agent'] || '';
  const url = req.url;
  const body = JSON.stringify(req.body);
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(url) || pattern.test(body)
  );
  
  if (isSuspicious) {
    console.warn(`🚨 Tentative d'attaque détectée:`, {
      ip: req.ip,
      userAgent,
      url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  securityMiddleware,
  customSecurityHeaders,
  requestSizeLimiter,
  contentTypeValidator,
  attackLogger
}; 