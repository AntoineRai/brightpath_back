const OpenAI = require('openai');

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test de connexion OpenAI
const testOpenAIConnection = async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Clé API OpenAI manquante!');
      console.error('Assurez-vous d\'avoir défini OPENAI_API_KEY dans vos variables d\'environnement');
      return false;
    }

    // Test simple avec une requête courte
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Réponds simplement 'OK' si tu reçois ce message."
        }
      ],
      max_tokens: 10
    });

    console.log('✅ Connexion à OpenAI établie avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à OpenAI:', error.message);
    return false;
  }
};

// Configuration des modèles
const models = {
  gpt35: "gpt-3.5-turbo",
  gpt4: "gpt-4",
  gpt4Turbo: "gpt-4-turbo-preview"
};

// Configuration des prompts par défaut
const defaultPrompts = {
  coverLetter: {
    system: `Tu es un expert en rédaction de lettres de motivation. 
    Tu dois créer une lettre de motivation professionnelle, engageante et personnalisée.
    La lettre doit être en français, structurée et adaptée au poste et à l'entreprise.
    Utilise un ton professionnel mais chaleureux.
    
    IMPORTANT : Retourne UNIQUEMENT le contenu de la lettre de motivation, sans les coordonnées en en-tête et sans commentaire final.`,
    user: `Crée une lettre de motivation pour le poste de {position} chez {company}.
    
    Informations du candidat :
    - Nom : {nom}
    - Prénom : {prenom}
    - Email : {email}
    - Téléphone : {telephone}
    - Adresse : {adresse}
    
    Informations sur l'entreprise :
    - Nom de l'entreprise : {company}
    - Poste convoité : {position}
    - Destinataire (si connu) : {destinataire}
    
    La lettre doit faire environ 300-400 mots et être structurée avec :
    - Une introduction accrocheuse
    - Un développement de 2-3 paragraphes
    - Une conclusion engageante
    
    Retourne UNIQUEMENT le contenu de la lettre, en commençant par "Objet : Candidature au poste de [poste]". Ne pas inclure les coordonnées en en-tête ni de commentaire final.`
  }
};

module.exports = {
  openai,
  testOpenAIConnection,
  models,
  defaultPrompts
}; 