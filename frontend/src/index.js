import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Point d'entrée principal de l'application React
 * Démarre l'application dans le DOM
 */

// Création de la racine React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendu de l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
