# Application de Gestion de Planning

## 📋 Description

Application web intranet de gestion de planning développée avec Node.js, React et MariaDB. Cette application permet la gestion sécurisée des événements de planning avec authentification, rôles utilisateurs et interface d'administration.

## 🏗️ Architecture

### Stack Technologique
- **Backend**: Node.js + Express.js
- **Frontend**: React.js + Material-UI
- **Base de données**: MariaDB/MySQL
- **Serveur web**: Nginx (reverse proxy)
- **Sécurité**: bcrypt, sessions, validation, requêtes préparées

### Architecture MVC
```
├── models/          # Modèles de données (User, Planning)
├── controllers/     # Contrôleurs (auth, planning, admin)
├── routes/          # Routes API
├── middleware/      # Middlewares (auth, validation)
├── config/          # Configuration (base de données)
└── client/          # Application React frontend
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- MariaDB/MySQL 10.3+
- Nginx (optionnel)

### Installation Manuelle

1. **Cloner le projet**
```bash
git clone <repository-url>
cd Arthur
```

2. **Installer les dépendances backend**
```bash
npm install
```

3. **Installer les dépendances frontend**
```bash
cd client
npm install
cd ..
```

4. **Configurer la base de données**
```bash
# Créer la base de données
mysql -u root -p < database/planningDB.sql
```

5. **Configurer les variables d'environnement**
```bash
cp config.env.example .env
# Éditer le fichier .env avec vos paramètres
```

6. **Démarrer l'application**
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd client
npm start
```

### Installation avec Docker

1. **Démarrer tous les services**
```bash
docker-compose up -d
```

2. **Accéder à l'application**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Base de données: localhost:3306

## 🔐 Sécurité Implémentée

### Authentification
- **Hachage des mots de passe**: bcrypt avec salt rounds
- **Sessions sécurisées**: cookies HttpOnly, Secure en production
- **Limitation des tentatives**: rate limiting sur les connexions

### Validation et Protection
- **Validation des entrées**: express-validator
- **Protection XSS**: échappement des données, Content Security Policy
- **Requêtes préparées**: protection contre les injections SQL
- **CORS configuré**: restriction des origines autorisées

### Middleware de Sécurité
- **Helmet**: en-têtes de sécurité HTTP
- **Rate limiting**: limitation du nombre de requêtes
- **Validation des rôles**: contrôle d'accès basé sur les rôles

## 📊 Fonctionnalités

### Authentification
- ✅ Connexion sécurisée
- ✅ Gestion des sessions
- ✅ Changement de mot de passe
- ✅ Déconnexion

### Gestion du Planning
- ✅ Consultation par semaine/jour
- ✅ Création d'événements
- ✅ Modification d'événements
- ✅ Suppression d'événements
- ✅ Recherche et filtrage
- ✅ Détection de conflits d'horaires

### Administration
- ✅ Gestion des utilisateurs
- ✅ Attribution des rôles (admin/user)
- ✅ Statistiques globales
- ✅ Gestion des événements

## 🗄️ Base de Données

### Tables Principales

#### `utilisateurs`
- `id`: Identifiant unique
- `nom`, `prenom`: Nom et prénom
- `email`: Adresse email (unique)
- `mot_de_passe`: Mot de passe haché
- `role`: Rôle (admin/user)
- `actif`: Statut actif/inactif
- `date_creation`: Date de création
- `derniere_connexion`: Dernière connexion

#### `planning`
- `id`: Identifiant unique
- `titre`: Titre de l'événement
- `description`: Description détaillée
- `date_debut`, `date_fin`: Dates de début et fin
- `type_evenement`: Type (réunion, formation, maintenance, autre)
- `statut`: Statut (planifié, en cours, terminé, annulé)
- `utilisateur_id`: Créateur de l'événement
- `salle`: Lieu de l'événement
- `participants`: Liste des participants

### Comptes par Défaut
- **Admin**: admin@planning.com / admin123
- **Utilisateur**: jean.dupont@planning.com / user123

## 🔧 Configuration

### Variables d'Environnement
```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=planningDB

# Session
SESSION_SECRET=votre_secret_session_tres_long_et_securise

# Serveur
PORT=3000
NODE_ENV=development
```

### Configuration Nginx
Le fichier `nginx/nginx.conf` configure Nginx comme reverse proxy avec :
- Limitation du taux de requêtes
- Compression gzip
- En-têtes de sécurité
- Cache des fichiers statiques

## 📱 Interface Utilisateur

### Pages Principales
1. **Page de connexion**: Authentification sécurisée
2. **Tableau de bord**: Vue d'ensemble et statistiques
3. **Planning**: Consultation et gestion des événements
4. **Administration**: Gestion des utilisateurs (admin uniquement)

### Design
- Interface responsive avec Material-UI
- Thème cohérent et professionnel
- Navigation intuitive
- Feedback utilisateur (messages d'erreur/succès)

## 🧪 Tests et Validation

### Tests de Sécurité
- ✅ Validation des entrées utilisateur
- ✅ Protection contre les injections SQL
- ✅ Gestion sécurisée des sessions
- ✅ Contrôle d'accès basé sur les rôles

### Tests Fonctionnels
- ✅ Authentification et autorisation
- ✅ CRUD des événements
- ✅ Gestion des utilisateurs
- ✅ Interface responsive

## 📈 Performance

### Optimisations
- **Base de données**: Index sur les colonnes fréquemment utilisées
- **Frontend**: Lazy loading, compression gzip
- **Backend**: Pool de connexions, requêtes préparées
- **Cache**: Cache des fichiers statiques avec Nginx

## 🚀 Déploiement

### Production
1. **Build de l'application**
```bash
cd client
npm run build
```

2. **Configuration Nginx**
- Copier `nginx/nginx.conf` vers `/etc/nginx/nginx.conf`
- Redémarrer Nginx

3. **Variables d'environnement**
- Configurer `NODE_ENV=production`
- Utiliser HTTPS en production

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 API Documentation

### Endpoints Principaux

#### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/check` - Vérification de session
- `POST /api/auth/register` - Inscription

#### Planning
- `GET /api/planning/week` - Événements de la semaine
- `GET /api/planning/day/:date` - Événements du jour
- `POST /api/planning` - Créer un événement
- `PUT /api/planning/:id` - Modifier un événement
- `DELETE /api/planning/:id` - Supprimer un événement

#### Administration
- `GET /api/admin/users` - Liste des utilisateurs
- `POST /api/admin/users` - Créer un utilisateur
- `PUT /api/admin/users/:id` - Modifier un utilisateur
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de connexion à la base de données**
   - Vérifier les paramètres de connexion dans `.env`
   - S'assurer que MariaDB est démarré

2. **Erreur CORS**
   - Vérifier la configuration CORS dans `server.js`
   - S'assurer que le proxy est configuré dans `client/package.json`

3. **Erreur de session**
   - Vérifier `SESSION_SECRET` dans `.env`
   - Nettoyer les cookies du navigateur

## 📄 Licence

Ce projet est développé dans le cadre d'un projet éducatif.

## 👥 Auteur

Développé avec l'assistance d'IA pour l'apprentissage et la démonstration des bonnes pratiques de développement web sécurisé.
