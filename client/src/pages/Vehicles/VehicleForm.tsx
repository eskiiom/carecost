import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  energyType: string;
  initialMileage: number;
}

interface VehicleResponse {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  energyType: string;
  initialMileage: number;
}

export const VehicleForm: React.FC = () => {
  const [formData, setFormData] = useState<VehicleFormData>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    energyType: 'GASOLINE',
    initialMileage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get<VehicleFormData>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setFormData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement du véhicule');
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      if (isEditMode) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccess(true);
        setTimeout(() => navigate('/vehicles'), 1000);
      } else {
        const response = await axios.post<VehicleResponse>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccess(true);
        setTimeout(() => navigate(`/vehicles/${response.data.id}`), 1000);
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

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {isEditMode ? 'Véhicule modifié avec succès !' : 'Véhicule créé avec succès !'} Redirection...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded-lg p-6">
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

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {isEditMode ? 'Modifier le véhicule' : 'Créer le véhicule'}
          </button>
        </div>
      </form>
    </div>
  );
}; 