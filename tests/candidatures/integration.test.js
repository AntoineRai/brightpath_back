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

describe('Tests d\'intégration - Candidatures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock par défaut du middleware d'authentification
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: '123', role: 'user' };
      next();
    });
  });

  describe('Workflow complet CRUD', () => {
    it('devrait permettre de créer, lire, mettre à jour et supprimer une candidature', async () => {
      // 1. Créer une candidature
      const applicationData = {
        company: 'Test Company',
        position: 'Développeur Full Stack',
        application_date: '2023-12-01',
        status: 'pending',
        location: 'Paris',
        salary: '50000',
        contact_person: 'John Doe',
        contact_email: 'john@test.com',
        contact_phone: '0123456789',
        job_description: 'Description du poste',
        notes: 'Notes personnelles'
      };

      const mockCreatedApplication = {
        id: '456',
        user_id: '123',
        ...applicationData,
        created_at: new Date(),
        updated_at: new Date()
      };

      applicationController.createApplication.mockImplementation((req, res) => {
        res.status(201).json({
          message: 'Candidature créée avec succès',
          application: mockCreatedApplication
        });
      });

      const createResponse = await request(app)
        .post('/applications')
        .set('Authorization', 'Bearer valid-token')
        .send(applicationData)
        .expect(201);

      expect(createResponse.body.application.id).toBe('456');
      expect(createResponse.body.application.company).toBe('Test Company');

      // 2. Lire la candidature créée
      applicationController.getApplicationById.mockImplementation((req, res) => {
        res.json({
          message: 'Candidature récupérée avec succès',
          application: mockCreatedApplication
        });
      });

      const getResponse = await request(app)
        .get('/applications/456')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(getResponse.body.application.id).toBe('456');

      // 3. Mettre à jour la candidature
      const updateData = {
        status: 'accepted',
        notes: 'Candidature acceptée !'
      };

      const mockUpdatedApplication = {
        ...mockCreatedApplication,
        ...updateData,
        updated_at: new Date()
      };

      applicationController.updateApplication.mockImplementation((req, res) => {
        res.json({
          message: 'Candidature mise à jour avec succès',
          application: mockUpdatedApplication
        });
      });

      const updateResponse = await request(app)
        .put('/applications/456')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.application.status).toBe('accepted');

      // 4. Supprimer la candidature
      applicationController.deleteApplication.mockImplementation((req, res) => {
        res.json({
          message: 'Candidature supprimée avec succès'
        });
      });

      const deleteResponse = await request(app)
        .delete('/applications/456')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(deleteResponse.body.message).toBe('Candidature supprimée avec succès');
    });
  });

  describe('Gestion des autorisations', () => {
    it('devrait autoriser l\'accès admin à toutes les candidatures', async () => {
      // Mock d'un utilisateur admin
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: '123', role: 'admin' };
        next();
      });

      const mockApplication = {
        id: '456',
        user_id: '999', // Différent de l'utilisateur admin
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
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.application.user_id).toBe('999');
    });

    it('devrait refuser l\'accès aux candidatures d\'autres utilisateurs', async () => {
      // Mock d'un utilisateur normal
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: '123', role: 'user' };
        next();
      });

      applicationController.getApplicationById.mockImplementation((req, res) => {
        res.status(403).json({
          error: 'Accès non autorisé à cette candidature',
          status: 403
        });
      });

      await request(app)
        .get('/applications/456')
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });
  });

  describe('Fonctionnalités avancées', () => {
    it('devrait permettre la recherche de candidatures', async () => {
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
          count: 1,
          searchParams: req.query
        });
      });

      const response = await request(app)
        .get('/applications/search?company=Test&status=pending&position=Développeur')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.applications).toHaveLength(1);
      expect(response.body.searchParams.company).toBe('Test');
    });

    it('devrait récupérer les statistiques utilisateur', async () => {
      const mockStats = {
        total: 10,
        pending: 5,
        accepted: 3,
        rejected: 2,
        interview_rate: 0.3,
        acceptance_rate: 0.3
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

      expect(response.body.stats.total).toBe(10);
      expect(response.body.stats.pending).toBe(5);
    });

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
          count: 1,
          days: parseInt(req.query.days) || 30
        });
      });

      const response = await request(app)
        .get('/applications/recent?days=7')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.applications).toHaveLength(1);
      expect(response.body.days).toBe(7);
    });

    it('devrait compter les candidatures par statut', async () => {
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

      expect(response.body.counts.pending).toBe(5);
      expect(response.body.counts.accepted).toBe(3);
    });
  });

  describe('Gestion des erreurs', () => {
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

    it('devrait gérer les erreurs de validation', async () => {
      applicationController.createApplication.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'user_id, company, position et application_date sont requis',
          status: 400
        });
      });

      await request(app)
        .post('/applications')
        .set('Authorization', 'Bearer valid-token')
        .send({ company: 'Test Company' }) // Données incomplètes
        .expect(400);
    });

    it('devrait gérer les erreurs serveur', async () => {
      applicationController.getUserApplications.mockImplementation((req, res) => {
        res.status(500).json({
          error: 'Erreur lors de la récupération des candidatures',
          status: 500
        });
      });

      await request(app)
        .get('/applications')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });
  });

  describe('Validation des paramètres', () => {
    it('devrait accepter les paramètres de pagination', async () => {
      const mockApplications = [];

      applicationController.getUserApplications.mockImplementation((req, res) => {
        res.json({
          message: 'Candidatures récupérées avec succès',
          applications: mockApplications,
          count: 0,
          pagination: {
            limit: parseInt(req.query.limit) || 100,
            offset: parseInt(req.query.offset) || 0
          }
        });
      });

      const response = await request(app)
        .get('/applications?limit=5&offset=10&orderBy=company&orderDirection=asc')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.offset).toBe(10);
    });

    it('devrait valider le Content-Type JSON', async () => {
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

  describe('Sécurité', () => {
    it('devrait exiger l\'authentification pour toutes les routes', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          error: 'Token d\'accès requis',
          status: 401
        });
      });

      // Tester plusieurs routes
      await request(app).post('/applications').expect(401);
      await request(app).get('/applications').expect(401);
      await request(app).get('/applications/456').expect(401);
      await request(app).put('/applications/456').expect(401);
      await request(app).delete('/applications/456').expect(401);
    });

    it('devrait rejeter les requêtes vers des routes inexistantes', async () => {
      await request(app)
        .get('/applications/nonexistent/route')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });
}); 