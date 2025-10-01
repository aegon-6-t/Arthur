/**
 * Routes d'authentification
 * Gère la connexion, déconnexion et l'inscription des utilisateurs
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authValidation, handleValidationErrors } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', 
    authValidation.login,
    handleValidationErrors,
    AuthController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion d'un utilisateur
 * @access  Private
 */
router.post('/logout', 
    requireAuth,
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
 * @route   GET /api/auth/check
 * @desc    Vérification du statut de connexion
 * @access  Private
 */
router.get('/check', 
    requireAuth,
    AuthController.checkAuth
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Changement de mot de passe
 * @access  Private
 */
router.put('/change-password', 
    requireAuth,
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
    requireAuth,
    AuthController.getProfile
);

module.exports = router;
