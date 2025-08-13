// Mock des modules avant les imports
jest.mock('../../src/controllers/applicationController', () => ({
  createApplication: jest.fn(),
  getUserApplications: jest.fn(),
  getApplicationById: jest.fn(),
  updateApplication: jest.fn(),
  deleteApplication: jest.fn(),
  getUserStats: jest.fn(),
  searchApplications: jest.fn(),
  getRecentApplications: jest.fn(),
  getApplicationCounts: jest.fn()
}));

jest.mock('../../src/middleware/auth', () => ({
  authenticateToken: jest.fn()
}));

jest.mock('../../src/config/rateLimit', () => ({
  apiLimiter: (req, res, next) => next(),
  sensitiveLimiter: (req, res, next) => next()
}));

const request = require('supertest');
const express = require('express');
const applicationRoutes = require('../../src/routes/applicationRoutes');
const applicationController = require('../../src/controllers/applicationController');
const { authenticateToken } = require('../../src/middleware/auth');

// Créer une application Express pour les tests
const app = express();
app.use(express.json());
app.use('/applications', applicationRoutes);

describe('Routes des candidatures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock par défaut du middleware d'authentification
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: '123', role: 'user' };
      next();
    });
  });

  describe('POST /applications', () => {
    it('devrait créer une candidature avec succès', async () => {
      const applicationData = {
        company: 'Test Company',
        position: 'Développeur Full Stack',
        application_date: '2023-12-01',
        status: 'pending'
      };

      const mockApplication = {
        id: '456',
        user_id: '123',
        ...applicationData,
        created_at: new Date('2023-01-01T00:00:00.000Z')
      };

      applicationController.createApplication.mockImplementation((req, res) => {
        res.status(201).json({
          message: 'Candidature créée avec succès',
          application: mockApplication
        });
      });

      const response = await request(app)
        .post('/applications')
        .set('Authorization', 'Bearer valid-token')
        .send(applicationData)
        .expect(201);

      expect(authenticateToken).toHaveBeenCalled();
      expect(applicationController.createApplication).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Candidature créée avec succès');
      expect(response.body.application.id).toBe(mockApplication.id);
      expect(response.body.application.company).toBe(mockApplication.company);
      expect(response.body.application.position).toBe(mockApplication.position);
      expect(response.body.application.status).toBe(mockApplication.status);
    });

    it('devrait rejeter les requêtes sans authentification', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          error: 'Token d\'accès requis',
          status: 401
        });
      });

      await request(app)
        .post('/applications')
        .send({ company: 'Test Company' })
        .expect(401);
    });
  });

  describe('GET /applications', () => {
    it('devrait récupérer les candidatures de l\'utilisateur', async () => {
      const mockApplications = [
        {
          id: '456',
          user_id: '123',
          company: 'Test Company',
          position: 'Développeur',
          application_date: '2023-12-01',
          status: 'pending'
        }
      ];

      applicationController.getUserApplications.mockImplementation((req, res) => {
        res.json({
          message: 'Candidatures récupérées avec succès',
          applications: mockApplications,
          count: 1
        });
      });

      const response = await request(app)
        .get('/applications')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(applicationController.getUserApplications).toHaveBeenCalledTimes(1);
      expect(response.body.applications).toEqual(mockApplications);
    });

    it('devrait accepter les paramètres de requête', async () => {
      applicationController.getUserApplications.mockImplementation((req, res) => {
        res.json({
          message: 'Candidatures récupérées avec succès',
          applications: [],
          count: 0
        });
      });

      await request(app)
        .get('/applications?status=pending&limit=10&offset=0')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(applicationController.getUserApplications).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /applications/stats', () => {
    it('devrait récupérer les statistiques de l\'utilisateur', async () => {
      const mockStats = {
        total: 10,
        pending: 5,
        accepted: 3,
        rejected: 2
      };

      applicationController.getUserStats.mockImplementation((req, res) => {
        res.json({
          message: 'Statistiques récupérées avec succès',
          stats: mockStats
        });
      });

      const response = await request(app)
        .get('/applications/stats')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(applicationController.getUserStats).toHaveBeenCalledTimes(1);
      expect(response.body.stats).toEqual(mockStats);
    });
  });

  describe('GET /applications/search', () => {
    it('devrait rechercher des candidatures', async () => {
      const mockApplications = [
        {
          id: '456',
          user_id: '123',
          company: 'Test Company',
          position: 'Développeur Full Stack',
          status: 'pending'
        }
      ];

      applicationController.searchApplications.mockImplementation((req, res) => {
        res.json({
          message: 'Recherche effectuée avec succès',
          applications: mockApplications,
          count: 1
        });
      });

      const response = await request(app)
        .get('/applications/search?company=Test&status=pending')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(applicationController.searchApplications).toHaveBeenCalledTimes(1);
      expect(response.body.applications).toEqual(mockApplications);
    });
  });

  describe('GET /applications/recent', () => {
    it('devrait récupérer les candidatures récentes', async () => {
      const mockApplications = [
        {
          id: '456',
          user_id: '123',
          company: 'Test Company',
          position: 'Développeur',
          application_date: '2023-12-01',
          status: 'pending'
        }
      ];

      applicationController.getRecentApplications.mockImplementation((req, res) => {
        res.json({
          message: 'Candidatures récentes récupérées avec succès',
          applications: mockApplications,
          count: 1
        });
      });

      const response = await request(app)
        .get('/applications/recent?days=30')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(applicationController.getRecentApplications).toHaveBeenCalledTimes(1);
      expect(response.body.applications).toEqual(mockApplications);
    });
  });

  describe('GET /applications/count', () => {
    it('devrait récupérer les compteurs de candidatures', async () => {
      const mockCounts = {
        pending: 5,
        accepted: 3,
        rejected: 2,
        interviewing: 1
      };

      applicationController.getApplicationCounts.mockImplementation((req, res) => {
        res.json({
          message: 'Compteurs récupérés avec succès',
          counts: mockCounts
        });
      });

      const response = await request(app)
        .get('/applications/count')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(applicationController.getApplicationCounts).toHaveBeenCalledTimes(1);
      expect(response.body.counts).toEqual(mockCounts);
    });
  });

  describe('GET /applications/:id', () => {
    it('devrait récupérer une candidature spécifique', async () => {
      const mockApplication = {
        id: '456',
        user_id: '123',
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01',
        status: 'pending'
      };

      applicationController.getApplicationById.mockImplementation((req, res) => {
        res.json({
          message: 'Candidature récupérée avec succès',
          application: mockApplication
        });
      });

      const response = await request(app)
        .get('/applications/456')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(applicationController.getApplicationById).toHaveBeenCalledTimes(1);
      expect(response.body.application).toEqual(mockApplication);
    });

    it('devrait gérer les candidatures non trouvées', async () => {
      applicationController.getApplicationById.mockImplementation((req, res) => {
        res.status(404).json({
          error: 'Candidature non trouvée',
          status: 404
        });
      });

      await request(app)
        .get('/applications/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });

  describe('PUT /applications/:id', () => {
    it('devrait mettre à jour une candidature', async () => {
      const updateData = {
        status: 'accepted',
        notes: 'Candidature acceptée !'
      };

      const mockUpdatedApplication = {
        id: '456',
        user_id: '123',
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01',
        status: 'accepted',
        notes: 'Candidature acceptée !',
        updated_at: new Date('2023-01-01T00:00:00.000Z')
      };

      applicationController.updateApplication.mockImplementation((req, res) => {
        res.json({
          message: 'Candidature mise à jour avec succès',
          application: mockUpdatedApplication
        });
      });

      const response = await request(app)
        .put('/applications/456')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(applicationController.updateApplication).toHaveBeenCalledTimes(1);
      expect(response.body.application.id).toBe(mockUpdatedApplication.id);
      expect(response.body.application.status).toBe(mockUpdatedApplication.status);
      expect(response.body.application.notes).toBe(mockUpdatedApplication.notes);
    });

    it('devrait gérer les candidatures non trouvées lors de la mise à jour', async () => {
      applicationController.updateApplication.mockImplementation((req, res) => {
        res.status(404).json({
          error: 'Candidature non trouvée',
          status: 404
        });
      });

      await request(app)
        .put('/applications/999')
        .set('Authorization', 'Bearer valid-token')
        .send({ status: 'accepted' })
        .expect(404);
    });
  });

  describe('DELETE /applications/:id', () => {
    it('devrait supprimer une candidature', async () => {
      applicationController.deleteApplication.mockImplementation((req, res) => {
        res.json({
          message: 'Candidature supprimée avec succès'
        });
      });

      const response = await request(app)
        .delete('/applications/456')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(applicationController.deleteApplication).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Candidature supprimée avec succès');
    });

    it('devrait gérer les candidatures non trouvées lors de la suppression', async () => {
      applicationController.deleteApplication.mockImplementation((req, res) => {
        res.status(404).json({
          error: 'Candidature non trouvée',
          status: 404
        });
      });

      await request(app)
        .delete('/applications/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });

  describe('Validation des routes', () => {
    it('devrait rejeter les requêtes vers des routes inexistantes', async () => {
      await request(app)
        .get('/applications/nonexistent/route')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });

    it('devrait accepter les requêtes avec le bon Content-Type', async () => {
      applicationController.createApplication.mockImplementation((req, res) => {
        res.status(201).json({ message: 'Success' });
      });

      await request(app)
        .post('/applications')
        .set('Authorization', 'Bearer valid-token')
        .set('Content-Type', 'application/json')
        .send({
          company: 'Test Company',
          position: 'Développeur',
          application_date: '2023-12-01'
        })
        .expect(201);
    });
  });
}); 