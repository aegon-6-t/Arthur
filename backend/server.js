/**
 * Serveur principal de l'application de gestion de planning
 * Ce fichier configure Express et démarre le serveur
 */

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importation des routes
const authADRoutes = require('./routes/authAD'); // <-- AD routes
const planningRoutes = require('./routes/planning');
const adminRoutes = require('./routes/admin');

// Importation du middleware d'authentification
const { requireAuth } = require('./middleware/auth');

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

if (process.env.NODE_ENV === 'production') {
  // 🚀 En production : limites normales
  limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  });

  loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 5 tentatives max en 15 min
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
  });
} else {
  // 🧑‍💻 En dev : aucune limite
  limiter = (req, res, next) => next();
  loginLimiter = (req, res, next) => next();
}

// Middleware pour parser les données JSON et URL
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuration des sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-par-defaut-changez-moi',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS en production
        httpOnly: true, // Empêche l'accès via JavaScript côté client
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

// Routes publiques (authentification via AD)
app.use('/api/auth', loginLimiter, authADRoutes);

// Routes protégées (nécessitent une authentification)
app.use('/api/planning', requireAuth, planningRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Serveur de gestion de planning opérationnel',
        timestamp: new Date().toISOString()
    });
});

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
    console.log(`🚀 Serveur de gestion de planning démarré sur le port ${PORT}`);
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
});

module.exports = app;
