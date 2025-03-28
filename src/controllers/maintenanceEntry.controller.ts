import { Request, Response } from 'express';
import maintenanceEntryService from '../services/maintenanceEntry.service';

class MaintenanceEntryController {
  async create(req: Request, res: Response) {
    try {
      const { vehicleId, date, type, description, cost, mileage, providerName, forceMileageUpdate, notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ 
          message: 'Non authentifié',
          code: 'AUTH_REQUIRED'
        });
      }

      // Validation des champs obligatoires
      const missingFields = [];
      if (!vehicleId) missingFields.push('ID du véhicule');
      if (!date) missingFields.push('date');
      if (!type) missingFields.push('type');
      if (!description) missingFields.push('description');
      if (!cost) missingFields.push('coût');
      if (!mileage) missingFields.push('kilométrage');

      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Les champs suivants sont obligatoires : ${missingFields.join(', ')}`,
          code: 'MISSING_FIELDS',
          fields: missingFields
        });
      }

      // Validation des valeurs numériques
      if (isNaN(cost) || cost <= 0) {
        return res.status(400).json({ 
          message: 'Le coût doit être un nombre positif',
          code: 'INVALID_COST'
        });
      }

      if (isNaN(mileage) || mileage < 0) {
        return res.status(400).json({ 
          message: 'Le kilométrage doit être un nombre positif',
          code: 'INVALID_MILEAGE'
        });
      }

      // Validation de la date
      const entryDate = new Date(date);
      const now = new Date();
      if (entryDate > now) {
        return res.status(400).json({ 
          message: 'La date ne peut pas être dans le futur',
          code: 'INVALID_DATE'
        });
      }

      const maintenanceEntry = await maintenanceEntryService.create({
        vehicleId,
        date: entryDate,
        type,
        description,
        cost,
        mileage,
        userId,
        providerName,
        forceMileageUpdate,
        notes
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
      const { date, type, description, cost, mileage, providerName, forceMileageUpdate, notes } = req.body;

      if (!userId) {
        return res.status(401).json({ 
          message: 'Non authentifié',
          code: 'AUTH_REQUIRED'
        });
      }

      // Validation des valeurs numériques si fournies
      if (cost !== undefined && (isNaN(cost) || cost <= 0)) {
        return res.status(400).json({ 
          message: 'Le coût doit être un nombre positif',
          code: 'INVALID_COST'
        });
      }

      if (mileage !== undefined && (isNaN(mileage) || mileage < 0)) {
        return res.status(400).json({ 
          message: 'Le kilométrage doit être un nombre positif',
          code: 'INVALID_MILEAGE'
        });
      }

      // Validation de la date si fournie
      if (date) {
        const entryDate = new Date(date);
        const now = new Date();
        if (entryDate > now) {
          return res.status(400).json({ 
            message: 'La date ne peut pas être dans le futur',
            code: 'INVALID_DATE'
          });
        }
      }

      const updatedEntry = await maintenanceEntryService.update(id, {
        date: date ? new Date(date) : undefined,
        type,
        description,
        cost,
        mileage,
        userId,
        providerName,
        forceMileageUpdate,
        notes
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