const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  console.error('Assurez-vous d\'avoir défini SUPABASE_URL et SUPABASE_ANON_KEY');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Test de connexion
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Connexion à Supabase établie avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion Supabase:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
}; 