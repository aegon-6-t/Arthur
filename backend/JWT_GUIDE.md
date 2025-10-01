# Guide d'utilisation de JWT dans l'application de gestion de planning

## 🔐 Authentification JWT

Cette application utilise maintenant **JWT (JSON Web Tokens)** pour l'authentification au lieu des sessions traditionnelles.

## 🚀 Démarrage avec JWT

### 1. Démarrer le serveur JWT

```bash
# Démarrer le serveur avec JWT
node serverJWT.js
```

### 2. Tester l'authentification JWT

```bash
# Tester les fonctionnalités JWT
node test-jwt.js
```

## 📋 Endpoints disponibles

### Authentification

- **POST** `/api/auth/login` - Connexion (retourne un token JWT)
- **POST** `/api/auth/logout` - Déconnexion (optionnel avec JWT)
- **POST** `/api/auth/register` - Inscription d'un nouvel utilisateur
- **GET** `/api/auth/verify` - Vérification du token JWT
- **POST** `/api/auth/refresh` - Rafraîchissement du token
- **PUT** `/api/auth/change-password` - Changement de mot de passe
- **GET** `/api/auth/profile` - Récupération du profil utilisateur

### Planning (protégé par JWT)

- **GET** `/api/planning` - Consultation du planning
- **POST** `/api/planning` - Création d'un événement
- **PUT** `/api/planning/:id` - Modification d'un événement
- **DELETE** `/api/planning/:id` - Suppression d'un événement

### Administration (protégé par JWT + Admin)

- **GET** `/api/admin/users` - Liste des utilisateurs
- **POST** `/api/admin/users` - Création d'un utilisateur
- **PUT** `/api/admin/users/:id` - Modification d'un utilisateur
- **DELETE** `/api/admin/users/:id` - Suppression d'un utilisateur

## 🔑 Utilisation des tokens JWT

### 1. Connexion et récupération du token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@planning.com",
    "mot_de_passe": "Admin123!"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "nom": "Admin",
    "prenom": "Système",
    "email": "admin@planning.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 2. Utilisation du token pour les requêtes protégées

```bash
curl -X GET http://localhost:3000/api/planning \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Vérification du token

```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Rafraîchissement du token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🛡️ Sécurité JWT

### Configuration

- **Secret JWT** : Défini dans `JWT_SECRET` (environnement)
- **Durée de vie** : 24 heures par défaut
- **Algorithme** : HS256
- **Émetteur** : planning-app
- **Audience** : planning-users

### Bonnes pratiques

1. **Stockage sécurisé** : Stockez le token dans le localStorage ou sessionStorage
2. **Transmission HTTPS** : Utilisez HTTPS en production
3. **Rotation des secrets** : Changez le secret JWT régulièrement
4. **Expiration courte** : Utilisez des tokens à courte durée de vie
5. **Rafraîchissement** : Implémentez un système de rafraîchissement automatique

## 🔧 Configuration

### Variables d'environnement

```env
# Secret JWT (changez en production)
JWT_SECRET=votre_secret_jwt_tres_long_et_securise

# Durée de vie du token (optionnel)
JWT_EXPIRES_IN=24h

# Port du serveur
PORT=3000

# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=planningDB
```

### Personnalisation

Vous pouvez modifier la configuration JWT dans `config/jwt.js` :

```javascript
const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'votre_secret',
    expiresIn: '24h',
    issuer: 'planning-app',
    audience: 'planning-users',
    algorithm: 'HS256'
};
```

## 🧪 Tests

### Test automatique

```bash
# Lancer tous les tests JWT
node test-jwt.js
```

### Test manuel

1. **Connexion** : Testez la connexion avec un utilisateur existant
2. **Token** : Vérifiez que le token est retourné
3. **Accès protégé** : Testez l'accès aux routes protégées
4. **Expiration** : Testez l'expiration du token
5. **Rafraîchissement** : Testez le rafraîchissement du token

## 🚨 Dépannage

### Erreurs courantes

1. **"Token d'authentification requis"**
   - Vérifiez que l'en-tête `Authorization` est présent
   - Format : `Bearer <token>`

2. **"Token invalide"**
   - Vérifiez que le token est correct
   - Vérifiez que le secret JWT est le même

3. **"Token expiré"**
   - Le token a expiré, utilisez `/auth/refresh`
   - Ou reconnectez-vous

4. **"Permissions d'administrateur requises"**
   - L'utilisateur n'a pas le rôle admin
   - Vérifiez le rôle dans la base de données

### Logs de débogage

Activez les logs détaillés :

```bash
DEBUG=jwt:* node serverJWT.js
```

## 📚 Ressources

- [Documentation JWT](https://jwt.io/)
- [Express JWT](https://github.com/auth0/express-jwt)
- [Sécurité JWT](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## 🔄 Migration depuis les sessions

Si vous migrez depuis l'ancien système de sessions :

1. **Sauvegardez** vos données utilisateurs
2. **Testez** la connexion avec JWT
3. **Mettez à jour** le frontend pour utiliser les tokens
4. **Supprimez** l'ancien serveur avec sessions

## 🎯 Avantages de JWT

- **Stateless** : Pas de stockage côté serveur
- **Scalable** : Facile à distribuer
- **Sécurisé** : Signature cryptographique
- **Standard** : Format standardisé
- **Flexible** : Contient des métadonnées
