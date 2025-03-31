import { Request, Response } from 'express';
import { UserPreferencesService } from '../services/userPreferences.service';

export class UserPreferencesController {
  static async getPreferences(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const preferences = await UserPreferencesService.getPreferences(req.user.id);
      res.json(preferences);
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des préférences' });
    }
  }

  static async updatePreferences(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const preferences = await UserPreferencesService.updatePreferences(req.user.id, req.body);
      res.json(preferences);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour des préférences' });
    }
  }
} 