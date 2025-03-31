import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { VehicleForm } from './VehicleForm';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  energyType: string;
  initialMileage: number;
  vin: string;
}

export const EditVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
              Authorization: `Bearer ${token}`
            }
          }
        );
        setVehicle(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement du véhicule:', err);
        setError('Une erreur est survenue lors du chargement du véhicule');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicle();
    }
  }, [id]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Modifier {vehicle.brand} {vehicle.model}
          </h1>
          <VehicleForm
            vehicle={vehicle}
            onSuccess={(vehicleId) => navigate(`/vehicles/${vehicleId}`)}
            onCancel={() => navigate(`/vehicles/${vehicle.id}`)}
          />
        </div>
      </div>
    </div>
  );
}; 