import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { Vehicle, FuelEntry, EnergyType, FuelType } from '../../types/vehicle.types';
import { useFuelTypes } from '../../hooks/useFuelTypes';

type FuelEntryFormData = Omit<Partial<FuelEntry>, 'quantity' | 'unitPrice'> & {
  quantity: number;
  unitPrice: number;
};

interface FuelEntryFormProps {
  vehicle: Vehicle;
  entry?: FuelEntry;
  onSubmit: (data: Partial<FuelEntry>) => Promise<void>;
  onCancel: () => void;
}

export const FuelEntryForm: React.FC<FuelEntryFormProps> = ({
  vehicle,
  entry,
  onSubmit,
  onCancel,
}) => {
  const { fuelTypes, loading: fuelTypesLoading } = useFuelTypes(vehicle.energyType);
  const [formData, setFormData] = useState<FuelEntryFormData>({
    date: entry?.date || new Date(),
    mileage: entry?.mileage || vehicle.currentMileage || 0,
    quantity: entry?.quantity || 0,
    unitPrice: entry?.unitPrice || 0,
    totalCost: entry?.totalCost || 0,
    fuelTypeId: entry?.fuelTypeId || '',
    stationType: entry?.stationType || '',
    rechargeType: entry?.rechargeType || '',
    isSubscription: entry?.isSubscription || false,
    subscriptionStartDate: entry?.subscriptionStartDate,
    subscriptionEndDate: entry?.subscriptionEndDate,
    notes: entry?.notes || '',
    status: entry?.status || 'PENDING',
    missedFillup: entry?.missedFillup || false,
  });
  const [tempValues, setTempValues] = useState({
    mileage: '',
    quantity: '',
    unitPrice: '',
    totalCost: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastKnownMileage, setLastKnownMileage] = useState<number>(0);
  const [forceMileageUpdate, setForceMileageUpdate] = useState(false);

  useEffect(() => {
    if (entry) {
      const date = entry.date instanceof Date ? entry.date : new Date(entry.date);
      const startDate = entry.subscriptionStartDate 
        ? (entry.subscriptionStartDate instanceof Date ? entry.subscriptionStartDate : new Date(entry.subscriptionStartDate))
        : undefined;
      const endDate = entry.subscriptionEndDate
        ? (entry.subscriptionEndDate instanceof Date ? entry.subscriptionEndDate : new Date(entry.subscriptionEndDate))
        : undefined;

      setFormData({
        ...entry,
        date,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
      });

      // Initialiser les valeurs temporaires avec les valeurs existantes
      setTempValues({
        mileage: entry.mileage.toString(),
        quantity: entry.quantity.toString(),
        unitPrice: entry.unitPrice.toString(),
        totalCost: entry.totalCost.toString()
      });
    } else {
      // Réinitialiser les valeurs temporaires quand on crée une nouvelle entrée
      setTempValues({
        mileage: '',
        quantity: '',
        unitPrice: '',
        totalCost: ''
      });
    }
  }, [entry]);

  useEffect(() => {
    if (vehicle.historicalMaxMileage) {
      setLastKnownMileage(vehicle.historicalMaxMileage);
    }
  }, [vehicle.id, vehicle.historicalMaxMileage]);

  const calculateMissingValue = useCallback(() => {
    const qty = parseFloat(tempValues.quantity);
    const price = parseFloat(tempValues.unitPrice);
    const total = parseFloat(tempValues.totalCost);

    if (!isNaN(qty) && !isNaN(price) && tempValues.totalCost === '') {
      // Calculer le total si quantité et prix unitaire sont remplis
      const newTotal = Number((qty * price).toFixed(2));
      setTempValues(prev => ({ ...prev, totalCost: newTotal.toString() }));
      setFormData(prev => ({ ...prev, quantity: qty, unitPrice: price, totalCost: newTotal }));
    } 
    else if (!isNaN(total) && !isNaN(price) && price > 0 && tempValues.quantity === '') {
      // Calculer la quantité si total et prix unitaire sont remplis
      const newQty = Number((total / price).toFixed(2));
      setTempValues(prev => ({ ...prev, quantity: newQty.toString() }));
      setFormData(prev => ({ ...prev, quantity: newQty, unitPrice: price, totalCost: total }));
    }
    else if (!isNaN(total) && !isNaN(qty) && qty > 0 && tempValues.unitPrice === '') {
      // Calculer le prix unitaire si total et quantité sont remplis
      const newPrice = Number((total / qty).toFixed(3));
      setTempValues(prev => ({ ...prev, unitPrice: newPrice.toString() }));
      setFormData(prev => ({ ...prev, quantity: qty, unitPrice: newPrice, totalCost: total }));
    }
  }, [tempValues, setTempValues, setFormData]);

  useEffect(() => {
    // Calculer la valeur manquante après un court délai
    const timer = setTimeout(() => {
      calculateMissingValue();
    }, 500);

    return () => clearTimeout(timer);
  }, [tempValues, calculateMissingValue]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                    type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'date' ? new Date(value) : newValue
    }));

    // Calculer automatiquement le coût total
    if (name === 'quantity' || name === 'unitPrice') {
      const quantity = name === 'quantity' ? parseFloat(value) || 0 : formData.quantity;
      const unitPrice = name === 'unitPrice' ? parseFloat(value) || 0 : formData.unitPrice;
      
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        totalCost: Number((quantity * unitPrice).toFixed(2))
      }));
    }
  };

  // Fonction pour normaliser les nombres (accepte point et virgule)
  const normalizeNumber = (value: string): string => {
    // Remplace la virgule par un point
    return value.replace(',', '.');
  };

  const calculateTotalCost = () => {
    return (formData.quantity * formData.unitPrice).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const dataToSubmit = {
        ...formData,
        vehicleId: vehicle.id,
      };

      await onSubmit(dataToSubmit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
            <input
              type="date"
              name="date"
              value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
              onChange={handleInputChange}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Kilométrage
            <div className="relative">
              <input
                type="number"
                name="mileage"
                value={tempValues.mileage}
                onChange={(e) => {
                  const value = normalizeNumber(e.target.value);
                  setTempValues(prev => ({ ...prev, mileage: value }));
                  setFormData(prev => ({ ...prev, mileage: parseFloat(value) || 0 }));
                }}
                min="0"
                step="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder={lastKnownMileage ? `Dernier kilométrage connu: ${lastKnownMileage.toLocaleString()} km` : undefined}
              />
              {parseFloat(tempValues.mileage) < (lastKnownMileage || 0) && (
                <div className="mt-2">
                  <label className="inline-flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-2"
                      checked={forceMileageUpdate}
                      onChange={(e) => setForceMileageUpdate(e.target.checked)}
                    />
                    Forcer la mise à jour du kilométrage
                  </label>
                </div>
              )}
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantité (L)
            <input
              type="text"
              inputMode="decimal"
              name="quantity"
              value={tempValues.quantity}
              onChange={(e) => {
                const value = normalizeNumber(e.target.value);
                if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) return;
                setTempValues(prev => ({ ...prev, quantity: value }));
                setFormData(prev => ({ ...prev, quantity: parseFloat(value) || 0 }));
                calculateMissingValue();
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="Ex: 45.5"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prix unitaire (€/L)
            <input
              type="text"
              inputMode="decimal"
              name="unitPrice"
              value={tempValues.unitPrice}
              onChange={(e) => {
                const value = normalizeNumber(e.target.value);
                if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) return;
                setTempValues(prev => ({ ...prev, unitPrice: value }));
                setFormData(prev => ({ ...prev, unitPrice: parseFloat(value) || 0 }));
                calculateMissingValue();
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="Ex: 1.859"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Coût total (€)
            <input
              type="text"
              inputMode="decimal"
              name="totalCost"
              value={tempValues.totalCost}
              onChange={(e) => {
                const value = normalizeNumber(e.target.value);
                if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) return;
                setTempValues(prev => ({ ...prev, totalCost: value }));
                setFormData(prev => ({ ...prev, totalCost: parseFloat(value) || 0 }));
                calculateMissingValue();
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="Ex: 84.50"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type de station
            <select
              name="stationType"
              value={formData.stationType || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionner...</option>
              <option value="PUBLIC">Station publique</option>
              <option value="PRIVATE">Station privée</option>
              <option value="HOME">Domicile</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
            Type de carburant
          </label>
          <select
            id="fuelType"
            name="fuelTypeId"
            value={formData.fuelTypeId}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            disabled={fuelTypesLoading}
          >
            <option value="">Sélectionnez un type de carburant</option>
            {fuelTypes.map((fuelType) => (
              <option key={fuelType.id} value={fuelType.id}>
                {fuelType.name}
              </option>
            ))}
          </select>
          {fuelTypesLoading && (
            <p className="mt-1 text-sm text-gray-500">Chargement des types de carburant...</p>
          )}
        </div>
      </div>

      <div className="flex items-center mt-4">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="isSubscription"
            checked={formData.isSubscription}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-2"
          />
          Abonnement
        </label>
      </div>

      {formData.isSubscription && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de début d'abonnement
            </label>
            <input
              type="date"
              id="subscriptionStartDate"
              name="subscriptionStartDate"
              value={formData.subscriptionStartDate ? format(formData.subscriptionStartDate, 'yyyy-MM-dd') : ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de fin d'abonnement
            </label>
            <input
              type="date"
              id="subscriptionEndDate"
              name="subscriptionEndDate"
              value={formData.subscriptionEndDate ? format(formData.subscriptionEndDate, 'yyyy-MM-dd') : ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      )}

      <div className="flex items-center mt-4 relative">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="missedFillup"
            checked={formData.missedFillup || false}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-2"
          />
          Plein manqué
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              setShowTooltip(!showTooltip);
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {showTooltip && (
            <div className="absolute left-0 bottom-full mb-2 w-64 bg-black text-white text-sm rounded-lg py-2 px-3 shadow-lg z-10">
              <div className="relative">
                Cochez cette case si vous avez oublié d'enregistrer un ou plusieurs pleins entre cette entrée et la précédente. Cela aide à expliquer les variations inhabituelles de consommation.
                <div className="absolute -bottom-2 left-4 w-4 h-4 bg-black transform rotate-45"></div>
              </div>
            </div>
          )}
        </label>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Notes
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Notes optionnelles sur cette entrée..."
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : (entry ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </form>
  );
}; 