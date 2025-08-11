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

-- Créer une politique RLS (Row Level Security) pour sécuriser la table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture de son propre profil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre la mise à jour de son propre profil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre l'insertion de nouveaux utilisateurs (inscription)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Note: Ces politiques RLS sont pour Supabase Auth
-- Pour notre API JWT personnalisée, nous gérons l'autorisation dans le code 