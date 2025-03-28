import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { getSystemDate, isDateInFuture } from '../config/systemDate';
import { validateFuelEntry } from '../validators/fuelEntry.validator';
import vehicleService from '../services/vehicle.service';

export class FuelEntryController {
  // Créer une nouvelle entrée de carburant/recharge
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      console.log('Données reçues:', data);
      console.log('Headers:', req.headers);
      
      // Valider les données
      const validationError = await validateFuelEntry(data);
      if (validationError) {
        console.log('Erreur de validation:', validationError);
        return res.status(400).json({ message: validationError });
      }

      // Créer l'entrée
      const { forceMileageUpdate, missedFillup, ...prismaData } = data;
      const newEntry = await prisma.fuelEntry.create({
        data: {
          ...prismaData,
          date: new Date(data.date)
        }
      });

      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Erreur lors de la création de l\'entrée:', error);
      res.status(500).json({ 
        message: 'Une erreur est survenue lors de la création de l\'entrée',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
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

      // Vérifier que le véhicule appartient à l'utilisateur
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId
        }
      });

      if (!vehicle) {
        return res.status(404).json({ message: 'Véhicule non trouvé' });
      }

      const fuelEntries = await prisma.fuelEntry.findMany({
        where: {
          vehicleId,
          vehicle: {
            userId
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      res.json(fuelEntries);
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des entrées de carburant' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Valider les données
      const validationError = await validateFuelEntry(data);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      // Récupérer l'entrée existante
      const existingEntry = await prisma.fuelEntry.findUnique({
        where: { id }
      });

      if (!existingEntry) {
        return res.status(404).json({ message: 'Entrée non trouvée' });
      }

      // Mettre à jour l'entrée
      const { forceMileageUpdate, missedFillup, ...updateData } = data;
      const updatedEntry = await prisma.fuelEntry.update({
        where: { id },
        data: {
          ...updateData,
          date: new Date(data.date)
        }
      });

      res.json(updatedEntry);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entrée:', error);
      res.status(500).json({ 
        message: 'Une erreur est survenue lors de la mise à jour de l\'entrée',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      // Vérifier que l'entrée existe et appartient à l'utilisateur
      const entryToDelete = await prisma.fuelEntry.findFirst({
        where: {
          id,
          vehicle: {
            userId
          }
        },
        include: {
          vehicle: true
        }
      });

      if (!entryToDelete) {
        return res.status(404).json({ message: 'Entrée non trouvée ou non autorisée' });
      }

      // Supprimer l'entrée
      await prisma.fuelEntry.delete({
        where: { id }
      });

      res.json({ message: 'Entrée supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée:', error);
      res.status(500).json({ 
        message: 'Une erreur est survenue lors de la suppression de l\'entrée',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}

export default new FuelEntryController(); 
