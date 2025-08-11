// Configuration JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'votre-secret-jwt-super-securise-changez-moi-en-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'votre-refresh-secret-super-securise-changez-moi-en-production',
  
  // Options pour les tokens d'accès
  accessToken: {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m', // 15 minutes
    algorithm: 'HS256'
  },
  
  // Options pour les tokens de rafraîchissement
  refreshToken: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 7 jours
    algorithm: 'HS256'
  },
  
  // Options pour les cookies (si utilisé)
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en millisecondes
  }
};

module.exports = jwtConfig; 