import { Router } from 'express';
import consumptionStatisticsController from '../controllers/consumptionStatistics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Obtenir les statistiques générales d'un véhicule
router.get('/vehicle/:vehicleId', consumptionStatisticsController.getVehicleStats);

// Obtenir les statistiques mensuelles d'un véhicule
router.get('/vehicle/:vehicleId/monthly', consumptionStatisticsController.getMonthlyStats);

// Obtenir les statistiques annuelles d'un véhicule
router.get('/vehicle/:vehicleId/yearly', consumptionStatisticsController.getYearlyStats);

// Obtenir l'historique de consommation d'un véhicule
router.get('/vehicle/:vehicleId/history', consumptionStatisticsController.getConsumptionHistory);

// Comparer deux périodes pour un véhicule
router.post('/vehicle/:vehicleId/compare', consumptionStatisticsController.comparePeriods);

export default router; 