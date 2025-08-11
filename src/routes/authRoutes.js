const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter, registerLimiter, sensitiveLimiter } = require('../config/rateLimit');

// Routes publiques (pas besoin d'authentification)
router.post('/register', registerLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authLimiter, authController.refreshToken);

// Routes protégées (nécessitent un token JWT)
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, sensitiveLimiter, authController.getProfile);

module.exports = router; 