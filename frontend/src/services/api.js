import axios from 'axios';

/**
 * Configuration de base pour les requêtes API (sessions/cookies)
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Intercepteur réponse: rediriger sur /login si 401
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expirée ou non authentifié
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Service d'authentification (sessions)
 */
export const authService = {
  /** Connexion */
  async login(email, password) {
    return api.post('/auth/login', { email, mot_de_passe: password });
  },

  /** Déconnexion */
  async logout() {
    return api.post('/auth/logout');
  },

  /** Inscription */
  async register(userData) {
    return api.post('/auth/register', userData);
  },

  /** Vérification de session */
  async checkAuth() {
    return api.get('/auth/check');
  },

  /** Changement de mot de passe */
  async changePassword(oldPassword, newPassword) {
    return api.put('/auth/change-password', {
      ancien_mot_de_passe: oldPassword,
      nouveau_mot_de_passe: newPassword,
    });
  },

  /** Profil utilisateur */
  async getProfile() {
    return api.get('/auth/profile');
  },
};

/**
 * Service de gestion du planning (sessions)
 */
export const planningService = {
  /** Événements d'une semaine */
  async getWeekEvents(date) {
    const params = date ? { date } : {};
    return api.get('/planning/week', { params });
  },

  /** Événements d'un jour */
  async getDayEvents(date) {
    return api.get(`/planning/day/${date}`);
  },

  /** Événements d'une période */
  async getEventsByDateRange(startDate, endDate) {
    return api.get('/planning/range', { params: { startDate, endDate } });
  },

  /** Créer un événement */
  async createEvent(eventData) {
    return api.post('/planning', eventData);
  },

  /** Mettre à jour un événement */
  async updateEvent(id, eventData) {
    return api.put(`/planning/${id}`, eventData);
  },

  /** Supprimer un événement */
  async deleteEvent(id) {
    return api.delete(`/planning/${id}`);
  },

  /** Obtenir un événement par ID */
  async getEvent(id) {
    return api.get(`/planning/${id}`);
  },

  /** Rechercher des événements */
  async searchEvents(query) {
    return api.get('/planning/search', { params: { q: query } });
  },

  /** Statistiques planning */
  async getStatistics() {
    return api.get('/planning/statistics');
  },
};

/**
 * Service d'administration (sessions)
 */
export const adminService = {
  users: {
    async getAll(params = {}) {
      return api.get('/admin/users', { params });
    },
    async getById(id) {
      return api.get(`/admin/users/${id}`);
    },
    async create(userData) {
      return api.post('/admin/users', userData);
    },
    async update(id, userData) {
      return api.put(`/admin/users/${id}`, userData);
    },
    async delete(id) {
      return api.delete(`/admin/users/${id}`);
    },
    async search(query) {
      return api.get('/admin/users/search', { params: { q: query } });
    },
  },
  events: {
    async getAll(params = {}) {
      return api.get('/admin/events', { params });
    },
    async delete(id) {
      return api.delete(`/admin/events/${id}`);
    },
    async getUserEvents(userId) {
      return api.get(`/admin/events/user/${userId}`);
    },
  },
  async getGlobalStatistics() {
    return api.get('/admin/statistics');
  },
};

/**
 * Utilitaires pour la gestion des erreurs
 */
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    if (data && data.message) {
      return { status, message: data.message, errors: data.errors };
    }
    return { status, message: `Erreur ${status}: ${error.message}` };
  } else if (error.request) {
    return { status: 0, message: 'Erreur de réseau: Impossible de contacter le serveur' };
  } else {
    return { status: 0, message: error.message || 'Une erreur inconnue est survenue' };
  }
};

export default api;
