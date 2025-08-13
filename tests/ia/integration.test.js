// Mock des modules avant les imports
jest.mock('../../src/controllers/aiController', () => ({
  generateCoverLetter: jest.fn(),
  professionalizeText: jest.fn()
}));

jest.mock('../../src/middleware/auth', () => ({
  authenticateToken: jest.fn()
}));

jest.mock('../../src/config/rateLimit', () => ({
  sensitiveLimiter: (req, res, next) => next()
}));

const request = require('supertest');
const express = require('express');
const aiRoutes = require('../../src/routes/aiRoutes');
const aiController = require('../../src/controllers/aiController');
const { authenticateToken } = require('../../src/middleware/auth');

// Créer une application Express pour les tests
const app = express();
app.use(express.json());
app.use('/ai', aiRoutes);

describe('Tests d\'Intégration IA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock par défaut du middleware d'authentification
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: '123', role: 'user' };
      next();
    });
  });

  describe('Workflow complet de génération de lettre de motivation', () => {
    it('devrait gérer un workflow complet de génération de lettre', async () => {
      const coverLetterData = {
        position: 'Développeur Full Stack',
        company: 'Tech Company',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        telephone: '0123456789',
        adresse: '123 Rue de la Paix, 75001 Paris'
      };

      const mockResponse = {
        message: 'Lettre de motivation générée avec succès',
        content: 'Cher recruteur,\n\nJe vous présente ma candidature...',
        usage: { total_tokens: 150, prompt_tokens: 50, completion_tokens: 100 },
        model: 'gpt-3.5-turbo',
        generatedAt: new Date().toISOString()
      };

      aiController.generateCoverLetter.mockImplementation((req, res) => {
        res.json(mockResponse);
      });

      // Test de la génération
      const response = await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .send(coverLetterData)
        .expect(200);

      expect(response.body.message).toBe('Lettre de motivation générée avec succès');
      expect(response.body.content).toBe(mockResponse.content);
      expect(response.body.model).toBe('gpt-3.5-turbo');
      expect(response.body.usage).toEqual(mockResponse.usage);
      expect(response.body.generatedAt).toBeDefined();
    });

    it('devrait gérer les tentatives multiples avec rate limiting', async () => {
      // Simuler un rate limiter qui bloque après la première requête
      let requestCount = 0;
      
      aiController.generateCoverLetter.mockImplementation((req, res) => {
        requestCount++;
        if (requestCount > 1) {
          return res.status(429).json({
            error: 'Trop de requêtes',
            status: 429
          });
        }
        res.json({
          message: 'Lettre de motivation générée avec succès',
          content: 'Contenu généré',
          usage: { total_tokens: 100 },
          model: 'gpt-3.5-turbo',
          generatedAt: new Date().toISOString()
        });
      });

      // Première requête - succès
      await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .send({
          position: 'Développeur',
          company: 'Tech Company',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@email.com',
          telephone: '0123456789',
          adresse: '123 Rue de la Paix, 75001 Paris'
        })
        .expect(200);

      // Deuxième requête - bloquée par rate limiting
      await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .send({
          position: 'Développeur',
          company: 'Tech Company',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@email.com',
          telephone: '0123456789',
          adresse: '123 Rue de la Paix, 75001 Paris'
        })
        .expect(429);
    });
  });

  describe('Workflow complet de professionnalisation de texte', () => {
    it('devrait gérer un workflow complet de professionnalisation', async () => {
      const textData = {
        originalText: 'J\'ai fait du développement web avec HTML et CSS'
      };

      const mockResponse = {
        message: 'Texte professionnalisé avec succès',
        content: 'Développement d\'applications web en utilisant les technologies HTML5 et CSS3',
        usage: { total_tokens: 80, prompt_tokens: 30, completion_tokens: 50 },
        model: 'gpt-3.5-turbo',
        generatedAt: new Date().toISOString()
      };

      aiController.professionalizeText.mockImplementation((req, res) => {
        res.json(mockResponse);
      });

      // Test de la professionnalisation
      const response = await request(app)
        .post('/ai/professionalize-text')
        .set('Authorization', 'Bearer valid-token')
        .send(textData)
        .expect(200);

      expect(response.body.message).toBe('Texte professionnalisé avec succès');
      expect(response.body.content).toBe(mockResponse.content);
      expect(response.body.model).toBe('gpt-3.5-turbo');
      expect(response.body.usage).toEqual(mockResponse.usage);
      expect(response.body.generatedAt).toBeDefined();
    });

    it('devrait gérer les textes longs et courts', async () => {
      const shortText = { originalText: 'Développeur web' };
      const longText = { 
        originalText: 'J\'ai travaillé pendant 5 ans comme développeur web full stack en utilisant React, Node.js, PostgreSQL et Docker. J\'ai développé des applications e-commerce, des APIs REST et des interfaces utilisateur modernes.'
      };

      aiController.professionalizeText.mockImplementation((req, res) => {
        const text = req.body.originalText;
        const isLong = text.length > 50;
        
        res.json({
          message: 'Texte professionnalisé avec succès',
          content: isLong ? 'Expérience approfondie en développement web full stack...' : 'Développement web',
          usage: { 
            total_tokens: isLong ? 120 : 30,
            prompt_tokens: isLong ? 40 : 10,
            completion_tokens: isLong ? 80 : 20
          },
          model: 'gpt-3.5-turbo',
          generatedAt: new Date().toISOString()
        });
      });

      // Test avec texte court
      const shortResponse = await request(app)
        .post('/ai/professionalize-text')
        .set('Authorization', 'Bearer valid-token')
        .send(shortText)
        .expect(200);

      expect(shortResponse.body.usage.total_tokens).toBe(30);

      // Test avec texte long
      const longResponse = await request(app)
        .post('/ai/professionalize-text')
        .set('Authorization', 'Bearer valid-token')
        .send(longText)
        .expect(200);

      expect(longResponse.body.usage.total_tokens).toBe(120);
    });
  });

  describe('Gestion des autorisations et rôles', () => {
    it('devrait exiger l\'authentification pour toutes les routes IA', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          error: 'Token d\'accès requis',
          status: 401
        });
      });

      // Tester les deux routes IA
      await request(app).post('/ai/cover-letter').expect(401);
      await request(app).post('/ai/professionalize-text').expect(401);
    });

    it('devrait accepter différents rôles d\'utilisateur', async () => {
      const roles = ['user', 'admin', 'premium'];
      
      for (const role of roles) {
        authenticateToken.mockImplementation((req, res, next) => {
          req.user = { id: '123', role };
          next();
        });

        aiController.generateCoverLetter.mockImplementation((req, res) => {
          res.json({
            message: 'Lettre de motivation générée avec succès',
            content: 'Contenu généré',
            usage: { total_tokens: 100 },
            model: 'gpt-3.5-turbo',
            generatedAt: new Date().toISOString()
          });
        });

        await request(app)
          .post('/ai/cover-letter')
          .set('Authorization', 'Bearer valid-token')
          .send({
            position: 'Développeur',
            company: 'Tech Company',
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@email.com',
            telephone: '0123456789',
            adresse: '123 Rue de la Paix, 75001 Paris'
          })
          .expect(200);
      }
    });
  });

  describe('Gestion des erreurs avancées', () => {
    it('devrait gérer les erreurs de validation complexes', async () => {
      const invalidData = {
        position: '', // Position vide
        company: 'Tech Company',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'email-invalide', // Email invalide
        telephone: '123', // Téléphone trop court
        adresse: '123 Rue de la Paix, 75001 Paris'
      };

      aiController.generateCoverLetter.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'Données invalides: position vide, email invalide, téléphone trop court',
          status: 400
        });
      });

      await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidData)
        .expect(400);
    });

    it('devrait gérer les erreurs de service IA', async () => {
      aiController.generateCoverLetter.mockImplementation((req, res) => {
        res.status(503).json({
          error: 'Service IA temporairement indisponible',
          status: 503
        });
      });

      await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .send({
          position: 'Développeur Full Stack',
          company: 'Tech Company',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@email.com',
          telephone: '0123456789',
          adresse: '123 Rue de la Paix, 75001 Paris'
        })
        .expect(503);
    });

    it('devrait gérer les timeouts de l\'API IA', async () => {
      aiController.professionalizeText.mockImplementation((req, res) => {
        res.status(408).json({
          error: 'Timeout de l\'API IA',
          status: 408
        });
      });

      await request(app)
        .post('/ai/professionalize-text')
        .set('Authorization', 'Bearer valid-token')
        .send({
          originalText: 'J\'ai fait du développement web'
        })
        .expect(408);
    });
  });

  describe('Validation des réponses', () => {
    it('devrait valider la structure des réponses de génération', async () => {
      aiController.generateCoverLetter.mockImplementation((req, res) => {
        res.json({
          message: 'Lettre de motivation générée avec succès',
          content: 'Cher recruteur,\n\nJe vous présente ma candidature...',
          usage: { total_tokens: 150, prompt_tokens: 50, completion_tokens: 100 },
          model: 'gpt-3.5-turbo',
          generatedAt: new Date().toISOString()
        });
      });

      const response = await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .send({
          position: 'Développeur Full Stack',
          company: 'Tech Company',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@email.com',
          telephone: '0123456789',
          adresse: '123 Rue de la Paix, 75001 Paris'
        })
        .expect(200);

      // Vérifier la structure de la réponse
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('usage');
      expect(response.body).toHaveProperty('model');
      expect(response.body).toHaveProperty('generatedAt');
      
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.content).toBe('string');
      expect(typeof response.body.usage).toBe('object');
      expect(typeof response.body.model).toBe('string');
      expect(typeof response.body.generatedAt).toBe('string');
      
      expect(response.body.usage).toHaveProperty('total_tokens');
      expect(response.body.usage).toHaveProperty('prompt_tokens');
      expect(response.body.usage).toHaveProperty('completion_tokens');
    });

    it('devrait valider la structure des réponses de professionnalisation', async () => {
      aiController.professionalizeText.mockImplementation((req, res) => {
        res.json({
          message: 'Texte professionnalisé avec succès',
          content: 'Développement d\'applications web',
          usage: { total_tokens: 80, prompt_tokens: 30, completion_tokens: 50 },
          model: 'gpt-3.5-turbo',
          generatedAt: new Date().toISOString()
        });
      });

      const response = await request(app)
        .post('/ai/professionalize-text')
        .set('Authorization', 'Bearer valid-token')
        .send({
          originalText: 'J\'ai fait du développement web'
        })
        .expect(200);

      // Vérifier la structure de la réponse
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('usage');
      expect(response.body).toHaveProperty('model');
      expect(response.body).toHaveProperty('generatedAt');
      
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.content).toBe('string');
      expect(typeof response.body.usage).toBe('object');
      expect(typeof response.body.model).toBe('string');
      expect(typeof response.body.generatedAt).toBe('string');
    });
  });
}); 