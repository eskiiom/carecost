import React, { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'date-fns/format';
import { FuelEntryForm } from './FuelEntryForm';

interface FuelEntry {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  quantity: number;
  totalCost: number;
  missedFillup: boolean;
  notes?: string;
  unitPrice: number;
  stationType?: string;
  isSubscription: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

interface FuelEntriesListProps {
  vehicleId: string;
  onUpdate: () => Promise<void>;
}

export const FuelEntriesList: React.FC<FuelEntriesListProps> = ({ vehicleId, onUpdate }) => {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<FuelEntry | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<any | null>(null);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const response = await axios.get<FuelEntry[]>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/fuel-entries/vehicle/${vehicleId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Trier les entrées par date décroissante
      const sortedEntries = response.data.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(sortedEntries);
    } catch (err) {
      console.error('Erreur lors de la récupération des entrées:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Une erreur est survenue lors de la récupération des entrées'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const response = await axios.get(
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

  useEffect(() => {
    fetchEntries();
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const handleEdit = (entry: FuelEntry) => {
    setEntryToEdit(entry);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/fuel-entries/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Rafraîchir la liste et les infos du véhicule
      fetchEntries();
      fetchVehicle();
      onUpdate();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Une erreur est survenue lors de la suppression'
      );
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEntryToEdit(undefined);
    fetchEntries();
    fetchVehicle();
    onUpdate();
  };

  const getStationTypeLabel = (type?: string) => {
    const types: { [key: string]: string } = {
      PUBLIC: 'Station publique',
      PRIVATE: 'Station privée',
      HOME: 'Domicile'
    };
    return type ? types[type] || type : '-';
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des entrées...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  if (showForm) {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {entryToEdit ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
        </h3>
        <FuelEntryForm
          vehicleId={vehicleId}
          entryToEdit={entryToEdit}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEntryToEdit(undefined);
          }}
          currentMileage={vehicle?.currentMileage}
        />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Entrées de carburant</h3>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ajouter une entrée
          </button>
        </div>
        <p className="text-gray-500 text-center">Aucune entrée de carburant</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Entrées de carburant</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ajouter une entrée
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kilométrage
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité (L)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix/L
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coût (€)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id} className={entry.missedFillup ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(entry.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.mileage.toLocaleString('fr-FR')} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.quantity.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.unitPrice.toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.totalCost.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getStationTypeLabel(entry.stationType)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Modifier
                    </button>
                    {showDeleteConfirm === entry.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(entry.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 