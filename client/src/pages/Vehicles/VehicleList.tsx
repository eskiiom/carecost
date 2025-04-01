import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { VehicleForm } from './VehicleForm';
import { ViewSelector } from '../../components/ViewSelector';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { ViewMode } from '../../types/preferences.types';
import { ENERGY_COLORS } from '../../constants/energyColors';
import { EnergyType } from '../../types/vehicle.types';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  energyType: EnergyType;
  year: number;
  initialMileage: number;
  vin: string;
}

export const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { preferences, updatePreferences } = useUserPreferences();
  const navigate = useNavigate();

  const handleViewChange = async (newView: ViewMode) => {
    try {
      await updatePreferences({ vehicleViewMode: newView });
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const response = await axios.get<Vehicle[]>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setVehicles(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des véhicules:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Une erreur est survenue lors de la récupération des véhicules'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  const getEnergyTypeLabel = (type: EnergyType) => {
    const types: Record<EnergyType, string> = {
      GASOLINE: 'Essence',
      DIESEL: 'Diesel',
      GPL: 'GPL',
      HYBRID_GASOLINE: 'Hybride Essence',
      HYBRID_DIESEL: 'Hybride Diesel',
      ELECTRIC: 'Électrique',
      HYDROGEN: 'Hydrogène'
    };
    return types[type] || type;
  };

  const getEnergyTypeStyle = (type: EnergyType) => {
    return {
      color: ENERGY_COLORS[type],
      fontWeight: 'bold'
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Véhicules</h1>
        <div className="flex items-center space-x-4">
          <ViewSelector
            currentView={preferences.vehicleViewMode}
            onViewChange={handleViewChange}
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Ajouter un véhicule
          </button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore de véhicule</p>
        </div>
      ) : preferences.vehicleViewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              to={`/vehicles/${vehicle.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <div className="text-gray-600">
                  <p>Année : {vehicle.year}</p>
                  <p>Immatriculation : {vehicle.licensePlate}</p>
                  <p>Énergie : <span style={getEnergyTypeStyle(vehicle.energyType)}>{getEnergyTypeLabel(vehicle.energyType)}</span></p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              to={`/vehicles/${vehicle.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {vehicle.year} - {vehicle.licensePlate} - <span style={getEnergyTypeStyle(vehicle.energyType)}>{getEnergyTypeLabel(vehicle.energyType)}</span>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Ajouter un véhicule</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <VehicleForm
                onSuccess={(vehicleId) => {
                  setShowAddModal(false);
                  navigate(`/vehicles/${vehicleId}`);
                }}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 