import { Router } from 'express';
import { FuelController } from '../controllers/fuel.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes protégées par authentification
router.use(authenticate);

// Récupérer les carburants disponibles pour un type d'énergie
router.get('/:energyType', FuelController.getFuelTypes);

// Valider la compatibilité d'un carburant
router.post('/validate', FuelController.validateFuelType);

export default router; 