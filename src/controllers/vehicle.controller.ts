import { Request, Response } from 'express';
import vehicleService from '../services/vehicle.service';
import { getSystemDate } from '../config/systemDate';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Définition des énumérations localement
enum EnergyType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  GPL = 'GPL',
  HYBRID_GASOLINE = 'HYBRID_GASOLINE',
  HYBRID_DIESEL = 'HYBRID_DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYDROGEN = 'HYDROGEN'
}

enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  SOFT_DELETED = 'SOFT_DELETED'
}

enum MaintenanceFrequency {
  ANNUAL = 'ANNUAL',
  BIENNIAL = 'BIENNIAL',
  EVERY_15000KM = 'EVERY_15000KM',
  EVERY_20000KM = 'EVERY_20000KM',
  EVERY_30000KM = 'EVERY_30000KM'
}

class VehicleController {
  async create(req: Request, res: Response) {
    try {
      const { brand, model, year, licensePlate, vin, mileage, energyType, productionDate, acquisitionDate, initialMileage, powerDIN, powerHP, batterySize, lastTechnicalCheck, lastMaintenanceDone, maintenanceFrequency, status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      // Validation des champs obligatoires avec messages spécifiques
      const missingFields = [];
      if (!brand) missingFields.push('marque');
      if (!model) missingFields.push('modèle');
      if (!year) missingFields.push('année');
      if (!licensePlate) missingFields.push('immatriculation');
      if (!energyType) missingFields.push('type d\'énergie');

      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Les champs suivants sont obligatoires : ${missingFields.join(', ')}`
        });
      }

      // Validation du type d'énergie
      if (!Object.values(EnergyType).includes(energyType)) {
        return res.status(400).json({ 
          message: 'Type d\'énergie invalide',
          validTypes: Object.values(EnergyType)
        });
      }

      // Validation du statut
      if (status && !Object.values(VehicleStatus).includes(status)) {
        return res.status(400).json({ 
          message: 'Statut de véhicule invalide',
          validStatuses: Object.values(VehicleStatus)
        });
      }

      // Validation de la fréquence de maintenance
      if (maintenanceFrequency && !Object.values(MaintenanceFrequency).includes(maintenanceFrequency)) {
        return res.status(400).json({ 
          message: 'Fréquence de maintenance invalide',
          validFrequencies: Object.values(MaintenanceFrequency)
        });
      }

      // Validation de l'année
      const systemDate = getSystemDate();
      if (year < 1900 || year > systemDate.getFullYear() + 1) {
        return res.status(400).json({ 
          message: `L'année doit être comprise entre 1900 et ${systemDate.getFullYear() + 1}`
        });
      }

      // Validation des dates
      const now = getSystemDate();
      console.log('Date actuelle:', now);
      
      const dates = {
        productionDate: productionDate ? new Date(productionDate) : undefined,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : undefined,
        lastTechnicalCheck: lastTechnicalCheck ? new Date(lastTechnicalCheck) : undefined,
        lastMaintenanceDone: lastMaintenanceDone ? new Date(lastMaintenanceDone) : undefined
      };

      console.log('Dates reçues:', dates);

      // Vérifier que les dates sont dans le passé
      if (dates.productionDate && dates.productionDate > now) {
        console.log('Erreur: Date de production dans le futur');
        return res.status(400).json({ 
          message: 'La date de production ne peut pas être dans le futur'
        });
      }

      if (dates.acquisitionDate && dates.acquisitionDate > now) {
        console.log('Erreur: Date d\'acquisition dans le futur');
        return res.status(400).json({ 
          message: 'La date d\'acquisition ne peut pas être dans le futur'
        });
      }

      if (dates.lastTechnicalCheck && dates.lastTechnicalCheck > now) {
        console.log('Erreur: Date de révision technique dans le futur');
        return res.status(400).json({ 
          message: 'La date de dernière révision technique ne peut pas être dans le futur'
        });
      }

      if (dates.lastMaintenanceDone && dates.lastMaintenanceDone > now) {
        console.log('Erreur: Date de maintenance dans le futur');
        return res.status(400).json({ 
          message: 'La date de dernière maintenance ne peut pas être dans le futur'
        });
      }

      // Vérifier que la date de production n'est pas après la date d'acquisition
      if (dates.productionDate && dates.acquisitionDate && dates.productionDate > dates.acquisitionDate) {
        console.log('Erreur: Date de production après date d\'acquisition');
        return res.status(400).json({ 
          message: 'La date de production ne peut pas être postérieure à la date d\'acquisition'
        });
      }

      // Vérifier que la date de dernière maintenance n'est pas antérieure à la date de production
      if (dates.lastMaintenanceDone && dates.productionDate && dates.lastMaintenanceDone < dates.productionDate) {
        console.log('Erreur: Date de maintenance avant date de production');
        return res.status(400).json({ 
          message: 'La date de dernière maintenance ne peut pas être antérieure à la date de production'
        });
      }

      console.log('Toutes les validations de dates ont réussi');

      const vehicle = await vehicleService.create({
        brand,
        model,
        year,
        licensePlate,
        vin,
        mileage,
        energyType,
        userId,
        productionDate,
        acquisitionDate,
        initialMileage,
        powerDIN,
        powerHP,
        batterySize,
        lastTechnicalCheck,
        lastMaintenanceDone,
        maintenanceFrequency,
        status
      });

      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('Unique constraint failed on the fields: (`vin`)')) {
          return res.status(400).json({ message: 'Un véhicule avec ce numéro VIN existe déjà' });
        }
        if (errorMessage.includes('Unique constraint failed on the fields: (`licensePlate`)')) {
          return res.status(400).json({ message: 'Un véhicule avec cette immatriculation existe déjà' });
        }
        res.status(400).json({ message: errorMessage });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue lors de la création du véhicule' });
      }
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const vehicle = await vehicleService.findById(id);

      if (!vehicle) {
        return res.status(404).json({ message: 'Véhicule non trouvé' });
      }

      if (vehicle.userId !== userId) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du véhicule' });
    }
  }

  async getByUserId(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const vehicles = await vehicleService.findByUserId(userId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des véhicules' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { brand, model, year, licensePlate, vin, mileage, energyType, productionDate, acquisitionDate, initialMileage, powerDIN, powerHP, batterySize, lastTechnicalCheck, lastMaintenanceDone, maintenanceFrequency, status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const vehicle = await vehicleService.findById(id);

      if (!vehicle) {
        return res.status(404).json({ message: 'Véhicule non trouvé' });
      }

      if (vehicle.userId !== userId) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      // Validation du type d'énergie
      if (energyType && !Object.values(EnergyType).includes(energyType)) {
        return res.status(400).json({ 
          message: 'Type d\'énergie invalide',
          validTypes: Object.values(EnergyType)
        });
      }

      // Validation du statut
      if (status && !Object.values(VehicleStatus).includes(status)) {
        return res.status(400).json({ 
          message: 'Statut de véhicule invalide',
          validStatuses: Object.values(VehicleStatus)
        });
      }

      // Validation de la fréquence de maintenance
      if (maintenanceFrequency && !Object.values(MaintenanceFrequency).includes(maintenanceFrequency)) {
        return res.status(400).json({ 
          message: 'Fréquence de maintenance invalide',
          validFrequencies: Object.values(MaintenanceFrequency)
        });
      }

      // Validation de l'année
      const systemDate = getSystemDate();
      if (year && (year < 1900 || year > systemDate.getFullYear() + 1)) {
        return res.status(400).json({ 
          message: `L'année doit être comprise entre 1900 et ${systemDate.getFullYear() + 1}`
        });
      }

      // Validation des dates
      const now = getSystemDate();
      console.log('Date actuelle:', now);
      
      const dates = {
        productionDate: productionDate ? new Date(productionDate) : undefined,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : undefined,
        lastTechnicalCheck: lastTechnicalCheck ? new Date(lastTechnicalCheck) : undefined,
        lastMaintenanceDone: lastMaintenanceDone ? new Date(lastMaintenanceDone) : undefined
      };

      console.log('Dates reçues:', dates);

      // Vérifier que les dates sont dans le passé
      if (dates.productionDate && dates.productionDate > now) {
        console.log('Erreur: Date de production dans le futur');
        return res.status(400).json({ 
          message: 'La date de production ne peut pas être dans le futur'
        });
      }

      if (dates.acquisitionDate && dates.acquisitionDate > now) {
        console.log('Erreur: Date d\'acquisition dans le futur');
        return res.status(400).json({ 
          message: 'La date d\'acquisition ne peut pas être dans le futur'
        });
      }

      if (dates.lastTechnicalCheck && dates.lastTechnicalCheck > now) {
        console.log('Erreur: Date de révision technique dans le futur');
        return res.status(400).json({ 
          message: 'La date de dernière révision technique ne peut pas être dans le futur'
        });
      }

      if (dates.lastMaintenanceDone && dates.lastMaintenanceDone > now) {
        console.log('Erreur: Date de maintenance dans le futur');
        return res.status(400).json({ 
          message: 'La date de dernière maintenance ne peut pas être dans le futur'
        });
      }

      // Vérifier que la date de production n'est pas après la date d'acquisition
      if (dates.productionDate && dates.acquisitionDate && dates.productionDate > dates.acquisitionDate) {
        console.log('Erreur: Date de production après date d\'acquisition');
        return res.status(400).json({ 
          message: 'La date de production ne peut pas être postérieure à la date d\'acquisition'
        });
      }

      // Vérifier que la date de dernière maintenance n'est pas antérieure à la date de production
      if (dates.lastMaintenanceDone && dates.productionDate && dates.lastMaintenanceDone < dates.productionDate) {
        console.log('Erreur: Date de maintenance avant date de production');
        return res.status(400).json({ 
          message: 'La date de dernière maintenance ne peut pas être antérieure à la date de production'
        });
      }

      console.log('Toutes les validations de dates ont réussi');

      const updateData = {
        brand,
        model,
        year,
        licensePlate,
        vin,
        mileage,
        energyType,
        productionDate,
        acquisitionDate,
        initialMileage,
        powerDIN,
        powerHP,
        batterySize,
        lastTechnicalCheck,
        lastMaintenanceDone,
        maintenanceFrequency,
        status
      };

      const updatedVehicle = await vehicleService.update(id, updateData);

      res.json(updatedVehicle);
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('Un véhicule avec ce numéro VIN existe déjà')) {
          return res.status(400).json({ message: errorMessage });
        }
        if (errorMessage.includes('Un véhicule avec cette immatriculation existe déjà')) {
          return res.status(400).json({ message: errorMessage });
        }
        res.status(400).json({ message: errorMessage });
      } else {
        res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour du véhicule' });
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

      const vehicle = await vehicleService.findById(id);

      if (!vehicle) {
        return res.status(404).json({ message: 'Véhicule non trouvé' });
      }

      if (vehicle.userId !== userId) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      await vehicleService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du véhicule' });
    }
  }

  async getHistoricalMaxMileage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ 
          message: 'Non authentifié',
          code: 'AUTH_REQUIRED'
        });
      }

      // Vérifier que le véhicule appartient à l'utilisateur
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!vehicle) {
        return res.status(404).json({ 
          message: 'Véhicule non trouvé ou non autorisé',
          code: 'NOT_FOUND'
        });
      }

      const maxMileage = await vehicleService.getHistoricalMaxMileage(id);
      
      return res.json({
        historicalMaxMileage: maxMileage
      });
    } catch (error) {
      console.error('[VehicleController] Erreur lors de la récupération du kilométrage maximum:', error);
      return res.status(500).json({ 
        message: 'Une erreur est survenue lors de la récupération du kilométrage maximum',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

export default new VehicleController(); 