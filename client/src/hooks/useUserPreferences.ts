import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPreferences, PreferencesResponse } from '../types/preferences.types';

const DEFAULT_PREFERENCES: UserPreferences = {
  vehicleViewMode: 'grid'
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const response = await axios.get<PreferencesResponse>(
        `${process.env.REACT_APP_API_URL}/api/user/preferences`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Réponse GET preferences:', response.data);
      
      const userPreferences = response.data.preferences || response.data;
      if (userPreferences && typeof userPreferences === 'object' && 'vehicleViewMode' in userPreferences) {
        setPreferences(userPreferences as UserPreferences);
      } else {
        console.warn('Format de réponse GET inattendu:', response.data);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des préférences:', err);
      setError('Erreur lors de la récupération des préférences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      console.log('Envoi PATCH preferences:', newPreferences);

      const response = await axios.patch<PreferencesResponse>(
        `${process.env.REACT_APP_API_URL}/api/user/preferences`,
        newPreferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Réponse PATCH preferences:', response.data);

      const updatedPreferences = response.data.preferences || response.data;
      if (updatedPreferences && typeof updatedPreferences === 'object' && 'vehicleViewMode' in updatedPreferences) {
        setPreferences(updatedPreferences as UserPreferences);
        return updatedPreferences as UserPreferences;
      }

      throw new Error('Format de réponse invalide');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      if (error?.response?.data) {
        console.error('Détails de l\'erreur:', error.response.data);
      }
      throw error;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return { preferences, loading, error, updatePreferences };
}; 