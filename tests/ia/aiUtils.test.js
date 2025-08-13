// Mock des modules avant les imports
jest.mock('../../src/config/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  },
  models: {
    gpt35: 'gpt-3.5-turbo',
    gpt4: 'gpt-4'
  },
  defaultPrompts: {
    coverLetter: {
      system: 'Tu es un expert en rédaction de lettres de motivation',
      user: 'Écris une lettre de motivation pour le poste de {position} chez {company}'
    },
    professionalizeText: {
      system: 'Tu es un expert en rédaction professionnelle',
      user: 'Professionnalise ce texte: {originalText}'
    }
  }
}));

const AIUtils = require('../../src/utils/aiUtils');
const { openai, defaultPrompts } = require('../../src/config/openai');

describe('Utilitaires IA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateContent', () => {
    it('devrait générer du contenu avec succès', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Contenu généré avec succès'
          }
        }],
        usage: {
          total_tokens: 100,
          prompt_tokens: 30,
          completion_tokens: 70
        },
        model: 'gpt-3.5-turbo'
      };

      openai.chat.completions.create.mockResolvedValue(mockResponse);

      const data = {
        position: 'Développeur',
        company: 'Tech Company'
      };

      const result = await AIUtils.generateContent('coverLetter', data);

      expect(openai.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en rédaction de lettres de motivation'
          },
          {
            role: 'user',
            content: 'Écris une lettre de motivation pour le poste de Développeur chez Tech Company'
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      });

      expect(result).toEqual({
        success: true,
        content: 'Contenu généré avec succès',
        usage: mockResponse.usage,
        model: mockResponse.model
      });
    });

    it('devrait gérer les erreurs de génération', async () => {
      openai.chat.completions.create.mockRejectedValue(new Error('Erreur API OpenAI'));

      const data = { position: 'Développeur', company: 'Tech Company' };

      const result = await AIUtils.generateContent('coverLetter', data);

      expect(result).toEqual({
        success: false,
        error: 'Erreur API OpenAI',
        content: null
      });
    });

    it('devrait gérer les types de prompt non reconnus', async () => {
      const data = { position: 'Développeur' };

      const result = await AIUtils.generateContent('unknownType', data);

      expect(result).toEqual({
        success: false,
        error: 'Type de prompt non reconnu: unknownType',
        content: null
      });
    });
  });

  describe('replaceVariables', () => {
    it('devrait remplacer les variables dans un template', () => {
      const template = 'Bonjour {nom} {prenom}, poste: {position}';
      const data = {
        nom: 'Dupont',
        prenom: 'Jean',
        position: 'Développeur'
      };

      const result = AIUtils.replaceVariables(template, data);

      expect(result).toBe('Bonjour Dupont Jean, poste: Développeur');
    });

    it('devrait gérer les variables manquantes', () => {
      const template = 'Bonjour {nom} {prenom}, poste: {position}';
      const data = {
        nom: 'Dupont'
        // prenom et position manquants
      };

      const result = AIUtils.replaceVariables(template, data);

      expect(result).toBe('Bonjour Dupont {prenom}, poste: {position}');
    });

    it('devrait gérer les templates sans variables', () => {
      const template = 'Template simple sans variables';
      const data = { nom: 'Dupont' };

      const result = AIUtils.replaceVariables(template, data);

      expect(result).toBe('Template simple sans variables');
    });

    it('devrait gérer les données vides', () => {
      const template = 'Bonjour {nom}';
      const data = {};

      const result = AIUtils.replaceVariables(template, data);

      expect(result).toBe('Bonjour {nom}');
    });
  });

  describe('generateCoverLetter', () => {
    it('devrait générer une lettre de motivation avec succès', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Cher recruteur,\n\nJe vous présente ma candidature...'
          }
        }],
        usage: { total_tokens: 150, prompt_tokens: 50, completion_tokens: 100 },
        model: 'gpt-3.5-turbo'
      };

      openai.chat.completions.create.mockResolvedValue(mockResponse);

      const data = {
        position: 'Développeur Full Stack',
        company: 'Tech Company',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        telephone: '0123456789',
        adresse: '123 Rue de la Paix, 75001 Paris'
      };

      const result = await AIUtils.generateCoverLetter(data);

      expect(result).toEqual({
        success: true,
        content: 'Cher recruteur,\n\nJe vous présente ma candidature...',
        usage: mockResponse.usage,
        model: mockResponse.model
      });
    });

    it('devrait gérer les champs manquants', async () => {
      const data = {
        position: 'Développeur',
        company: 'Tech Company'
        // Manque nom, prenom, email, telephone, adresse
      };

      const result = await AIUtils.generateCoverLetter(data);

      expect(result).toEqual({
        success: false,
        error: 'Champ requis manquant: nom',
        content: null
      });
    });

    it('devrait gérer les erreurs de génération', async () => {
      openai.chat.completions.create.mockRejectedValue(new Error('Erreur API'));

      const data = {
        position: 'Développeur Full Stack',
        company: 'Tech Company',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        telephone: '0123456789',
        adresse: '123 Rue de la Paix, 75001 Paris'
      };

      const result = await AIUtils.generateCoverLetter(data);

      expect(result).toEqual({
        success: false,
        error: 'Erreur API',
        content: null
      });
    });
  });

  describe('professionalizeText', () => {
    it('devrait professionnaliser un texte avec succès', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Développement d\'applications web en utilisant les technologies HTML5 et CSS3'
          }
        }],
        usage: { total_tokens: 80, prompt_tokens: 30, completion_tokens: 50 },
        model: 'gpt-3.5-turbo'
      };

      openai.chat.completions.create.mockResolvedValue(mockResponse);

      const data = {
        originalText: 'J\'ai fait du développement web avec HTML et CSS'
      };

      const result = await AIUtils.professionalizeText(data);

      expect(result).toEqual({
        success: true,
        content: 'Développement d\'applications web en utilisant les technologies HTML5 et CSS3',
        usage: mockResponse.usage,
        model: mockResponse.model
      });
    });

    it('devrait gérer le texte manquant', async () => {
      const data = {
        // Manque originalText
      };

      const result = await AIUtils.professionalizeText(data);

      expect(result).toEqual({
        success: false,
        error: 'Champ requis manquant: originalText',
        content: null
      });
    });

    it('devrait gérer les erreurs de professionnalisation', async () => {
      openai.chat.completions.create.mockRejectedValue(new Error('Erreur API'));

      const data = {
        originalText: 'J\'ai fait du développement web'
      };

      const result = await AIUtils.professionalizeText(data);

      expect(result).toEqual({
        success: false,
        error: 'Erreur API',
        content: null
      });
    });
  });
}); 