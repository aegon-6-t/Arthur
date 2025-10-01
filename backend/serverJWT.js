/**
 * Serveur principal de l'application de gestion de planning avec JWT
 * Ce fichier configure Express et démarre le serveur avec authentification JWT
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importation des routes
const authRoutes = require('./routes/authJWT');
const planningRoutes = require('./routes/planning');
const adminRoutes = require('./routes/admin');

// Importation du middleware d'authentification JWT
const { verifyJWT, requireAdmin } = require('./middleware/jwtAuth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de la sécurité avec Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Configuration CORS pour permettre les requêtes depuis le frontend React
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3001',
    credentials: true
}));

// Middleware pour parser les données JSON et URL
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Limitation du taux de requêtes pour éviter les attaques par force brute
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 10000,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});

// Limitation spéciale pour les tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 100,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Serveur de gestion de planning opérationnel avec JWT',
        timestamp: new Date().toISOString()
    });
});

// Application du rate limiter aux routes API
app.use('/api', limiter);

// Routes publiques (authentification)
app.use('/api/auth', loginLimiter, authRoutes);

// Routes protégées (nécessitent une authentification JWT)
app.use('/api/planning', verifyJWT, planningRoutes);
app.use('/api/admin', verifyJWT, requireAdmin, adminRoutes);

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée',
        message: 'La route demandée n\'existe pas'
    });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur de gestion de planning avec JWT démarré sur le port ${PORT}`);
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`🔐 Authentification: JWT`);
});

module.exports = app;
