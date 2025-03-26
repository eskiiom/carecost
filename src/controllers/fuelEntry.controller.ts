import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { getSystemDate, isDateInFuture } from '../config/systemDate';
import { validateFuelEntry } from '../validators/fuelEntry.validator';

export class FuelEntryController {
  // Créer une nouvelle entrée de carburant/recharge
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      
      // Valider les données
      const validationError = validateFuelEntry(data);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      // Créer l'entrée
      const newEntry = await prisma.fuelEntry.create({
        data: {
          ...data,
          date: new Date(data.date)
        }
      });

      // Mettre à jour le kilométrage du véhicule si c'est l'entrée la plus récente
      const isLatestEntry = await prisma.fuelEntry.count({
        where: {
          vehicleId: data.vehicleId,
          date: {
            gt: data.date
          }
        }
      }) === 0;

      if (isLatestEntry) {
        await prisma.vehicle.update({
          where: { id: data.vehicleId },
          data: { currentMileage: data.mileage }
        });
      }

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
      const validationError = validateFuelEntry(data);
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
      const updatedEntry = await prisma.fuelEntry.update({
        where: { id },
        data: {
          ...data,
          date: new Date(data.date)
        }
      });

      // Vérifier si c'est l'entrée la plus récente
      const isLatestEntry = await prisma.fuelEntry.count({
        where: {
          vehicleId: data.vehicleId,
          date: {
            gt: data.date
          }
        }
      }) === 0;

      if (isLatestEntry) {
        await prisma.vehicle.update({
          where: { id: data.vehicleId },
          data: { currentMileage: data.mileage }
        });
      } else if (existingEntry.mileage === (await prisma.vehicle.findUnique({ where: { id: data.vehicleId } }))?.currentMileage) {
        // Si l'entrée modifiée était la référence pour le currentMileage, mettre à jour avec la plus récente
        const latestEntry = await prisma.fuelEntry.findFirst({
          where: { vehicleId: data.vehicleId },
          orderBy: { date: 'desc' }
        });
        if (latestEntry) {
          await prisma.vehicle.update({
            where: { id: data.vehicleId },
            data: { currentMileage: latestEntry.mileage }
          });
        }
      }

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

      // 1. Récupérer l'entrée à supprimer pour avoir le vehicleId
      const entryToDelete = await prisma.fuelEntry.findUnique({
        where: { id },
        include: {
          vehicle: true
        }
      });

      if (!entryToDelete) {
        return res.status(404).json({ message: 'Entrée non trouvée' });
      }

      // 2. Vérifier si c'est l'entrée la plus récente
      const isLatestEntry = await prisma.fuelEntry.count({
        where: {
          vehicleId: entryToDelete.vehicleId,
          date: {
            gt: entryToDelete.date
          }
        }
      }) === 0;

      // 3. Si c'est la plus récente, nous devons mettre à jour le kilométrage du véhicule
      if (isLatestEntry) {
        // Trouver l'entrée de carburant précédente la plus récente
        const previousFuelEntry = await prisma.fuelEntry.findFirst({
          where: {
            vehicleId: entryToDelete.vehicleId,
            date: {
              lt: entryToDelete.date
            }
          },
          orderBy: {
            date: 'desc'
          }
        });

        // Trouver la maintenance la plus récente
        const latestMaintenance = await prisma.maintenanceEntry.findFirst({
          where: {
            vehicleId: entryToDelete.vehicleId,
            date: {
              lt: entryToDelete.date
            }
          },
          orderBy: {
            date: 'desc'
          }
        });

        // Déterminer le kilométrage le plus récent entre l'entrée de carburant et la maintenance
        let newCurrentMileage = entryToDelete.vehicle.initialMileage;
        
        if (previousFuelEntry && latestMaintenance) {
          newCurrentMileage = previousFuelEntry.date > latestMaintenance.date 
            ? previousFuelEntry.mileage 
            : latestMaintenance.mileage;
        } else if (previousFuelEntry) {
          newCurrentMileage = previousFuelEntry.mileage;
        } else if (latestMaintenance) {
          newCurrentMileage = latestMaintenance.mileage;
        }

        // Mettre à jour le véhicule avec le nouveau kilométrage
        await prisma.vehicle.update({
          where: { id: entryToDelete.vehicleId },
          data: { currentMileage: newCurrentMileage }
        });
      }

      // 4. Supprimer l'entrée
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