import { Router } from 'express';
import fuelEntryController from '../controllers/fuelEntry.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer une nouvelle entrée de carburant/recharge
router.post('/', fuelEntryController.create);

// Obtenir toutes les entrées de carburant/recharge d'un véhicule
router.get('/vehicle/:vehicleId', fuelEntryController.getByVehicleId);

// Mettre à jour une entrée de carburant/recharge
router.put('/:id', fuelEntryController.update);

// Supprimer une entrée de carburant/recharge
router.delete('/:id', fuelEntryController.delete);

export default router; 