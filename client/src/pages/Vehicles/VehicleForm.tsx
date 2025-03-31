import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface VehicleFormProps {
  vehicle?: VehicleFormData;
  onSuccess: (vehicleId: string) => void;
  onCancel: () => void;
}

interface VehicleFormData {
  id?: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  energyType: string;
  initialMileage: number;
  vin: string;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    energyType: 'GASOLINE',
    initialMileage: 0,
    vin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      if (vehicle?.id) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${vehicle.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        onSuccess(vehicle.id);
      } else {
        const response = await axios.post<VehicleFormData & { id: string }>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        onSuccess(response.data.id);
      }
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du véhicule:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Une erreur est survenue lors de l\'enregistrement du véhicule'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

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
          placeholder="WVWZZZ1KZDM687212"
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

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : vehicle?.id ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}; 