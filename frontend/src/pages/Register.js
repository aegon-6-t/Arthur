import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Page d'inscription de nouveaux utilisateurs
 */
const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Gestion des changements dans le formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Validation du formulaire côté client
   */
  const validateForm = () => {
    const newErrors = {};

    // Validation des champs requis
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
    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    } else if (formData.mot_de_passe.length < 6) {
      newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.mot_de_passe !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return newErrors;
  };

  /**
   * Soumission du formulaire d'inscription
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      toast.success('Inscription réussie ! Bienvenue sur l\'intranet OSEF.');
      navigate('/dashboard');
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);

      // Gestion des erreurs spécifiques
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
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
            <span className="text-2xl font-bold text-primary-600">OSEF</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Ou{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              se connecter à un compte existant
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Champ nom */}
            <div>
              <label htmlFor="nom" className="form-label">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                autoComplete="family-name"
                required
                className={`form-input ${errors.nom ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="Votre nom"
                value={formData.nom}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.nom && (
                <p className="form-error">{errors.nom}</p>
              )}
            </div>

            {/* Champ prénom */}
            <div>
              <label htmlFor="prenom" className="form-label">
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                autoComplete="given-name"
                required
                className={`form-input ${errors.prenom ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="Votre prénom"
                value={formData.prenom}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.prenom && (
                <p className="form-error">{errors.prenom}</p>
              )}
            </div>

            {/* Champ email */}
            <div>
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`form-input ${errors.email ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="votre.email@osef.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            {/* Champ mot de passe */}
            <div>
              <label htmlFor="mot_de_passe" className="form-label">
                Mot de passe
              </label>
              <input
                id="mot_de_passe"
                name="mot_de_passe"
                type="password"
                autoComplete="new-password"
                required
                className={`form-input ${errors.mot_de_passe ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="Votre mot de passe (min. 6 caractères)"
                value={formData.mot_de_passe}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.mot_de_passe && (
                <p className="form-error">{errors.mot_de_passe}</p>
              )}
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`form-input ${errors.confirmPassword ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="Confirmer votre mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="mr-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </span>
                  Création en cours...
                </>
              ) : (
                'Créer le compte'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
