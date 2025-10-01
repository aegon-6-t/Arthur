import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { planningService, adminService } from '../services/api';
import { handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek, isSameWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Page du tableau de bord principal
 */
const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [weekEvents, setWeekEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  /**
   * Chargement des données du dashboard
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les événements de la semaine
      const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const eventsResponse = await planningService.getWeekEvents(weekStart);
      setWeekEvents(eventsResponse.data.data.events || []);

      // Charger les statistiques si admin
      if (isAdmin) {
        const statsResponse = await adminService.getGlobalStatistics();
        setStatistics(statsResponse.data.data);
      } else {
        const statsResponse = await planningService.getStatistics();
        setStatistics(statsResponse.data.data);
      }
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(`Erreur lors du chargement: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentWeek, isAdmin]);

  /**
   * Navigation vers la semaine précédente/suivante
   */
  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  /**
   * Obtenir les événements du jour
   */
  const getDayEvents = (date) => {
    return weekEvents.filter(event =>
      format(new Date(event.date_debut), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  /**
   * Rendu des événements d'un jour
   */
  const renderDayEvents = (date) => {
    const dayEvents = getDayEvents(date);

    return (
      <div className="space-y-1">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className="text-xs p-2 bg-primary-50 border-l-4 border-primary-400 rounded text-secondary-700"
          >
            <div className="font-medium truncate">{event.titre}</div>
            <div className="text-secondary-500">
              {format(new Date(event.date_debut), 'HH:mm')} - {format(new Date(event.date_fin), 'HH:mm')}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Rendu du calendrier de la semaine
   */
  const renderWeekCalendar = () => {
    const weekDays = [];
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="btn btn-secondary btn-sm"
          >
            ← Semaine précédente
          </button>
          <h3 className="text-lg font-semibold text-secondary-900">
            Semaine du {format(start, 'dd MMM yyyy', { locale: fr })}
          </h3>
          <button
            onClick={() => navigateWeek(1)}
            className="btn btn-secondary btn-sm"
          >
            Semaine suivante →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-secondary-900 mb-1">
                {format(date, 'EEE', { locale: fr })}
              </div>
              <div className={`text-lg font-bold mb-2 ${
                format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ? 'bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                  : 'text-secondary-700'
              }`}>
                {format(date, 'dd')}
              </div>
              <div className="min-h-[60px]">
                {renderDayEvents(date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Rendu des statistiques
   */
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
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

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="w-8 h-8 text-warning-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-secondary-900">
                {statistics.planifies || 0}
              </div>
              <div className="text-sm text-secondary-600">
                Planifiés
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="w-8 h-8 text-success-600" />
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-secondary-900">
                {statistics.en_cours || 0}
              </div>
              <div className="text-sm text-secondary-600">
                En cours
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">
          Bienvenue, {user.prenom} {user.nom}
        </h1>
        <p className="text-secondary-600">
          Voici votre tableau de bord personnel avec un aperçu de vos événements et statistiques.
        </p>
      </div>

      {/* Statistiques */}
      {renderStatistics()}

      {/* Calendrier de la semaine */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-secondary-900">
            Vue d'ensemble de la semaine
          </h2>
          <button
            onClick={() => window.location.href = '/planning'}
            className="btn btn-primary btn-sm flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Gérer le planning
          </button>
        </div>
        {renderWeekCalendar()}
      </div>
    </div>
  );
};

export default Dashboard;
