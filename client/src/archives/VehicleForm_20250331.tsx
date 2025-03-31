import React, { useState } from 'react';
import axios from 'axios';

interface VehicleFormProps {
  onSuccess?: (vehicleId: string) => void;
}

interface VehicleResponse {
  id: string;
  brand: string;
  model: string;
  year: number;
  energyType: string;
  initialMileage: number;
  licensePlate: string;
  vin: string;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    energyType: 'GASOLINE',
    initialMileage: 0,
    licensePlate: '',
    vin: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const response = await axios.post<VehicleResponse>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(true);
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        energyType: 'GASOLINE',
        initialMileage: 0,
        licensePlate: '',
        vin: ''
      });

      if (onSuccess && response.data.id) {
        onSuccess(response.data.id);
      }
    } catch (err) {
      console.error('Erreur lors de la création du véhicule:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Une erreur est survenue lors de la création du véhicule'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Ajouter un véhicule</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Véhicule créé avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marque
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modèle
          </label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Immatriculation
          </label>
          <input
            type="text"
            value={formData.licensePlate}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="AB-123-CD"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de châssis (VIN)
          </label>
          <input
            type="text"
            value={formData.vin}
            onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Année
          </label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            min="1900"
            max={new Date().getFullYear() + 1}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d'énergie
          </label>
          <select
            value={formData.energyType}
            onChange={(e) => setFormData({ ...formData, energyType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="GASOLINE">Essence</option>
            <option value="DIESEL">Diesel</option>
            <option value="GPL">GPL</option>
            <option value="HYBRID_GASOLINE">Hybride Essence</option>
            <option value="HYBRID_DIESEL">Hybride Diesel</option>
            <option value="ELECTRIC">Électrique</option>
            <option value="HYDROGEN">Hydrogène</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kilométrage initial
          </label>
          <input
            type="number"
            value={formData.initialMileage}
            onChange={(e) => setFormData({ ...formData, initialMileage: parseInt(e.target.value) })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Créer le véhicule
        </button>
      </form>
    </div>
  );
}; 