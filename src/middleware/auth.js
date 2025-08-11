const JwtUtils = require('../utils/jwtUtils');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token d\'accès requis',
        status: 401
      });
    }

    // Extraire et vérifier le token
    const token = JwtUtils.extractTokenFromHeader(authHeader);
    const decoded = JwtUtils.verifyAccessToken(token);
    
    // Ajouter les informations utilisateur à la requête
    req.user = decoded;
    next();
    
  } catch (error) {
    return res.status(401).json({
      error: error.message,
      status: 401
    });
  }
};

// Middleware d'authentification optionnelle (pour les routes qui peuvent être publiques ou privées)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = JwtUtils.extractTokenFromHeader(authHeader);
      const decoded = JwtUtils.verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

// Middleware pour vérifier les rôles (optionnel)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        status: 401
      });
    }

    const userRole = req.user.role || 'user';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Permissions insuffisantes',
        requiredRoles: roles,
        userRole: userRole,
        status: 403
      });
    }

    next();
  };
};

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
const requireOwnership = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        status: 401
      });
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    // Vérifier si l'utilisateur est admin ou propriétaire de la ressource
    if (req.user.role === 'admin' || resourceId == userId) {
      return next();
    }

    return res.status(403).json({
      error: 'Accès non autorisé à cette ressource',
      status: 403
    });
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireOwnership
}; 