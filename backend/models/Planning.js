/**
 * Modèle Planning - Gestion des événements du planning
 * Ce fichier contient toutes les fonctions pour interagir avec la table planning
 */

const { executeQuery } = require('../config/database');

class Planning {
    /**
     * Créer un nouvel événement dans le planning
     * @param {Object} eventData - Données de l'événement
     * @returns {Promise<Object>} - L'événement créé
     */
    static async create(eventData) {
        try {
            const query = `
                INSERT INTO planning (
                    titre, description, date_debut, date_fin, 
                    type_evenement, statut, utilisateur_id, salle, participants
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                eventData.titre,
                eventData.description || null,
                eventData.date_debut,
                eventData.date_fin,
                eventData.type_evenement || 'autre',
                eventData.statut || 'planifie',
                eventData.utilisateur_id,
                eventData.salle || null,
                eventData.participants || null
            ];

            const result = await executeQuery(query, params);
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Erreur lors de la création de l\'événement:', error);
            throw error;
        }
    }

    /**
     * Trouver un événement par son ID
     * @param {number} id - ID de l'événement
     * @returns {Promise<Object|null>} - L'événement trouvé ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    p.*,
                    CONCAT(u.prenom, ' ', u.nom) as createur,
                    u.email as email_createur
                FROM planning p
                JOIN utilisateurs u ON p.utilisateur_id = u.id
                WHERE p.id = ?
            `;
            const events = await executeQuery(query, [id]);
            return events.length > 0 ? events[0] : null;
        } catch (error) {
            console.error('Erreur lors de la recherche de l\'événement par ID:', error);
            throw error;
        }
    }

    /**
     * Obtenir tous les événements d'une période donnée
     * @param {string} startDate - Date de début (YYYY-MM-DD)
     * @param {string} endDate - Date de fin (YYYY-MM-DD)
     * @param {number} userId - ID de l'utilisateur (optionnel, pour filtrer)
     * @returns {Promise<Array>} - Liste des événements
     */
    static async findByDateRange(startDate, endDate, userId = null) {
        try {
            let query = `
                SELECT 
                    p.*,
                    CONCAT(u.prenom, ' ', u.nom) as createur,
                    u.email as email_createur
                FROM planning p
                JOIN utilisateurs u ON p.utilisateur_id = u.id
                WHERE DATE(p.date_debut) BETWEEN ? AND ?
            `;
            
            const params = [startDate, endDate];
            
            if (userId) {
                query += ' AND p.utilisateur_id = ?';
                params.push(userId);
            }
            
            query += ' ORDER BY p.date_debut ASC';
            
            return await executeQuery(query, params);
        } catch (error) {
            console.error('Erreur lors de la recherche d\'événements par période:', error);
            throw error;
        }
    }

    /**
     * Obtenir les événements d'une semaine spécifique
     * @param {string} weekStart - Date de début de la semaine (YYYY-MM-DD)
     * @param {number} userId - ID de l'utilisateur (optionnel)
     * @returns {Promise<Array>} - Liste des événements de la semaine
     */
    static async findByWeek(weekStart, userId = null) {
        try {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            return await this.findByDateRange(
                weekStart, 
                weekEnd.toISOString().split('T')[0], 
                userId
            );
        } catch (error) {
            console.error('Erreur lors de la recherche d\'événements par semaine:', error);
            throw error;
        }
    }

    /**
     * Obtenir les événements d'un jour spécifique
     * @param {string} date - Date (YYYY-MM-DD)
     * @param {number} userId - ID de l'utilisateur (optionnel)
     * @returns {Promise<Array>} - Liste des événements du jour
     */
    static async findByDay(date, userId = null) {
        try {
            let query = `
                SELECT 
                    p.*,
                    CONCAT(u.prenom, ' ', u.nom) as createur,
                    u.email as email_createur
                FROM planning p
                JOIN utilisateurs u ON p.utilisateur_id = u.id
                WHERE DATE(p.date_debut) = ?
            `;
            
            const params = [date];
            
            if (userId) {
                query += ' AND p.utilisateur_id = ?';
                params.push(userId);
            }
            
            query += ' ORDER BY p.date_debut ASC';
            
            return await executeQuery(query, params);
        } catch (error) {
            console.error('Erreur lors de la recherche d\'événements par jour:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour un événement
     * @param {number} id - ID de l'événement
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - L'événement mis à jour
     */
    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            // Ajouter les champs à mettre à jour
            if (updateData.titre) {
                fields.push('titre = ?');
                values.push(updateData.titre);
            }
            if (updateData.description !== undefined) {
                fields.push('description = ?');
                values.push(updateData.description);
            }
            if (updateData.date_debut) {
                fields.push('date_debut = ?');
                values.push(updateData.date_debut);
            }
            if (updateData.date_fin) {
                fields.push('date_fin = ?');
                values.push(updateData.date_fin);
            }
            if (updateData.type_evenement) {
                fields.push('type_evenement = ?');
                values.push(updateData.type_evenement);
            }
            if (updateData.statut) {
                fields.push('statut = ?');
                values.push(updateData.statut);
            }
            if (updateData.salle !== undefined) {
                fields.push('salle = ?');
                values.push(updateData.salle);
            }
            if (updateData.participants !== undefined) {
                fields.push('participants = ?');
                values.push(updateData.participants);
            }

            if (fields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);

            const query = `UPDATE planning SET ${fields.join(', ')} WHERE id = ?`;
            await executeQuery(query, values);

            return await this.findById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'événement:', error);
            throw error;
        }
    }

    /**
     * Supprimer un événement
     * @param {number} id - ID de l'événement
     * @returns {Promise<boolean>} - True si la suppression a réussi
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM planning WHERE id = ?';
            const result = await executeQuery(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
            throw error;
        }
    }

    /**
     * Obtenir tous les événements d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {number} limit - Nombre maximum d'événements
     * @param {number} offset - Décalage pour la pagination
     * @returns {Promise<Array>} - Liste des événements
     */
    static async findByUser(userId, limit = 50, offset = 0) {
        try {
            const query = `
                SELECT 
                    p.*,
                    CONCAT(u.prenom, ' ', u.nom) as createur,
                    u.email as email_createur
                FROM planning p
                JOIN utilisateurs u ON p.utilisateur_id = u.id
                WHERE p.utilisateur_id = ?
                ORDER BY p.date_debut DESC
                LIMIT ? OFFSET ?
            `;
            return await executeQuery(query, [userId, limit, offset]);
        } catch (error) {
            console.error('Erreur lors de la recherche d\'événements par utilisateur:', error);
            throw error;
        }
    }

    /**
     * Rechercher des événements par titre ou description
     * @param {string} searchTerm - Terme de recherche
     * @param {number} userId - ID de l'utilisateur (optionnel)
     * @returns {Promise<Array>} - Liste des événements correspondants
     */
    static async search(searchTerm, userId = null) {
        try {
            let query = `
                SELECT 
                    p.*,
                    CONCAT(u.prenom, ' ', u.nom) as createur,
                    u.email as email_createur
                FROM planning p
                JOIN utilisateurs u ON p.utilisateur_id = u.id
                WHERE (p.titre LIKE ? OR p.description LIKE ?)
            `;
            
            const params = [`%${searchTerm}%`, `%${searchTerm}%`];
            
            if (userId) {
                query += ' AND p.utilisateur_id = ?';
                params.push(userId);
            }
            
            query += ' ORDER BY p.date_debut DESC';
            
            return await executeQuery(query, params);
        } catch (error) {
            console.error('Erreur lors de la recherche d\'événements:', error);
            throw error;
        }
    }

    /**
     * Obtenir les statistiques des événements
     * @param {number} userId - ID de l'utilisateur (optionnel)
     * @returns {Promise<Object>} - Statistiques des événements
     */
    static async getStatistics(userId = null) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_evenements,
                    COUNT(CASE WHEN statut = 'planifie' THEN 1 END) as planifies,
                    COUNT(CASE WHEN statut = 'en_cours' THEN 1 END) as en_cours,
                    COUNT(CASE WHEN statut = 'termine' THEN 1 END) as termines,
                    COUNT(CASE WHEN statut = 'annule' THEN 1 END) as annules,
                    COUNT(CASE WHEN type_evenement = 'reunion' THEN 1 END) as reunions,
                    COUNT(CASE WHEN type_evenement = 'formation' THEN 1 END) as formations,
                    COUNT(CASE WHEN type_evenement = 'maintenance' THEN 1 END) as maintenances
                FROM planning
            `;
            
            const params = [];
            
            if (userId) {
                query += ' WHERE utilisateur_id = ?';
                params.push(userId);
            }
            
            const result = await executeQuery(query, params);
            return result[0];
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }

    /**
     * Vérifier s'il y a des conflits d'horaires
     * @param {string} startDate - Date/heure de début
     * @param {string} endDate - Date/heure de fin
     * @param {number} excludeId - ID de l'événement à exclure (pour les mises à jour)
     * @returns {Promise<Array>} - Liste des événements en conflit
     */
    static async checkConflicts(startDate, endDate, excludeId = null) {
        try {
            let query = `
                SELECT p.*, CONCAT(u.prenom, ' ', u.nom) as createur
                FROM planning p
                JOIN utilisateurs u ON p.utilisateur_id = u.id
                WHERE (
                    (p.date_debut <= ? AND p.date_fin > ?) OR
                    (p.date_debut < ? AND p.date_fin >= ?) OR
                    (p.date_debut >= ? AND p.date_fin <= ?)
                )
                AND p.statut != 'annule'
            `;
            
            const params = [startDate, startDate, endDate, endDate, startDate, endDate];
            
            if (excludeId) {
                query += ' AND p.id != ?';
                params.push(excludeId);
            }
            
            query += ' ORDER BY p.date_debut';
            
            return await executeQuery(query, params);
        } catch (error) {
            console.error('Erreur lors de la vérification des conflits:', error);
            throw error;
        }
    }
}

module.exports = Planning;
