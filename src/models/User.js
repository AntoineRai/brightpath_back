const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

class User {
  // Créer un nouvel utilisateur
  static async create(userData) {
    try {
      const { email, password, name, role = 'user' } = userData;

      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Erreur lors de la vérification de l\'utilisateur');
      }

      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer le nouvel utilisateur
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            name,
            role
          }
        ])
        .select('id, email, name, role, created_at')
        .single();

      if (insertError) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  // Trouver un utilisateur par email
  static async findByEmail(email) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, password, name, role, created_at')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Utilisateur non trouvé
        }
        throw new Error('Erreur lors de la recherche de l\'utilisateur');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Utilisateur non trouvé
        }
        throw new Error('Erreur lors de la recherche de l\'utilisateur');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Vérifier le mot de passe
  static async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new Error('Erreur lors de la vérification du mot de passe');
    }
  }

  // Mettre à jour un utilisateur
  static async update(id, updateData) {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('id, email, name, role, created_at')
        .single();

      if (error) {
        throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
      }

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un utilisateur
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error('Erreur lors de la suppression de l\'utilisateur');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Lister tous les utilisateurs (pour admin)
  static async findAll(limit = 100, offset = 0) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      return users;
    } catch (error) {
      throw error;
    }
  }

  // Compter le nombre d'utilisateurs
  static async count() {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error('Erreur lors du comptage des utilisateurs');
      }

      return count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 