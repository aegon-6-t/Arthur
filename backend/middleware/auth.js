/**
 * Middleware d'authentification
 * Vérifie si l'utilisateur est connecté et a les bonnes permissions
 */

const User = require('../models/User');

/**
 * Middleware pour vérifier l'authentification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const requireAuth = async (req, res, next) => {
    try {
        // Vérification de la présence de la session
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        // Vérification de l'existence de l'utilisateur
        const user = await User.findById(req.session.userId);
        if (!user) {
            // Session invalide, destruction de la session
            req.session.destroy();
            return res.status(401).json({
                success: false,
                message: 'Session invalide'
            });
        }

        // Ajout des informations utilisateur à la requête
        req.user = user;
        next();

    } catch (error) {
        console.error('Erreur dans le middleware d\'authentification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

/**
 * Middleware pour vérifier les permissions d'administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const requireAdmin = async (req, res, next) => {
    try {
        // Vérification de l'authentification d'abord
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        // Vérification du rôle administrateur
        if (req.session.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permissions d\'administrateur requises'
            });
        }

        // Vérification de l'existence de l'utilisateur
        const user = await User.findById(req.session.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permissions d\'administrateur requises'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Erreur dans le middleware d\'administration:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

/**
 * Middleware pour vérifier les permissions sur une ressource
 * @param {string} resourceType - Type de ressource ('planning', 'user')
 * @returns {Function} - Middleware
 */
const requireResourceAccess = (resourceType) => {
    return async (req, res, next) => {
        try {
            // Les administrateurs ont accès à tout
            if (req.session.userRole === 'admin') {
                return next();
            }

            const resourceId = req.params.id;
            const userId = req.session.userId;

            if (resourceType === 'planning') {
                // Vérification pour les événements du planning
                const Planning = require('../models/Planning');
                const event = await Planning.findById(resourceId);
                
                if (!event) {
                    return res.status(404).json({
                        success: false,
                        message: 'Événement non trouvé'
                    });
                }

                if (event.utilisateur_id !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès non autorisé à cet événement'
                    });
                }
            } else if (resourceType === 'user') {
                // Vérification pour les utilisateurs
                if (parseInt(resourceId) !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès non autorisé à ce profil'
                    });
                }
            }

            next();

        } catch (error) {
            console.error('Erreur dans le middleware de vérification d\'accès:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    };
};

/**
 * Middleware pour vérifier si l'utilisateur est connecté (optionnel)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const optionalAuth = async (req, res, next) => {
    try {
        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        console.error('Erreur dans le middleware d\'authentification optionnelle:', error);
        next(); // Continue même en cas d'erreur
    }
};

/**
 * Middleware pour vérifier les permissions de modification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const requireModificationAccess = async (req, res, next) => {
    try {
        // Les administrateurs peuvent tout modifier
        if (req.session.userRole === 'admin') {
            return next();
        }

        const resourceId = req.params.id;
        const userId = req.session.userId;

        // Vérification pour les événements
        if (req.baseUrl.includes('/planning')) {
            const Planning = require('../models/Planning');
            const event = await Planning.findById(resourceId);
            
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Événement non trouvé'
                });
            }

            if (event.utilisateur_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez modifier que vos propres événements'
                });
            }
        }

        next();

    } catch (error) {
        console.error('Erreur dans le middleware de vérification de modification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireResourceAccess,
    optionalAuth,
    requireModificationAccess
};
