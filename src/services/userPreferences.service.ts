import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserPreferences {
  vehicleViewMode: string;
  // Ajouter d'autres préférences ici si besoin
}

export class UserPreferencesService {
  static async getPreferences(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Si l'utilisateur n'a pas encore de préférences, retourner les valeurs par défaut
      return user.preferences || { vehicleViewMode: 'grid' };
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      throw error;
    }
  }

  static async updatePreferences(userId: string, preferences: UserPreferences) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: preferences as unknown as Prisma.InputJsonValue
        },
        select: { preferences: true }
      });

      return updatedUser.preferences;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }
} 