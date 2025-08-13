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

describe('Routes IA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock par défaut du middleware d'authentification
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: '123', role: 'user' };
      next();
    });
  });

  describe('POST /ai/cover-letter', () => {
    it('devrait générer une lettre de motivation avec succès', async () => {
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

      const response = await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .send(coverLetterData)
        .expect(200);

      expect(authenticateToken).toHaveBeenCalled();
      expect(aiController.generateCoverLetter).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Lettre de motivation générée avec succès');
      expect(response.body.content).toBe(mockResponse.content);
      expect(response.body.model).toBe('gpt-3.5-turbo');
    });

    it('devrait rejeter les requêtes sans authentification', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          error: 'Token d\'accès requis',
          status: 401
        });
      });

      await request(app)
        .post('/ai/cover-letter')
        .send({
          position: 'Développeur',
          company: 'Tech Company'
        })
        .expect(401);
    });

    it('devrait gérer les données manquantes', async () => {
      aiController.generateCoverLetter.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'Champs requis manquants: nom, prenom, email, telephone, adresse',
          status: 400
        });
      });

      await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .send({
          position: 'Développeur',
          company: 'Tech Company'
        })
        .expect(400);
    });

    it('devrait gérer les erreurs de génération', async () => {
      aiController.generateCoverLetter.mockImplementation((req, res) => {
        res.status(500).json({
          error: 'Erreur API OpenAI',
          status: 500
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
        .expect(500);
    });
  });

  describe('POST /ai/professionalize-text', () => {
    it('devrait professionnaliser un texte avec succès', async () => {
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

      const response = await request(app)
        .post('/ai/professionalize-text')
        .set('Authorization', 'Bearer valid-token')
        .send(textData)
        .expect(200);

      expect(authenticateToken).toHaveBeenCalled();
      expect(aiController.professionalizeText).toHaveBeenCalledTimes(1);
      expect(response.body.message).toBe('Texte professionnalisé avec succès');
      expect(response.body.content).toBe(mockResponse.content);
      expect(response.body.model).toBe('gpt-3.5-turbo');
    });

    it('devrait rejeter les requêtes sans authentification', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({
          error: 'Token d\'accès requis',
          status: 401
        });
      });

      await request(app)
        .post('/ai/professionalize-text')
        .send({
          originalText: 'J\'ai fait du développement web'
        })
        .expect(401);
    });

    it('devrait gérer le texte manquant', async () => {
      aiController.professionalizeText.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'Champs requis manquants: originalText',
          status: 400
        });
      });

      await request(app)
        .post('/ai/professionalize-text')
        .set('Authorization', 'Bearer valid-token')
        .send({})
        .expect(400);
    });

    it('devrait gérer les erreurs de professionnalisation', async () => {
      aiController.professionalizeText.mockImplementation((req, res) => {
        res.status(500).json({
          error: 'Erreur API OpenAI',
          status: 500
        });
      });

      await request(app)
        .post('/ai/professionalize-text')
        .set('Authorization', 'Bearer valid-token')
        .send({
          originalText: 'J\'ai fait du développement web'
        })
        .expect(500);
    });
  });

  describe('Validation des routes', () => {
    it('devrait rejeter les requêtes vers des routes inexistantes', async () => {
      await request(app)
        .post('/ai/nonexistent-route')
        .set('Authorization', 'Bearer valid-token')
        .send({})
        .expect(404);
    });

    it('devrait accepter les requêtes avec le bon Content-Type', async () => {
      aiController.generateCoverLetter.mockImplementation((req, res) => {
        res.json({ message: 'Success' });
      });

      await request(app)
        .post('/ai/cover-letter')
        .set('Authorization', 'Bearer valid-token')
        .set('Content-Type', 'application/json')
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
    });

    it('devrait exiger l\'authentification pour toutes les routes', async () => {
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
  });
}); 