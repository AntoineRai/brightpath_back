-- Script SQL pour créer la table users dans Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Créer la table users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur l'email pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Créer un index sur le rôle pour optimiser les requêtes par rôle
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer des utilisateurs de test (optionnel)
-- Les mots de passe sont hashés avec bcrypt (password = "password")
INSERT INTO users (email, password, name, role) VALUES
    ('admin@brightpath.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin'),
    ('user@brightpath.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Utilisateur', 'user')
ON CONFLICT (email) DO NOTHING;

-- Note: Nous n'utilisons pas les politiques RLS de Supabase Auth
-- car nous gérons l'authentification avec notre propre système JWT
-- L'autorisation est gérée dans le code de l'API 