/**
 * Exemples de requêtes préparées utilisées dans l'application
 * Ce fichier démontre l'utilisation des requêtes préparées pour la sécurité
 */

const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * EXEMPLE 1: Authentification utilisateur
 * Protection contre l'injection SQL lors de la connexion
 */
async function authentifierUtilisateur(email, motDePasse) {
    try {
        // ❌ MAUVAISE PRATIQUE (vulnérable aux injections SQL)
        // const query = `SELECT * FROM utilisateurs WHERE email = '${email}' AND mot_de_passe = '${motDePasse}'`;
        
        // ✅ BONNE PRATIQUE (requête préparée)
        const query = `
            SELECT id, nom, prenom, email, mot_de_passe, role, actif, date_creation, derniere_connexion 
            FROM utilisateurs 
            WHERE email = ? AND actif = true
        `;
        
        const users = await executeQuery(query, [email]);
        
        if (users.length > 0) {
            const user = users[0];
            // Vérification du mot de passe avec bcrypt
            const isPasswordValid = await bcrypt.compare(motDePasse, user.mot_de_passe);
            
            if (isPasswordValid) {
                return { success: true, user: user };
            }
        }
        
        return { success: false, message: 'Email ou mot de passe incorrect' };
        
    } catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        throw error;
    }
}

/**
 * EXEMPLE 2: Création d'un événement
 * Protection contre l'injection SQL lors de l'insertion
 */
async function creerEvenement(donneesEvenement) {
    try {
        // ❌ MAUVAISE PRATIQUE (vulnérable aux injections SQL)
        // const query = `INSERT INTO planning (titre, description, date_debut, date_fin, utilisateur_id) VALUES ('${donneesEvenement.titre}', '${donneesEvenement.description}', '${donneesEvenement.date_debut}', '${donneesEvenement.date_fin}', ${donneesEvenement.utilisateur_id})`;
        
        // ✅ BONNE PRATIQUE (requête préparée)
        const query = `
            INSERT INTO planning (
                titre, description, date_debut, date_fin, 
                type_evenement, statut, utilisateur_id, salle, participants
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            donneesEvenement.titre,
            donneesEvenement.description || null,
            donneesEvenement.date_debut,
            donneesEvenement.date_fin,
            donneesEvenement.type_evenement || 'autre',
            donneesEvenement.statut || 'planifie',
            donneesEvenement.utilisateur_id,
            donneesEvenement.salle || null,
            donneesEvenement.participants || null
        ];
        
        const result = await executeQuery(query, params);
        
        // Récupérer l'événement créé
        const nouvelEvenement = await recupererEvenementParId(result.insertId);
        
        return { success: true, evenement: nouvelEvenement };
        
    } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        throw error;
    }
}

/**
 * EXEMPLE 3: Recherche d'événements avec filtres
 * Protection contre l'injection SQL lors de la recherche
 */
async function rechercherEvenements(criteres) {
    try {
        // Construction dynamique de la requête avec des paramètres sécurisés
        let query = `
            SELECT 
                p.*,
                CONCAT(u.prenom, ' ', u.nom) as createur,
                u.email as email_createur
            FROM planning p
            JOIN utilisateurs u ON p.utilisateur_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        // Filtre par utilisateur
        if (criteres.utilisateur_id) {
            query += ' AND p.utilisateur_id = ?';
            params.push(criteres.utilisateur_id);
        }
        
        // Filtre par type d'événement
        if (criteres.type_evenement) {
            query += ' AND p.type_evenement = ?';
            params.push(criteres.type_evenement);
        }
        
        // Filtre par statut
        if (criteres.statut) {
            query += ' AND p.statut = ?';
            params.push(criteres.statut);
        }
        
        // Filtre par période
        if (criteres.date_debut) {
            query += ' AND DATE(p.date_debut) >= ?';
            params.push(criteres.date_debut);
        }
        
        if (criteres.date_fin) {
            query += ' AND DATE(p.date_debut) <= ?';
            params.push(criteres.date_fin);
        }
        
        // Recherche textuelle (avec protection)
        if (criteres.recherche) {
            query += ' AND (p.titre LIKE ? OR p.description LIKE ?)';
            const termeRecherche = `%${criteres.recherche}%`;
            params.push(termeRecherche, termeRecherche);
        }
        
        query += ' ORDER BY p.date_debut ASC';
        
        // Limitation des résultats
        if (criteres.limit) {
            query += ' LIMIT ?';
            params.push(criteres.limit);
        }
        
        const evenements = await executeQuery(query, params);
        
        return { success: true, evenements: evenements };
        
    } catch (error) {
        console.error('Erreur lors de la recherche d\'événements:', error);
        throw error;
    }
}

/**
 * EXEMPLE 4: Mise à jour d'un utilisateur
 * Protection contre l'injection SQL lors de la modification
 */
async function mettreAJourUtilisateur(id, donnees) {
    try {
        // Construction dynamique de la requête UPDATE
        const fields = [];
        const values = [];
        
        // Vérifier chaque champ et l'ajouter s'il est fourni
        if (donnees.nom) {
            fields.push('nom = ?');
            values.push(donnees.nom);
        }
        
        if (donnees.prenom) {
            fields.push('prenom = ?');
            values.push(donnees.prenom);
        }
        
        if (donnees.email) {
            fields.push('email = ?');
            values.push(donnees.email);
        }
        
        if (donnees.role) {
            fields.push('role = ?');
            values.push(donnees.role);
        }
        
        if (donnees.actif !== undefined) {
            fields.push('actif = ?');
            values.push(donnees.actif);
        }
        
        // Si un nouveau mot de passe est fourni, le hacher
        if (donnees.mot_de_passe) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(donnees.mot_de_passe, saltRounds);
            fields.push('mot_de_passe = ?');
            values.push(hashedPassword);
        }
        
        if (fields.length === 0) {
            throw new Error('Aucune donnée à mettre à jour');
        }
        
        // Ajouter l'ID à la fin pour la clause WHERE
        values.push(id);
        
        const query = `UPDATE utilisateurs SET ${fields.join(', ')} WHERE id = ?`;
        
        const result = await executeQuery(query, values);
        
        if (result.affectedRows > 0) {
            // Récupérer l'utilisateur mis à jour
            const utilisateurMisAJour = await recupererUtilisateurParId(id);
            return { success: true, utilisateur: utilisateurMisAJour };
        } else {
            return { success: false, message: 'Utilisateur non trouvé' };
        }
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        throw error;
    }
}

/**
 * EXEMPLE 5: Suppression sécurisée d'un événement
 * Protection contre l'injection SQL lors de la suppression
 */
async function supprimerEvenement(id, utilisateurId, roleUtilisateur) {
    try {
        // Vérifier d'abord que l'événement existe et que l'utilisateur a le droit de le supprimer
        const queryVerification = `
            SELECT id, utilisateur_id 
            FROM planning 
            WHERE id = ?
        `;
        
        const evenements = await executeQuery(queryVerification, [id]);
        
        if (evenements.length === 0) {
            return { success: false, message: 'Événement non trouvé' };
        }
        
        const evenement = evenements[0];
        
        // Vérifier les permissions
        if (roleUtilisateur !== 'admin' && evenement.utilisateur_id !== utilisateurId) {
            return { success: false, message: 'Accès non autorisé' };
        }
        
        // Supprimer l'événement
        const querySuppression = 'DELETE FROM planning WHERE id = ?';
        const result = await executeQuery(querySuppression, [id]);
        
        if (result.affectedRows > 0) {
            return { success: true, message: 'Événement supprimé avec succès' };
        } else {
            return { success: false, message: 'Erreur lors de la suppression' };
        }
        
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        throw error;
    }
}

/**
 * EXEMPLE 6: Statistiques avec requêtes préparées
 * Protection contre l'injection SQL lors des requêtes d'agrégation
 */
async function obtenirStatistiques(utilisateurId = null) {
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
        
        // Filtrer par utilisateur si spécifié
        if (utilisateurId) {
            query += ' WHERE utilisateur_id = ?';
            params.push(utilisateurId);
        }
        
        const result = await executeQuery(query, params);
        
        return { success: true, statistiques: result[0] };
        
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
    }
}

/**
 * EXEMPLE 7: Requête avec jointures et protection
 * Protection contre l'injection SQL dans les requêtes complexes
 */
async function obtenirEvenementsAvecDetails(filtres) {
    try {
        let query = `
            SELECT 
                p.id,
                p.titre,
                p.description,
                p.date_debut,
                p.date_fin,
                p.type_evenement,
                p.statut,
                p.salle,
                p.participants,
                p.date_creation,
                p.date_modification,
                u.id as createur_id,
                CONCAT(u.prenom, ' ', u.nom) as createur_nom,
                u.email as createur_email,
                u.role as createur_role
            FROM planning p
            INNER JOIN utilisateurs u ON p.utilisateur_id = u.id
            WHERE u.actif = true
        `;
        
        const params = [];
        
        // Ajouter des filtres dynamiques
        if (filtres.date_debut) {
            query += ' AND DATE(p.date_debut) >= ?';
            params.push(filtres.date_debut);
        }
        
        if (filtres.date_fin) {
            query += ' AND DATE(p.date_debut) <= ?';
            params.push(filtres.date_fin);
        }
        
        if (filtres.utilisateur_id) {
            query += ' AND p.utilisateur_id = ?';
            params.push(filtres.utilisateur_id);
        }
        
        query += ' ORDER BY p.date_debut ASC';
        
        const evenements = await executeQuery(query, params);
        
        return { success: true, evenements: evenements };
        
    } catch (error) {
        console.error('Erreur lors de la récupération des événements avec détails:', error);
        throw error;
    }
}

// Fonctions utilitaires
async function recupererUtilisateurParId(id) {
    const query = `
        SELECT id, nom, prenom, email, role, actif, date_creation, derniere_connexion 
        FROM utilisateurs 
        WHERE id = ? AND actif = true
    `;
    const users = await executeQuery(query, [id]);
    return users.length > 0 ? users[0] : null;
}

async function recupererEvenementParId(id) {
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
}

/**
 * EXEMPLE 8: Test de vulnérabilité (à des fins éducatives)
 * Ce code montre ce qu'il ne faut PAS faire
 */
async function exempleVulnerable(email) {
    // ❌ TRÈS DANGEREUX - Ne jamais faire cela !
    const queryVulnerable = `SELECT * FROM utilisateurs WHERE email = '${email}'`;
    
    // Cette requête est vulnérable à l'injection SQL
    // Si email = "admin@test.com' OR '1'='1"
    // La requête devient: SELECT * FROM utilisateurs WHERE email = 'admin@test.com' OR '1'='1'
    // Ce qui retournerait TOUS les utilisateurs !
    
    console.log('⚠️  ATTENTION: Cette requête est vulnérable aux injections SQL !');
    console.log('Requête vulnérable:', queryVulnerable);
    
    // ✅ VERSION SÉCURISÉE
    const querySecurisee = 'SELECT * FROM utilisateurs WHERE email = ?';
    console.log('✅ Requête sécurisée avec paramètres:', querySecurisee);
}

// Export des fonctions pour les tests
module.exports = {
    authentifierUtilisateur,
    creerEvenement,
    rechercherEvenements,
    mettreAJourUtilisateur,
    supprimerEvenement,
    obtenirStatistiques,
    obtenirEvenementsAvecDetails,
    exempleVulnerable
};

/**
 * RÉSUMÉ DES BONNES PRATIQUES:
 * 
 * 1. ✅ TOUJOURS utiliser des requêtes préparées avec des paramètres (?)
 * 2. ✅ JAMAIS concaténer directement les valeurs utilisateur dans les requêtes
 * 3. ✅ Valider et nettoyer les entrées utilisateur avant de les utiliser
 * 4. ✅ Utiliser des types de données appropriés dans les paramètres
 * 5. ✅ Limiter les privilèges de l'utilisateur de base de données
 * 6. ✅ Utiliser des transactions pour les opérations complexes
 * 7. ✅ Logger les tentatives d'injection SQL suspectes
 * 8. ✅ Tester régulièrement la sécurité avec des outils d'audit
 */
