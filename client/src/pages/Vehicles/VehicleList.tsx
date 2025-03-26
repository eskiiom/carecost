import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  energyType: string;
  year: number;
}

export const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes véhicules</h1>
        <Link
          to="/vehicles/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un véhicule
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucun véhicule enregistré</p>
          <Link
            to="/vehicles/new"
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            Commencer par ajouter un véhicule
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <p>Immatriculation : {vehicle.licensePlate}</p>
                  <p>Année : {vehicle.year}</p>
                  <p>Énergie : {getEnergyTypeLabel(vehicle.energyType)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 