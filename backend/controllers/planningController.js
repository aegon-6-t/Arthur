/**
 * Contrôleur de planning
 * Gère les opérations CRUD sur les événements du planning
 */

const Planning = require('../models/Planning');
const { validationResult } = require('express-validator');

class PlanningController {
    /**
     * Obtenir les événements d'une semaine
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getWeekEvents(req, res) {
        try {
            const { date } = req.query;
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            // Si pas de date fournie, utiliser la date actuelle
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            // Calculer le début de la semaine (lundi)
            const weekStart = new Date(targetDate);
            const dayOfWeek = weekStart.getDay();
            const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            weekStart.setDate(weekStart.getDate() + daysToMonday);
            const weekStartStr = weekStart.toISOString().split('T')[0];

            // Récupérer les événements de la semaine
            // Les admins voient tous les événements, les utilisateurs normaux voient seulement les leurs
            const events = userRole === 'admin' 
                ? await Planning.findByWeek(weekStartStr)
                : await Planning.findByWeek(weekStartStr, userId);

            res.json({
                success: true,
                data: {
                    weekStart: weekStartStr,
                    events: events
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des événements de la semaine:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les événements d'un jour spécifique
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getDayEvents(req, res) {
        try {
            const { date } = req.params;
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            // Récupérer les événements du jour
            const events = userRole === 'admin' 
                ? await Planning.findByDay(date)
                : await Planning.findByDay(date, userId);

            res.json({
                success: true,
                data: {
                    date: date,
                    events: events
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des événements du jour:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Créer un nouvel événement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async createEvent(req, res) {
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

            const eventData = {
                ...req.body,
                utilisateur_id: req.session.userId
            };

            // Vérification des conflits d'horaires
            const conflicts = await Planning.checkConflicts(
                eventData.date_debut, 
                eventData.date_fin
            );

            if (conflicts.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Conflit d\'horaires détecté',
                    conflicts: conflicts
                });
            }

            // Création de l'événement
            const newEvent = await Planning.create(eventData);

            res.status(201).json({
                success: true,
                message: 'Événement créé avec succès',
                data: newEvent
            });

        } catch (error) {
            console.error('Erreur lors de la création de l\'événement:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir un événement par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getEvent(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            const event = await Planning.findById(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Événement non trouvé'
                });
            }

            // Vérification des permissions
            if (userRole !== 'admin' && event.utilisateur_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé à cet événement'
                });
            }

            res.json({
                success: true,
                data: event
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'événement:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour un événement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateEvent(req, res) {
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

            const { id } = req.params;
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            // Vérification de l'existence de l'événement
            const existingEvent = await Planning.findById(id);
            if (!existingEvent) {
                return res.status(404).json({
                    success: false,
                    message: 'Événement non trouvé'
                });
            }

            // Vérification des permissions
            if (userRole !== 'admin' && existingEvent.utilisateur_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé à cet événement'
                });
            }

            // Vérification des conflits d'horaires (si les dates changent)
            if (req.body.date_debut || req.body.date_fin) {
                const startDate = req.body.date_debut || existingEvent.date_debut;
                const endDate = req.body.date_fin || existingEvent.date_fin;
                
                const conflicts = await Planning.checkConflicts(startDate, endDate, parseInt(id));
                if (conflicts.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: 'Conflit d\'horaires détecté',
                        conflicts: conflicts
                    });
                }
            }

            // Mise à jour de l'événement
            const updatedEvent = await Planning.update(id, req.body);

            res.json({
                success: true,
                message: 'Événement mis à jour avec succès',
                data: updatedEvent
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'événement:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer un événement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            // Vérification de l'existence de l'événement
            const existingEvent = await Planning.findById(id);
            if (!existingEvent) {
                return res.status(404).json({
                    success: false,
                    message: 'Événement non trouvé'
                });
            }

            // Vérification des permissions
            if (userRole !== 'admin' && existingEvent.utilisateur_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé à cet événement'
                });
            }

            // Suppression de l'événement
            const deleted = await Planning.delete(id);
            if (!deleted) {
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression'
                });
            }

            res.json({
                success: true,
                message: 'Événement supprimé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Rechercher des événements
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async searchEvents(req, res) {
        try {
            const { q } = req.query;
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Le terme de recherche doit contenir au moins 2 caractères'
                });
            }

            // Recherche des événements
            const events = userRole === 'admin' 
                ? await Planning.search(q.trim())
                : await Planning.search(q.trim(), userId);

            res.json({
                success: true,
                data: {
                    searchTerm: q.trim(),
                    events: events
                }
            });

        } catch (error) {
            console.error('Erreur lors de la recherche d\'événements:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les statistiques des événements
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStatistics(req, res) {
        try {
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            // Les admins voient les statistiques globales, les utilisateurs voient les leurs
            const statistics = userRole === 'admin' 
                ? await Planning.getStatistics()
                : await Planning.getStatistics(userId);

            res.json({
                success: true,
                data: statistics
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les événements d'une période
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getEventsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Les dates de début et de fin sont requises'
                });
            }

            // Récupérer les événements de la période
            const events = userRole === 'admin' 
                ? await Planning.findByDateRange(startDate, endDate)
                : await Planning.findByDateRange(startDate, endDate, userId);

            res.json({
                success: true,
                data: {
                    startDate,
                    endDate,
                    events: events
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des événements par période:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

module.exports = PlanningController;
