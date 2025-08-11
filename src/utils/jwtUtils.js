const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Classe utilitaire pour la gestion des JWT
class JwtUtils {
  // Générer un token d'accès
  static generateAccessToken(payload) {
    try {
      return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.accessToken.expiresIn,
        algorithm: jwtConfig.accessToken.algorithm
      });
    } catch (error) {
      throw new Error('Erreur lors de la génération du token d\'accès');
    }
  }

  // Générer un token de rafraîchissement
  static generateRefreshToken(payload) {
    try {
      return jwt.sign(payload, jwtConfig.refreshSecret, {
        expiresIn: jwtConfig.refreshToken.expiresIn,
        algorithm: jwtConfig.refreshToken.algorithm
      });
    } catch (error) {
      throw new Error('Erreur lors de la génération du token de rafraîchissement');
    }
  }

  // Vérifier un token d'accès
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.accessToken.algorithm]
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token d\'accès expiré');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token d\'accès invalide');
      }
      throw new Error('Erreur lors de la vérification du token d\'accès');
    }
  }

  // Vérifier un token de rafraîchissement
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret, {
        algorithms: [jwtConfig.refreshToken.algorithm]
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token de rafraîchissement expiré');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token de rafraîchissement invalide');
      }
      throw new Error('Erreur lors de la vérification du token de rafraîchissement');
    }
  }

  // Rafraîchir un token d'accès
  static refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Générer un nouveau token d'accès avec les mêmes données
      const { iat, exp, ...payload } = decoded;
      return this.generateAccessToken(payload);
    } catch (error) {
      throw error;
    }
  }

  // Extraire le token du header Authorization
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Format d\'autorisation invalide');
    }
    return authHeader.substring(7); // Enlever "Bearer "
  }

  // Décoder un token sans vérification (pour debug)
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error('Impossible de décoder le token');
    }
  }
}

module.exports = JwtUtils; 