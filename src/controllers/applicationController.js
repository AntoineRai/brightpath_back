const Application = require('../models/Application');

const applicationController = {
  // POST /api/applications - Créer une nouvelle candidature
  createApplication: async (req, res) => {
    try {
      const userId = req.user.id;
      const applicationData = {
        ...req.body,
        user_id: userId
      };

      const newApplication = await Application.create(applicationData);

      res.status(201).json({
        message: 'Candidature créée avec succès',
        application: newApplication
      });

    } catch (error) {
      console.error('Erreur lors de la création de la candidature:', error);
      
      if (error.message.includes('sont requis')) {
        return res.status(400).json({
          error: error.message,
          status: 400
        });
      }
      
      res.status(500).json({
        error: 'Erreur lors de la création de la candidature',
        status: 500
      });
    }
  },

  // GET /api/applications - Récupérer toutes les candidatures de l'utilisateur
  getUserApplications: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        status, 
        limit = 100, 
        offset = 0, 
        orderBy = 'application_date', 
        orderDirection = 'desc' 
      } = req.query;

      const options = {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy,
        orderDirection
      };

      const applications = await Application.findByUserId(userId, options);

      res.json({
        message: 'Candidatures récupérées avec succès',
        applications,
        count: applications.length,
        pagination: {
          limit: options.limit,
          offset: options.offset
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des candidatures',
        status: 500
      });
    }
  },

  // GET /api/applications/:id - Récupérer une candidature spécifique
  getApplicationById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const application = await Application.findById(id);

      if (!application) {
        return res.status(404).json({
          error: 'Candidature non trouvée',
          status: 404
        });
      }

      // Vérifier que l'utilisateur est propriétaire de la candidature
      if (application.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès non autorisé à cette candidature',
          status: 403
        });
      }

      res.json({
        message: 'Candidature récupérée avec succès',
        application
      });

    } catch (error) {
      console.error('Erreur lors de la récupération de la candidature:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération de la candidature',
        status: 500
      });
    }
  },

  // PUT /api/applications/:id - Mettre à jour une candidature
  updateApplication: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Vérifier que la candidature existe et appartient à l'utilisateur
      const existingApplication = await Application.findById(id);
      
      if (!existingApplication) {
        return res.status(404).json({
          error: 'Candidature non trouvée',
          status: 404
        });
      }

      if (existingApplication.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès non autorisé à cette candidature',
          status: 403
        });
      }

      const updatedApplication = await Application.update(id, updateData);

      res.json({
        message: 'Candidature mise à jour avec succès',
        application: updatedApplication
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour de la candidature:', error);
      res.status(500).json({
        error: 'Erreur lors de la mise à jour de la candidature',
        status: 500
      });
    }
  },

  // DELETE /api/applications/:id - Supprimer une candidature
  deleteApplication: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Vérifier que la candidature existe et appartient à l'utilisateur
      const existingApplication = await Application.findById(id);
      
      if (!existingApplication) {
        return res.status(404).json({
          error: 'Candidature non trouvée',
          status: 404
        });
      }

      if (existingApplication.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès non autorisé à cette candidature',
          status: 403
        });
      }

      await Application.delete(id);

      res.json({
        message: 'Candidature supprimée avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression de la candidature:', error);
      res.status(500).json({
        error: 'Erreur lors de la suppression de la candidature',
        status: 500
      });
    }
  },

  // GET /api/applications/stats - Obtenir les statistiques de l'utilisateur
  getUserStats: async (req, res) => {
    try {
      const userId = req.user.id;

      const stats = await Application.getUserStats(userId);

      res.json({
        message: 'Statistiques récupérées avec succès',
        stats
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des statistiques',
        status: 500
      });
    }
  },

  // GET /api/applications/search - Rechercher des candidatures
  searchApplications: async (req, res) => {
    try {
      const userId = req.user.id;
      const searchParams = req.query;

      const applications = await Application.search(userId, searchParams);

      res.json({
        message: 'Recherche effectuée avec succès',
        applications,
        count: applications.length,
        searchParams
      });

    } catch (error) {
      console.error('Erreur lors de la recherche des candidatures:', error);
      res.status(500).json({
        error: 'Erreur lors de la recherche des candidatures',
        status: 500
      });
    }
  },

  // GET /api/applications/recent - Obtenir les candidatures récentes
  getRecentApplications: async (req, res) => {
    try {
      const userId = req.user.id;
      const { days = 30 } = req.query;

      const applications = await Application.getRecent(userId, parseInt(days));

      res.json({
        message: 'Candidatures récentes récupérées avec succès',
        applications,
        count: applications.length,
        days: parseInt(days)
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures récentes:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des candidatures récentes',
        status: 500
      });
    }
  },

  // GET /api/applications/count - Compter les candidatures par statut
  getApplicationCounts: async (req, res) => {
    try {
      const userId = req.user.id;

      const counts = await Application.countByStatus(userId);

      res.json({
        message: 'Compteurs récupérés avec succès',
        counts
      });

    } catch (error) {
      console.error('Erreur lors du comptage des candidatures:', error);
      res.status(500).json({
        error: 'Erreur lors du comptage des candidatures',
        status: 500
      });
    }
  }
};

module.exports = applicationController; 