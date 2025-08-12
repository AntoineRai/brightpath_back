require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import des routes
const authRoutes = require('./src/routes/authRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

// Import de la configuration Supabase
const { testConnection } = require('./src/config/supabase');

// Import de la configuration OpenAI
const { testOpenAIConnection } = require('./src/config/openai');

// Import des middlewares de sécurité
const { globalLimiter } = require('./src/config/rateLimit');
const { 
  securityMiddleware, 
  customSecurityHeaders, 
  requestSizeLimiter, 
  contentTypeValidator, 
  attackLogger 
} = require('./src/middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de sécurité (à appliquer en premier)
app.use(securityMiddleware);
app.use(customSecurityHeaders);
app.use(attackLogger);
app.use(requestSizeLimiter);
app.use(contentTypeValidator);

// Rate limiter global
app.use(globalLimiter);

// Middleware CORS et parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de base (Publique - pas besoin de JWT)
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API BrightPath!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    info: 'Cette route est publique. Les autres routes nécessitent une authentification JWT.',
    endpoints: {
      public: [
        'GET /',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/refresh'
      ],
      protected: [
        'GET /api/hello',
        'POST /api/data',
        'GET /api/data',
        'GET /api/data/:id',
        'GET /api/auth/me',
        'POST /api/auth/logout'
      ]
    }
  });
});

// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);

// Routes API protégées (nécessitent JWT)
app.use('/api', apiRoutes);

// Routes des candidatures (protégées)
app.use('/api/applications', applicationRoutes);

// Routes AI (protégées)
app.use('/api/ai', aiRoutes);

// Import du middleware de gestion d'erreurs
const errorHandler = require('./src/middleware/errorHandler');

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    status: 404
  });
});

// Gestion des erreurs globales
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log(`🔐 Système JWT intégré`);
  console.log(`🗄️  Base de données Supabase connectée`);
  console.log(`🛡️  Système de sécurité et rate limiting activé`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Rate limiting: ${process.env.NODE_ENV === 'development' ? 'Mode développement (limites élevées)' : 'Mode production (limites strictes)'}`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   📍 Routes publiques:`);
  console.log(`      GET  http://localhost:${PORT}/`);
  console.log(`      POST http://localhost:${PORT}/api/auth/register`);
  console.log(`      POST http://localhost:${PORT}/api/auth/login`);
  console.log(`      POST http://localhost:${PORT}/api/auth/refresh`);
  console.log(`   🔒 Routes protégées (nécessitent JWT):`);
  console.log(`      GET  http://localhost:${PORT}/api/hello`);
  console.log(`      POST http://localhost:${PORT}/api/data`);
  console.log(`      GET  http://localhost:${PORT}/api/data`);
  console.log(`      GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`      POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`   📝 Routes des candidatures:`);
  console.log(`      POST http://localhost:${PORT}/api/applications`);
  console.log(`      GET  http://localhost:${PORT}/api/applications`);
  console.log(`      GET  http://localhost:${PORT}/api/applications/stats`);
  console.log(`      GET  http://localhost:${PORT}/api/applications/search`);
  console.log(`   🤖 Routes AI (ChatGPT):`);
  console.log(`      POST http://localhost:${PORT}/api/ai/cover-letter`);
  console.log(`      POST http://localhost:${PORT}/api/ai/professionalize-text`);
  
  // Tester la connexion Supabase
  try {
    await testConnection();
  } catch (error) {
    console.error('❌ Erreur de connexion à Supabase:', error.message);
  }

  // Tester la connexion OpenAI
  try {
    await testOpenAIConnection();
  } catch (error) {
    console.error('❌ Erreur de connexion à OpenAI:', error.message);
  }
}); 