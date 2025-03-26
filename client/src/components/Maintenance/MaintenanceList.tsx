import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
}

export const MaintenanceList: React.FC<MaintenanceListProps> = ({ vehicleId }) => {
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Non authentifié');
          return;
        }

        const response = await axios.get<MaintenanceEntry[]>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/maintenance-entries/vehicle/${vehicleId}`,
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

    fetchEntries();
  }, [vehicleId]);

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
      OIL_CHANGE: 'Vidange',
      TIRES: 'Pneumatiques',
      BRAKES: 'Freins',
      BATTERY: 'Batterie',
      FILTERS: 'Filtres',
      TIMING_BELT: 'Courroie de distribution',
      OTHER: 'Autre'
    };
    return types[type] || type;
  };

  return (
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
              Kilométrage
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Co&ucirc;t (€)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.mileage.toLocaleString('fr-FR')} km
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.cost.toFixed(2)} €
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {entry.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 