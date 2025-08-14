// Configuration globale pour les tests
process.env.NODE_ENV = 'test';

// Mock des variables d'environnement pour les tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Mock de process.exit pour éviter l'arrêt des tests
const originalExit = process.exit;
process.exit = (code) => {
  if (code !== 0) {
    throw new Error(`Process.exit called with code: ${code}`);
  }
};

// Augmenter le timeout pour les tests
jest.setTimeout(10000);

// Mock de console.error pour éviter le bruit dans les tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Ne pas afficher les erreurs de variables d'environnement manquantes
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Variables d\'environnement')) {
    return;
  }
  originalConsoleError(...args);
}; 