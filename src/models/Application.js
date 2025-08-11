const { supabase } = require('../config/supabase');

class Application {
  // Créer une nouvelle candidature
  static async create(applicationData) {
    try {
      const { 
        user_id, 
        company, 
        position, 
        application_date, 
        status = 'pending',
        location,
        salary,
        contact_person,
        contact_email,
        contact_phone,
        job_description,
        notes
      } = applicationData;

      // Validation des champs requis
      if (!user_id || !company || !position || !application_date) {
        throw new Error('user_id, company, position et application_date sont requis');
      }

      // Insérer la nouvelle candidature
      const { data: newApplication, error: insertError } = await supabase
        .from('applications')
        .insert([
          {
            user_id,
            company,
            position,
            application_date,
            status,
            location,
            salary,
            contact_person,
            contact_email,
            contact_phone,
            job_description,
            notes
          }
        ])
        .select('*')
        .single();

      if (insertError) {
        throw new Error('Erreur lors de la création de la candidature');
      }

      return newApplication;
    } catch (error) {
      throw error;
    }
  }

  // Trouver une candidature par ID
  static async findById(id) {
    try {
      const { data: application, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Candidature non trouvée
        }
        throw new Error('Erreur lors de la recherche de la candidature');
      }

      return application;
    } catch (error) {
      throw error;
    }
  }

  // Trouver toutes les candidatures d'un utilisateur
  static async findByUserId(userId, options = {}) {
    try {
      const { 
        status, 
        limit = 100, 
        offset = 0, 
        orderBy = 'application_date', 
        orderDirection = 'desc' 
      } = options;

      let query = supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order(orderBy, { ascending: orderDirection === 'asc' });

      // Filtrer par statut si spécifié
      if (status) {
        query = query.eq('status', status);
      }

      const { data: applications, error } = await query;

      if (error) {
        throw new Error('Erreur lors de la récupération des candidatures');
      }

      return applications;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une candidature
  static async update(id, updateData) {
    try {
      const { data: updatedApplication, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error('Erreur lors de la mise à jour de la candidature');
      }

      return updatedApplication;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une candidature
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error('Erreur lors de la suppression de la candidature');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques d'un utilisateur
  static async getUserStats(userId) {
    try {
      const { data: stats, error } = await supabase
        .rpc('get_user_application_stats', { user_id_param: userId });

      if (error) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      return stats[0] || {
        total_applications: 0,
        pending_count: 0,
        interview_count: 0,
        rejected_count: 0,
        accepted_count: 0,
        success_rate: 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Rechercher des candidatures avec filtres
  static async search(userId, searchParams = {}) {
    try {
      const { 
        company, 
        position, 
        status, 
        dateFrom, 
        dateTo,
        limit = 100, 
        offset = 0 
      } = searchParams;

      let query = supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order('application_date', { ascending: false });

      // Appliquer les filtres
      if (company) {
        query = query.ilike('company', `%${company}%`);
      }

      if (position) {
        query = query.ilike('position', `%${position}%`);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (dateFrom) {
        query = query.gte('application_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('application_date', dateTo);
      }

      const { data: applications, error } = await query;

      if (error) {
        throw new Error('Erreur lors de la recherche des candidatures');
      }

      return applications;
    } catch (error) {
      throw error;
    }
  }

  // Compter les candidatures par statut pour un utilisateur
  static async countByStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        throw new Error('Erreur lors du comptage des candidatures');
      }

      const counts = {
        pending: 0,
        interview: 0,
        rejected: 0,
        accepted: 0,
        total: data.length
      };

      data.forEach(app => {
        counts[app.status]++;
      });

      return counts;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les candidatures récentes (derniers 30 jours)
  static async getRecent(userId, days = 30) {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .gte('application_date', dateLimit.toISOString().split('T')[0])
        .order('application_date', { ascending: false });

      if (error) {
        throw new Error('Erreur lors de la récupération des candidatures récentes');
      }

      return applications;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Application; 