import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MaintenanceForm } from './MaintenanceForm';

interface MaintenanceEntry {
  id: string;
  date: string;
  mileage: number;
  description: string;
  cost: number;
  type: string;
  notes?: string;
}

interface MaintenanceListProps {
  vehicleId: string;
  onVehicleUpdate?: () => void;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  description: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  description
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer cette maintenance ?
          <br />
          <span className="font-medium">{description}</span>
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export const MaintenanceList: React.FC<MaintenanceListProps> = ({ 
  vehicleId,
  onVehicleUpdate
}) => {
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MaintenanceEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MaintenanceEntry | null>(null);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      const response = await axios.get<MaintenanceEntry[]>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${vehicleId}/maintenance`,
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
      console.error('Erreur lors de la récupération des maintenances:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Une erreur est survenue lors de la récupération des maintenances'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [vehicleId]);

  const handleDeleteClick = (entry: MaintenanceEntry) => {
    setSelectedEntry(entry);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/vehicles/${vehicleId}/maintenance/${selectedEntry.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Rafraîchir la liste
      await fetchEntries();
      setDeleteModalOpen(false);
      setSelectedEntry(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Une erreur est survenue lors de la suppression de la maintenance'
      );
    }
  };

  const handleEditClick = (entry: MaintenanceEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingEntry(null);
  };

  const handleEditSuccess = () => {
    handleEditClose();
    fetchEntries();
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des maintenances...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center py-4 text-gray-500">Aucune maintenance enregistrée</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getMaintenanceTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      ROUTINE: 'Entretien de routine',
      REPAIR: 'Réparation',
      TECHNICAL_CHECK: 'Contrôle technique',
      TIRES: 'Pneumatiques',
      OTHER: 'Autre'
    };
    return types[type] || type;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kilométrage
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coût (€)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(entry.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getMaintenanceTypeLabel(entry.type)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {entry.description}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                  {entry.notes || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.mileage.toLocaleString('fr-FR')} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.cost.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEditClick(entry)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteClick(entry)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedEntry(null);
        }}
        onConfirm={handleDeleteConfirm}
        description={selectedEntry ? `${getMaintenanceTypeLabel(selectedEntry.type)} - ${selectedEntry.description}` : ''}
      />

      {isEditModalOpen && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Modifier la maintenance</h2>
              <button
                onClick={handleEditClose}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <MaintenanceForm
              vehicleId={vehicleId}
              onSuccess={handleEditSuccess}
              onCancel={handleEditClose}
              initialData={editingEntry}
              onVehicleUpdate={onVehicleUpdate}
            />
          </div>
        </div>
      )}
    </>
  );
}; 