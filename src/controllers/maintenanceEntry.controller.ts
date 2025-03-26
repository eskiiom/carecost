import { Request, Response } from 'express';
import maintenanceEntryService from '../services/maintenanceEntry.service';

class MaintenanceEntryController {
  async create(req: Request, res: Response) {
    try {
      const { vehicleId, date, type, description, cost, mileage, providerName, forceMileageUpdate } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
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
          message: `Les champs suivants sont obligatoires : ${missingFields.join(', ')}`
        });
      }

      // Validation des valeurs numériques
      if (isNaN(cost) || cost <= 0) {
        return res.status(400).json({ 
          message: 'Le coût doit être un nombre positif'
        });
      }

      if (isNaN(mileage) || mileage < 0) {
        return res.status(400).json({ 
          message: 'Le kilométrage doit être un nombre positif'
        });
      }

      // Validation de la date
      const entryDate = new Date(date);
      const now = new Date();
      if (entryDate > now) {
        return res.status(400).json({ 
          message: 'La date ne peut pas être dans le futur'
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
        forceMileageUpdate
      });

      res.status(201).json(maintenanceEntry);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue lors de la création de l\'entrée de maintenance' });
      }
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
      const { date, type, description, cost, mileage, providerName, forceMileageUpdate } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      // Validation des valeurs numériques
      if (cost && (isNaN(cost) || cost <= 0)) {
        return res.status(400).json({ 
          message: 'Le coût doit être un nombre positif'
        });
      }

      if (mileage && (isNaN(mileage) || mileage < 0)) {
        return res.status(400).json({ 
          message: 'Le kilométrage doit être un nombre positif'
        });
      }

      // Validation de la date
      if (date) {
        const entryDate = new Date(date);
        const now = new Date();
        if (entryDate > now) {
          return res.status(400).json({ 
            message: 'La date ne peut pas être dans le futur'
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
        forceMileageUpdate
      });

      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de l\'entrée de maintenance' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      await maintenanceEntryService.delete(id, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue lors de la suppression de l\'entrée de maintenance' });
      }
    }
  }
}

export default new MaintenanceEntryController(); 