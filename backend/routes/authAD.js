/**
 * Routes d'authentification via Active Directory (AD)
 */

const express = require('express');
const router = express.Router();
const AuthControllerAD = require('../controllers/authControllerAD');
const { verifyJWT } = require('../middleware/jwtAuth'); // Assurez-vous que ce middleware décode le token et met req.user

/**
 * @route   POST /api/auth/login
 * @desc    Connexion via Active Directory
 * @access  Public
 */
router.post('/login', AuthControllerAD.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Récupération du profil utilisateur connecté
 * @access  Private
 */
router.get('/profile', verifyJWT, AuthControllerAD.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion de l’utilisateur
 * @access  Public (ou Private selon besoin)
 */
router.post('/logout', AuthControllerAD.logout);

router.post('/register', AuthControllerAD.register);

module.exports = router;