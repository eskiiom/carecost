import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

interface MaintenanceFormProps {
  vehicleId: string;
  onSuccess: () => void;
  onCancel: () => void;
  onVehicleUpdate?: () => void;
  initialData?: {
    id: string;
    date: string;
    mileage: number;
    description: string;
    cost: number;
    type: string;
    notes?: string;
    providerName?: string;
  };
}

interface FormData {
  vehicleId: string;
  date: string;
  mileage: number;
  description: string;
  cost: number;
  type: string;
  notes: string;
  forceMileageUpdate: boolean;
  providerName?: string;
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
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  vehicleId,
  onSuccess,
  onCancel,
  onVehicleUpdate,
  initialData
}) => {
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<FormData>({
    vehicleId,
    date: initialData?.date ? formatDateForInput(initialData.date) : new Date().toISOString().split('T')[0],
    mileage: initialData?.mileage || 0,
    description: initialData?.description || '',
    cost: initialData?.cost || 0,
    type: initialData?.type || 'ROUTINE',
    notes: initialData?.notes || '',
    forceMileageUpdate: false,
    providerName: initialData?.providerName || ''
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
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${vehicleId}/historical-max-mileage`,
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
    } else if (!formData.forceMileageUpdate && vehicle?.historicalMaxMileage && formData.mileage < vehicle.historicalMaxMileage) {
      errors.mileage = 'Le kilométrage ne peut pas être inférieur au kilométrage historique maximum';
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
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      // Préparer les données pour l'envoi
      let dataToSend: any = {};

      if (initialData) {
        // Pour une modification, n'envoyer que les champs modifiés
        if (formData.date !== format(parseISO(initialData.date), 'yyyy-MM-dd')) {
          dataToSend.date = formData.date;
        }
        if (formData.type !== initialData.type) {
          dataToSend.type = formData.type;
        }
        if (formData.description !== initialData.description) {
          dataToSend.description = formData.description;
        }
        if (formData.cost !== initialData.cost) {
          dataToSend.cost = Number(formData.cost);
        }
        if (formData.mileage !== initialData.mileage) {
          dataToSend.mileage = Number(formData.mileage);
          if (formData.forceMileageUpdate) {
            dataToSend.forceMileageUpdate = true;
          }
        }
        if (formData.notes !== initialData.notes) {
          dataToSend.notes = formData.notes || null;
        }
        if (formData.providerName !== initialData.providerName) {
          dataToSend.providerName = formData.providerName || null;
        }

        // Toujours inclure l'ID du véhicule
        dataToSend.vehicleId = formData.vehicleId;
      } else {
        // Pour une nouvelle entrée, envoyer toutes les données nécessaires
        dataToSend = {
          vehicleId: formData.vehicleId,
          date: formData.date,
          type: formData.type,
          description: formData.description,
          mileage: Number(formData.mileage),
          cost: Number(formData.cost),
          notes: formData.notes || null,
          providerName: formData.providerName || null
        };
      }

      // Logs détaillés pour le débogage
      console.log('Mode:', initialData ? 'Modification' : 'Création');
      console.log('ID de l\'entrée:', initialData?.id);
      console.log('Données originales:', initialData);
      console.log('Données modifiées:', formData);
      console.log('Données envoyées:', dataToSend);

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let response;
      if (initialData) {
        // Modification d'une entrée existante
        response = await axios.put<ApiResponse>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/maintenance-entries/${initialData.id}`,
          dataToSend,
          config
        );
      } else {
        // Création d'une nouvelle entrée
        response = await axios.post<ApiResponse>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/maintenance-entries`,
          dataToSend,
          config
        );
      }

      if (response.data.code === 'VALIDATION_ERROR') {
        setFieldErrors(response.data.errors || {});
        setError(response.data.message || 'Erreur de validation');
        return;
      }

      // Appeler onVehicleUpdate si le kilométrage a été mis à jour
      if (formData.mileage > (vehicle?.historicalMaxMileage || 0) || formData.forceMileageUpdate) {
        onVehicleUpdate?.();
      }

      onSuccess();
    } catch (error: unknown) {
      console.error('Erreur lors de la modification de la maintenance:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: ApiResponse } };
        if (axiosError.response?.status === 400) {
          if (typeof axiosError.response.data.message === 'string') {
            setError(axiosError.response.data.message);
          } else if (axiosError.response.data.errors) {
            setFieldErrors(axiosError.response.data.errors);
          }
        } else {
          setError('Une erreur est survenue lors de la modification de la maintenance');
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

        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type de maintenance
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              fieldErrors.type ? 'border-red-500' : ''
            }`}
          >
            <option value="ROUTINE">Entretien de routine</option>
            <option value="REPAIR">Réparation</option>
            <option value="TECHNICAL_CHECK">Contrôle technique</option>
            <option value="TIRES">Pneumatiques</option>
            <option value="OTHER">Autre</option>
          </select>
          {fieldErrors.type && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.type}</p>
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
              placeholder={vehicle?.historicalMaxMileage !== undefined ? `Dernier kilométrage connu: ${vehicle.historicalMaxMileage.toLocaleString('fr-FR')} km` : ''}
            />
          </div>
          {vehicle?.historicalMaxMileage && formData.mileage !== 0 && formData.mileage < vehicle.historicalMaxMileage && (
            <div className="text-yellow-600 text-sm mt-1">
              Le kilométrage est inférieur au dernier kilométrage connu ({vehicle.historicalMaxMileage} km).
              <br />
              Cochez "Forcer la mise à jour" si c'est intentionnel.
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

        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (optionnel)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Ajoutez des notes supplémentaires ici..."
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