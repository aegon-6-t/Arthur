/**
 * Contrôleur d'administration
 * Gère les fonctionnalités réservées aux administrateurs
 */

const User = require('../models/User');
const Planning = require('../models/Planning');
const { validationResult } = require('express-validator');

class AdminController {
    /**
     * Obtenir tous les utilisateurs (avec pagination)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const users = await User.findAll(limit, offset);
            const totalUsers = await User.count();
            const totalPages = Math.ceil(totalUsers / limit);

            res.json({
                success: true,
                data: {
                    users: users,
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalUsers: totalUsers,
                        limit: limit
                    }
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Créer un nouvel utilisateur
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async createUser(req, res) {
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
                data: newUser
            });

        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir un utilisateur par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            res.json({
                success: true,
                data: user
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour un utilisateur
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateUser(req, res) {
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

            // Vérification de l'existence de l'utilisateur
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Mise à jour de l'utilisateur
            const updatedUser = await User.update(id, req.body);

            res.json({
                success: true,
                message: 'Utilisateur mis à jour avec succès',
                data: updatedUser
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer un utilisateur
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUserId = req.session.userId;

            // Empêcher l'auto-suppression
            if (parseInt(id) === currentUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vous ne pouvez pas supprimer votre propre compte'
                });
            }

            // Vérification de l'existence de l'utilisateur
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Suppression de l'utilisateur
            const deleted = await User.delete(id);

            if (!deleted) {
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression'
                });
            }

            res.json({
                success: true,
                message: 'Utilisateur supprimé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Rechercher des utilisateurs
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async searchUsers(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Le terme de recherche doit contenir au moins 2 caractères'
                });
            }

            const users = await User.search(q.trim());

            res.json({
                success: true,
                data: {
                    searchTerm: q.trim(),
                    users: users
                }
            });

        } catch (error) {
            console.error('Erreur lors de la recherche d\'utilisateurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir tous les événements (pour l'administration)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAllEvents(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;

            // Récupération des événements avec pagination
            const events = await Planning.findByDateRange(
                '1900-01-01', 
                '2100-12-31'
            );

            // Pagination manuelle (pour simplifier)
            const paginatedEvents = events.slice(offset, offset + limit);
            const totalEvents = events.length;
            const totalPages = Math.ceil(totalEvents / limit);

            res.json({
                success: true,
                data: {
                    events: paginatedEvents,
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalEvents: totalEvents,
                        limit: limit
                    }
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de tous les événements:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les statistiques globales
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getGlobalStatistics(req, res) {
        try {
            // Statistiques des utilisateurs
            const totalUsers = await User.count();
            const users = await User.findAll(1000, 0); // Récupérer tous les utilisateurs
            const activeUsers = users.filter(user => user.actif).length;
            const adminUsers = users.filter(user => user.role === 'admin').length;

            // Statistiques des événements
            const eventStats = await Planning.getStatistics();

            // Statistiques des événements par utilisateur
            const eventsByUser = await Planning.findByDateRange('1900-01-01', '2100-12-31');
            const userEventCounts = {};
            eventsByUser.forEach(event => {
                const userId = event.utilisateur_id;
                userEventCounts[userId] = (userEventCounts[userId] || 0) + 1;
            });

            res.json({
                success: true,
                data: {
                    users: {
                        total: totalUsers,
                        active: activeUsers,
                        admins: adminUsers,
                        regular: activeUsers - adminUsers
                    },
                    events: eventStats,
                    eventsByUser: userEventCounts
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques globales:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les événements d'un utilisateur spécifique
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getUserEvents(req, res) {
        try {
            const { userId } = req.params;
            const { startDate, endDate } = req.query;

            // Vérification de l'existence de l'utilisateur
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            let events;
            if (startDate && endDate) {
                events = await Planning.findByDateRange(startDate, endDate, parseInt(userId));
            } else {
                events = await Planning.findByUser(parseInt(userId), 100, 0);
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email
                    },
                    events: events
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des événements de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer un événement (admin)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteEvent(req, res) {
        try {
            const { id } = req.params;

            // Vérification de l'existence de l'événement
            const existingEvent = await Planning.findById(id);
            if (!existingEvent) {
                return res.status(404).json({
                    success: false,
                    message: 'Événement non trouvé'
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
}

module.exports = AdminController;
