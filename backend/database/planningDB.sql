-- =============================================
-- Script de création de la base de données planningDB
-- Application de gestion de planning
-- =============================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS planningDB 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Utilisation de la base de données
USE planningDB;

-- =============================================
-- Table des utilisateurs
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
-- Table des événements du planning
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
    participants TEXT, -- JSON ou liste séparée par des virgules
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_date_debut (date_debut),
    INDEX idx_date_fin (date_fin),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_statut (statut),
    INDEX idx_type (type_evenement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table des sessions utilisateurs (optionnel)
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
-- Insertion des utilisateurs par défaut
-- =============================================

-- Utilisateur administrateur par défaut
-- Mot de passe: admin123 (sera haché par l'application)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES 
('Admin', 'Système', 'admin@planning.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Utilisateur normal par défaut
-- Mot de passe: user123 (sera haché par l'application)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES 
('Dupont', 'Jean', 'jean.dupont@planning.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- =============================================
-- Insertion d'événements d'exemple
-- =============================================
INSERT INTO planning (titre, description, date_debut, date_fin, type_evenement, utilisateur_id, salle) VALUES 
('Réunion équipe', 'Réunion hebdomadaire de l\'équipe de développement', '2024-01-15 09:00:00', '2024-01-15 10:00:00', 'reunion', 1, 'Salle A'),
('Formation React', 'Formation sur les bases de React.js', '2024-01-16 14:00:00', '2024-01-16 17:00:00', 'formation', 1, 'Salle B'),
('Maintenance serveur', 'Maintenance préventive du serveur principal', '2024-01-17 02:00:00', '2024-01-17 04:00:00', 'maintenance', 1, 'Datacenter'),
('Présentation projet', 'Présentation du nouveau projet client', '2024-01-18 10:30:00', '2024-01-18 11:30:00', 'reunion', 2, 'Salle C');

-- =============================================
-- Vues utiles pour les requêtes fréquentes
-- =============================================

-- Vue pour les événements de la semaine courante
CREATE VIEW vue_planning_semaine AS
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
CREATE VIEW vue_statistiques AS
SELECT 
    type_evenement,
    statut,
    COUNT(*) as nombre_evenements,
    AVG(TIMESTAMPDIFF(MINUTE, date_debut, date_fin)) as duree_moyenne_minutes
FROM planning
GROUP BY type_evenement, statut;

-- =============================================
-- Procédures stockées utiles
-- =============================================

DELIMITER //

-- Procédure pour nettoyer les sessions expirées
CREATE PROCEDURE NettoyerSessionsExpirees()
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END //

-- Procédure pour obtenir les événements d'un utilisateur
CREATE PROCEDURE GetEvenementsUtilisateur(IN user_id INT, IN date_debut DATE, IN date_fin DATE)
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

DELIMITER ;

-- =============================================
-- Triggers pour l'audit
-- =============================================

-- Trigger pour mettre à jour la date de dernière connexion
DELIMITER //
CREATE TRIGGER update_derniere_connexion
AFTER UPDATE ON utilisateurs
FOR EACH ROW
BEGIN
    IF NEW.derniere_connexion IS NOT NULL AND OLD.derniere_connexion IS NULL THEN
        UPDATE utilisateurs 
        SET derniere_connexion = NOW() 
        WHERE id = NEW.id;
    END IF;
END //
DELIMITER ;

-- =============================================
-- Index supplémentaires pour optimiser les performances
-- =============================================

-- Index composite pour les requêtes de planning par date et utilisateur
CREATE INDEX idx_planning_date_user ON planning(date_debut, utilisateur_id);

-- Index pour les recherches textuelles
CREATE FULLTEXT INDEX idx_planning_recherche ON planning(titre, description);

-- =============================================
-- Permissions et utilisateur de l'application
-- =============================================

-- Création d'un utilisateur spécifique pour l'application (optionnel)
-- CREATE USER 'planning_app'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON planningDB.* TO 'planning_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =============================================
-- Fin du script
-- =============================================

SELECT 'Base de données planningDB créée avec succès!' as message;
SELECT 'Tables créées: utilisateurs, planning, sessions' as tables;
SELECT 'Utilisateurs par défaut: admin@planning.com (admin123), jean.dupont@planning.com (user123)' as utilisateurs;
