import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MaintenanceFormProps {
  vehicleId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  date: string;
  mileage: number;
  description: string;
  cost: number;
  type: string;
  notes: string;
  forceMileageUpdate: boolean;
}

interface FieldErrors {
  [key: string]: string;
}

interface ApiResponse {
  code?: string;
  message?: string;
  errors?: FieldErrors;
}

interface Vehicle {
  currentMileage?: number;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  vehicleId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    mileage: 0,
    description: '',
    cost: 0,
    type: 'ROUTINE',
    notes: '',
    forceMileageUpdate: false
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Non authentifié');
          return;
        }

        const response = await axios.get<Vehicle>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${vehicleId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setVehicle(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération du véhicule:', err);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    
    // Validation de la date
    if (!formData.date) {
      errors.date = 'La date est obligatoire';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        errors.date = 'La date ne peut pas être dans le futur';
      }
    }
    
    // Validation du kilométrage
    if (formData.mileage <= 0) {
      errors.mileage = 'Le kilométrage doit être supérieur à 0';
    } else if (!formData.forceMileageUpdate && vehicle?.currentMileage && formData.mileage < vehicle.currentMileage) {
      errors.mileage = 'Le kilométrage ne peut pas être inférieur au kilométrage actuel';
    }
    
    // Validation de la description
    if (!formData.description.trim()) {
      errors.description = 'La description est obligatoire';
    } else if (formData.description.length > 200) {
      errors.description = 'La description ne doit pas dépasser 200 caractères';
    }
    
    // Validation du coût
    if (formData.cost <= 0) {
      errors.cost = 'Le coût doit être supérieur à 0';
    }

    // Validation du type
    const validTypes = ['ROUTINE', 'REPAIR', 'TECHNICAL_CHECK', 'TIRES', 'OTHER'];
    if (!validTypes.includes(formData.type)) {
      errors.type = 'Type de maintenance invalide';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const response = await axios.post<ApiResponse>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/maintenance-entries`,
        {
          ...formData,
          vehicleId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 'VALIDATION_ERROR') {
        setFieldErrors(response.data.errors || {});
        setError(response.data.message || 'Erreur de validation');
        return;
      }

      onSuccess();
    } catch (error: unknown) {
      console.error('Erreur lors de l\'ajout de la maintenance:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: ApiResponse } };
        if (axiosError.response?.status === 400) {
          if (typeof axiosError.response.data.message === 'string') {
            setError(axiosError.response.data.message);
          } else if (axiosError.response.data.errors) {
            setFieldErrors(axiosError.response.data.errors);
          }
        } else {
          setError('Une erreur est survenue lors de l\'ajout de la maintenance');
        }
      } else {
        setError('Une erreur inattendue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Effacer l'erreur du champ modifié
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.date ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {fieldErrors.date && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.type ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          >
            <option value="ROUTINE">Entretien de routine</option>
            <option value="REPAIR">Réparation</option>
            <option value="TECHNICAL_CHECK">Contrôle technique</option>
            <option value="TIRES">Pneumatiques</option>
            <option value="OTHER">Autre</option>
          </select>
          {fieldErrors.type && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.type}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            required
            maxLength={200}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
            Kilométrage
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                fieldErrors.mileage ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              min="0"
              step="1"
              placeholder={vehicle?.currentMileage !== undefined ? `Dernier kilométrage connu: ${vehicle.currentMileage.toLocaleString('fr-FR')} km` : ''}
            />
          </div>
          {vehicle?.currentMileage && formData.mileage !== 0 && formData.mileage < vehicle.currentMileage && (
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="forceMileageUpdate"
                  checked={formData.forceMileageUpdate}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Forcer la mise à jour du kilométrage
                </span>
              </label>
            </div>
          )}
          {fieldErrors.mileage && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.mileage}</p>
          )}
        </div>

        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
            Coût (€)
          </label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleInputChange}
            step="0.01"
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.cost ? 'border-red-300' : 'border-gray-300'
            }`}
            required
            min="0"
          />
          {fieldErrors.cost && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.cost}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
        )}

        <div className="flex justify-end space-x-3">
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
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  );
}; 