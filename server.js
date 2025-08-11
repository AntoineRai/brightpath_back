require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import des routes
const authRoutes = require('./src/routes/authRoutes');
const apiRoutes = require('./src/routes/apiRoutes');

// Import de la configuration Supabase
const { testConnection } = require('./src/config/supabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    status: 404
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    status: 500
  });
});

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log(`🔐 Système JWT intégré`);
  console.log(`🗄️  Base de données Supabase connectée`);
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
  
  // Tester la connexion Supabase
  try {
    await testConnection();
  } catch (error) {
    console.error('❌ Erreur de connexion à Supabase:', error.message);
  }
}); 