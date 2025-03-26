import { Request, Response } from 'express';
import consumptionStatisticsService from '../services/consumptionStatistics.service';

class ConsumptionStatisticsController {
  async getVehicleStats(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const stats = await consumptionStatisticsService.getVehicleStats(
        vehicleId,
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      if (!stats) {
        return res.status(404).json({ 
          message: 'Pas assez de données pour calculer les statistiques' 
        });
      }

      res.json(stats);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Une erreur est survenue lors du calcul des statistiques' 
        });
      }
    }
  }

  async getMonthlyStats(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { year, month } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      if (!year || !month) {
        return res.status(400).json({ 
          message: 'L\'année et le mois sont requis' 
        });
      }

      const stats = await consumptionStatisticsService.getMonthlyStats(
        vehicleId,
        userId,
        parseInt(year as string),
        parseInt(month as string)
      );

      if (!stats) {
        return res.status(404).json({ 
          message: 'Pas assez de données pour calculer les statistiques mensuelles' 
        });
      }

      res.json(stats);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Une erreur est survenue lors du calcul des statistiques mensuelles' 
        });
      }
    }
  }

  async getYearlyStats(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { year } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      if (!year) {
        return res.status(400).json({ 
          message: 'L\'année est requise' 
        });
      }

      const stats = await consumptionStatisticsService.getYearlyStats(
        vehicleId,
        userId,
        parseInt(year as string)
      );

      if (!stats) {
        return res.status(404).json({ 
          message: 'Pas assez de données pour calculer les statistiques annuelles' 
        });
      }

      res.json(stats);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Une erreur est survenue lors du calcul des statistiques annuelles' 
        });
      }
    }
  }

  async comparePeriods(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Les dates de début et de fin sont requises' 
        });
      }

      const comparison = await consumptionStatisticsService.comparePeriods(
        vehicleId,
        userId,
        new Date(startDate),
        new Date(endDate)
      );

      if (!comparison) {
        return res.status(404).json({ 
          message: 'Pas assez de données pour comparer les périodes' 
        });
      }

      res.json(comparison);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Une erreur est survenue lors de la comparaison des périodes' 
        });
      }
    }
  }

  async getConsumptionHistory(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Les dates de début et de fin sont requises' 
        });
      }

      const history = await consumptionStatisticsService.getConsumptionHistory(
        vehicleId,
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      if (!history || history.length === 0) {
        return res.status(404).json({ 
          message: 'Pas assez de données pour générer l\'historique' 
        });
      }

      res.json(history);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Une erreur est survenue lors de la récupération de l\'historique' 
        });
      }
    }
  }
}

const consumptionStatisticsController = new ConsumptionStatisticsController();
export default consumptionStatisticsController; 