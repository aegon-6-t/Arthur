/**
 * Modèle User - Gestion des utilisateurs
 * Ce fichier contient toutes les fonctions pour interagir avec la table utilisateurs
 */

const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    /**
     * Créer un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<Object>} - L'utilisateur créé
     */
    static async create(userData) {
        try {
            // Hachage du mot de passe avec bcrypt
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.mot_de_passe, saltRounds);

            // Requête préparée pour insérer un nouvel utilisateur
            const query = `
                INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, actif) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                userData.nom,
                userData.prenom,
                userData.email,
                hashedPassword,
                userData.role || 'user',
                userData.actif !== undefined ? userData.actif : true
            ];

            const result = await executeQuery(query, params);
            
            // Récupérer l'utilisateur créé sans le mot de passe
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Trouver un utilisateur par son ID
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<Object|null>} - L'utilisateur trouvé ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT id, nom, prenom, email, role, actif, date_creation, derniere_connexion 
                FROM utilisateurs 
                WHERE id = ? AND actif = true
            `;
            const users = await executeQuery(query, [id]);
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Erreur lors de la recherche de l\'utilisateur par ID:', error);
            throw error;
        }
    }

    /**
     * Trouver un utilisateur par son email
     * @param {string} email - Email de l'utilisateur
     * @returns {Promise<Object|null>} - L'utilisateur trouvé ou null
     */
    static async findByEmail(email) {
        try {
            const query = `
                SELECT id, nom, prenom, email, mot_de_passe, role, actif, date_creation, derniere_connexion 
                FROM utilisateurs 
                WHERE email = ? AND actif = true
            `;
            const users = await executeQuery(query, [email]);
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Erreur lors de la recherche de l\'utilisateur par email:', error);
            throw error;
        }
    }

    /**
     * Vérifier le mot de passe d'un utilisateur
     * @param {string} plainPassword - Mot de passe en clair
     * @param {string} hashedPassword - Mot de passe haché
     * @returns {Promise<boolean>} - True si le mot de passe est correct
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Erreur lors de la vérification du mot de passe:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour la dernière connexion d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<void>}
     */
    static async updateLastLogin(userId) {
        try {
            const query = `
                UPDATE utilisateurs 
                SET derniere_connexion = NOW() 
                WHERE id = ?
            `;
            await executeQuery(query, [userId]);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
            throw error;
        }
    }

    /**
     * Obtenir tous les utilisateurs (pour l'administration)
     * @param {number} limit - Nombre maximum d'utilisateurs à retourner
     * @param {number} offset - Décalage pour la pagination
     * @returns {Promise<Array>} - Liste des utilisateurs
     */
    static async findAll(limit = 50, offset = 0) {
        try {
            const query = `
                SELECT id, nom, prenom, email, role, actif, date_creation, derniere_connexion 
                FROM utilisateurs 
                ORDER BY date_creation DESC 
                LIMIT ? OFFSET ?
            `;
            return await executeQuery(query, [limit, offset]);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - L'utilisateur mis à jour
     */
    static async update(id, updateData) {
        try {
            // Construction dynamique de la requête UPDATE
            const fields = [];
            const values = [];

            // Ajouter les champs à mettre à jour
            if (updateData.nom) {
                fields.push('nom = ?');
                values.push(updateData.nom);
            }
            if (updateData.prenom) {
                fields.push('prenom = ?');
                values.push(updateData.prenom);
            }
            if (updateData.email) {
                fields.push('email = ?');
                values.push(updateData.email);
            }
            if (updateData.role) {
                fields.push('role = ?');
                values.push(updateData.role);
            }
            if (updateData.actif !== undefined) {
                fields.push('actif = ?');
                values.push(updateData.actif);
            }

            // Si un nouveau mot de passe est fourni, le hacher
            if (updateData.mot_de_passe) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(updateData.mot_de_passe, saltRounds);
                fields.push('mot_de_passe = ?');
                values.push(hashedPassword);
            }

            if (fields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id); // Ajouter l'ID à la fin pour la clause WHERE

            const query = `UPDATE utilisateurs SET ${fields.join(', ')} WHERE id = ?`;
            await executeQuery(query, values);

            return await this.findById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Supprimer un utilisateur (désactivation)
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<boolean>} - True si la suppression a réussi
     */
    static async delete(id) {
        try {
            const query = 'UPDATE utilisateurs SET actif = false WHERE id = ?';
            const result = await executeQuery(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Compter le nombre total d'utilisateurs
     * @returns {Promise<number>} - Nombre d'utilisateurs
     */
    static async count() {
        try {
            const query = 'SELECT COUNT(*) as total FROM utilisateurs WHERE actif = true';
            const result = await executeQuery(query);
            return result[0].total;
        } catch (error) {
            console.error('Erreur lors du comptage des utilisateurs:', error);
            throw error;
        }
    }

    /**
     * Rechercher des utilisateurs par nom ou email
     * @param {string} searchTerm - Terme de recherche
     * @returns {Promise<Array>} - Liste des utilisateurs correspondants
     */
    static async search(searchTerm) {
        try {
            const query = `
                SELECT id, nom, prenom, email, role, actif, date_creation, derniere_connexion 
                FROM utilisateurs 
                WHERE (nom LIKE ? OR prenom LIKE ? OR email LIKE ?) 
                AND actif = true 
                ORDER BY nom, prenom
            `;
            const searchPattern = `%${searchTerm}%`;
            return await executeQuery(query, [searchPattern, searchPattern, searchPattern]);
        } catch (error) {
            console.error('Erreur lors de la recherche d\'utilisateurs:', error);
            throw error;
        }
    }
}

module.exports = User;
