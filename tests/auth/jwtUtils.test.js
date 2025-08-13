const JwtUtils = require('../../src/utils/jwtUtils');
const jwt = require('jsonwebtoken');

// Mock de jsonwebtoken
jest.mock('jsonwebtoken');

describe('Utilitaires JWT', () => {
  const mockPayload = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('devrait générer un token d\'accès valide', () => {
      const mockToken = 'mock-access-token';
      jwt.sign.mockReturnValue(mockToken);

      const result = JwtUtils.generateAccessToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        'votre-secret-jwt-super-securise-changez-moi-en-production',
        { 
          expiresIn: '15m',
          algorithm: 'HS256'
        }
      );
      expect(result).toBe(mockToken);
    });

    it('devrait gérer les erreurs de génération', () => {
      jwt.sign.mockImplementation(() => {
        throw new Error('Erreur de génération');
      });

      expect(() => {
        JwtUtils.generateAccessToken(mockPayload);
      }).toThrow('Erreur lors de la génération du token d\'accès');
    });
  });

  describe('generateRefreshToken', () => {
    it('devrait générer un token de rafraîchissement valide', () => {
      const mockToken = 'mock-refresh-token';
      jwt.sign.mockReturnValue(mockToken);

      const result = JwtUtils.generateRefreshToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        'votre-refresh-secret-super-securise-changez-moi-en-production',
        { 
          expiresIn: '7d',
          algorithm: 'HS256'
        }
      );
      expect(result).toBe(mockToken);
    });

    it('devrait gérer les erreurs de génération', () => {
      jwt.sign.mockImplementation(() => {
        throw new Error('Erreur de génération');
      });

      expect(() => {
        JwtUtils.generateRefreshToken(mockPayload);
      }).toThrow('Erreur lors de la génération du token de rafraîchissement');
    });
  });

  describe('verifyAccessToken', () => {
    it('devrait vérifier un token d\'accès valide', () => {
      const mockToken = 'valid-access-token';
      jwt.verify.mockReturnValue(mockPayload);

      const result = JwtUtils.verifyAccessToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'votre-secret-jwt-super-securise-changez-moi-en-production', {
        algorithms: ['HS256']
      });
      expect(result).toEqual(mockPayload);
    });

    it('devrait lever une erreur pour un token invalide', () => {
      const mockToken = 'invalid-access-token';
      const mockError = new Error('Token invalide');
      mockError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => {
        JwtUtils.verifyAccessToken(mockToken);
      }).toThrow('Token d\'accès invalide');
    });

    it('devrait lever une erreur pour un token expiré', () => {
      const mockToken = 'expired-access-token';
      const mockError = new Error('Token expiré');
      mockError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => {
        JwtUtils.verifyAccessToken(mockToken);
      }).toThrow('Token d\'accès expiré');
    });

    it('devrait gérer les erreurs générales', () => {
      const mockToken = 'error-token';
      const mockError = new Error('Erreur générale');
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => {
        JwtUtils.verifyAccessToken(mockToken);
      }).toThrow('Erreur lors de la vérification du token d\'accès');
    });
  });

  describe('verifyRefreshToken', () => {
    it('devrait vérifier un token de rafraîchissement valide', () => {
      const mockToken = 'valid-refresh-token';
      jwt.verify.mockReturnValue(mockPayload);

      const result = JwtUtils.verifyRefreshToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'votre-refresh-secret-super-securise-changez-moi-en-production', {
        algorithms: ['HS256']
      });
      expect(result).toEqual(mockPayload);
    });

    it('devrait lever une erreur pour un token de rafraîchissement invalide', () => {
      const mockToken = 'invalid-refresh-token';
      const mockError = new Error('Token invalide');
      mockError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => {
        JwtUtils.verifyRefreshToken(mockToken);
      }).toThrow('Token de rafraîchissement invalide');
    });

    it('devrait lever une erreur pour un token de rafraîchissement expiré', () => {
      const mockToken = 'expired-refresh-token';
      const mockError = new Error('Token expiré');
      mockError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => {
        JwtUtils.verifyRefreshToken(mockToken);
      }).toThrow('Token de rafraîchissement expiré');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('devrait extraire le token du header Authorization Bearer', () => {
      const mockToken = 'valid-token';
      const mockHeader = `Bearer ${mockToken}`;

      const result = JwtUtils.extractTokenFromHeader(mockHeader);

      expect(result).toBe(mockToken);
    });

    it('devrait lever une erreur si le header est mal formaté', () => {
      const mockHeader = 'InvalidFormat token';

      expect(() => {
        JwtUtils.extractTokenFromHeader(mockHeader);
      }).toThrow('Format d\'autorisation invalide');
    });

    it('devrait lever une erreur si le header est vide', () => {
      const mockHeader = '';

      expect(() => {
        JwtUtils.extractTokenFromHeader(mockHeader);
      }).toThrow('Format d\'autorisation invalide');
    });

    it('devrait lever une erreur si le header est null', () => {
      expect(() => {
        JwtUtils.extractTokenFromHeader(null);
      }).toThrow('Format d\'autorisation invalide');
    });
  });

  describe('refreshAccessToken', () => {
    it('devrait rafraîchir un token d\'accès avec succès', () => {
      const mockRefreshToken = 'valid-refresh-token';
      const mockDecoded = {
        ...mockPayload,
        iat: 1234567890,
        exp: 1234567890
      };
      const mockNewToken = 'new-access-token';

      JwtUtils.verifyRefreshToken = jest.fn().mockReturnValue(mockDecoded);
      JwtUtils.generateAccessToken = jest.fn().mockReturnValue(mockNewToken);

      const result = JwtUtils.refreshAccessToken(mockRefreshToken);

      expect(JwtUtils.verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(JwtUtils.generateAccessToken).toHaveBeenCalledWith(mockPayload);
      expect(result).toBe(mockNewToken);
    });

    it('devrait propager les erreurs de vérification', () => {
      const mockRefreshToken = 'invalid-refresh-token';
      const mockError = new Error('Token invalide');

      JwtUtils.verifyRefreshToken = jest.fn().mockImplementation(() => {
        throw mockError;
      });

      expect(() => {
        JwtUtils.refreshAccessToken(mockRefreshToken);
      }).toThrow('Token invalide');
    });
  });
}); 