import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Page de connexion des utilisateurs
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
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
   * Soumission du formulaire de connexion
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation basique côté client
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    }
    if (!formData.mot_de_passe.trim()) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.mot_de_passe);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);

      // Gestion des erreurs spécifiques
      if (apiError.status === 401) {
        setErrors({
          email: 'Email ou mot de passe incorrect',
          mot_de_passe: 'Email ou mot de passe incorrect',
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
            Connexion à l'intranet
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              créer un nouveau compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                autoComplete="current-password"
                required
                className={`form-input ${errors.mot_de_passe ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="Votre mot de passe"
                value={formData.mot_de_passe}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.mot_de_passe && (
                <p className="form-error">{errors.mot_de_passe}</p>
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
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          {/* Informations de connexion par défaut */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Comptes de démonstration
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Admin:</strong> admin@planning.com / admin123</p>
              <p><strong>Utilisateur:</strong> jean.dupont@planning.com / user123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
