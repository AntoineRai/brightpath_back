const AIUtils = require('../utils/aiUtils');

const aiController = {
  // POST /api/ai/cover-letter - Générer une lettre de motivation
  generateCoverLetter: async (req, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Validation des champs requis
      const requiredFields = ['position', 'company', 'nom', 'prenom', 'email', 'telephone', 'adresse'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Champs requis manquants: ${missingFields.join(', ')}`,
          status: 400
        });
      }

      // Générer la lettre de motivation
      const result = await AIUtils.generateCoverLetter(data);

      if (!result.success) {
        return res.status(500).json({
          error: result.error,
          status: 500
        });
      }

      res.json({
        message: 'Lettre de motivation générée avec succès',
        content: result.content,
        usage: result.usage,
        model: result.model,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erreur lors de la génération de la lettre de motivation:', error);
      res.status(500).json({
        error: 'Erreur lors de la génération de la lettre de motivation',
        status: 500
      });
    }
  },

  // POST /api/ai/professionalize-text - Professionnaliser un texte pour CV
  professionalizeText: async (req, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Validation des champs requis
      const requiredFields = ['originalText'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Champs requis manquants: ${missingFields.join(', ')}`,
          status: 400
        });
      }

      // Professionnaliser le texte
      const result = await AIUtils.professionalizeText(data);

      if (!result.success) {
        return res.status(500).json({
          error: result.error,
          status: 500
        });
      }

      res.json({
        message: 'Texte professionnalisé avec succès',
        content: result.content,
        usage: result.usage,
        model: result.model,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erreur lors de la professionnalisation du texte:', error);
      res.status(500).json({
        error: 'Erreur lors de la professionnalisation du texte',
        status: 500
      });
    }
  }
};

module.exports = aiController; 