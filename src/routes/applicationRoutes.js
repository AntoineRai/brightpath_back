const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/auth');
const { apiLimiter, sensitiveLimiter } = require('../config/rateLimit');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);
router.use(apiLimiter);

// Routes principales CRUD
router.post('/', applicationController.createApplication);
router.get('/', applicationController.getUserApplications);
router.get('/stats', sensitiveLimiter, applicationController.getUserStats);
router.get('/search', applicationController.searchApplications);
router.get('/recent', applicationController.getRecentApplications);
router.get('/count', sensitiveLimiter, applicationController.getApplicationCounts);

// Routes pour une candidature spécifique
router.get('/:id', applicationController.getApplicationById);
router.put('/:id', applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router; 