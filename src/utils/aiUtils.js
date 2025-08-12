const { openai, models, defaultPrompts } = require('../config/openai');

class AIUtils {
  // Générer du contenu avec ChatGPT
  static async generateContent(promptType, data, customPrompt = null) {
    try {
      // Récupérer le prompt par défaut ou utiliser le custom
      const promptConfig = customPrompt || defaultPrompts[promptType];
      
      if (!promptConfig) {
        throw new Error(`Type de prompt non reconnu: ${promptType}`);
      }

      // Remplacer les variables dans le prompt
      const systemPrompt = this.replaceVariables(promptConfig.system, data);
      const userPrompt = this.replaceVariables(promptConfig.user, data);

      // Appel à l'API OpenAI
      const response = await openai.chat.completions.create({
        model: models.gpt35, // Utiliser GPT-3.5 par défaut (plus rapide et moins cher)
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7, // Créativité modérée
        top_p: 0.9
      });

      return {
        success: true,
        content: response.choices[0].message.content.trim(),
        usage: response.usage,
        model: response.model
      };

    } catch (error) {
      console.error('Erreur lors de la génération de contenu:', error);
      
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  // Remplacer les variables dans un template
  static replaceVariables(template, data) {
    let result = template;
    
    // Remplacer toutes les variables {variableName} par leurs valeurs
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, data[key] || '');
    });

    return result;
  }

  // Générer une lettre de motivation
  static async generateCoverLetter(data) {
    const requiredFields = ['position', 'company', 'nom', 'prenom', 'email', 'telephone', 'adresse'];
    
    // Vérifier les champs requis
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          success: false,
          error: `Champ requis manquant: ${field}`,
          content: null
        };
      }
    }

    return await this.generateContent('coverLetter', data);
  }

  // Professionnaliser un texte pour CV
  static async professionalizeText(data) {
    const requiredFields = ['originalText'];
    
    // Vérifier les champs requis
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          success: false,
          error: `Champ requis manquant: ${field}`,
          content: null
        };
      }
    }

    return await this.generateContent('professionalizeText', data);
  }
}

module.exports = AIUtils; 