import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { VehicleForm } from './VehicleForm';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  energyType: string;
  year: number;
  initialMileage: number;
  vin: string;
}

export const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes véhicules</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Ajouter un véhicule
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore de véhicule</p>
        </div>
      ) : (
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
                  <p>Énergie : {getEnergyTypeLabel(vehicle.energyType)}</p>
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