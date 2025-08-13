// Mock des modules avant les imports
jest.mock('../../src/utils/aiUtils', () => ({
  generateCoverLetter: jest.fn(),
  professionalizeText: jest.fn()
}));

const aiController = require('../../src/controllers/aiController');
const AIUtils = require('../../src/utils/aiUtils');

describe('Contrôleur IA', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de la requête
    mockReq = {
      user: { id: '123', role: 'user' },
      body: {}
    };

    // Mock de la réponse
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('generateCoverLetter', () => {
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

      const mockResult = {
        success: true,
        content: 'Cher recruteur,\n\nJe vous présente ma candidature...',
        usage: { total_tokens: 150, prompt_tokens: 50, completion_tokens: 100 },
        model: 'gpt-3.5-turbo'
      };

      mockReq.body = coverLetterData;

      AIUtils.generateCoverLetter.mockResolvedValue(mockResult);

      await aiController.generateCoverLetter(mockReq, mockRes);

      expect(AIUtils.generateCoverLetter).toHaveBeenCalledWith(coverLetterData);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Lettre de motivation générée avec succès',
        content: mockResult.content,
        usage: mockResult.usage,
        model: mockResult.model,
        generatedAt: expect.any(String)
      });
    });

    it('devrait gérer les champs manquants', async () => {
      const incompleteData = {
        position: 'Développeur',
        company: 'Tech Company'
        // Manque nom, prenom, email, telephone, adresse
      };

      mockReq.body = incompleteData;

      await aiController.generateCoverLetter(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Champs requis manquants: nom, prenom, email, telephone, adresse',
        status: 400
      });
    });

    it('devrait gérer les erreurs de génération', async () => {
      const coverLetterData = {
        position: 'Développeur Full Stack',
        company: 'Tech Company',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        telephone: '0123456789',
        adresse: '123 Rue de la Paix, 75001 Paris'
      };

      const mockResult = {
        success: false,
        error: 'Erreur API OpenAI',
        content: null
      };

      mockReq.body = coverLetterData;

      AIUtils.generateCoverLetter.mockResolvedValue(mockResult);

      await aiController.generateCoverLetter(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur API OpenAI',
        status: 500
      });
    });

    it('devrait gérer les erreurs générales', async () => {
      const coverLetterData = {
        position: 'Développeur Full Stack',
        company: 'Tech Company',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        telephone: '0123456789',
        adresse: '123 Rue de la Paix, 75001 Paris'
      };

      mockReq.body = coverLetterData;

      AIUtils.generateCoverLetter.mockRejectedValue(new Error('Erreur de base de données'));

      await aiController.generateCoverLetter(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la génération de la lettre de motivation',
        status: 500
      });
    });
  });

  describe('professionalizeText', () => {
    it('devrait professionnaliser un texte avec succès', async () => {
      const textData = {
        originalText: 'J\'ai fait du développement web avec HTML et CSS'
      };

      const mockResult = {
        success: true,
        content: 'Développement d\'applications web en utilisant les technologies HTML5 et CSS3',
        usage: { total_tokens: 80, prompt_tokens: 30, completion_tokens: 50 },
        model: 'gpt-3.5-turbo'
      };

      mockReq.body = textData;

      AIUtils.professionalizeText.mockResolvedValue(mockResult);

      await aiController.professionalizeText(mockReq, mockRes);

      expect(AIUtils.professionalizeText).toHaveBeenCalledWith(textData);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Texte professionnalisé avec succès',
        content: mockResult.content,
        usage: mockResult.usage,
        model: mockResult.model,
        generatedAt: expect.any(String)
      });
    });

    it('devrait gérer le texte manquant', async () => {
      const incompleteData = {
        // Manque originalText
      };

      mockReq.body = incompleteData;

      await aiController.professionalizeText(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Champs requis manquants: originalText',
        status: 400
      });
    });

    it('devrait gérer les erreurs de professionnalisation', async () => {
      const textData = {
        originalText: 'J\'ai fait du développement web'
      };

      const mockResult = {
        success: false,
        error: 'Erreur API OpenAI',
        content: null
      };

      mockReq.body = textData;

      AIUtils.professionalizeText.mockResolvedValue(mockResult);

      await aiController.professionalizeText(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur API OpenAI',
        status: 500
      });
    });

    it('devrait gérer les erreurs générales', async () => {
      const textData = {
        originalText: 'J\'ai fait du développement web'
      };

      mockReq.body = textData;

      AIUtils.professionalizeText.mockRejectedValue(new Error('Erreur de base de données'));

      await aiController.professionalizeText(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la professionnalisation du texte',
        status: 500
      });
    });
  });
}); 