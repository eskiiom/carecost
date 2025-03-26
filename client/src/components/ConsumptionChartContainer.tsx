import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ConsumptionChart } from './ConsumptionChart';

interface ConsumptionData {
  month: string;
  averageConsumption: number;
  totalCost: number;
  totalQuantity: number;
  totalDistance: number;
}

interface ConsumptionChartContainerProps {
  vehicleId: string;
}

// Fonction utilitaire pour obtenir la date système (26 mars 2024)
const getSystemDate = (): Date => {
  const now = new Date();
  now.setFullYear(2024);
  now.setMonth(2); // 0-based index, 2 = mars
  now.setDate(26);
  return now;
};

export const ConsumptionChartContainer: React.FC<ConsumptionChartContainerProps> = ({ vehicleId }) => {
  const [data, setData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculer les dates pour les 12 derniers mois
        const endDate = getSystemDate();
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 12);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Non authentifié');
          return;
        }

        const response = await axios.get<ConsumptionData[]>(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/statistics/vehicle/${vehicleId}/history`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            params: {
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0]
            }
          }
        );

        // Filtrer les données pour ne garder que les mois avec des données
        const filteredData = response.data.filter(
          entry => entry.averageConsumption > 0 || entry.totalCost > 0
        );

        setData(filteredData);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Une erreur est survenue lors de la récupération des données'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-4">Aucune donnée disponible pour la période sélectionnée</div>;
  }

  return <ConsumptionChart data={data} />;
}; 