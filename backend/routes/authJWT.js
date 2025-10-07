/**
 * Routes d'authentification avec JWT
 * Gère la connexion, déconnexion et l'inscription des utilisateurs avec tokens JWT
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authControllerAD');
const { authValidation, handleValidationErrors } = require('../middleware/validation');
const { verifyJWT, requireAdmin } = require('../middleware/jwtAuth');

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur avec JWT
 * @access  Public
 */
router.post('/login', 
    authValidation.login,
    handleValidationErrors,
    AuthController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion d'un utilisateur (optionnel avec JWT)
 * @access  Private
 */
router.post('/logout', 
    verifyJWT,
    AuthController.logout
);

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', 
    authValidation.register,
    handleValidationErrors,
    AuthController.register
);

/**
 * @route   GET /api/auth/verify
 * @desc    Vérification du token JWT
 * @access  Private
 */
router.get('/verify', 
    verifyJWT,
    AuthController.verifyToken
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchissement du token JWT
 * @access  Private
 */
router.post('/refresh', 
    verifyJWT,
    AuthController.refreshToken
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Changement de mot de passe
 * @access  Private
 */
router.put('/change-password', 
    verifyJWT,
    authValidation.changePassword,
    handleValidationErrors,
    AuthController.changePassword
);

/**
 * @route   GET /api/auth/profile
 * @desc    Récupération du profil utilisateur
 * @access  Private
 */
router.get('/profile', 
    verifyJWT,
    AuthController.getProfile
);

module.exports = router;
