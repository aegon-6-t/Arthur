/**
 * Configuration JWT
 * Gère les paramètres et utilitaires pour les tokens JWT
 */

const jwt = require('jsonwebtoken');

// Configuration JWT
const JWT_CONFIG = {
    // Secret pour signer les tokens (à changer en production)
    secret: process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_changez_moi_en_production',
    
    // Durée de vie des tokens
    expiresIn: '24h',
    
    // Émetteur du token
    issuer: 'planning-app',
    
    // Audience du token
    audience: 'planning-users',
    
    // Algorithme de signature
    algorithm: 'HS256'
};

/**
 * Génère un token JWT
 * @param {Object} payload - Données à inclure dans le token
 * @param {Object} options - Options supplémentaires
 * @returns {string} Token JWT
 */
function generateToken(payload, options = {}) {
    const defaultOptions = {
        expiresIn: JWT_CONFIG.expiresIn,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        algorithm: JWT_CONFIG.algorithm
    };
    
    return jwt.sign(payload, JWT_CONFIG.secret, { ...defaultOptions, ...options });
}

/**
 * Vérifie un token JWT
 * @param {string} token - Token à vérifier
 * @param {Object} options - Options de vérification
 * @returns {Object} Token décodé
 */
function verifyToken(token, options = {}) {
    const defaultOptions = {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        algorithms: [JWT_CONFIG.algorithm]
    };
    
    return jwt.verify(token, JWT_CONFIG.secret, { ...defaultOptions, ...options });
}

/**
 * Décode un token JWT sans vérification
 * @param {string} token - Token à décoder
 * @returns {Object} Token décodé
 */
function decodeToken(token) {
    return jwt.decode(token);
}

/**
 * Vérifie si un token est expiré
 * @param {string} token - Token à vérifier
 * @returns {boolean} True si expiré
 */
function isTokenExpired(token) {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}

/**
 * Extrait le token depuis l'en-tête Authorization
 * @param {string} authHeader - En-tête Authorization
 * @returns {string|null} Token extrait ou null
 */
function extractTokenFromHeader(authHeader) {
    if (!authHeader) {
        return null;
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    
    return parts[1];
}

/**
 * Génère un token de rafraîchissement
 * @param {Object} payload - Données à inclure dans le token
 * @returns {string} Token de rafraîchissement
 */
function generateRefreshToken(payload) {
    return generateToken(payload, {
        expiresIn: '7d', // Token de rafraîchissement valide 7 jours
        issuer: JWT_CONFIG.issuer,
        audience: 'refresh-tokens'
    });
}

/**
 * Vérifie un token de rafraîchissement
 * @param {string} token - Token à vérifier
 * @returns {Object} Token décodé
 */
function verifyRefreshToken(token) {
    return verifyToken(token, {
        audience: 'refresh-tokens'
    });
}

module.exports = {
    JWT_CONFIG,
    generateToken,
    verifyToken,
    decodeToken,
    isTokenExpired,
    extractTokenFromHeader,
    generateRefreshToken,
    verifyRefreshToken
};
