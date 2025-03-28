import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VehicleForm } from './VehicleForm';

export const NewVehicle: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un véhicule</h1>
          <VehicleForm
            onSuccess={(vehicleId) => navigate(`/vehicles/${vehicleId}`)}
            onCancel={() => navigate('/vehicles')}
          />
        </div>
      </div>
    </div>
  );
}; 