import React from 'react';

/**
 * Composant LoadingSpinner pour afficher un indicateur de chargement
 * @param {string} size - Taille du spinner (sm, md, lg)
 * @param {string} color - Couleur du spinner (primary, secondary, white)
 * @param {string} className - Classes CSS supplémentaires
 */
const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-secondary-600',
    white: 'border-white',
    success: 'border-success-600',
    warning: 'border-warning-600',
    danger: 'border-danger-600',
  };

  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Chargement..."
      >
        <span className="sr-only">Chargement...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
