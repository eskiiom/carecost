import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ConsumptionChartContainer } from '../../components/ConsumptionChartContainer';
import { FuelEntriesList } from '../../components/FuelEntries/FuelEntriesList';
import { MaintenanceList } from '../../components/Maintenance/MaintenanceList';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  energyType: string;
  year: number;
  initialMileage: number;
  currentMileage?: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  chassisNumber?: string;
}

type TabType = 'info' | 'fuel' | 'maintenance' | 'statistics';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const response = await axios.get<Vehicle>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setVehicle(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération du véhicule:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Une erreur est survenue lors de la récupération du véhicule'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const getEnergyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
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

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  if (!vehicle) {
    return <div className="text-center py-4">Véhicule non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec les informations principales */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </h1>
            <div className="flex items-center space-x-4 text-gray-500">
              <p>{vehicle.licensePlate}</p>
              <span>•</span>
              <p>{getEnergyTypeLabel(vehicle.energyType)}</p>
              {vehicle.currentMileage && (
                <>
                  <span>•</span>
                  <p>{vehicle.currentMileage.toLocaleString()} km</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/vehicles')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Retour à la liste
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('fuel')}
              className={`${
                activeTab === 'fuel'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Carburant
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Statistiques
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Contenu des onglets */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Marque</dt>
                    <dd className="mt-1 text-sm text-gray-900">{vehicle.brand}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Modèle</dt>
                    <dd className="mt-1 text-sm text-gray-900">{vehicle.model}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Année</dt>
                    <dd className="mt-1 text-sm text-gray-900">{vehicle.year}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type d'énergie</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getEnergyTypeLabel(vehicle.energyType)}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Caractéristiques techniques</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Kilométrage initial</dt>
                    <dd className="mt-1 text-sm text-gray-900">{vehicle.initialMileage} km</dd>
                  </div>
                  {vehicle.currentMileage && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Kilométrage actuel</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.currentMileage} km</dd>
                    </div>
                  )}
                  {vehicle.powerDIN && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Puissance (DIN)</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.powerDIN} ch</dd>
                    </div>
                  )}
                  {vehicle.batterySize && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Capacité batterie</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.batterySize} kWh</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'fuel' && (
            <div>
              <div className="flex justify-between items-center mb-6">
              </div>
              <FuelEntriesList vehicleId={vehicle.id} onUpdate={fetchVehicle} />
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Maintenance</h3>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => {/* TODO: Ouvrir le formulaire d'ajout */}}
                >
                  Ajouter une maintenance
                </button>
              </div>
              <MaintenanceList vehicleId={vehicle.id} />
            </div>
          )}

          {activeTab === 'statistics' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques de consommation</h3>
              <ConsumptionChartContainer vehicleId={vehicle.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 