/**
 * Contrôleur d'authentification avec JWT et Active Directory
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const ActiveDirectory = require('activedirectory2'); // npm i activedirectory2

// Configuration AD depuis le .env
const adConfig = {
  url: process.env.AD_URL || 'ldap://localhost',
  baseDN: process.env.AD_BASE_DN || 'DC=osef,DC=local',
  username: process.env.AD_USERNAME,
  password: process.env.AD_PASSWORD
};

const ad = new ActiveDirectory(adConfig);

class AuthController {

  /**
   * Connexion d'un utilisateur via AD
   */
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Données invalides', errors: errors.array() });
      }

      const { email, mot_de_passe } = req.body;

      // Vérifier si l'utilisateur existe dans AD
      ad.authenticate(email, mot_de_passe, async (err, auth) => {
        if (err) {
          console.error('Erreur AD:', err);
          return res.status(500).json({ success: false, message: 'Erreur interne AD' });
        }

        if (!auth) {
          return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect (AD)' });
        }

        // Vérifier si l'utilisateur existe dans la DB locale
        let user = await User.findByEmail(email);

        if (!user) {
          // Créer un utilisateur local si inexistant
          const adUser = await new Promise((resolve, reject) => {
            ad.findUser(email, (err, user) => {
              if (err) reject(err);
              else resolve(user);
            });
          });

          if (!adUser) {
            return res.status(404).json({ success: false, message: 'Utilisateur AD introuvable' });
          }

          // Création local DB
          user = await User.create({
            nom: adUser.sn || 'N/A',
            prenom: adUser.givenName || 'N/A',
            email: adUser.userPrincipalName || email,
            mot_de_passe: mot_de_passe, // on peut stocker hash si tu veux fallback local
            role: 'user'
          });
        }

        // Génération du JWT
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise',
          { expiresIn: '24h', issuer: 'planning-app', audience: 'planning-users' }
        );

        res.json({
          success: true,
          message: 'Connexion réussie',
          user: {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role
          },
          token,
          expiresIn: '24h'
        });
      });

    } catch (error) {
      console.error('Erreur lors de la connexion AD:', error);
      res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
  }

  /**
   * Déconnexion (JWT côté client)
   */
  static async logout(req, res) {
    res.json({ success: true, message: 'Déconnexion réussie (JWT côté client)' });
  }

  /**
   * Vérification token JWT
   */
  static async verifyToken(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

      res.json({ success: true, message: 'Token valide', user });
    } catch (error) {
      console.error('Erreur vérification token:', error);
      res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
  }

  /**
   * Rafraîchissement token JWT
   */
  static async refreshToken(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise',
        { expiresIn: '24h', issuer: 'planning-app', audience: 'planning-users' }
      );

      res.json({ success: true, message: 'Token rafraîchi', token, expiresIn: '24h' });
    } catch (error) {
      console.error('Erreur rafraîchissement token:', error);
      res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
  }
}

module.exports = AuthController;
