/**
 * Middleware d'authentification JWT
 * Vérifie et valide les tokens JWT
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware pour vérifier le token JWT
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const verifyJWT = async (req, res, next) => {
    try {
        // Récupération du token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification requis'
            });
        }

        // Extraction du token (format: "Bearer <token>")
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification invalide'
            });
        }

        // Vérification et décodage du token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise'
        );

        // Vérification que l'utilisateur existe toujours
        const user = await User.findById(decoded.userId);
        if (!user || !user.actif) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé ou inactif'
            });
        }

        // Ajout des informations utilisateur à la requête
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();

    } catch (error) {
        console.error('Erreur de vérification JWT:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide',
                code: 'INVALID_TOKEN'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur de vérification du token'
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
        // Vérification du rôle administrateur
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permissions d\'administrateur requises'
            });
        }

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
 * Middleware optionnel pour vérifier le token (ne bloque pas si absent)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const optionalJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return next(); // Continuer sans authentification
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return next(); // Continuer sans authentification
        }

        // Vérification du token si présent
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise'
        );

        const user = await User.findById(decoded.userId);
        if (user && user.actif) {
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        }

        next();

    } catch (error) {
        // En cas d'erreur, continuer sans authentification
        next();
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
            if (req.user.role === 'admin') {
                return next();
            }

            const resourceId = req.params.id;
            const userId = req.user.userId;

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

module.exports = {
    verifyJWT,
    requireAdmin,
    optionalJWT,
    requireResourceAccess
};
