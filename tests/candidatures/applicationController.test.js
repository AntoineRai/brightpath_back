// Mock des modules avant les imports
jest.mock('../../src/models/Application', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getUserStats: jest.fn(),
  search: jest.fn(),
  getRecent: jest.fn(),
  countByStatus: jest.fn()
}));

const applicationController = require('../../src/controllers/applicationController');
const Application = require('../../src/models/Application');

describe('Contrôleur des candidatures', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de la requête
    mockReq = {
      user: { id: '123', role: 'user' },
      body: {},
      params: {},
      query: {}
    };

    // Mock de la réponse
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('createApplication', () => {
    it('devrait créer une candidature avec succès', async () => {
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

      const mockApplication = {
        id: '456',
        user_id: '123',
        ...applicationData,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.body = applicationData;

      Application.create.mockResolvedValue(mockApplication);

      await applicationController.createApplication(mockReq, mockRes);

      expect(Application.create).toHaveBeenCalledWith({
        ...applicationData,
        user_id: '123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidature créée avec succès',
        application: mockApplication
      });
    });

    it('devrait gérer les erreurs de validation', async () => {
      mockReq.body = { company: 'Test Company' }; // Données incomplètes

      Application.create.mockRejectedValue(new Error('user_id, company, position et application_date sont requis'));

      await applicationController.createApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'user_id, company, position et application_date sont requis',
        status: 400
      });
    });

    it('devrait gérer les erreurs générales', async () => {
      const applicationData = {
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01'
      };

      mockReq.body = applicationData;

      Application.create.mockRejectedValue(new Error('Erreur de base de données'));

      await applicationController.createApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la création de la candidature',
        status: 500
      });
    });
  });

  describe('getUserApplications', () => {
    it('devrait récupérer les candidatures de l\'utilisateur avec succès', async () => {
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

      mockReq.query = {
        status: 'pending',
        limit: '10',
        offset: '0',
        orderBy: 'application_date',
        orderDirection: 'desc'
      };

      Application.findByUserId.mockResolvedValue(mockApplications);

      await applicationController.getUserApplications(mockReq, mockRes);

      expect(Application.findByUserId).toHaveBeenCalledWith('123', {
        status: 'pending',
        limit: 10,
        offset: 0,
        orderBy: 'application_date',
        orderDirection: 'desc'
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidatures récupérées avec succès',
        applications: mockApplications,
        count: 1,
        pagination: {
          limit: 10,
          offset: 0
        }
      });
    });

    it('devrait utiliser les valeurs par défaut pour la pagination', async () => {
      const mockApplications = [];

      Application.findByUserId.mockResolvedValue(mockApplications);

      await applicationController.getUserApplications(mockReq, mockRes);

      expect(Application.findByUserId).toHaveBeenCalledWith('123', {
        status: undefined,
        limit: 100,
        offset: 0,
        orderBy: 'application_date',
        orderDirection: 'desc'
      });
    });

    it('devrait gérer les erreurs', async () => {
      Application.findByUserId.mockRejectedValue(new Error('Erreur de base de données'));

      await applicationController.getUserApplications(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération des candidatures',
        status: 500
      });
    });
  });

  describe('getApplicationById', () => {
    it('devrait récupérer une candidature spécifique avec succès', async () => {
      const mockApplication = {
        id: '456',
        user_id: '123',
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01',
        status: 'pending'
      };

      mockReq.params = { id: '456' };

      Application.findById.mockResolvedValue(mockApplication);

      await applicationController.getApplicationById(mockReq, mockRes);

      expect(Application.findById).toHaveBeenCalledWith('456');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidature récupérée avec succès',
        application: mockApplication
      });
    });

    it('devrait retourner 404 si la candidature n\'existe pas', async () => {
      mockReq.params = { id: '999' };

      Application.findById.mockResolvedValue(null);

      await applicationController.getApplicationById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Candidature non trouvée',
        status: 404
      });
    });

    it('devrait autoriser l\'accès admin', async () => {
      const mockApplication = {
        id: '456',
        user_id: '999', // Différent de l'utilisateur actuel
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01',
        status: 'pending'
      };

      mockReq.params = { id: '456' };
      mockReq.user = { id: '123', role: 'admin' };

      Application.findById.mockResolvedValue(mockApplication);

      await applicationController.getApplicationById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidature récupérée avec succès',
        application: mockApplication
      });
    });

    it('devrait refuser l\'accès si l\'utilisateur n\'est pas propriétaire', async () => {
      const mockApplication = {
        id: '456',
        user_id: '999', // Différent de l'utilisateur actuel
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01',
        status: 'pending'
      };

      mockReq.params = { id: '456' };

      Application.findById.mockResolvedValue(mockApplication);

      await applicationController.getApplicationById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Accès non autorisé à cette candidature',
        status: 403
      });
    });
  });

  describe('updateApplication', () => {
    it('devrait mettre à jour une candidature avec succès', async () => {
      const existingApplication = {
        id: '456',
        user_id: '123',
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01',
        status: 'pending'
      };

      const updateData = {
        status: 'accepted',
        notes: 'Candidature acceptée !'
      };

      const updatedApplication = {
        ...existingApplication,
        ...updateData,
        updated_at: new Date()
      };

      mockReq.params = { id: '456' };
      mockReq.body = updateData;

      Application.findById.mockResolvedValue(existingApplication);
      Application.update.mockResolvedValue(updatedApplication);

      await applicationController.updateApplication(mockReq, mockRes);

      expect(Application.findById).toHaveBeenCalledWith('456');
      expect(Application.update).toHaveBeenCalledWith('456', updateData);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidature mise à jour avec succès',
        application: updatedApplication
      });
    });

    it('devrait retourner 404 si la candidature n\'existe pas', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { status: 'accepted' };

      Application.findById.mockResolvedValue(null);

      await applicationController.updateApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Candidature non trouvée',
        status: 404
      });
    });

    it('devrait refuser la mise à jour si l\'utilisateur n\'est pas propriétaire', async () => {
      const existingApplication = {
        id: '456',
        user_id: '999', // Différent de l'utilisateur actuel
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01',
        status: 'pending'
      };

      mockReq.params = { id: '456' };
      mockReq.body = { status: 'accepted' };

      Application.findById.mockResolvedValue(existingApplication);

      await applicationController.updateApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Accès non autorisé à cette candidature',
        status: 403
      });
    });
  });

  describe('deleteApplication', () => {
    it('devrait supprimer une candidature avec succès', async () => {
      const existingApplication = {
        id: '456',
        user_id: '123',
        company: 'Test Company',
        position: 'Développeur',
        application_date: '2023-12-01',
        status: 'pending'
      };

      mockReq.params = { id: '456' };

      Application.findById.mockResolvedValue(existingApplication);
      Application.delete.mockResolvedValue();

      await applicationController.deleteApplication(mockReq, mockRes);

      expect(Application.findById).toHaveBeenCalledWith('456');
      expect(Application.delete).toHaveBeenCalledWith('456');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidature supprimée avec succès'
      });
    });

    it('devrait retourner 404 si la candidature n\'existe pas', async () => {
      mockReq.params = { id: '999' };

      Application.findById.mockResolvedValue(null);

      await applicationController.deleteApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Candidature non trouvée',
        status: 404
      });
    });
  });

  describe('getUserStats', () => {
    it('devrait récupérer les statistiques avec succès', async () => {
      const mockStats = {
        total: 10,
        pending: 5,
        accepted: 3,
        rejected: 2,
        interview_rate: 0.3,
        acceptance_rate: 0.3
      };

      Application.getUserStats.mockResolvedValue(mockStats);

      await applicationController.getUserStats(mockReq, mockRes);

      expect(Application.getUserStats).toHaveBeenCalledWith('123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Statistiques récupérées avec succès',
        stats: mockStats
      });
    });

    it('devrait gérer les erreurs', async () => {
      Application.getUserStats.mockRejectedValue(new Error('Erreur de base de données'));

      await applicationController.getUserStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération des statistiques',
        status: 500
      });
    });
  });

  describe('searchApplications', () => {
    it('devrait rechercher des candidatures avec succès', async () => {
      const searchParams = {
        company: 'Test',
        status: 'pending',
        position: 'Développeur'
      };

      const mockApplications = [
        {
          id: '456',
          user_id: '123',
          company: 'Test Company',
          position: 'Développeur Full Stack',
          status: 'pending'
        }
      ];

      mockReq.query = searchParams;

      Application.search.mockResolvedValue(mockApplications);

      await applicationController.searchApplications(mockReq, mockRes);

      expect(Application.search).toHaveBeenCalledWith('123', searchParams);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Recherche effectuée avec succès',
        applications: mockApplications,
        count: 1,
        searchParams
      });
    });

    it('devrait gérer les erreurs', async () => {
      mockReq.query = { company: 'Test' };

      Application.search.mockRejectedValue(new Error('Erreur de base de données'));

      await applicationController.searchApplications(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la recherche des candidatures',
        status: 500
      });
    });
  });

  describe('getRecentApplications', () => {
    it('devrait récupérer les candidatures récentes avec succès', async () => {
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

      mockReq.query = { days: '30' };

      Application.getRecent.mockResolvedValue(mockApplications);

      await applicationController.getRecentApplications(mockReq, mockRes);

      expect(Application.getRecent).toHaveBeenCalledWith('123', 30);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidatures récentes récupérées avec succès',
        applications: mockApplications,
        count: 1,
        days: 30
      });
    });

    it('devrait utiliser la valeur par défaut pour les jours', async () => {
      const mockApplications = [];

      Application.getRecent.mockResolvedValue(mockApplications);

      await applicationController.getRecentApplications(mockReq, mockRes);

      expect(Application.getRecent).toHaveBeenCalledWith('123', 30);
    });
  });

  describe('getApplicationCounts', () => {
    it('devrait récupérer les compteurs avec succès', async () => {
      const mockCounts = {
        pending: 5,
        accepted: 3,
        rejected: 2,
        interviewing: 1
      };

      Application.countByStatus.mockResolvedValue(mockCounts);

      await applicationController.getApplicationCounts(mockReq, mockRes);

      expect(Application.countByStatus).toHaveBeenCalledWith('123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Compteurs récupérés avec succès',
        counts: mockCounts
      });
    });

    it('devrait gérer les erreurs', async () => {
      Application.countByStatus.mockRejectedValue(new Error('Erreur de base de données'));

      await applicationController.getApplicationCounts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors du comptage des candidatures',
        status: 500
      });
    });
  });
}); 