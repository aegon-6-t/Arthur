# Guide de Sécurité - Application de Gestion de Planning

## 🔒 Mesures de Sécurité Implémentées

### 1. Authentification et Autorisation

#### Hachage des Mots de Passe
```javascript
// Utilisation de bcrypt avec salt rounds
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

**Avantages :**
- Protection contre les attaques par dictionnaire
- Salt unique pour chaque mot de passe
- Résistance aux attaques par force brute

#### Gestion des Sessions
```javascript
// Configuration sécurisée des sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS en production
        httpOnly: true, // Empêche l'accès via JavaScript
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));
```

**Protections :**
- Cookies HttpOnly (protection XSS)
- Cookies Secure en production (HTTPS uniquement)
- Expiration automatique des sessions
- Secret de session fort et unique

#### Contrôle d'Accès Basé sur les Rôles
```javascript
// Middleware de vérification des rôles
const requireAdmin = async (req, res, next) => {
    if (req.session.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Permissions d\'administrateur requises'
        });
    }
    next();
};
```

### 2. Validation et Sanitisation

#### Validation des Entrées
```javascript
// Utilisation d'express-validator
const { body, validationResult } = require('express-validator');

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('L\'email doit être valide')
        .normalizeEmail(),
    body('mot_de_passe')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères')
];
```

**Protections :**
- Validation stricte des types de données
- Normalisation des emails
- Vérification de la longueur des mots de passe
- Validation des formats de dates

#### Protection XSS
```javascript
// Échappement des données utilisateur
body('nom')
    .trim()
    .escape(), // Protection XSS

// Configuration CSP avec Helmet
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
```

### 3. Protection de la Base de Données

#### Requêtes Préparées
```javascript
// Exemple de requête préparée
const query = `
    SELECT id, nom, prenom, email, role 
    FROM utilisateurs 
    WHERE email = ? AND actif = true
`;
const users = await executeQuery(query, [email]);
```

**Avantages :**
- Protection contre les injections SQL
- Séparation claire entre le code et les données
- Validation automatique des types

#### Pool de Connexions Sécurisé
```javascript
// Configuration du pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});
```

### 4. Limitation du Taux de Requêtes

#### Rate Limiting Global
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite à 100 requêtes par fenêtre
    message: 'Trop de requêtes depuis cette IP'
});
app.use(limiter);
```

#### Rate Limiting pour la Connexion
```javascript
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Maximum 5 tentatives de connexion
    message: 'Trop de tentatives de connexion'
});
app.use('/api/auth', loginLimiter, authRoutes);
```

### 5. En-têtes de Sécurité

#### Configuration Helmet
```javascript
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
```

#### En-têtes Nginx
```nginx
# En-têtes de sécurité
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### 6. Configuration CORS

```javascript
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3001',
    credentials: true
}));
```

**Protections :**
- Restriction des origines autorisées
- Support des credentials pour les sessions
- Configuration différente selon l'environnement

## 🛡️ Bonnes Pratiques de Sécurité

### 1. Gestion des Variables d'Environnement

#### Fichier .env Sécurisé
```env
# Ne jamais commiter le fichier .env
DB_PASSWORD=mot_de_passe_fort_et_unique
SESSION_SECRET=secret_tres_long_et_aleatoire_changez_moi
```

#### Validation des Variables
```javascript
// Vérification des variables requises
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'SESSION_SECRET'];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        throw new Error(`Variable d'environnement manquante: ${envVar}`);
    }
});
```

### 2. Logging et Monitoring

#### Logs de Sécurité
```javascript
// Logging des tentatives de connexion
console.log(`Tentative de connexion depuis ${req.ip} pour ${email}`);

// Logging des erreurs de sécurité
console.error('Tentative d\'accès non autorisé:', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    timestamp: new Date().toISOString()
});
```

### 3. Gestion des Erreurs

#### Messages d'Erreur Génériques
```javascript
// Ne pas révéler d'informations sensibles
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});
```

### 4. Validation des Permissions

#### Vérification des Droits d'Accès
```javascript
// Vérifier si l'utilisateur peut modifier une ressource
const canEditEvent = (event, user) => {
    return user.role === 'admin' || event.utilisateur_id === user.id;
};

// Middleware de vérification
const requireResourceAccess = (resourceType) => {
    return async (req, res, next) => {
        if (req.session.userRole === 'admin') {
            return next();
        }
        // Vérification spécifique selon le type de ressource
        // ...
    };
};
```

## 🔍 Tests de Sécurité

### 1. Tests d'Injection SQL

#### Test de Requête Malveillante
```bash
# Tentative d'injection SQL
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@planning.com'\'' OR '\''1'\''='\''1","mot_de_passe":"test"}'
```

**Résultat attendu :** Échec de la connexion (requête préparée)

### 2. Tests XSS

#### Test de Script Malveillant
```bash
# Tentative XSS
curl -X POST http://localhost:3000/api/planning \
  -H "Content-Type: application/json" \
  -d '{"titre":"<script>alert('\''XSS'\'')</script>","date_debut":"2024-01-01T10:00:00","date_fin":"2024-01-01T11:00:00"}'
```

**Résultat attendu :** Script échappé et rendu inoffensif

### 3. Tests de Rate Limiting

#### Test de Limitation
```bash
# Tentative de dépassement de limite
for i in {1..10}; do 
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","mot_de_passe":"test"}'
done
```

**Résultat attendu :** Blocage après 5 tentatives

### 4. Tests d'Authentification

#### Test de Session
```bash
# Test sans session
curl http://localhost:3000/api/planning/week

# Test avec session valide
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@planning.com","mot_de_passe":"admin123"}' \
  -c cookies.txt

curl http://localhost:3000/api/planning/week -b cookies.txt
```

## 🚨 Réponse aux Incidents

### 1. Détection d'Intrusion

#### Signes d'Intrusion
- Tentatives de connexion multiples échouées
- Accès à des ressources non autorisées
- Modifications suspectes de données
- Logs d'erreur inhabituels

#### Actions Correctives
```bash
# Bloquer une IP suspecte
sudo iptables -A INPUT -s IP_SUSPECTE -j DROP

# Révoquer les sessions actives
# (redémarrer l'application ou vider la table sessions)

# Analyser les logs
sudo tail -f /var/log/nginx/access.log | grep IP_SUSPECTE
```

### 2. Compromission de Mot de Passe

#### Actions Immédiates
1. Forcer la déconnexion de l'utilisateur
2. Demander un nouveau mot de passe
3. Analyser les logs d'accès
4. Vérifier les modifications récentes

#### Code de Réponse
```javascript
// Forcer la déconnexion
const forceLogout = async (userId) => {
    // Supprimer toutes les sessions de l'utilisateur
    await executeQuery('DELETE FROM sessions WHERE user_id = ?', [userId]);
    
    // Marquer le compte comme compromis
    await executeQuery('UPDATE utilisateurs SET actif = false WHERE id = ?', [userId]);
};
```

## 📋 Checklist de Sécurité

### Configuration Initiale
- [ ] Mots de passe forts pour la base de données
- [ ] Secret de session unique et long
- [ ] Variables d'environnement sécurisées
- [ ] Certificats SSL en production
- [ ] Configuration CORS restrictive

### Déploiement
- [ ] Base de données avec utilisateur dédié
- [ ] Permissions de fichiers restrictives
- [ ] Logs de sécurité activés
- [ ] Monitoring des accès
- [ ] Sauvegarde sécurisée

### Maintenance
- [ ] Mise à jour régulière des dépendances
- [ ] Audit des logs de sécurité
- [ ] Test des sauvegardes
- [ ] Révision des permissions
- [ ] Formation des utilisateurs

## 🔐 Recommandations Avancées

### 1. Authentification à Deux Facteurs
```javascript
// Implémentation 2FA avec TOTP
const speakeasy = require('speakeasy');

const generateSecret = () => {
    return speakeasy.generateSecret({
        name: 'Planning App',
        issuer: 'Votre Entreprise'
    });
};
```

### 2. Audit Trail
```javascript
// Logging des actions sensibles
const auditLog = async (userId, action, details) => {
    await executeQuery(`
        INSERT INTO audit_log (user_id, action, details, timestamp)
        VALUES (?, ?, ?, NOW())
    `, [userId, action, JSON.stringify(details)]);
};
```

### 3. Chiffrement des Données Sensibles
```javascript
// Chiffrement des données sensibles
const crypto = require('crypto');

const encrypt = (text) => {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};
```

Cette documentation de sécurité couvre les aspects essentiels de la protection de l'application. Il est important de maintenir ces mesures à jour et d'effectuer des audits de sécurité réguliers.
