const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes API
router.use(authenticateToken);

// Route hello protégée
router.get('/hello', (req, res) => {
  const { name } = req.query;
  
  res.json({
    message: `Bonjour ${name || 'Monde'}! (Utilisateur authentifié: ${req.user.name})`,
    timestamp: new Date().toISOString(),
    endpoint: '/api/hello',
    method: 'GET',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Route de données protégée
router.post('/data', (req, res) => {
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
    createdAt: new Date().toISOString(),
    createdBy: {
      id: req.user.id,
      name: req.user.name
    }
  };
  
  res.status(201).json({
    message: 'Données créées avec succès',
    data: newData
  });
});

// Route pour récupérer les données de l'utilisateur
router.get('/data', (req, res) => {
  // Simulation de données (en production, ceci viendrait de la base de données)
  const mockData = [
    {
      id: 1,
      title: 'Premier élément',
      description: 'Description du premier élément',
      createdAt: new Date().toISOString(),
      createdBy: {
        id: req.user.id,
        name: req.user.name
      }
    },
    {
      id: 2,
      title: 'Deuxième élément',
      description: 'Description du deuxième élément',
      createdAt: new Date().toISOString(),
      createdBy: {
        id: req.user.id,
        name: req.user.name
      }
    }
  ];
  
  res.json({
    message: 'Données récupérées avec succès',
    data: mockData,
    count: mockData.length,
    user: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Route pour récupérer une donnée spécifique
router.get('/data/:id', (req, res) => {
  const { id } = req.params;
  
  const mockData = {
    id: parseInt(id),
    title: `Élément ${id}`,
    description: `Description de l'élément ${id}`,
    createdAt: new Date().toISOString(),
    createdBy: {
      id: req.user.id,
      name: req.user.name
    }
  };
  
  res.json({
    message: 'Données récupérées avec succès',
    data: mockData
  });
});

module.exports = router; 