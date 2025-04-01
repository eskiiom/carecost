import { Request, Response } from 'express';
import { FuelService } from '../services/fuel.service';
import { EnergyType } from '@prisma/client';

export class FuelController {
  /**
   * Récupère les carburants disponibles pour un type d'énergie
   */
  static async getFuelTypes(req: Request, res: Response) {
    try {
      const { energyType } = req.params;
      
      if (!Object.values(EnergyType).includes(energyType as EnergyType)) {
        return res.status(400).json({ error: 'Type d\'énergie invalide' });
      }

      const fuelTypes = await FuelService.getFuelTypesByEnergyType(energyType as EnergyType);
      res.json(fuelTypes);
    } catch (error) {
      console.error('Erreur lors de la récupération des carburants:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  /**
   * Vérifie la compatibilité d'un carburant avec un type d'énergie
   */
  static async validateFuelType(req: Request, res: Response) {
    try {
      const { fuelTypeId, vehicleEnergyType } = req.body;

      if (!fuelTypeId || !vehicleEnergyType) {
        return res.status(400).json({ error: 'Paramètres manquants' });
      }

      if (!Object.values(EnergyType).includes(vehicleEnergyType as EnergyType)) {
        return res.status(400).json({ error: 'Type d\'énergie invalide' });
      }

      const isValid = await FuelService.validateFuelType(fuelTypeId, vehicleEnergyType as EnergyType);
      res.json({ isValid });
    } catch (error) {
      console.error('Erreur lors de la validation du carburant:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
} 