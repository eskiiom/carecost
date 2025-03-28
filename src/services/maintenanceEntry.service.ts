import { PrismaClient, MaintenanceType } from '@prisma/client';

const prisma = new PrismaClient();

interface VehicleUpdateData {
  mileage?: number;
  lastTechnicalCheck?: Date;
  nextTechnicalCheck?: Date;
  currentMileage?: number;
}

class MaintenanceEntryService {
  private calculateNextTechnicalCheckDate(currentCheckDate: Date): Date {
    const nextDate = new Date(currentCheckDate);
    nextDate.setFullYear(nextDate.getFullYear() + 2); // Contrôle technique tous les 2 ans
    return nextDate;
  }

  private validateMaintenanceType(type: MaintenanceType): boolean {
    return Object.values(MaintenanceType).includes(type);
  }

  private async validateVehicleOwnership(vehicleId: string, userId: string): Promise<boolean> {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: userId
      }
    });
    return !!vehicle;
  }

  async create(data: {
    vehicleId: string;
    date: Date;
    type: MaintenanceType;
    description: string;
    cost: number;
    mileage: number;
    userId: string;
    providerName?: string;
    forceMileageUpdate?: boolean;
  }) {
    console.log(`[MaintenanceService] Création d'une nouvelle entrée de maintenance pour le véhicule ${data.vehicleId}`);

    // Validation du type de maintenance
    if (!this.validateMaintenanceType(data.type)) {
      throw new Error(`Type de maintenance invalide: ${data.type}`);
    }

    // Vérification de la propriété du véhicule
    const isOwner = await this.validateVehicleOwnership(data.vehicleId, data.userId);
    if (!isOwner) {
      throw new Error('Véhicule non trouvé ou non autorisé');
    }

    // Récupération du véhicule
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId }
    });

    if (!vehicle) {
      throw new Error('Véhicule non trouvé');
    }

    // Validation du kilométrage
    if (data.mileage < 0) {
      throw new Error('Le kilométrage ne peut pas être négatif');
    }

    if (!data.forceMileageUpdate && vehicle.currentMileage && data.mileage < vehicle.currentMileage) {
      throw new Error('Le kilométrage ne peut pas être inférieur au kilométrage actuel du véhicule');
    }

    // Validation du coût
    if (data.cost <= 0) {
      throw new Error('Le coût doit être supérieur à 0');
    }

    // Validation de la date
    const now = new Date();
    if (data.date > now) {
      throw new Error('La date ne peut pas être dans le futur');
    }

    // Création de l'entrée de maintenance
    const maintenanceEntry = await prisma.maintenanceEntry.create({
      data: {
        vehicleId: data.vehicleId,
        date: data.date,
        type: data.type,
        description: data.description,
        cost: data.cost,
        mileage: data.mileage,
        providerName: data.providerName
      }
    });

    // Mise à jour du kilométrage du véhicule si nécessaire
    if (data.forceMileageUpdate || !vehicle.currentMileage || data.mileage > vehicle.currentMileage) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { currentMileage: data.mileage }
      });
    }

    // Mise à jour des dates de contrôle technique si nécessaire
    if (data.type === MaintenanceType.TECHNICAL_CHECK) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: {
          lastTechnicalCheck: data.date,
          nextTechnicalCheck: this.calculateNextTechnicalCheckDate(data.date)
        }
      });
    }

    console.log(`[MaintenanceService] Entrée de maintenance créée avec succès: ${maintenanceEntry.id}`);
    return maintenanceEntry;
  }

  async findByVehicleId(vehicleId: string, userId: string) {
    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: userId
      }
    });

    if (!vehicle) {
      throw new Error('Véhicule non trouvé ou non autorisé');
    }

    return prisma.maintenanceEntry.findMany({
      where: { vehicleId },
      orderBy: { date: 'desc' }
    });
  }

  async update(id: string, data: {
    date?: Date;
    type?: MaintenanceType;
    description?: string;
    cost?: number;
    mileage?: number;
    userId: string;
    providerName?: string;
    forceMileageUpdate?: boolean;
  }) {
    console.log(`[MaintenanceService] Mise à jour de l'entrée de maintenance ${id}`);

    // Vérification de l'existence et de la propriété
    const entry = await prisma.maintenanceEntry.findFirst({
      where: {
        id,
        vehicle: { userId: data.userId }
      }
    });

    if (!entry) {
      throw new Error('Entrée de maintenance non trouvée ou non autorisée');
    }

    // Validation du type si fourni
    if (data.type && !this.validateMaintenanceType(data.type)) {
      throw new Error(`Type de maintenance invalide: ${data.type}`);
    }

    // Validation du kilométrage si fourni
    if (data.mileage !== undefined) {
      if (data.mileage < 0) {
        throw new Error('Le kilométrage ne peut pas être négatif');
      }

      if (!data.forceMileageUpdate && entry.mileage && data.mileage < entry.mileage) {
        throw new Error('Le kilométrage ne peut pas être inférieur au kilométrage actuel. Si vous souhaitez forcer la mise à jour, ajoutez le paramètre forceMileageUpdate à true.');
      }
    }

    // Validation du coût si fourni
    if (data.cost !== undefined && data.cost <= 0) {
      throw new Error('Le coût doit être supérieur à 0');
    }

    // Validation de la date si fournie
    if (data.date) {
      const now = new Date();
      if (data.date > now) {
        throw new Error('La date ne peut pas être dans le futur');
      }
    }

    // Mise à jour de l'entrée
    const updatedEntry = await prisma.maintenanceEntry.update({
      where: { id },
      data: {
        date: data.date,
        type: data.type,
        description: data.description,
        cost: data.cost,
        mileage: data.mileage,
        providerName: data.providerName
      }
    });

    // Mise à jour du kilométrage du véhicule si nécessaire
    if (data.mileage !== undefined) {
      await prisma.vehicle.update({
        where: { id: entry.vehicleId },
        data: { currentMileage: data.mileage }
      });
    }

    // Mise à jour des dates de contrôle technique si nécessaire
    if (data.type === MaintenanceType.TECHNICAL_CHECK) {
      await prisma.vehicle.update({
        where: { id: entry.vehicleId },
        data: {
          lastTechnicalCheck: data.date || entry.date,
          nextTechnicalCheck: this.calculateNextTechnicalCheckDate(data.date || entry.date)
        }
      });
    }

    console.log(`[MaintenanceService] Entrée de maintenance mise à jour avec succès: ${id}`);
    return updatedEntry;
  }

  async delete(id: string, userId: string) {
    console.log(`[MaintenanceService] Suppression de l'entrée de maintenance ${id}`);

    // Vérification de l'existence et de la propriété
    const entry = await prisma.maintenanceEntry.findFirst({
      where: {
        id,
        vehicle: { userId: userId }
      }
    });

    if (!entry) {
      throw new Error('Entrée de maintenance non trouvée ou non autorisée');
    }

    // Suppression de l'entrée
    await prisma.maintenanceEntry.delete({
      where: { id }
    });

    console.log(`[MaintenanceService] Entrée de maintenance supprimée avec succès: ${id}`);
  }
}

export default new MaintenanceEntryService(); 