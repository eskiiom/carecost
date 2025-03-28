import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDTO, LoginDTO, ResetPasswordDTO, UpdatePasswordDTO } from '../types/auth.types';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data: RegisterDTO = req.body;
      const result = await AuthService.register(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Une erreur est survenue' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data: LoginDTO = req.body;
      const result = await AuthService.login(data);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'Email ou mot de passe incorrect' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const data: ResetPasswordDTO = req.body;
      await AuthService.resetPassword(data);
      res.json({ message: 'Si l\'adresse email existe, un lien de réinitialisation a été envoyé' });
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue lors de la réinitialisation du mot de passe' });
    }
  }

  static async updatePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const data: UpdatePasswordDTO = req.body;
      await AuthService.updatePassword(userId, data);
      res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Une erreur est survenue' });
    }
  }
} 