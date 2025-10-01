/**
 * Routes du planning
 * Gère les opérations CRUD sur les événements du planning
 */

const express = require('express');
const router = express.Router();
const PlanningController = require('../controllers/planningController');
const { planningValidation, paramValidation, handleValidationErrors } = require('../middleware/validation');
const { requireAuth, requireModificationAccess } = require('../middleware/auth');

/**
 * @route   GET /api/planning/week
 * @desc    Obtenir les événements d'une semaine
 * @access  Private
 */
router.get('/week', 
    requireAuth,
    planningValidation.queryParams,
    handleValidationErrors,
    PlanningController.getWeekEvents
);

/**
 * @route   GET /api/planning/day/:date
 * @desc    Obtenir les événements d'un jour spécifique
 * @access  Private
 */
router.get('/day/:date', 
    requireAuth,
    paramValidation.id,
    handleValidationErrors,
    PlanningController.getDayEvents
);

/**
 * @route   GET /api/planning/range
 * @desc    Obtenir les événements d'une période
 * @access  Private
 */
router.get('/range', 
    requireAuth,
    planningValidation.queryParams,
    handleValidationErrors,
    PlanningController.getEventsByDateRange
);

/**
 * @route   POST /api/planning
 * @desc    Créer un nouvel événement
 * @access  Private
 */
router.post('/', 
    requireAuth,
    planningValidation.createEvent,
    handleValidationErrors,
    PlanningController.createEvent
);

/**
 * @route   GET /api/planning/:id
 * @desc    Obtenir un événement par son ID
 * @access  Private
 */
router.get('/:id', 
    requireAuth,
    paramValidation.id,
    handleValidationErrors,
    PlanningController.getEvent
);

/**
 * @route   PUT /api/planning/:id
 * @desc    Mettre à jour un événement
 * @access  Private
 */
router.put('/:id', 
    requireAuth,
    requireModificationAccess,
    paramValidation.id,
    planningValidation.updateEvent,
    handleValidationErrors,
    PlanningController.updateEvent
);

/**
 * @route   DELETE /api/planning/:id
 * @desc    Supprimer un événement
 * @access  Private
 */
router.delete('/:id', 
    requireAuth,
    requireModificationAccess,
    paramValidation.id,
    handleValidationErrors,
    PlanningController.deleteEvent
);

/**
 * @route   GET /api/planning/search
 * @desc    Rechercher des événements
 * @access  Private
 */
router.get('/search', 
    requireAuth,
    planningValidation.queryParams,
    handleValidationErrors,
    PlanningController.searchEvents
);

/**
 * @route   GET /api/planning/statistics
 * @desc    Obtenir les statistiques des événements
 * @access  Private
 */
router.get('/statistics', 
    requireAuth,
    PlanningController.getStatistics
);

module.exports = router;
