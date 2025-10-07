import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contextes
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

// Composants
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

/**
 * Composant principal de l'application
 * Gère le routage et l'authentification
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-secondary-50">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

/**
 * Composant pour gérer les routes avec protection d'authentification
 */
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Routes protégées */}
      <Route
        path="/*"
        element={
          user ? (
            <ProtectedLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

/**
 * Layout protégé avec navbar pour les utilisateurs connectés
 */
function ProtectedLayout({ children }) {
  return (
    <div className="flex h-screen bg-secondary-50">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default App;
