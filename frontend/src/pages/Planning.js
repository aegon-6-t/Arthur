import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { planningService } from '../services/api';
import { handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Page de gestion du planning
 */
const Planning = () => {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  /**
   * Chargement des événements de la semaine
   */
  const loadWeekEvents = async () => {
    try {
      setLoading(true);
      const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const response = await planningService.getWeekEvents(weekStart);
      setEvents(response.data.data.events || []);
      setFilteredEvents(response.data.data.events || []);
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(`Erreur lors du chargement: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeekEvents();
  }, [currentWeek]);

  /**
   * Filtrage des événements par terme de recherche
   */
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = events.filter(event =>
        event.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchTerm, events]);

  /**
   * Navigation vers la semaine précédente/suivante
   */
  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  /**
   * Rendu du calendrier hebdomadaire
   */
  const renderWeekCalendar = () => {
    const weekDays = [];
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      const dayEvents = filteredEvents.filter(event =>
        isSameDay(new Date(event.date_debut), date)
      );

      weekDays.push(
        <div key={i} className="bg-white rounded-lg border p-4">
          <div className="text-center mb-3">
            <div className="text-sm font-medium text-secondary-600">
              {format(date, 'EEE', { locale: fr })}
            </div>
            <div className={`text-xl font-bold ${
              isSameDay(date, new Date()) ? 'bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-secondary-900'
            }`}>
              {format(date, 'dd')}
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-primary-50 border-l-4 border-primary-400 rounded cursor-pointer hover:bg-primary-100 transition-colors"
                onClick={() => setEditingEvent(event)}
              >
                <div className="font-medium text-sm text-secondary-900 truncate">
                  {event.titre}
                </div>
                <div className="text-xs text-secondary-600 mt-1">
                  {format(new Date(event.date_debut), 'HH:mm')} - {format(new Date(event.date_fin), 'HH:mm')}
                </div>
                {event.salle && (
                  <div className="text-xs text-secondary-500 flex items-center mt-1">
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {event.salle}
                  </div>
                )}
              </div>
            ))}

            {dayEvents.length === 0 && (
              <div className="text-sm text-secondary-400 text-center py-4">
                Aucun événement
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays}
      </div>
    );
  };

  /**
   * Rendu de la liste des événements (vue alternative)
   */
  const renderEventList = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">
            Liste des événements
          </h3>
        </div>
        <div className="divide-y divide-secondary-200">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 hover:bg-secondary-50 cursor-pointer"
              onClick={() => setEditingEvent(event)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-secondary-900">
                    {event.titre}
                  </h4>
                  <p className="text-sm text-secondary-600 mt-1">
                    {event.description}
                  </p>
                  <div className="flex items-center text-xs text-secondary-500 mt-2 space-x-4">
                    <span className="flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      {format(new Date(event.date_debut), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {format(new Date(event.date_debut), 'HH:mm')} - {format(new Date(event.date_fin), 'HH:mm')}
                    </span>
                    {event.salle && (
                      <span className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {event.salle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.statut === 'planifie' ? 'bg-blue-100 text-blue-800' :
                    event.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                    event.statut === 'termine' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.statut}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center text-secondary-500">
              Aucun événement trouvé
            </div>
          )}
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
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">
          Gestion du Planning
        </h1>
        <button
          onClick={() => setShowEventModal(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouvel événement
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Rechercher des événements..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation de semaine */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek(-1)}
            className="btn btn-secondary"
          >
            ← Semaine précédente
          </button>
          <h2 className="text-lg font-semibold text-secondary-900">
            Semaine du {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={() => navigateWeek(1)}
            className="btn btn-secondary"
          >
            Semaine suivante →
          </button>
        </div>
      </div>

      {/* Vue calendrier */}
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Vue calendrier
        </h3>
        {renderWeekCalendar()}
      </div>

      {/* Vue liste */}
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Vue liste
        </h3>
        {renderEventList()}
      </div>

      {/* Modal d'événement */}
      {showEventModal && (
        <EventModal
          event={editingEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSave={() => {
            setShowEventModal(false);
            setEditingEvent(null);
            loadWeekEvents();
          }}
        />
      )}
    </div>
  );
};

/**
 * Modal pour créer/éditer un événement
 */
const EventModal = ({ event, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    type_evenement: 'autre',
    salle: '',
    participants: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!event;

  useEffect(() => {
    if (isEditing && event) {
      setFormData({
        titre: event.titre || '',
        description: event.description || '',
        date_debut: format(new Date(event.date_debut), 'yyyy-MM-dd\'T\'HH:mm'),
        date_fin: format(new Date(event.date_fin), 'yyyy-MM-dd\'T\'HH:mm'),
        type_evenement: event.type_evenement || 'autre',
        salle: event.salle || '',
        participants: event.participants || '',
      });
    } else {
      // Pré-remplir avec la date actuelle
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData({
        titre: '',
        description: '',
        date_debut: format(now, 'yyyy-MM-dd\'T\'HH:mm'),
        date_fin: format(nextHour, 'yyyy-MM-dd\'T\'HH:mm'),
        type_evenement: 'autre',
        salle: '',
        participants: '',
      });
    }
  }, [event, isEditing]);

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
    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    }
    if (!formData.date_debut) {
      newErrors.date_debut = 'La date de début est requise';
    }
    if (!formData.date_fin) {
      newErrors.date_fin = 'La date de fin est requise';
    }
    if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
      newErrors.date_fin = 'La date de fin doit être après la date de début';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isEditing) {
        await planningService.updateEvent(event.id, formData);
        toast.success('Événement modifié avec succès');
      } else {
        await planningService.createEvent(formData);
        toast.success('Événement créé avec succès');
      }
      onSave();
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);

      if (apiError.status === 409) {
        setErrors({
          date_debut: 'Conflit d\'horaires détecté',
          date_fin: 'Conflit d\'horaires détecté',
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
            {isEditing ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="form-label">Titre *</label>
              <input
                type="text"
                name="titre"
                className={`form-input ${errors.titre ? 'border-danger-300' : ''}`}
                value={formData.titre}
                onChange={handleChange}
                placeholder="Titre de l'événement"
              />
              {errors.titre && <p className="form-error">{errors.titre}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                rows="3"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de l'événement"
              />
            </div>

            {/* Date de début */}
            <div>
              <label className="form-label">Date et heure de début *</label>
              <input
                type="datetime-local"
                name="date_debut"
                className={`form-input ${errors.date_debut ? 'border-danger-300' : ''}`}
                value={formData.date_debut}
                onChange={handleChange}
              />
              {errors.date_debut && <p className="form-error">{errors.date_debut}</p>}
            </div>

            {/* Date de fin */}
            <div>
              <label className="form-label">Date et heure de fin *</label>
              <input
                type="datetime-local"
                name="date_fin"
                className={`form-input ${errors.date_fin ? 'border-danger-300' : ''}`}
                value={formData.date_fin}
                onChange={handleChange}
              />
              {errors.date_fin && <p className="form-error">{errors.date_fin}</p>}
            </div>

            {/* Type d'événement */}
            <div>
              <label className="form-label">Type d'événement</label>
              <select
                name="type_evenement"
                className="form-input"
                value={formData.type_evenement}
                onChange={handleChange}
              >
                <option value="autre">Autre</option>
                <option value="reunion">Réunion</option>
                <option value="formation">Formation</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Salle */}
            <div>
              <label className="form-label">Salle</label>
              <input
                type="text"
                name="salle"
                className="form-input"
                value={formData.salle}
                onChange={handleChange}
                placeholder="Salle de réunion, bureau, etc."
              />
            </div>

            {/* Participants */}
            <div>
              <label className="form-label">Participants</label>
              <input
                type="text"
                name="participants"
                className="form-input"
                value={formData.participants}
                onChange={handleChange}
                placeholder="Liste des participants (optionnel)"
              />
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
                {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Planning;
