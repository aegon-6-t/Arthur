import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  KeyIcon,
  CalendarDaysIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

/**
 * Page du profil utilisateur
 */
const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  /**
   * Chargement du profil utilisateur
   */
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(`Erreur lors du chargement: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Informations du profil */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-secondary-900">
              {profile?.prenom} {profile?.nom}
            </h1>
            <p className="text-secondary-600">{profile?.email}</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
              profile?.role === 'admin'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              Informations personnelles
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-secondary-500">Nom complet</dt>
                <dd className="text-sm text-secondary-900">
                  {profile?.prenom} {profile?.nom}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-secondary-500">Email</dt>
                <dd className="text-sm text-secondary-900">{profile?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-secondary-500">Rôle</dt>
                <dd className="text-sm text-secondary-900 capitalize">
                  {profile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              Informations du compte
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-secondary-500">Date de création</dt>
                <dd className="text-sm text-secondary-900">
                  {profile?.date_creation ? new Date(profile.date_creation).toLocaleDateString('fr-FR') : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-secondary-500">Dernière connexion</dt>
                <dd className="text-sm text-secondary-900">
                  {profile?.derniere_connexion ? new Date(profile.derniere_connexion).toLocaleDateString('fr-FR') : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-secondary-500">Statut</dt>
                <dd className="text-sm text-secondary-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    profile?.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.actif ? 'Actif' : 'Inactif'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Actions du profil */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Actions du compte
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-secondary flex items-center"
          >
            <KeyIcon className="w-5 h-5 mr-2" />
            Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setShowPasswordModal(false);
            toast.success('Mot de passe changé avec succès');
          }}
        />
      )}
    </div>
  );
};

/**
 * Modal pour changer le mot de passe
 */
const PasswordChangeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
    if (!formData.ancien_mot_de_passe) {
      newErrors.ancien_mot_de_passe = 'L\'ancien mot de passe est requis';
    }
    if (!formData.nouveau_mot_de_passe) {
      newErrors.nouveau_mot_de_passe = 'Le nouveau mot de passe est requis';
    } else if (formData.nouveau_mot_de_passe.length < 6) {
      newErrors.nouveau_mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (formData.nouveau_mot_de_passe !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...passwordData } = formData;
      await authService.changePassword(passwordData.ancien_mot_de_passe, passwordData.nouveau_mot_de_passe);
      onSuccess();
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);

      if (apiError.status === 401) {
        setErrors({
          ancien_mot_de_passe: 'Ancien mot de passe incorrect',
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
            Changer le mot de passe
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ancien mot de passe */}
            <div>
              <label className="form-label">Ancien mot de passe *</label>
              <input
                type="password"
                name="ancien_mot_de_passe"
                className={`form-input ${errors.ancien_mot_de_passe ? 'border-danger-300' : ''}`}
                value={formData.ancien_mot_de_passe}
                onChange={handleChange}
                placeholder="Votre mot de passe actuel"
              />
              {errors.ancien_mot_de_passe && <p className="form-error">{errors.ancien_mot_de_passe}</p>}
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="form-label">Nouveau mot de passe *</label>
              <input
                type="password"
                name="nouveau_mot_de_passe"
                className={`form-input ${errors.nouveau_mot_de_passe ? 'border-danger-300' : ''}`}
                value={formData.nouveau_mot_de_passe}
                onChange={handleChange}
                placeholder="Votre nouveau mot de passe"
              />
              {errors.nouveau_mot_de_passe && <p className="form-error">{errors.nouveau_mot_de_passe}</p>}
            </div>

            {/* Confirmation */}
            <div>
              <label className="form-label">Confirmer le mot de passe *</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'border-danger-300' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmer le nouveau mot de passe"
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

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
                {loading ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
