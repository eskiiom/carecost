import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ConsumptionChartContainer } from '../../components/ConsumptionChartContainer';
import { FuelEntriesList } from '../../components/FuelEntries/FuelEntriesList';
import { MaintenanceList } from '../../components/Maintenance/MaintenanceList';
import { MaintenanceForm } from '../../components/Maintenance/MaintenanceForm';
import { VehicleForm } from './VehicleForm';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  energyType: string;
  year: number;
  initialMileage: number;
  historicalMaxMileage?: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  chassisNumber?: string;
  vin: string;
  mileage: number;
  fuelType: string;
  maintenances?: {
    id: string;
    date: string;
    description: string;
    cost: number;
    mileage: number;
  }[];
  fuelRecords?: {
    id: string;
    date: string;
    quantity: number;
    cost: number;
    mileage: number;
  }[];
}

interface HistoricalMaxMileageResponse {
  historicalMaxMileage: number;
}

type TabType = 'info' | 'fuel' | 'maintenance' | 'statistics';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    mileage: 0,
    volume: 0,
    pricePerLiter: 0,
  });
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const [vehicleResponse, historicalResponse] = await Promise.all([
        axios.get<Vehicle>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        ),
        axios.get<HistoricalMaxMileageResponse>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${id}/historical-max-mileage`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      ]);

      setVehicle({
        ...vehicleResponse.data,
        historicalMaxMileage: historicalResponse.data.historicalMaxMileage
      });
    } catch (err) {
      console.error('Erreur lors du chargement des détails du véhicule:', err);
      setError('Une erreur est survenue lors du chargement des détails du véhicule');
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

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Véhicule supprimé avec succès');
      setTimeout(() => navigate('/vehicles'), 2000);
    } catch (err) {
      console.error('Erreur lors de la suppression du véhicule:', err);
      setError('Une erreur est survenue lors de la suppression du véhicule');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-md mx-auto mt-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Véhicule non trouvé
        </div>
      </div>
    );
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
              {typeof vehicle.historicalMaxMileage !== 'undefined' && (
                <>
                  <span>•</span>
                  <p>{vehicle.historicalMaxMileage.toLocaleString()} km</p>
                </>
              )}
            </div>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Modifier le véhicule</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <VehicleForm
              vehicle={vehicle}
              onSuccess={() => {
                setShowEditModal(false);
                fetchVehicle();
              }}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce véhicule ?
              <br />
              <span className="font-medium">{vehicle.brand} {vehicle.model} ({vehicle.licensePlate})</span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {vehicle.historicalMaxMileage && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Kilométrage actuel</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.historicalMaxMileage} km</dd>
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
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowMaintenanceForm(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Ajouter une maintenance
                </button>
              </div>
              {showMaintenanceForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Ajouter une maintenance</h2>
                      <button
                        onClick={() => setShowMaintenanceForm(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        ✕
                      </button>
                    </div>
                    <MaintenanceForm
                      vehicleId={vehicle.id}
                      onSuccess={() => {
                        setShowMaintenanceForm(false);
                        fetchVehicle();
                      }}
                      onCancel={() => setShowMaintenanceForm(false)}
                      onVehicleUpdate={fetchVehicle}
                    />
                  </div>
                </div>
              )}
              <MaintenanceList vehicleId={vehicle.id} onVehicleUpdate={fetchVehicle} />
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