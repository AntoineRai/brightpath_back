const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/authRoutes');

// Mock complet des dépendances
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

const authController = require('../../src/controllers/authController');
const { authenticateToken } = require('../../src/middleware/auth');

// Créer une application Express pour les tests
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Tests d\'intégration - Routes d\'authentification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('devrait retourner 201 avec les données utilisateur et tokens', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const mockCreatedAt = new Date('2023-01-01T00:00:00.000Z');
      const mockResponse = {
        message: 'Utilisateur créé avec succès',
        user: {
          id: '123',
          email: userData.email,
          name: userData.name,
          role: 'user',
          created_at: mockCreatedAt
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };

      authController.register.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(authController.register).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe(mockResponse.message);
      expect(response.body.user.id).toBe(mockResponse.user.id);
      expect(response.body.user.email).toBe(mockResponse.user.email);
      expect(response.body.user.name).toBe(mockResponse.user.name);
      expect(response.body.user.role).toBe(mockResponse.user.role);
      expect(response.body.tokens).toEqual(mockResponse.tokens);
    });

    it('devrait retourner 400 pour des données manquantes', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'Email, mot de passe et nom sont requis',
          status: 400
        });
      });

      await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('devrait retourner 200 avec les données utilisateur et tokens', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockCreatedAt = new Date('2023-01-01T00:00:00.000Z');
      const mockResponse = {
        message: 'Connexion réussie',
        user: {
          id: '123',
          email: loginData.email,
          name: 'Test User',
          role: 'user',
          created_at: mockCreatedAt
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };

      authController.login.mockImplementation((req, res) => {
        res.json(mockResponse);
      });

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(authController.login).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe(mockResponse.message);
      expect(response.body.user.id).toBe(mockResponse.user.id);
      expect(response.body.user.email).toBe(mockResponse.user.email);
      expect(response.body.user.name).toBe(mockResponse.user.name);
      expect(response.body.user.role).toBe(mockResponse.user.role);
      expect(response.body.tokens).toEqual(mockResponse.tokens);
    });

    it('devrait retourner 401 pour des identifiants incorrects', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(401).json({
          error: 'Email ou mot de passe incorrect',
          status: 401
        });
      });

      await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('devrait retourner 200 avec un nouveau token d\'accès', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token'
      };

      const mockResponse = {
        message: 'Token rafraîchi avec succès',
        accessToken: 'new-access-token'
      };

      authController.refreshToken.mockImplementation((req, res) => {
        res.json(mockResponse);
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send(refreshData)
        .expect(200);

      expect(authController.refreshToken).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockResponse);
    });

    it('devrait retourner 400 pour un refresh token manquant', async () => {
      authController.refreshToken.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'Token de rafraîchissement requis',
          status: 400
        });
      });

      await request(app)
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('devrait retourner 200 avec le middleware d\'authentification', async () => {
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
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(authenticateToken).toHaveBeenCalledTimes(1);
      expect(authController.logout).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Déconnexion réussie');
    });

    it('devrait retourner 401 sans token d\'authentification', async () => {
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
    it('devrait retourner 200 avec les données du profil', async () => {
      const mockCreatedAt = new Date('2023-01-01T00:00:00.000Z');
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        created_at: mockCreatedAt
      };

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
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(authenticateToken).toHaveBeenCalledTimes(1);
      expect(authController.getProfile).toHaveBeenCalledTimes(1);
      expect(response.body.user.id).toBe(mockUser.id);
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.user.name).toBe(mockUser.name);
      expect(response.body.user.role).toBe(mockUser.role);
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
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

      await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });

  describe('Validation des routes', () => {
    it('devrait rejeter les requêtes vers des routes inexistantes', async () => {
      await request(app)
        .get('/auth/nonexistent')
        .expect(404);
    });

    it('devrait accepter les requêtes avec le bon Content-Type', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(201).json({ message: 'Success' });
      });

      await request(app)
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(201);
    });
  });
}); 