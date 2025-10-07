/**
 * Contrôleur d'authentification avec AD + JWT
 * Authentifie via Active Directory et retourne un token JWT
 */

const jwt = require('jsonwebtoken');
const adService = require('../services/ad.service');
const ActiveDirectory = require('activedirectory2'); // ou activedirectory selon le module installé

const config = {
    url: process.env.AD_URL,
    baseDN: process.env.AD_BASE_DN,
    username: process.env.AD_USERNAME,
    password: process.env.AD_PASSWORD
};

const ad = new ActiveDirectory(config);

class AuthControllerAD {
    /**
     * Connexion via AD
     */
    static async login(req, res) {
        try {
            const { email, mot_de_passe } = req.body;
            if (!email || !mot_de_passe) {
                return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
            }

            const userPrincipalName = email; // ex: user@domain.local

            ad.authenticate(userPrincipalName, mot_de_passe, (err, auth) => {
                if (err) {
                    console.error('Erreur AD:', err);
                    return res.status(500).json({ success: false, message: 'Erreur serveur AD' });
                }

                if (!auth) {
                    return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
                }

                // Récupération des infos AD
                ad.findUser(userPrincipalName, (err, user) => {
                    if (err) {
                        console.error('Erreur récupération utilisateur AD:', err);
                        return res.status(500).json({ success: false, message: 'Erreur serveur AD' });
                    }

                    if (!user) {
                        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé dans AD' });
                    }

                    // Création du token JWT
                    const token = jwt.sign(
                        {
                            email: user.userPrincipalName,
                            displayName: user.displayName,
                            nom: user.sn,
                            prenom: user.givenName,
                            role: 'user' // Tu peux gérer rôle selon AD groupe
                        },
                        process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise',
                        { expiresIn: '24h', issuer: 'planning-app', audience: 'planning-users' }
                    );

                    res.json({
                        success: true,
                        message: 'Connexion réussie',
                        user: {
                            email: user.userPrincipalName,
                            nom: user.sn,
                            prenom: user.givenName,
                            displayName: user.displayName
                        },
                        token: token,
                        expiresIn: '24h'
                    });
                });
            });

        } catch (error) {
            console.error('Erreur login AD:', error);
            res.status(500).json({ success: false, message: 'Erreur interne serveur' });
        }
    }

    /**
     * Récupération du profil utilisateur connecté
     */
    static async getProfile(req, res) {
        try {
            const user = req.user; // récupéré par ton middleware JWT
            if (!user) {
                return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            }

            res.json({
                success: true,
                user: {
                    email: user.email,
                    displayName: user.displayName,
                    nom: user.nom,
                    prenom: user.prenom,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Erreur récupération profil AD:', error);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    }

    /**
     * Déconnexion (JWT côté client)
     */
    static async logout(req, res) {
        res.json({ success: true, message: 'Déconnexion réussie, supprimez le token côté client' });
    }

    static async register (req, res) {
        try {
            const { prenom, nom, email, mot_de_passe } = req.body;

            if (!prenom || !nom || !email || !mot_de_passe) {
            return res.status(400).json({ success: false, message: 'Champs requis manquants' });
            }

            const message = await adService.createUser({ prenom, nom, email, mot_de_passe });
            res.status(201).json({ success: true, message });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
        };
}

module.exports = AuthControllerAD;