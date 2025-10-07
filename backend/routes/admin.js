/**
 * Routes d'administration
 * Gère les fonctionnalités réservées aux administrateurs
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { adminValidation, paramValidation, handleValidationErrors } = require('../middleware/validation');
const { requireAdmin } = require('../middleware/auth');

// =============================================
// Routes de gestion des utilisateurs
// =============================================

/**
 * @route   GET /api/admin/users
 * @desc    Obtenir tous les utilisateurs (avec pagination)
 * @access  Private (Admin only)
 */
router.get('/users', 
    requireAdmin,
    AdminController.getUsers
);

/**
 * @route   POST /api/admin/users
 * @desc    Créer un nouvel utilisateur
 * @access  Private (Admin only)
 */
router.post('/users', 
    requireAdmin,
    adminValidation.createUser,
    handleValidationErrors,
    AdminController.createUser
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Obtenir un utilisateur par son ID
 * @access  Private (Admin only)
 */
router.get('/users/:id', 
    requireAdmin,
    paramValidation.id,
    handleValidationErrors,
    AdminController.getUser
);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Private (Admin only)
 */
router.put('/users/:id', 
    requireAdmin,
    paramValidation.id,
    adminValidation.updateUser,
    handleValidationErrors,
    AdminController.updateUser
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private (Admin only)
 */
router.delete('/users/:id', 
    requireAdmin,
    paramValidation.id,
    handleValidationErrors,
    AdminController.deleteUser
);

/**
 * @route   GET /api/admin/users/search
 * @desc    Rechercher des utilisateurs
 * @access  Private (Admin only)
 */
router.get('/users/search', 
    requireAdmin,
    AdminController.searchUsers
);

// =============================================
// Routes de gestion des événements (Admin)
// =============================================

/**
 * @route   GET /api/admin/events
 * @desc    Obtenir tous les événements (avec pagination)
 * @access  Private (Admin only)
 */
router.get('/events', 
    requireAdmin,
    AdminController.getAllEvents
);

/**
 * @route   DELETE /api/admin/events/:id
 * @desc    Supprimer un événement (admin)
 * @access  Private (Admin only)
 */
router.delete('/events/:id', 
    requireAdmin,
    paramValidation.id,
    handleValidationErrors,
    AdminController.deleteEvent
);

/**
 * @route   GET /api/admin/events/user/:userId
 * @desc    Obtenir les événements d'un utilisateur spécifique
 * @access  Private (Admin only)
 */
router.get('/events/user/:userId', 
    requireAdmin,
    paramValidation.userId,
    handleValidationErrors,
    AdminController.getUserEvents
);

// =============================================
// Routes de statistiques et rapports
// =============================================

/**
 * @route   GET /api/admin/statistics
 * @desc    Obtenir les statistiques globales
 * @access  Private (Admin only)
 */
router.get('/statistics', 
    requireAdmin,
    AdminController.getGlobalStatistics
);

module.exports = router;
