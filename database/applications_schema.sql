-- Script SQL pour créer la table applications dans Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Créer la table applications
CREATE TABLE IF NOT EXISTS applications (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Champs requis (basés sur l'existant)
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  application_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'interview', 'rejected', 'accepted')),
  
  -- Champs optionnels (basés sur l'existant)
  location VARCHAR(255),
  salary VARCHAR(100),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  job_description TEXT,
  notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_application_date ON applications(application_date);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer des données de test (optionnel)
INSERT INTO applications (user_id, company, position, application_date, status, location, salary, contact_person, contact_email, job_description, notes) VALUES
    (1, 'TechCorp', 'Développeur Full Stack', '2024-01-15', 'pending', 'Paris, France', '45k-55k€', 'Jean Dupont', 'jean.dupont@techcorp.com', 'Développement d''applications web modernes avec React et Node.js', 'Candidature envoyée via LinkedIn'),
    (1, 'StartupXYZ', 'Lead Developer', '2024-01-10', 'interview', 'Lyon, France', '50k-65k€', 'Marie Martin', 'marie.martin@startupxyz.com', 'Encadrement d''une équipe de développeurs et développement de nouvelles fonctionnalités', 'Premier entretien prévu le 20 janvier'),
    (2, 'BigCompany', 'Développeur Frontend', '2024-01-12', 'rejected', 'Marseille, France', '40k-50k€', 'Pierre Durand', 'pierre.durand@bigcompany.com', 'Développement d''interfaces utilisateur avec React et TypeScript', 'Refusé - profil trop junior'),
    (2, 'InnovationLab', 'Développeur Backend', '2024-01-08', 'accepted', 'Nantes, France', '45k-55k€', 'Sophie Bernard', 'sophie.bernard@innovationlab.com', 'Développement d''APIs RESTful avec Node.js et PostgreSQL', 'Offre acceptée - début le 1er février')
ON CONFLICT (id) DO NOTHING;

-- Créer une vue pour faciliter les requêtes avec les informations utilisateur
CREATE OR REPLACE VIEW applications_with_user AS
SELECT 
    a.*,
    u.name as user_name,
    u.email as user_email
FROM applications a
JOIN users u ON a.user_id = u.id;

-- Créer une fonction pour obtenir les statistiques des candidatures par utilisateur
CREATE OR REPLACE FUNCTION get_user_application_stats(user_id_param BIGINT)
RETURNS TABLE (
    total_applications BIGINT,
    pending_count BIGINT,
    interview_count BIGINT,
    rejected_count BIGINT,
    accepted_count BIGINT,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_applications,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
        COUNT(*) FILTER (WHERE status = 'interview')::BIGINT as interview_count,
        COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_count,
        COUNT(*) FILTER (WHERE status = 'accepted')::BIGINT as accepted_count,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'accepted')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
        ) as success_rate
    FROM applications 
    WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql; 