/**
 * Contrôleur d'authentification avec JWT
 * Gère la connexion, déconnexion et l'inscription des utilisateurs avec tokens JWT
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class AuthController {
    /**
     * Connexion d'un utilisateur avec JWT
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

            // Mise à jour de la dernière connexion (sans trigger pour éviter les conflits)
            try {
                await User.updateLastLogin(user.id);
            } catch (error) {
                console.log('Impossible de mettre à jour la dernière connexion:', error.message);
                // Continuer même si cette mise à jour échoue
            }

            // Génération du token JWT
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise',
                {
                    expiresIn: '24h', // Token valide 24 heures
                    issuer: 'planning-app',
                    audience: 'planning-users'
                }
            );

            // Retour des informations de l'utilisateur avec le token
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
                user: userInfo,
                token: token,
                expiresIn: '24h'
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
     * Déconnexion d'un utilisateur (optionnel avec JWT)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async logout(req, res) {
        try {
            // Avec JWT, la déconnexion se fait côté client en supprimant le token
            // Optionnel : on peut maintenir une blacklist de tokens révoqués
            res.json({
                success: true,
                message: 'Déconnexion réussie'
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
     * Vérification du token JWT
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async verifyToken(req, res) {
        try {
            // Le middleware JWT a déjà vérifié le token
            // On peut retourner les informations de l'utilisateur
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Token valide',
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
            console.error('Erreur lors de la vérification du token:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Rafraîchissement du token JWT
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async refreshToken(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Génération d'un nouveau token
            const newToken = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise',
                {
                    expiresIn: '24h',
                    issuer: 'planning-app',
                    audience: 'planning-users'
                }
            );

            res.json({
                success: true,
                message: 'Token rafraîchi avec succès',
                token: newToken,
                expiresIn: '24h'
            });

        } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
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
            const userId = req.user.userId; // Récupéré du token JWT

            // Récupération de l'utilisateur avec son mot de passe
            const user = await User.findByEmail(req.user.email);
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
            const userId = req.user.userId; // Récupéré du token JWT
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
