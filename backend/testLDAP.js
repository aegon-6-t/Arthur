require('dotenv').config();
const ActiveDirectory = require('activedirectory2');

const config = {
  url: process.env.AD_URL,
  baseDN: process.env.AD_BASE_DN,
  username: process.env.AD_USERNAME, // admin@osef.local
  password: process.env.AD_PASSWORD  // Mot de passe admin
};

const ad = new ActiveDirectory(config);

// Test de connexion pour ton utilisateur AD
ad.authenticate('zeub@osef.local', 'TJn97g4Hf4Eig5', (err, auth) => {
  if (err) console.error('Erreur AD (utilisateur):', err);
  else console.log('Auth utilisateur OK ?', auth);
});
