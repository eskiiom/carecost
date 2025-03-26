import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ConsumptionData {
  month: string;
  averageConsumption: number;
  totalCost: number;
  totalQuantity: number;
  totalDistance: number;
}

interface ConsumptionChartProps {
  data: ConsumptionData[];
}

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data }) => {
  // Formater les mois pour l'affichage (ex: "2025-01" -> "Janvier 2025")
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const chartData = {
    labels: data.map(entry => formatMonth(entry.month)),
    datasets: [
      {
        type: 'line' as const,
        label: 'Consommation (L/100 km)',
        data: data.map(entry => entry.averageConsumption),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e',
        borderWidth: 2,
        pointStyle: 'rectRot' as const,
        pointRadius: 5,
        pointBackgroundColor: '#22c55e',
        yAxisID: 'consumption',
        tension: 0.4,
      },
      {
        type: 'bar' as const,
        label: 'Dépense (€/mois)',
        data: data.map(entry => entry.totalCost),
        backgroundColor: 'rgba(244, 114, 182, 0.5)',
        borderColor: 'rgba(244, 114, 182, 0.8)',
        yAxisID: 'cost',
        order: 3,
        pointStyle: 'rect' as const,
      },
      {
        type: 'line' as const,
        label: 'Carburant utilisé (L/mois)',
        data: data.map(entry => entry.totalQuantity),
        borderColor: 'rgba(96, 165, 250, 0.8)',
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        borderWidth: 1,
        pointStyle: 'triangle' as const,
        pointRadius: 4,
        fill: true,
        yAxisID: 'consumption',
        order: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Graphique de Consommation',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: 20
      },
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          },
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset: any, i: number) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: dataset.borderWidth,
              pointStyle: dataset.pointStyle || (dataset.type === 'bar' ? 'rect' : 'circle'),
              hidden: !chart.isDatasetVisible(i),
              index: i
            }));
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      consumption: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'L/100km - Litres',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        min: 0
      },
      cost: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '€',
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        },
        min: 0
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}; 