-- =============================================
-- Export SQL de la base de données planningDB
-- Application de gestion de planning
-- Date d'export: $(date)
-- =============================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS planningDB 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE planningDB;

-- =============================================
-- Structure de la table utilisateurs
-- =============================================
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Structure de la table planning
-- =============================================
CREATE TABLE IF NOT EXISTS planning (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    type_evenement ENUM('reunion', 'formation', 'maintenance', 'autre') DEFAULT 'autre',
    statut ENUM('planifie', 'en_cours', 'termine', 'annule') DEFAULT 'planifie',
    utilisateur_id INT NOT NULL,
    salle VARCHAR(100),
    participants TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_date_debut (date_debut),
    INDEX idx_date_fin (date_fin),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_statut (statut),
    INDEX idx_type (type_evenement),
    INDEX idx_planning_date_user (date_debut, utilisateur_id),
    FULLTEXT INDEX idx_planning_recherche (titre, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Structure de la table sessions
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Données des utilisateurs
-- =============================================
INSERT INTO utilisateurs (id, nom, prenom, email, mot_de_passe, role, actif, date_creation, derniere_connexion) VALUES
(1, 'Admin', 'Système', 'admin@planning.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, '2024-01-01 10:00:00', '2024-01-15 14:30:00'),
(2, 'Dupont', 'Jean', 'jean.dupont@planning.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, '2024-01-01 10:00:00', '2024-01-15 09:15:00'),
(3, 'Martin', 'Marie', 'marie.martin@planning.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, '2024-01-02 11:00:00', '2024-01-14 16:45:00'),
(4, 'Bernard', 'Pierre', 'pierre.bernard@planning.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, '2024-01-03 09:30:00', '2024-01-13 11:20:00'),
(5, 'Durand', 'Sophie', 'sophie.durand@planning.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 0, '2024-01-04 14:15:00', '2024-01-10 17:30:00');

-- =============================================
-- Données du planning
-- =============================================
INSERT INTO planning (id, titre, description, date_debut, date_fin, type_evenement, statut, utilisateur_id, salle, participants, date_creation, date_modification) VALUES
(1, 'Réunion équipe développement', 'Réunion hebdomadaire de l\'équipe de développement pour faire le point sur les projets en cours', '2024-01-15 09:00:00', '2024-01-15 10:00:00', 'reunion', 'termine', 1, 'Salle A', 'Jean Dupont, Marie Martin, Pierre Bernard', '2024-01-10 10:00:00', '2024-01-15 10:00:00'),
(2, 'Formation React.js', 'Formation sur les bases de React.js et les hooks pour l\'équipe frontend', '2024-01-16 14:00:00', '2024-01-16 17:00:00', 'formation', 'planifie', 1, 'Salle B', 'Marie Martin, Sophie Durand', '2024-01-11 14:30:00', '2024-01-11 14:30:00'),
(3, 'Maintenance serveur principal', 'Maintenance préventive du serveur principal - redémarrage et mise à jour des composants', '2024-01-17 02:00:00', '2024-01-17 04:00:00', 'maintenance', 'planifie', 1, 'Datacenter', 'Pierre Bernard', '2024-01-12 09:15:00', '2024-01-12 09:15:00'),
(4, 'Présentation projet client', 'Présentation du nouveau projet client à l\'équipe commerciale', '2024-01-18 10:30:00', '2024-01-18 11:30:00', 'reunion', 'planifie', 2, 'Salle C', 'Jean Dupont, Marie Martin', '2024-01-13 16:20:00', '2024-01-13 16:20:00'),
(5, 'Formation sécurité informatique', 'Formation sur les bonnes pratiques de sécurité informatique pour tous les employés', '2024-01-19 09:00:00', '2024-01-19 12:00:00', 'formation', 'planifie', 1, 'Amphithéâtre', 'Tous les employés', '2024-01-14 11:45:00', '2024-01-14 11:45:00'),
(6, 'Réunion planning Q1', 'Réunion de planification pour le premier trimestre 2024', '2024-01-22 14:00:00', '2024-01-22 16:00:00', 'reunion', 'planifie', 1, 'Salle A', 'Direction, Chefs de projet', '2024-01-15 08:30:00', '2024-01-15 08:30:00'),
(7, 'Maintenance base de données', 'Maintenance et optimisation de la base de données de production', '2024-01-23 01:00:00', '2024-01-23 03:00:00', 'maintenance', 'planifie', 1, 'Datacenter', 'Pierre Bernard', '2024-01-15 10:15:00', '2024-01-15 10:15:00'),
(8, 'Formation Node.js', 'Formation avancée sur Node.js et Express.js pour l\'équipe backend', '2024-01-24 09:00:00', '2024-01-24 17:00:00', 'formation', 'planifie', 1, 'Salle B', 'Pierre Bernard, Jean Dupont', '2024-01-15 12:00:00', '2024-01-15 12:00:00'),
(9, 'Réunion client - Projet Alpha', 'Réunion avec le client pour le projet Alpha - présentation des avancées', '2024-01-25 15:00:00', '2024-01-25 16:30:00', 'reunion', 'planifie', 2, 'Salle C', 'Jean Dupont, Marie Martin, Client Alpha', '2024-01-15 13:20:00', '2024-01-15 13:20:00'),
(10, 'Formation Docker', 'Formation sur Docker et la containerisation pour l\'équipe DevOps', '2024-01-26 10:00:00', '2024-01-26 16:00:00', 'formation', 'planifie', 1, 'Salle B', 'Pierre Bernard, Sophie Durand', '2024-01-15 14:45:00', '2024-01-15 14:45:00');

-- =============================================
-- Vues utiles
-- =============================================

-- Vue pour les événements de la semaine courante
CREATE OR REPLACE VIEW vue_planning_semaine AS
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
    CONCAT(u.prenom, ' ', u.nom) AS createur,
    u.email AS email_createur
FROM planning p
JOIN utilisateurs u ON p.utilisateur_id = u.id
WHERE p.date_debut >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  AND p.date_debut < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
ORDER BY p.date_debut;

-- Vue pour les statistiques des événements
CREATE OR REPLACE VIEW vue_statistiques AS
SELECT 
    type_evenement,
    statut,
    COUNT(*) as nombre_evenements,
    AVG(TIMESTAMPDIFF(MINUTE, date_debut, date_fin)) as duree_moyenne_minutes
FROM planning
GROUP BY type_evenement, statut;

-- =============================================
-- Procédures stockées
-- =============================================

DELIMITER //

-- Procédure pour nettoyer les sessions expirées
CREATE OR REPLACE PROCEDURE NettoyerSessionsExpirees()
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
    SELECT ROW_COUNT() as sessions_supprimees;
END //

-- Procédure pour obtenir les événements d'un utilisateur
CREATE OR REPLACE PROCEDURE GetEvenementsUtilisateur(IN user_id INT, IN date_debut DATE, IN date_fin DATE)
BEGIN
    SELECT 
        p.*,
        CONCAT(u.prenom, ' ', u.nom) AS createur
    FROM planning p
    JOIN utilisateurs u ON p.utilisateur_id = u.id
    WHERE p.utilisateur_id = user_id
      AND DATE(p.date_debut) BETWEEN date_debut AND date_fin
    ORDER BY p.date_debut;
END //

-- Procédure pour obtenir les statistiques globales
CREATE OR REPLACE PROCEDURE GetStatistiquesGlobales()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM utilisateurs WHERE actif = true) as total_utilisateurs,
        (SELECT COUNT(*) FROM utilisateurs WHERE role = 'admin' AND actif = true) as total_admins,
        (SELECT COUNT(*) FROM planning) as total_evenements,
        (SELECT COUNT(*) FROM planning WHERE statut = 'planifie') as evenements_planifies,
        (SELECT COUNT(*) FROM planning WHERE statut = 'en_cours') as evenements_en_cours,
        (SELECT COUNT(*) FROM planning WHERE statut = 'termine') as evenements_termines,
        (SELECT COUNT(*) FROM planning WHERE statut = 'annule') as evenements_annules;
END //

DELIMITER ;

-- =============================================
-- Triggers
-- =============================================

DELIMITER //

-- Trigger pour mettre à jour la date de dernière connexion
CREATE OR REPLACE TRIGGER update_derniere_connexion
AFTER UPDATE ON utilisateurs
FOR EACH ROW
BEGIN
    IF NEW.derniere_connexion IS NOT NULL AND OLD.derniere_connexion IS NULL THEN
        UPDATE utilisateurs 
        SET derniere_connexion = NOW() 
        WHERE id = NEW.id;
    END IF;
END //

-- Trigger pour logger les modifications d'événements
CREATE OR REPLACE TRIGGER log_modification_planning
AFTER UPDATE ON planning
FOR EACH ROW
BEGIN
    INSERT INTO planning_audit (evenement_id, action, ancienne_valeur, nouvelle_valeur, utilisateur_id, timestamp)
    VALUES (NEW.id, 'UPDATE', JSON_OBJECT('titre', OLD.titre, 'statut', OLD.statut), 
            JSON_OBJECT('titre', NEW.titre, 'statut', NEW.statut), NEW.utilisateur_id, NOW());
END //

DELIMITER ;

-- =============================================
-- Table d'audit (optionnelle)
-- =============================================
CREATE TABLE IF NOT EXISTS planning_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evenement_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    ancienne_valeur JSON,
    nouvelle_valeur JSON,
    utilisateur_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_evenement (evenement_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Données de test supplémentaires
-- =============================================

-- Sessions actives (exemple)
INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES
('session_admin_123', 1, '2024-01-16 14:30:00', '2024-01-15 14:30:00'),
('session_user_456', 2, '2024-01-16 09:15:00', '2024-01-15 09:15:00');

-- =============================================
-- Requêtes de vérification
-- =============================================

-- Vérifier le nombre d'utilisateurs
SELECT COUNT(*) as nombre_utilisateurs FROM utilisateurs WHERE actif = true;

-- Vérifier le nombre d'événements
SELECT COUNT(*) as nombre_evenements FROM planning;

-- Vérifier les événements par type
SELECT type_evenement, COUNT(*) as nombre FROM planning GROUP BY type_evenement;

-- Vérifier les événements par statut
SELECT statut, COUNT(*) as nombre FROM planning GROUP BY statut;

-- Vérifier les utilisateurs par rôle
SELECT role, COUNT(*) as nombre FROM utilisateurs WHERE actif = true GROUP BY role;

-- =============================================
-- Fin de l'export
-- =============================================

SELECT 'Export de la base de données planningDB terminé avec succès!' as message;
SELECT 'Tables créées: utilisateurs, planning, sessions, planning_audit' as tables;
SELECT 'Vues créées: vue_planning_semaine, vue_statistiques' as vues;
SELECT 'Procédures créées: NettoyerSessionsExpirees, GetEvenementsUtilisateur, GetStatistiquesGlobales' as procedures;
SELECT 'Triggers créés: update_derniere_connexion, log_modification_planning' as triggers;
SELECT 'Données insérées: 5 utilisateurs, 10 événements, 2 sessions' as donnees;
