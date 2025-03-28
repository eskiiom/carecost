import { Request, Response } from 'express';
import maintenanceEntryService from '../services/maintenanceEntry.service';
import { validateMaintenanceEntry } from '../validators/maintenanceEntry.validator';

class MaintenanceEntryController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ 
          message: 'Non authentifié',
          code: 'AUTH_REQUIRED'
        });
      }

      // Valider les données
      const validationError = await validateMaintenanceEntry({ ...data, userId }, false);
      if (validationError) {
        return res.status(400).json({ 
          message: validationError,
          code: 'VALIDATION_ERROR'
        });
      }

      const maintenanceEntry = await maintenanceEntryService.create({
        ...data,
        userId
      });

      return res.status(201).json({
        message: 'Entrée de maintenance créée avec succès',
        data: maintenanceEntry
      });
    } catch (error) {
      console.error('[MaintenanceController] Erreur lors de la création:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('non trouvé') || error.message.includes('non autorisé')) {
          return res.status(404).json({ 
            message: error.message,
            code: 'NOT_FOUND'
          });
        }
        if (error.message.includes('kilométrage')) {
          return res.status(400).json({ 
            message: error.message,
            code: 'INVALID_MILEAGE'
          });
        }
        return res.status(400).json({ 
          message: error.message,
          code: 'VALIDATION_ERROR'
        });
      }
      
      return res.status(500).json({ 
        message: 'Une erreur est survenue lors de la création de l\'entrée de maintenance',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async getByVehicleId(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const maintenanceEntries = await maintenanceEntryService.findByVehicleId(vehicleId, userId);
      res.json(maintenanceEntries);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des entrées de maintenance' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const data = req.body;

      if (!userId) {
        return res.status(401).json({ 
          message: 'Non authentifié',
          code: 'AUTH_REQUIRED'
        });
      }

      // Valider les données en mode mise à jour
      const validationError = await validateMaintenanceEntry({ ...data, userId }, true);
      if (validationError) {
        return res.status(400).json({ 
          message: validationError,
          code: 'VALIDATION_ERROR'
        });
      }

      const updatedEntry = await maintenanceEntryService.update(id, {
        ...data,
        userId
      });

      return res.json({
        message: 'Entrée de maintenance mise à jour avec succès',
        data: updatedEntry
      });
    } catch (error) {
      console.error('[MaintenanceController] Erreur lors de la mise à jour:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('non trouvé') || error.message.includes('non autorisé')) {
          return res.status(404).json({ 
            message: error.message,
            code: 'NOT_FOUND'
          });
        }
        if (error.message.includes('kilométrage')) {
          return res.status(400).json({ 
            message: error.message,
            code: 'INVALID_MILEAGE'
          });
        }
        return res.status(400).json({ 
          message: error.message,
          code: 'VALIDATION_ERROR'
        });
      }
      
      return res.status(500).json({ 
        message: 'Une erreur est survenue lors de la mise à jour de l\'entrée de maintenance',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ 
          message: 'Non authentifié',
          code: 'AUTH_REQUIRED'
        });
      }

      await maintenanceEntryService.delete(id, userId);
      return res.status(204).send();
    } catch (error) {
      console.error('[MaintenanceController] Erreur lors de la suppression:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('non trouvé') || error.message.includes('non autorisé')) {
          return res.status(404).json({ 
            message: error.message,
            code: 'NOT_FOUND'
          });
        }
        return res.status(400).json({ 
          message: error.message,
          code: 'VALIDATION_ERROR'
        });
      }
      
      return res.status(500).json({ 
        message: 'Une erreur est survenue lors de la suppression de l\'entrée de maintenance',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

export default new MaintenanceEntryController(); 