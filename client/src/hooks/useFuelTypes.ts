import { useState, useEffect } from 'react';
import axios from 'axios';
import { EnergyType, FuelType } from '../types/vehicle.types';

export const useFuelTypes = (energyType: EnergyType) => {
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFuelTypes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Non authentifié');
          return;
        }

        const response = await axios.get<FuelType[]>(`/api/fuels/${energyType}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setFuelTypes(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des carburants:', err);
        setError('Erreur lors de la récupération des carburants');
      } finally {
        setLoading(false);
      }
    };

    if (energyType) {
      fetchFuelTypes();
    }
  }, [energyType]);

  return { fuelTypes, loading, error };
}; 