import React, { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

interface FuelEntryFormProps {
  vehicleId: string;
  entryToEdit?: FuelEntry;
  onSuccess: () => void;
  onCancel: () => void;
  currentMileage?: number;
}

interface FuelEntry {
  id?: string;
  vehicleId: string;
  date: string;
  mileage: number;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  missedFillup?: boolean;
  notes?: string;
  fuelType?: string;
  stationType?: string;
  rechargeType?: string;
  isSubscription: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const FuelEntryForm: React.FC<FuelEntryFormProps> = ({
  vehicleId,
  entryToEdit,
  onSuccess,
  onCancel,
  currentMileage
}) => {
  const [formData, setFormData] = useState<FuelEntry>({
    vehicleId,
    date: format(new Date(), 'yyyy-MM-dd'),
    mileage: 0,
    quantity: 0,
    unitPrice: 0,
    totalCost: 0,
    missedFillup: false,
    isSubscription: false,
    status: 'ACTIVE'
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
  const [lastKnownMileage, setLastKnownMileage] = useState<number | null>(null);
  const [forceMileageUpdate, setForceMileageUpdate] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        ...entryToEdit,
        date: format(parseISO(entryToEdit.date), 'yyyy-MM-dd'),
        subscriptionStartDate: entryToEdit.subscriptionStartDate 
          ? format(parseISO(entryToEdit.subscriptionStartDate), 'yyyy-MM-dd')
          : undefined,
        subscriptionEndDate: entryToEdit.subscriptionEndDate
          ? format(parseISO(entryToEdit.subscriptionEndDate), 'yyyy-MM-dd')
          : undefined,
        missedFillup: entryToEdit.missedFillup || false,
        status: entryToEdit.status || 'ACTIVE'
      });

      // Initialiser les valeurs temporaires avec les valeurs existantes
      setTempValues({
        mileage: entryToEdit.mileage.toString(),
        quantity: entryToEdit.quantity.toString(),
        unitPrice: entryToEdit.unitPrice.toString(),
        totalCost: entryToEdit.totalCost.toString()
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
  }, [entryToEdit]);

  useEffect(() => {
    const fetchLastKnownMileage = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Si on a un kilométrage actuel, on l'utilise
        if (currentMileage) {
          setLastKnownMileage(currentMileage);
          return;
        }

        // Sinon on récupère le dernier kilométrage des entrées
        const response = await axios.get<FuelEntry[]>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/fuel-entries/vehicle/${vehicleId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // Trier par date décroissante et prendre le premier kilométrage
        const sortedEntries = response.data.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        if (sortedEntries.length > 0) {
          setLastKnownMileage(sortedEntries[0].mileage);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du dernier kilométrage:', err);
      }
    };

    fetchLastKnownMileage();
  }, [vehicleId, currentMileage]);

  const calculateMissingValue = () => {
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
  };

  useEffect(() => {
    // Calculer la valeur manquante après un court délai
    const timer = setTimeout(() => {
      calculateMissingValue();
    }, 500);

    return () => clearTimeout(timer);
  }, [tempValues]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                    type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
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

      // Validation des données
      if (formData.quantity <= 0) {
        setError('La quantité doit être supérieure à 0');
        return;
      }

      if (formData.unitPrice <= 0) {
        setError('Le prix unitaire doit être supérieur à 0');
        return;
      }

      if (formData.mileage <= 0) {
        setError('Le kilométrage doit être supérieur à 0');
        return;
      }

      // Vérification du kilométrage
      if (formData.mileage < (lastKnownMileage || 0) && !forceMileageUpdate) {
        setError(`Le kilométrage saisi (${formData.mileage.toLocaleString()} km) est inférieur au dernier kilométrage connu (${lastKnownMileage?.toLocaleString()} km). Si cette valeur est correcte, cochez la case "Forcer la mise à jour du kilométrage" ci-dessous.`);
        return;
      }

      // Vérifier la cohérence du coût total
      const calculatedTotal = Number((formData.quantity * formData.unitPrice).toFixed(2));

      // Préparer les données pour l'envoi
      const dataToSend = {
        id: entryToEdit?.id,
        vehicleId: formData.vehicleId,
        date: formData.date,
        mileage: Math.round(Number(formData.mileage)),
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        totalCost: calculatedTotal,
        fuelType: formData.fuelType || null,
        stationType: formData.stationType || null,
        rechargeType: formData.rechargeType || null,
        isSubscription: Boolean(formData.isSubscription),
        missedFillup: Boolean(formData.missedFillup),
        status: formData.status || 'ACTIVE',
        subscriptionStartDate: formData.subscriptionStartDate || null,
        subscriptionEndDate: formData.subscriptionEndDate || null,
        createdAt: entryToEdit?.createdAt,
        updatedAt: entryToEdit?.updatedAt,
        forceMileageUpdate: forceMileageUpdate
      };

      // Logs détaillés pour le débogage
      console.log('Mode:', entryToEdit?.id ? 'Modification' : 'Création');
      console.log('ID de l\'entrée:', entryToEdit?.id);
      console.log('Données originales:', {
        ...formData,
        calculatedTotal,
        difference: Math.abs(calculatedTotal - formData.totalCost)
      });
      console.log('Données envoyées:', dataToSend);

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (entryToEdit?.id) {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/fuel-entries/${entryToEdit.id}`,
          dataToSend,
          config
        );
        console.log('Réponse du serveur:', response.data);
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/fuel-entries`,
          dataToSend,
          config
        );
        console.log('Réponse du serveur:', response.data);
      }

      onSuccess();
    } catch (err) {
      console.error('Erreur détaillée:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: any; }; };
        console.error('Status:', axiosError.response?.status);
        console.error('Données d\'erreur:', axiosError.response?.data);
      }
      
      let errorMessage = 'Une erreur est survenue lors de l\'enregistrement';
      
      if (err && 
          typeof err === 'object' && 
          'response' in err && 
          err.response && 
          typeof err.response === 'object' && 
          'data' in err.response && 
          err.response.data && 
          typeof err.response.data === 'object' && 
          'message' in err.response.data && 
          typeof err.response.data.message === 'string') {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
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
              value={formData.date}
              onChange={handleInputChange}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              Début d'abonnement
              <input
                type="date"
                name="subscriptionStartDate"
                value={formData.subscriptionStartDate || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={formData.isSubscription}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fin d'abonnement
              <input
                type="date"
                name="subscriptionEndDate"
                value={formData.subscriptionEndDate || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </label>
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
          {loading ? 'Enregistrement...' : (entryToEdit ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </form>
  );
}; 