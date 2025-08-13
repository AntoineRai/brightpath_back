// Mock des modules avant les imports
jest.mock('../../src/controllers/authController', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  getProfile: jest.fn()
}));

jest.mock('../../src/middleware/auth', () => ({
  authenticateToken: jest.fn()
}));

jest.mock('../../src/config/rateLimit', () => ({
  authLimiter: (req, res, next) => next(),
  registerLimiter: (req, res, next) => next(),
  sensitiveLimiter: (req, res, next) => next()
}));

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/authRoutes');
const authController = require('../../src/controllers/authController');
const { authenticateToken } = require('../../src/middleware/auth');

// Créer une application Express pour les tests
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Routes d\'authentification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('devrait appeler le contrôleur register avec les bonnes données', async () => {
      const mockCreatedAt = new Date('2023-01-01T00:00:00.000Z');
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        created_at: mockCreatedAt
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      authController.register.mockImplementation((req, res) => {
        res.status(201).json({
          message: 'Utilisateur créé avec succès',
          user: mockUser,
          tokens: mockTokens
        });
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(201);

      expect(authController.register).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Utilisateur créé avec succès');
      expect(response.body.user.id).toBe(mockUser.id);
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.user.name).toBe(mockUser.name);
      expect(response.body.user.role).toBe(mockUser.role);
      expect(response.body.tokens).toEqual(mockTokens);
    });

    it('devrait gérer les erreurs du contrôleur register', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'Email, mot de passe et nom sont requis',
          status: 400
        });
      });

      const response = await request(app)
        .post('/auth/register')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Email, mot de passe et nom sont requis');
    });
  });

  describe('POST /auth/login', () => {
    it('devrait appeler le contrôleur login avec les bonnes données', async () => {
      const mockCreatedAt = new Date('2023-01-01T00:00:00.000Z');
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        created_at: mockCreatedAt
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      authController.login.mockImplementation((req, res) => {
        res.json({
          message: 'Connexion réussie',
          user: mockUser,
          tokens: mockTokens
        });
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(authController.login).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Connexion réussie');
      expect(response.body.user.id).toBe(mockUser.id);
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.user.name).toBe(mockUser.name);
      expect(response.body.user.role).toBe(mockUser.role);
      expect(response.body.tokens).toEqual(mockTokens);
    });

    it('devrait gérer les erreurs du contrôleur login', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(401).json({
          error: 'Email ou mot de passe incorrect',
          status: 401
        });
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Email ou mot de passe incorrect');
    });
  });

  describe('POST /auth/refresh', () => {
    it('devrait appeler le contrôleur refreshToken avec le refresh token', async () => {
      const mockNewToken = 'new-access-token';

      authController.refreshToken.mockImplementation((req, res) => {
        res.json({
          message: 'Token rafraîchi avec succès',
          accessToken: mockNewToken
        });
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken: 'mock-refresh-token'
        })
        .expect(200);

      expect(authController.refreshToken).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Token rafraîchi avec succès');
      expect(response.body.accessToken).toBe(mockNewToken);
    });

    it('devrait gérer les erreurs du contrôleur refreshToken', async () => {
      authController.refreshToken.mockImplementation((req, res) => {
        res.status(401).json({
          error: 'Token invalide',
          status: 401
        });
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token'
        })
        .expect(401);

      expect(response.body.error).toBe('Token invalide');
    });
  });

  describe('POST /auth/logout', () => {
    it('devrait appeler le contrôleur logout avec authentification', async () => {
      // Mock du middleware d'authentification
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: '123', email: 'test@example.com' };
        next();
      });

      authController.logout.mockImplementation((req, res) => {
        res.json({
          message: 'Déconnexion réussie'
        });
      });

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(authenticateToken).toHaveBeenCalledTimes(1);
      expect(authController.logout).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Déconnexion réussie');
    });

    it('devrait rejeter les requêtes sans token d\'authentification', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          error: 'Token d\'accès requis',
          status: 401
        });
      });

      await request(app)
        .post('/auth/logout')
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('devrait appeler le contrôleur getProfile avec authentification', async () => {
      const mockCreatedAt = new Date('2023-01-01T00:00:00.000Z');
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        created_at: mockCreatedAt
      };

      // Mock du middleware d'authentification
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: '123' };
        next();
      });

      authController.getProfile.mockImplementation((req, res) => {
        res.json({
          message: 'Profil récupéré avec succès',
          user: mockUser
        });
      });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(authenticateToken).toHaveBeenCalledTimes(1);
      expect(authController.getProfile).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Profil récupéré avec succès');
      expect(response.body.user.id).toBe(mockUser.id);
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.user.name).toBe(mockUser.name);
      expect(response.body.user.role).toBe(mockUser.role);
    });

    it('devrait gérer les erreurs du contrôleur getProfile', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: '123' };
        next();
      });

      authController.getProfile.mockImplementation((req, res) => {
        res.status(404).json({
          error: 'Utilisateur non trouvé',
          status: 404
        });
      });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.error).toBe('Utilisateur non trouvé');
    });
  });
}); 