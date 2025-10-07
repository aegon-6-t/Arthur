/**
 * Contrôleur d'authentification
 * Gère la connexion, déconnexion et l'inscription des utilisateurs
 */

const User = require('../models/User');
const { validationResult } = require('express-validator');

class AuthController {
    /**
     * Connexion d'un utilisateur
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async login(req, res) {
        try {
            // Vérification des erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const { email, mot_de_passe } = req.body;

            // Recherche de l'utilisateur par email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Vérification du mot de passe
            const isPasswordValid = await User.verifyPassword(mot_de_passe, user.mot_de_passe);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Mise à jour de la dernière connexion
            await User.updateLastLogin(user.id);

            // Création de la session
            req.session.userId = user.id;
            req.session.userRole = user.role;
            req.session.userEmail = user.email;

            // Retour des informations de l'utilisateur (sans le mot de passe)
            const userInfo = {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                derniere_connexion: user.derniere_connexion
            };

            res.json({
                success: true,
                message: 'Connexion réussie',
                user: userInfo
            });

        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Déconnexion d'un utilisateur
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async logout(req, res) {
        try {
            // Destruction de la session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Erreur lors de la déconnexion:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erreur lors de la déconnexion'
                    });
                }

                // Suppression du cookie de session
                res.clearCookie('connect.sid');
                
                res.json({
                    success: true,
                    message: 'Déconnexion réussie'
                });
            });
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Inscription d'un nouvel utilisateur
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async register(req, res) {
        try {
            // Vérification des erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const { nom, prenom, email, mot_de_passe, role } = req.body;

            // Vérification si l'utilisateur existe déjà
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Un utilisateur avec cet email existe déjà'
                });
            }

            // Création du nouvel utilisateur
            const newUser = await User.create({
                nom,
                prenom,
                email,
                mot_de_passe,
                role: role || 'user'
            });

            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès',
                user: newUser
            });

        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Vérification du statut de connexion
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async checkAuth(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Non authentifié'
                });
            }

            // Récupération des informations de l'utilisateur
            const user = await User.findById(req.session.userId);
            if (!user) {
                // Session invalide, destruction de la session
                req.session.destroy();
                return res.status(401).json({
                    success: false,
                    message: 'Session invalide'
                });
            }

            res.json({
                success: true,
                message: 'Utilisateur authentifié',
                user: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                    derniere_connexion: user.derniere_connexion
                }
            });

        } catch (error) {
            console.error('Erreur lors de la vérification d\'authentification:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Changement de mot de passe
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async changePassword(req, res) {
        try {
            // Vérification des erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
            const userId = req.session.userId;

            // Récupération de l'utilisateur avec son mot de passe
            const user = await User.findByEmail(req.session.userEmail);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Vérification de l'ancien mot de passe
            const isOldPasswordValid = await User.verifyPassword(ancien_mot_de_passe, user.mot_de_passe);
            if (!isOldPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Ancien mot de passe incorrect'
                });
            }

            // Mise à jour du mot de passe
            await User.update(userId, { mot_de_passe: nouveau_mot_de_passe });

            res.json({
                success: true,
                message: 'Mot de passe modifié avec succès'
            });

        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Récupération du profil utilisateur
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getProfile(req, res) {
        try {
            const userId = req.session.userId;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                    date_creation: user.date_creation,
                    derniere_connexion: user.derniere_connexion
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

module.exports = AuthController;
