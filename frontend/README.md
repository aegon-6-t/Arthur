# Frontend React - Intranet OSEF

Application frontend React.js avec Tailwind CSS pour la gestion de planning d'entreprise répondant aux exigences du TP BTS SIO.

## Fonctionnalités

### 🔐 Authentification
- Connexion/déconnexion sécurisée avec JWT
- Inscription de nouveaux utilisateurs
- Gestion des profils utilisateurs
- Changer de mot de passe

### 📅 Gestion du Planning
- Vue calendrier hebdomadaire
- Vue liste des événements
- Création/modification/suppression d'événements
- Gestion des conflits d'horaires
- Recherche d'événements
- Filtres par date et statut

### 👥 Administration (Administrateurs uniquement)
- Gestion des utilisateurs (CRUD)
- Vue d'ensemble des statistiques
- Gestion globale des événements
- Recherche et filtrage

### 🎨 Interface Utilisateur
- Design moderne avec Tailwind CSS
- Interface responsive (mobile, tablette, desktop)
- Animations fluides
- Notifications toast
- Navigation intuitive

## Technologies Utilisées

- **React 18** - Bibliothèque JavaScript pour l'interface utilisateur
- **React Router** - Gestion du routage
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP pour les appels API
- **React Hook Form** - Gestion des formulaires
- **Date-fns** - Manipulation des dates
- **React Hot Toast** - Notifications
- **Heroicons** - Icônes SVG

## Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Backend API fonctionnel sur le port 3000

## Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer l'environnement**
   ```bash
   # Créer un fichier .env si nécessaire
   REACT_APP_API_URL=http://localhost:3000/api
   ```

3. **Démarrer l'application en mode développement**
   ```bash
   npm start
   ```

4. **Accéder à l'application**
   Ouvrir [http://localhost:3001](http://localhost:3001)

## Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Navbar.js       # Navigation principale
│   └── LoadingSpinner.js
├── contexts/           # Contextes React
│   └── AuthContext.js  # Gestion de l'authentification
├── pages/              # Pages principales
│   ├── Login.js        # Page de connexion
│   ├── Register.js     # Page d'inscription
│   ├── Dashboard.js    # Tableau de bord
│   ├── Planning.js     # Gestion du planning
│   ├── Profile.js      # Profil utilisateur
│   └── Admin.js        # Administration
├── services/           # Services API
│   └── api.js          # Configuration Axios et appels API
├── hooks/              # Hooks personnalisés (si nécessaire)
├── utils/              # Utilitaires
└── index.js            # Point d'entrée
```

## Comptes de Test

### Administrateur
- **Email:** admin@planning.com
- **Mot de passe:** admin123

### Utilisateur
- **Email:** jean.dupont@planning.com
- **Mot de passe:** user123

## Fonctionnalités par Rôle

### Utilisateur Standard
- ✅ Consulter son planning personnel
- ✅ Créer/modifier/supprimer ses événements
- ✅ Consulter son profil
- ✅ Changer son mot de passe
- ❌ Accès à l'administration

### Administrateur
- ✅ Toutes les fonctionnalités utilisateur
- ✅ Gestion des utilisateurs (création, modification, suppression)
- ✅ Vue d'ensemble de tous les événements
- ✅ Accès aux statistiques globales
- ✅ Suppression d'événements de n'importe quel utilisateur

## Sécurité

- **Authentification JWT** avec expiration automatique
- **Protection CSRF** via tokens
- **Validation des entrées** côté client et serveur
- **Sécurisation des mots de passe** avec bcrypt
- **Rate limiting** pour les tentatives de connexion
- **Sécurisation des en-têtes HTTP** avec Helmet

## API Endpoints Utilisés

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/verify` - Vérification du token
- `PUT /api/auth/change-password` - Changement de mot de passe

### Planning
- `GET /api/planning/week` - Événements de la semaine
- `GET /api/planning/day/:date` - Événements du jour
- `POST /api/planning` - Créer un événement
- `PUT /api/planning/:id` - Modifier un événement
- `DELETE /api/planning/:id` - Supprimer un événement

### Administration
- `GET /api/admin/users` - Liste des utilisateurs
- `POST /api/admin/users` - Créer un utilisateur
- `PUT /api/admin/users/:id` - Modifier un utilisateur
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur
- `GET /api/admin/statistics` - Statistiques globales

## Développement

### Scripts Disponibles

- `npm start` - Démarrer en mode développement
- `npm run build` - Construire pour la production
- `npm test` - Lancer les tests
- `npm run eject` - Éjecter de Create React App

### Conventions de Code

- **Composants** : PascalCase pour les noms de fichiers et composants
- **Variables** : camelCase
- **Constantes** : UPPER_CASE avec underscores
- **Fichiers** : kebab-case pour les noms de fichiers
- **Imports** : Triés par type (externes, internes, styles)

## Déploiement

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Configuration serveur**
   - Servir le dossier `build/`
   - Configurer les redirections pour SPA
   - Variables d'environnement de production

## Support

Pour toute question ou problème, veuillez consulter la documentation du backend ou contacter l'équipe de développement.

---

*Application développée dans le cadre du TP BTS SIO - Mise en place d'un LABO d'entreprise complet*
