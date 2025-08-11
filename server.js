const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API BrightPath!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Endpoint principal - GET /api/hello
app.get('/api/hello', (req, res) => {
  const { name } = req.query;
  
  res.json({
    message: `Bonjour ${name || 'Monde'}!`,
    timestamp: new Date().toISOString(),
    endpoint: '/api/hello',
    method: 'GET'
  });
});

// Endpoint POST pour créer quelque chose
app.post('/api/data', (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({
      error: 'Le titre est requis',
      status: 400
    });
  }
  
  const newData = {
    id: Date.now(),
    title,
    description: description || '',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: 'Données créées avec succès',
    data: newData
  });
});

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
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/hello`);
  console.log(`   POST http://localhost:${PORT}/api/data`);
}); 