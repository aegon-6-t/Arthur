# Captures d'Écran - Application de Gestion de Planning

## 📸 Pages Principales

### 1. Page de Connexion
**URL**: http://localhost:3001/login

**Description**: Interface de connexion sécurisée avec validation des champs et protection contre les attaques par force brute.

**Fonctionnalités visibles**:
- Champ email avec validation
- Champ mot de passe avec bouton de visibilité
- Bouton de connexion avec état de chargement
- Messages d'erreur en cas d'échec
- Informations des comptes de test
- Design responsive avec Material-UI

**Sécurité implémentée**:
- Rate limiting (5 tentatives max par 15 minutes)
- Validation des entrées côté client et serveur
- Protection XSS avec échappement des données
- Cookies de session sécurisés

### 2. Tableau de Bord
**URL**: http://localhost:3001/dashboard

**Description**: Vue d'ensemble avec statistiques et événements récents.

**Fonctionnalités visibles**:
- Statistiques en temps réel (événements total, planifiés, en cours, réunions)
- Liste des événements de la semaine
- Actions rapides (nouvel événement, voir planning, administration)
- Informations du profil utilisateur
- Navigation intuitive

**Données affichées**:
- Nombre total d'événements
- Événements planifiés, en cours, terminés
- Événements par type (réunions, formations, maintenance)
- Derniers événements avec détails (titre, date, salle, créateur)

### 3. Page Planning
**URL**: http://localhost:3001/planning

**Description**: Interface complète de gestion des événements avec consultation par semaine/jour.

**Fonctionnalités visibles**:
- Sélecteur de date avec calendrier
- Vue par jour ou par semaine
- Barre de recherche et filtres par type
- Liste des événements avec détails complets
- Boutons d'édition et suppression (selon les permissions)
- Bouton flottant pour ajouter un événement

**Gestion des événements**:
- Création d'événements avec formulaire complet
- Modification d'événements existants
- Suppression avec confirmation
- Détection de conflits d'horaires
- Validation des dates et heures

### 4. Page Administration
**URL**: http://localhost:3001/admin

**Description**: Interface d'administration réservée aux administrateurs.

**Fonctionnalités visibles**:
- Statistiques globales (utilisateurs, événements)
- Onglets pour utilisateurs et événements
- Tableau des utilisateurs avec actions
- Tableau des événements avec gestion
- Formulaire de création/modification d'utilisateurs
- Recherche et filtrage

**Gestion des utilisateurs**:
- Liste complète des utilisateurs
- Création de nouveaux utilisateurs
- Modification des profils et rôles
- Activation/désactivation des comptes
- Suppression d'utilisateurs (avec protection)

## 🔒 Démonstrations de Sécurité

### 1. Authentification Sécurisée
**Test**: Tentative de connexion avec des identifiants incorrects

**Résultat attendu**:
- Message d'erreur générique (ne révèle pas si l'email existe)
- Compteur de tentatives limité
- Blocage temporaire après 5 échecs

### 2. Protection XSS
**Test**: Tentative d'injection de script dans un champ de texte

**Résultat attendu**:
- Script échappé et rendu inoffensif
- Affichage sécurisé du contenu
- Pas d'exécution de code malveillant

### 3. Contrôle d'Accès
**Test**: Tentative d'accès à l'administration avec un compte utilisateur

**Résultat attendu**:
- Redirection vers le tableau de bord
- Message d'erreur de permissions
- Interface d'administration non accessible

### 4. Validation des Données
**Test**: Soumission de formulaire avec données invalides

**Résultat attendu**:
- Messages d'erreur spécifiques
- Validation côté client et serveur
- Prévention de l'envoi de données malformées

## 📱 Interface Responsive

### Desktop (1920x1080)
- Navigation horizontale complète
- Statistiques en grille 4 colonnes
- Tableaux avec toutes les colonnes visibles
- Boutons d'action dans les listes

### Tablet (768x1024)
- Navigation adaptée avec menu hamburger
- Statistiques en grille 2 colonnes
- Tableaux avec colonnes essentielles
- Boutons d'action regroupés

### Mobile (375x667)
- Navigation mobile optimisée
- Statistiques en colonne unique
- Listes simplifiées avec détails en accordéon
- Boutons d'action en bas de page

## 🎨 Design et UX

### Thème Material-UI
- Couleurs cohérentes (bleu primaire, rouge secondaire)
- Typographie claire et lisible
- Espacement harmonieux
- Ombres et élévations subtiles

### Feedback Utilisateur
- Messages de succès/erreur avec Alert
- États de chargement avec spinners
- Confirmations pour les actions destructives
- Tooltips pour les actions complexes

### Accessibilité
- Contraste de couleurs respecté
- Navigation au clavier
- Labels appropriés pour les champs
- Messages d'erreur descriptifs

## 🔧 Fonctionnalités Techniques

### Gestion des Sessions
- Connexion persistante
- Déconnexion automatique après inactivité
- Gestion des cookies sécurisés
- Protection contre les attaques de session

### Gestion des Erreurs
- Messages d'erreur utilisateur-friendly
- Logs détaillés côté serveur
- Gestion des erreurs réseau
- Fallbacks pour les données manquantes

### Performance
- Chargement paresseux des composants
- Optimisation des requêtes de base de données
- Cache des données statiques
- Compression des assets

## 📊 Données de Démonstration

### Utilisateurs de Test
1. **Admin Système** (admin@planning.com)
   - Rôle: Administrateur
   - Accès complet à toutes les fonctionnalités
   - Peut gérer les utilisateurs et événements

2. **Jean Dupont** (jean.dupont@planning.com)
   - Rôle: Utilisateur
   - Accès au planning et à ses événements
   - Peut créer/modifier ses propres événements

3. **Marie Martin** (marie.martin@planning.com)
   - Rôle: Utilisateur
   - Compte actif avec événements récents

4. **Pierre Bernard** (pierre.bernard@planning.com)
   - Rôle: Utilisateur
   - Spécialisé dans les maintenances

5. **Sophie Durand** (sophie.durand@planning.com)
   - Rôle: Utilisateur
   - Compte désactivé (pour test)

### Événements de Démonstration
- **Réunions**: Équipe développement, Planning Q1, Client Alpha
- **Formations**: React.js, Sécurité informatique, Node.js, Docker
- **Maintenances**: Serveur principal, Base de données
- **Autres**: Présentations, événements divers

## 🧪 Tests de Validation

### Tests Fonctionnels
1. **Connexion/Déconnexion**
   - Connexion avec identifiants corrects
   - Déconnexion et redirection
   - Persistance de session

2. **Gestion des Événements**
   - Création d'un nouvel événement
   - Modification d'un événement existant
   - Suppression avec confirmation
   - Recherche et filtrage

3. **Administration**
   - Création d'un nouvel utilisateur
   - Modification des rôles
   - Gestion des événements globaux

### Tests de Sécurité
1. **Injection SQL**
   - Tentative d'injection dans les champs de recherche
   - Vérification de la protection par requêtes préparées

2. **XSS**
   - Injection de scripts dans les champs de texte
   - Vérification de l'échappement des données

3. **Contrôle d'Accès**
   - Tentative d'accès non autorisé
   - Vérification des permissions par rôle

## 📋 Checklist de Validation

### Interface Utilisateur
- [ ] Page de connexion fonctionnelle
- [ ] Navigation entre les pages
- [ ] Affichage des statistiques
- [ ] Gestion des événements
- [ ] Interface d'administration
- [ ] Design responsive
- [ ] Messages d'erreur/succès

### Sécurité
- [ ] Authentification sécurisée
- [ ] Protection XSS
- [ ] Requêtes préparées
- [ ] Contrôle d'accès
- [ ] Rate limiting
- [ ] Validation des données
- [ ] Gestion des sessions

### Fonctionnalités
- [ ] CRUD des événements
- [ ] Gestion des utilisateurs
- [ ] Recherche et filtrage
- [ ] Statistiques en temps réel
- [ ] Détection de conflits
- [ ] Export de données

Cette documentation des captures d'écran fournit une vue complète de l'application et de ses fonctionnalités de sécurité.
