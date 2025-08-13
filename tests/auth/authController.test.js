// Mock des modules avant les imports
jest.mock('../../src/models/User', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  verifyPassword: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../../src/utils/jwtUtils', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn()
}));

const authController = require('../../src/controllers/authController');
const JwtUtils = require('../../src/utils/jwtUtils');
const User = require('../../src/models/User');

describe('Contrôleur d\'authentification', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de la requête
    mockReq = {
      body: {},
      user: {}
    };

    // Mock de la réponse
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    it('devrait créer un utilisateur avec succès', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const mockUser = {
        id: '123',
        email: userData.email,
        name: userData.name,
        role: 'user',
        created_at: new Date()
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      mockReq.body = userData;

      // Mock des méthodes
      User.create.mockResolvedValue(mockUser);
      JwtUtils.generateAccessToken.mockReturnValue(mockTokens.accessToken);
      JwtUtils.generateRefreshToken.mockReturnValue(mockTokens.refreshToken);

      await authController.register(mockReq, mockRes);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(JwtUtils.generateAccessToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      });
      expect(JwtUtils.generateRefreshToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Utilisateur créé avec succès',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          created_at: mockUser.created_at
        },
        tokens: mockTokens
      });
    });

    it('devrait retourner une erreur 400 si les données sont manquantes', async () => {
      mockReq.body = { email: 'test@example.com' }; // Manque password et name

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email, mot de passe et nom sont requis',
        status: 400
      });
    });

    it('devrait gérer les erreurs de création d\'utilisateur', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      mockReq.body = userData;

      // Mock d'une erreur de duplication
      User.create.mockRejectedValue(new Error('Un utilisateur avec cet email existe déjà'));

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Un utilisateur avec cet email existe déjà',
        status: 409
      });
    });

    it('devrait gérer les erreurs générales', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      mockReq.body = userData;

      // Mock d'une erreur générale
      User.create.mockRejectedValue(new Error('Erreur de base de données'));

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la création de l\'utilisateur',
        status: 500
      });
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec succès', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: '123',
        email: loginData.email,
        name: 'Test User',
        role: 'user',
        created_at: new Date()
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      mockReq.body = loginData;

      // Mock des méthodes
      User.findByEmail.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(true);
      JwtUtils.generateAccessToken.mockReturnValue(mockTokens.accessToken);
      JwtUtils.generateRefreshToken.mockReturnValue(mockTokens.refreshToken);

      await authController.login(mockReq, mockRes);

      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(User.verifyPassword).toHaveBeenCalledWith(mockUser, loginData.password);
      expect(JwtUtils.generateAccessToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      });
      expect(JwtUtils.generateRefreshToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Connexion réussie',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          created_at: mockUser.created_at
        },
        tokens: mockTokens
      });
    });

    it('devrait retourner une erreur 400 si les données sont manquantes', async () => {
      mockReq.body = { email: 'test@example.com' }; // Manque password

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email et mot de passe sont requis',
        status: 400
      });
    });

    it('devrait retourner une erreur 401 si l\'utilisateur n\'existe pas', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      mockReq.body = loginData;

      User.findByEmail.mockResolvedValue(null);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email ou mot de passe incorrect',
        status: 401
      });
    });

    it('devrait retourner une erreur 401 si le mot de passe est incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: '123',
        email: loginData.email,
        name: 'Test User',
        role: 'user'
      };

      mockReq.body = loginData;

      User.findByEmail.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(false);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email ou mot de passe incorrect',
        status: 401
      });
    });
  });

  describe('refreshToken', () => {
    it('devrait rafraîchir le token avec succès', () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token'
      };

      const mockDecoded = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        iat: 1234567890,
        exp: 1234567890
      };

      const mockNewToken = 'new-access-token';

      mockReq.body = refreshData;

      // Mock des méthodes
      JwtUtils.verifyRefreshToken.mockReturnValue(mockDecoded);
      JwtUtils.generateAccessToken.mockReturnValue(mockNewToken);

      authController.refreshToken(mockReq, mockRes);

      expect(JwtUtils.verifyRefreshToken).toHaveBeenCalledWith(refreshData.refreshToken);
      expect(JwtUtils.generateAccessToken).toHaveBeenCalledWith({
        id: mockDecoded.id,
        email: mockDecoded.email,
        name: mockDecoded.name,
        role: mockDecoded.role
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token rafraîchi avec succès',
        accessToken: mockNewToken
      });
    });

    it('devrait retourner une erreur 400 si le refresh token est manquant', () => {
      mockReq.body = {};

      authController.refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token de rafraîchissement requis',
        status: 400
      });
    });

    it('devrait gérer les erreurs de vérification du token', () => {
      const refreshData = {
        refreshToken: 'invalid-refresh-token'
      };

      mockReq.body = refreshData;

      JwtUtils.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Token invalide');
      });

      authController.refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token invalide',
        status: 401
      });
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur avec succès', () => {
      authController.logout(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Déconnexion réussie'
      });
    });
  });

  describe('getProfile', () => {
    it('devrait récupérer le profil utilisateur avec succès', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        created_at: new Date()
      };

      mockReq.user = { id: '123' };

      User.findById.mockResolvedValue(mockUser);

      await authController.getProfile(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profil récupéré avec succès',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          created_at: mockUser.created_at
        }
      });
    });

    it('devrait retourner une erreur 404 si l\'utilisateur n\'existe pas', async () => {
      mockReq.user = { id: '123' };

      User.findById.mockResolvedValue(null);

      await authController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Utilisateur non trouvé',
        status: 404
      });
    });

    it('devrait gérer les erreurs générales', async () => {
      mockReq.user = { id: '123' };

      User.findById.mockRejectedValue(new Error('Erreur de base de données'));

      await authController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération du profil',
        status: 500
      });
    });
  });
}); 