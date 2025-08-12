const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');
const { sensitiveLimiter } = require('../config/rateLimit');

// Middleware d'authentification pour toutes les routes AI
router.use(authenticateToken);

// Rate limiter spécifique pour les appels AI (plus strict car coûteux)
const aiRateLimiter = sensitiveLimiter;

// Route pour la génération de lettres de motivation
router.post('/cover-letter', aiRateLimiter, aiController.generateCoverLetter);

// Route pour professionnaliser un texte pour CV
router.post('/professionalize-text', aiRateLimiter, aiController.professionalizeText);

module.exports = router; 