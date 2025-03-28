import { Router } from 'express';
import vehicleController from '../controllers/vehicle.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes sont protégées par l'authentification
router.use(authenticate);

// Routes pour les véhicules
router.post('/', vehicleController.create);
router.get('/', vehicleController.getByUserId);
router.get('/:id', vehicleController.getById);
router.get('/:id/historical-max-mileage', vehicleController.getHistoricalMaxMileage);
router.put('/:id', vehicleController.update);
router.delete('/:id', vehicleController.delete);

export default router; 