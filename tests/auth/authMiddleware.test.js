const { authenticateToken } = require('../../src/middleware/auth');
const JwtUtils = require('../../src/utils/jwtUtils');

// Mock des dépendances
jest.mock('../../src/utils/jwtUtils');

describe('Middleware d\'authentification', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de la requête
    mockReq = {
      headers: {},
      user: null
    };

    // Mock de la réponse
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock de la fonction next
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('devrait authentifier un token valide', () => {
      const mockToken = 'valid-token';
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      JwtUtils.extractTokenFromHeader.mockReturnValue(mockToken);
      JwtUtils.verifyAccessToken.mockReturnValue(mockUser);

      authenticateToken(mockReq, mockRes, mockNext);

      expect(JwtUtils.extractTokenFromHeader).toHaveBeenCalledWith(`Bearer ${mockToken}`);
      expect(JwtUtils.verifyAccessToken).toHaveBeenCalledWith(mockToken);
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('devrait rejeter une requête sans header Authorization', () => {
      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token d\'accès requis',
        status: 401
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait rejeter une requête avec un header Authorization mal formaté', () => {
      mockReq.headers.authorization = 'InvalidFormat token';
      
      JwtUtils.extractTokenFromHeader.mockImplementation(() => {
        throw new Error('Format d\'autorisation invalide');
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(JwtUtils.extractTokenFromHeader).toHaveBeenCalledWith('InvalidFormat token');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Format d\'autorisation invalide',
        status: 401
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait rejeter une requête avec un token invalide', () => {
      const mockToken = 'invalid-token';
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      JwtUtils.extractTokenFromHeader.mockReturnValue(mockToken);
      JwtUtils.verifyAccessToken.mockImplementation(() => {
        throw new Error('Token invalide');
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(JwtUtils.verifyAccessToken).toHaveBeenCalledWith(mockToken);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token invalide',
        status: 401
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait rejeter une requête avec un token expiré', () => {
      const mockToken = 'expired-token';
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      JwtUtils.extractTokenFromHeader.mockReturnValue(mockToken);
      JwtUtils.verifyAccessToken.mockImplementation(() => {
        throw new Error('Token d\'accès expiré');
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token d\'accès expiré',
        status: 401
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de vérification de token', () => {
      const mockToken = 'error-token';
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      JwtUtils.extractTokenFromHeader.mockReturnValue(mockToken);
      JwtUtils.verifyAccessToken.mockImplementation(() => {
        throw new Error('Erreur de vérification');
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur de vérification',
        status: 401
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 