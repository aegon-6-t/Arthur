# Guide d'Installation - Application de Gestion de Planning

## 📋 Prérequis

### Logiciels Requis
- **Node.js** 18.0 ou supérieur
- **MariaDB** 10.3 ou supérieur (ou MySQL 8.0+)
- **Nginx** (optionnel, pour la production)
- **Git** (pour cloner le projet)

### Vérification des Prérequis
```bash
# Vérifier Node.js
node --version

# Vérifier npm
npm --version

# Vérifier MariaDB/MySQL
mysql --version

# Vérifier Git
git --version
```

## 🚀 Installation Étape par Étape

### 1. Cloner le Projet
```bash
git clone <url-du-repository>
cd Arthur
```

### 2. Installation des Dépendances Backend
```bash
# Installer les dépendances Node.js
npm install

# Vérifier l'installation
npm list
```

### 3. Installation des Dépendances Frontend
```bash
# Aller dans le dossier client
cd client

# Installer les dépendances React
npm install

# Retourner au dossier racine
cd ..
```

### 4. Configuration de la Base de Données

#### 4.1 Démarrer MariaDB/MySQL
```bash
# Sur Ubuntu/Debian
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Sur macOS avec Homebrew
brew services start mariadb

# Sur Windows
# Démarrer le service MySQL/MariaDB via les Services
```

#### 4.2 Créer la Base de Données
```bash
# Se connecter à MariaDB/MySQL
mysql -u root -p

# Exécuter le script SQL
source database/planningDB.sql

# Ou directement depuis la ligne de commande
mysql -u root -p < database/planningDB.sql
```

#### 4.3 Vérifier la Création
```sql
-- Se connecter à la base
USE planningDB;

-- Vérifier les tables
SHOW TABLES;

-- Vérifier les utilisateurs par défaut
SELECT * FROM utilisateurs;
```

### 5. Configuration des Variables d'Environnement

#### 5.1 Créer le Fichier .env
```bash
# Copier le fichier d'exemple
cp config.env.example .env
```

#### 5.2 Éditer le Fichier .env
```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mariadb
DB_NAME=planningDB

# Configuration de la session
SESSION_SECRET=votre_secret_session_tres_long_et_securise_changez_moi

# Configuration du serveur
PORT=3000
NODE_ENV=development
```

### 6. Test de la Configuration

#### 6.1 Tester la Connexion à la Base de Données
```bash
# Démarrer le serveur backend
npm start

# Dans un autre terminal, tester l'API
curl http://localhost:3000/api/health
```

#### 6.2 Démarrer le Frontend
```bash
# Dans un nouveau terminal
cd client
npm start
```

### 7. Accès à l'Application

#### 7.1 URLs d'Accès
- **Frontend React**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Base de données**: localhost:3306

#### 7.2 Comptes de Test
- **Administrateur**: 
  - Email: admin@planning.com
  - Mot de passe: admin123
- **Utilisateur**: 
  - Email: jean.dupont@planning.com
  - Mot de passe: user123

## 🐳 Installation avec Docker

### 1. Prérequis Docker
```bash
# Vérifier Docker
docker --version
docker-compose --version
```

### 2. Démarrage avec Docker Compose
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### 3. Accès avec Docker
- **Application**: http://localhost:80
- **Base de données**: localhost:3306

## 🔧 Configuration Avancée

### Configuration Nginx (Production)

#### 1. Installer Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# macOS
brew install nginx
```

#### 2. Configurer Nginx
```bash
# Copier la configuration
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Configuration SSL (Production)

#### 1. Obtenir un Certificat SSL
```bash
# Avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

#### 2. Configurer HTTPS
- Modifier `nginx/nginx.conf` pour activer HTTPS
- Rediriger HTTP vers HTTPS
- Configurer les en-têtes de sécurité

## 🧪 Tests de Validation

### 1. Test de l'API
```bash
# Test de santé
curl http://localhost:3000/api/health

# Test de connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@planning.com","mot_de_passe":"admin123"}'
```

### 2. Test de l'Interface
1. Ouvrir http://localhost:3001
2. Se connecter avec un compte de test
3. Tester les fonctionnalités principales :
   - Navigation entre les pages
   - Création d'un événement
   - Modification d'un événement
   - Gestion des utilisateurs (admin)

### 3. Test de Sécurité
```bash
# Test de rate limiting
for i in {1..10}; do curl http://localhost:3000/api/auth/login; done

# Test de validation
curl -X POST http://localhost:3000/api/planning \
  -H "Content-Type: application/json" \
  -d '{"titre":"","date_debut":"invalid"}'
```

## 🐛 Résolution des Problèmes

### Problème : Erreur de Connexion à la Base de Données
```bash
# Vérifier que MariaDB est démarré
sudo systemctl status mariadb

# Vérifier les paramètres de connexion
mysql -u root -p -h localhost

# Vérifier le fichier .env
cat .env
```

### Problème : Port Déjà Utilisé
```bash
# Trouver le processus utilisant le port
lsof -i :3000
lsof -i :3001

# Tuer le processus
kill -9 <PID>
```

### Problème : Erreur CORS
```bash
# Vérifier la configuration CORS dans server.js
# Vérifier le proxy dans client/package.json
```

### Problème : Erreur de Session
```bash
# Vérifier SESSION_SECRET dans .env
# Nettoyer les cookies du navigateur
# Redémarrer le serveur
```

## 📊 Monitoring et Logs

### 1. Logs de l'Application
```bash
# Logs du backend
tail -f logs/app.log

# Logs avec PM2 (si utilisé)
pm2 logs planning-app
```

### 2. Logs de la Base de Données
```bash
# Logs MariaDB
sudo tail -f /var/log/mysql/error.log
```

### 3. Logs Nginx
```bash
# Logs d'accès
sudo tail -f /var/log/nginx/access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Mise à Jour

### 1. Mise à Jour du Code
```bash
# Récupérer les dernières modifications
git pull origin main

# Mettre à jour les dépendances
npm update
cd client && npm update && cd ..

# Redémarrer l'application
npm restart
```

### 2. Mise à Jour de la Base de Données
```bash
# Sauvegarder la base de données
mysqldump -u root -p planningDB > backup.sql

# Appliquer les migrations (si nécessaire)
mysql -u root -p planningDB < migrations/new_migration.sql
```

## 📞 Support

En cas de problème :
1. Vérifier les logs d'erreur
2. Consulter la documentation
3. Vérifier la configuration
4. Tester avec les comptes par défaut

## ✅ Checklist d'Installation

- [ ] Node.js installé et configuré
- [ ] MariaDB/MySQL installé et démarré
- [ ] Base de données créée avec le script SQL
- [ ] Variables d'environnement configurées
- [ ] Dépendances backend installées
- [ ] Dépendances frontend installées
- [ ] Serveur backend démarré (port 3000)
- [ ] Serveur frontend démarré (port 3001)
- [ ] Connexion à l'application réussie
- [ ] Tests de fonctionnalités effectués
