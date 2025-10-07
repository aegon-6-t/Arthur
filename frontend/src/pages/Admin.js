import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';
import { handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

/**
 * Page d'administration (réservée aux administrateurs)
 */
const Admin = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Redirection si pas admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/dashboard';
    }
  }, [isAdmin]);

  /**
   * Chargement des données d'administration
   */
  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Charger les utilisateurs
      const usersResponse = await adminService.users.getAll();
      setUsers(usersResponse.data || []);

      // Charger les événements
      const eventsResponse = await adminService.events.getAll();
      setEvents(eventsResponse.data || []);

      // Charger les statistiques globales
      const statsResponse = await adminService.getGlobalStatistics();
      setStatistics(statsResponse.data.data);

    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(`Erreur lors du chargement: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  /**
   * Filtrage des utilisateurs par terme de recherche
   */
  const filteredUsers = users.filter(user =>
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Onglets de l'administration
   */
  const tabs = [
    { id: 'users', name: 'Utilisateurs', icon: UsersIcon },
    { id: 'events', name: 'Événements', icon: CalendarDaysIcon },
    { id: 'statistics', name: 'Statistiques', icon: ChartBarIcon },
  ];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            Accès refusé
          </h2>
          <p className="text-secondary-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">
          Administration
        </h1>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-secondary-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Utilisateurs */}
          {activeTab === 'users' && (
            <UsersTab
              users={filteredUsers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUserEdit={(user) => {
                setEditingUser(user);
                setShowUserModal(true);
              }}
              onRefresh={loadAdminData}
              loading={loading}
            />
          )}

          {/* Onglet Événements */}
          {activeTab === 'events' && (
            <EventsTab
              events={events}
              onRefresh={loadAdminData}
              loading={loading}
            />
          )}

          {/* Onglet Statistiques */}
          {activeTab === 'statistics' && (
            <StatisticsTab statistics={statistics} loading={loading} />
          )}
        </div>
      </div>

      {/* Modal d'utilisateur */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSave={() => {
            setShowUserModal(false);
            setEditingUser(null);
            loadAdminData();
          }}
        />
      )}
    </div>
  );
};

/**
 * Onglet de gestion des utilisateurs
 */
const UsersTab = ({ users, searchTerm, onSearchChange, onUserEdit, onRefresh, loading }) => {
  return (
    <div className="space-y-4">
      {/* Barre de recherche et actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Rechercher des utilisateurs..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          onClick={() => onUserEdit(null)}
          className="btn btn-primary flex items-center ml-4"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-secondary-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {user.prenom} {user.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {user.derniere_connexion
                        ? new Date(user.derniere_connexion).toLocaleDateString('fr-FR')
                        : 'Jamais'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onUserEdit(user)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * Onglet de gestion des événements
 */
const EventsTab = ({ events, onRefresh, loading }) => {
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await adminService.events.delete(eventId);
        toast.success('Événement supprimé avec succès');
        onRefresh();
      } catch (error) {
        const apiError = handleApiError(error);
        toast.error(`Erreur lors de la suppression: ${apiError.message}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-secondary-900">
          Gestion des événements
        </h3>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Créateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-secondary-500">
                    Aucun événement trouvé
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {event.titre}
                      </div>
                      {event.description && (
                        <div className="text-sm text-secondary-500 truncate max-w-xs">
                          {event.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        {event.createur}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {event.email_createur}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        {new Date(event.date_debut).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {new Date(event.date_debut).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        event.statut === 'planifie' ? 'bg-blue-100 text-blue-800' :
                        event.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                        event.statut === 'termine' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-danger-600 hover:text-danger-900"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * Onglet des statistiques
 */
const StatisticsTab = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center text-secondary-500">
        Aucune statistique disponible
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-secondary-900">
        Statistiques globales
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-secondary-900">
                {statistics.total_utilisateurs || 0}
              </div>
              <div className="text-sm text-secondary-600">
                Utilisateurs total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-secondary-900">
                {statistics.total_evenements || 0}
              </div>
              <div className="text-sm text-secondary-600">
                Événements total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-secondary-900">
                {statistics.evenements_aujourdhui || 0}
              </div>
              <div className="text-sm text-secondary-600">
                Événements aujourd'hui
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-secondary-900">
                {statistics.evenements_semaine || 0}
              </div>
              <div className="text-sm text-secondary-600">
                Événements cette semaine
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques supplémentaires si disponibles */}
      {statistics.evenements_par_type && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="text-md font-medium text-secondary-900 mb-4">
            Répartition par type d'événement
          </h4>
          <div className="space-y-2">
            {Object.entries(statistics.evenements_par_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 capitalize">
                  {type === 'autre' ? 'Autre' :
                   type === 'reunion' ? 'Réunion' :
                   type === 'formation' ? 'Formation' :
                   type === 'maintenance' ? 'Maintenance' : type}
                </span>
                <div className="flex items-center">
                  <div className="w-32 bg-secondary-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${(count / statistics.total_evenements) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Modal pour créer/éditer un utilisateur
 */
const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'user',
    actif: true,
    mot_de_passe: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!user;

  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        role: user.role || 'user',
        actif: user.actif !== false,
        mot_de_passe: '', // Ne pas pré-remplir le mot de passe en édition
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        role: 'user',
        actif: true,
        mot_de_passe: '',
      });
    }
  }, [user, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!isEditing && !formData.mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    } else if (!isEditing && formData.mot_de_passe.length < 6) {
      newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const submitData = { ...formData };
      if (isEditing && !submitData.mot_de_passe) {
        delete submitData.mot_de_passe; // Ne pas envoyer le mot de passe vide en édition
      }

      if (isEditing) {
        await adminService.users.update(user.id, submitData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await adminService.users.create(submitData);
        toast.success('Utilisateur créé avec succès');
      }
      onSave();
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);

      if (apiError.status === 409) {
        setErrors({
          email: 'Un utilisateur avec cet email existe déjà',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            {isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom */}
            <div>
              <label className="form-label">Nom *</label>
              <input
                type="text"
                name="nom"
                className={`form-input ${errors.nom ? 'border-danger-300' : ''}`}
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom de famille"
              />
              {errors.nom && <p className="form-error">{errors.nom}</p>}
            </div>

            {/* Prénom */}
            <div>
              <label className="form-label">Prénom *</label>
              <input
                type="text"
                name="prenom"
                className={`form-input ${errors.prenom ? 'border-danger-300' : ''}`}
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Prénom"
              />
              {errors.prenom && <p className="form-error">{errors.prenom}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'border-danger-300' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="adresse@email.com"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Rôle */}
            <div>
              <label className="form-label">Rôle</label>
              <select
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            {/* Actif */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="actif"
                id="actif"
                className="form-input"
                checked={formData.actif}
                onChange={handleChange}
              />
              <label htmlFor="actif" className="ml-2 text-sm text-secondary-700">
                Compte actif
              </label>
            </div>

            {/* Mot de passe (création seulement) */}
            {!isEditing && (
              <div>
                <label className="form-label">Mot de passe *</label>
                <input
                  type="password"
                  name="mot_de_passe"
                  className={`form-input ${errors.mot_de_passe ? 'border-danger-300' : ''}`}
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  placeholder="Mot de passe temporaire"
                />
                {errors.mot_de_passe && <p className="form-error">{errors.mot_de_passe}</p>}
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
