/**
 * Configuration de la base de données MariaDB/MySQL
 * Ce fichier gère la connexion à la base de données
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'planningDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

/**
 * Fonction pour tester la connexion à la base de données
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion à la base de données réussie');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à la base de données:', error.message);
        return false;
    }
}

/**
 * Fonction pour exécuter une requête préparée
 * @param {string} query - La requête SQL avec des placeholders (?)
 * @param {Array} params - Les paramètres à injecter dans la requête
 * @returns {Promise} - Le résultat de la requête
 */
async function executeQuery(query, params = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Erreur lors de l\'exécution de la requête:', error);
        throw error;
    }
}

/**
 * Fonction pour obtenir une connexion du pool
 * @returns {Promise} - Une connexion de la base de données
 */
async function getConnection() {
    return await pool.getConnection();
}

/**
 * Fonction pour fermer le pool de connexions
 */
async function closePool() {
    try {
        await pool.end();
        console.log('🔒 Pool de connexions fermé');
    } catch (error) {
        console.error('Erreur lors de la fermeture du pool:', error);
    }
}

// Test de la connexion au démarrage
testConnection();

module.exports = {
    pool,
    executeQuery,
    getConnection,
    closePool,
    testConnection
};
