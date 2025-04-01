import { Router } from 'express';
import maintenanceEntryController from '../controllers/maintenanceEntry.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer une nouvelle entrée de maintenance
router.post('/', maintenanceEntryController.create);

// Obtenir toutes les entrées de maintenance d'un véhicule
router.get('/', maintenanceEntryController.getByVehicleId);

// Mettre à jour une entrée de maintenance
router.put('/:id', maintenanceEntryController.update);

// Supprimer une entrée de maintenance
router.delete('/:id', maintenanceEntryController.delete);

export default router; 