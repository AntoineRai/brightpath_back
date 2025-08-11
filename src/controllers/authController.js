const JwtUtils = require('../utils/jwtUtils');
const User = require('../models/User');

const authController = {
  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Validation des données
      if (!email || !password || !name) {
        return res.status(400).json({
          error: 'Email, mot de passe et nom sont requis',
          status: 400
        });
      }

      // Créer le nouvel utilisateur dans Supabase
      const newUser = await User.create({ email, password, name });

      // Générer les tokens
      const payload = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      };

      const accessToken = JwtUtils.generateAccessToken(payload);
      const refreshToken = JwtUtils.generateRefreshToken(payload);

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          created_at: newUser.created_at
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      if (error.message.includes('existe déjà')) {
        return res.status(409).json({
          error: error.message,
          status: 409
        });
      }
      
      res.status(500).json({
        error: 'Erreur lors de la création de l\'utilisateur',
        status: 500
      });
    }
  },

  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation des données
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email et mot de passe sont requis',
          status: 400
        });
      }

      // Trouver l'utilisateur dans Supabase
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Email ou mot de passe incorrect',
          status: 401
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Email ou mot de passe incorrect',
          status: 401
        });
      }

      // Générer les tokens
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      const accessToken = JwtUtils.generateAccessToken(payload);
      const refreshToken = JwtUtils.generateRefreshToken(payload);

      res.json({
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: user.created_at
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({
        error: 'Erreur lors de la connexion',
        status: 500
      });
    }
  },

  // POST /api/auth/refresh
  refreshToken: (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Token de rafraîchissement requis',
          status: 400
        });
      }

      // Vérifier et décoder le refresh token
      const decoded = JwtUtils.verifyRefreshToken(refreshToken);
      
      // Générer un nouveau token d'accès
      const { iat, exp, ...payload } = decoded;
      const newAccessToken = JwtUtils.generateAccessToken(payload);

      res.json({
        message: 'Token rafraîchi avec succès',
        accessToken: newAccessToken
      });

    } catch (error) {
      res.status(401).json({
        error: error.message,
        status: 401
      });
    }
  },

  // POST /api/auth/logout
  logout: (req, res) => {
    // En production, vous pourriez ajouter le token à une liste noire
    res.json({
      message: 'Déconnexion réussie'
    });
  },

  // GET /api/auth/me
  getProfile: async (req, res) => {
    try {
      // Récupérer les informations complètes de l'utilisateur depuis Supabase
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé',
          status: 404
        });
      }

      res.json({
        message: 'Profil récupéré avec succès',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération du profil',
        status: 500
      });
    }
  }
};

module.exports = authController; 