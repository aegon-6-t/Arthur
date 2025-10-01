#!/bin/bash

# Script de démarrage pour l'application de gestion de planning
# Ce script démarre tous les services nécessaires

echo "🚀 Démarrage de l'application de gestion de planning..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Vérification des prérequis
print_header "Vérification des prérequis"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

NODE_VERSION=$(node --version)
print_message "Node.js version: $NODE_VERSION"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_message "npm version: $NPM_VERSION"

# Vérifier MariaDB/MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL/MariaDB n'est pas installé ou n'est pas dans le PATH."
    print_warning "Assurez-vous que la base de données est accessible."
fi

# Vérifier le fichier .env
if [ ! -f ".env" ]; then
    print_warning "Fichier .env non trouvé. Copie du fichier d'exemple..."
    if [ -f "config.env.example" ]; then
        cp config.env.example .env
        print_message "Fichier .env créé. Veuillez le configurer avec vos paramètres."
    else
        print_error "Fichier config.env.example non trouvé."
        exit 1
    fi
fi

# Installation des dépendances
print_header "Installation des dépendances"

# Backend
print_message "Installation des dépendances backend..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_message "Dépendances backend installées avec succès."
    else
        print_error "Erreur lors de l'installation des dépendances backend."
        exit 1
    fi
else
    print_message "Dépendances backend déjà installées."
fi

# Frontend
print_message "Installation des dépendances frontend..."
if [ ! -d "client/node_modules" ]; then
    cd client
    npm install
    if [ $? -eq 0 ]; then
        print_message "Dépendances frontend installées avec succès."
    else
        print_error "Erreur lors de l'installation des dépendances frontend."
        exit 1
    fi
    cd ..
else
    print_message "Dépendances frontend déjà installées."
fi

# Vérification de la base de données
print_header "Vérification de la base de données"

# Charger les variables d'environnement
source .env

print_message "Test de connexion à la base de données..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT COUNT(*) as user_count FROM utilisateurs;" 2>/dev/null

if [ $? -eq 0 ]; then
    print_message "Connexion à la base de données réussie."
else
    print_warning "Impossible de se connecter à la base de données."
    print_warning "Veuillez vérifier vos paramètres dans le fichier .env"
    print_warning "Et vous assurer que la base de données est créée avec le script SQL."
fi

# Démarrage des services
print_header "Démarrage des services"

# Fonction pour nettoyer les processus au signal
cleanup() {
    print_message "Arrêt des services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer les signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Démarrer le backend
print_message "Démarrage du serveur backend (port $PORT)..."
npm start &
BACKEND_PID=$!

# Attendre que le backend soit prêt
sleep 3

# Vérifier que le backend est démarré
if curl -s http://localhost:$PORT/api/health > /dev/null; then
    print_message "Backend démarré avec succès sur le port $PORT"
else
    print_warning "Le backend pourrait ne pas être encore prêt."
fi

# Démarrer le frontend
print_message "Démarrage du serveur frontend (port 3001)..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

# Attendre que le frontend soit prêt
sleep 5

print_header "Application démarrée avec succès!"

echo -e "${GREEN}✅ Backend:${NC} http://localhost:$PORT"
echo -e "${GREEN}✅ Frontend:${NC} http://localhost:3001"
echo -e "${GREEN}✅ API Health:${NC} http://localhost:$PORT/api/health"
echo ""
echo -e "${BLUE}Comptes de test:${NC}"
echo -e "  ${YELLOW}Admin:${NC} admin@planning.com / admin123"
echo -e "  ${YELLOW}Utilisateur:${NC} jean.dupont@planning.com / user123"
echo ""
echo -e "${BLUE}Pour arrêter l'application, appuyez sur Ctrl+C${NC}"

# Attendre que les processus se terminent
wait $BACKEND_PID $FRONTEND_PID
