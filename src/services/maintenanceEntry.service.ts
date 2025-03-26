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
    const nextCheckDate = new Date(currentCheckDate);
    nextCheckDate.setFullYear(nextCheckDate.getFullYear() + 2);
    return nextCheckDate;
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
    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        userId: data.userId
      }
    });

    if (!vehicle) {
      throw new Error('Véhicule non trouvé ou non autorisé');
    }

    // Vérifier que le kilométrage est cohérent
    if (vehicle.currentMileage && data.mileage < vehicle.currentMileage && !data.forceMileageUpdate) {
      throw new Error('Le kilométrage ne peut pas être inférieur au kilométrage actuel du véhicule. Si vous souhaitez forcer la mise à jour, ajoutez le paramètre forceMileageUpdate à true.');
    }

    // Si c'est un contrôle technique, calculer la date minimale
    if (data.type === 'TECHNICAL_CHECK' && vehicle.productionDate) {
      // Créer l'entrée de maintenance
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

      // Calculer la date du prochain contrôle technique (2 ans après la date du contrôle actuel)
      const nextCheckDate = this.calculateNextTechnicalCheckDate(data.date);

      // Mettre à jour le kilométrage du véhicule et les dates de contrôle technique
      const updateData: VehicleUpdateData = {
        currentMileage: data.mileage,
        lastTechnicalCheck: data.date,
        nextTechnicalCheck: nextCheckDate
      };

      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: updateData
      });

      return maintenanceEntry;
    }

    // Pour les autres types de maintenance
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

    // Mettre à jour le kilométrage du véhicule si nécessaire
    if (data.forceMileageUpdate || !vehicle.currentMileage || data.mileage > vehicle.currentMileage) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { currentMileage: data.mileage }
      });
    }

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
    // Vérifier que l'entrée existe et appartient à un véhicule de l'utilisateur
    const entry = await prisma.maintenanceEntry.findFirst({
      where: {
        id,
        vehicle: { userId: data.userId }
      }
    });

    if (!entry) {
      throw new Error('Entrée de maintenance non trouvée ou non autorisée');
    }

    // Si le kilométrage est modifié, vérifier qu'il est cohérent
    if (data.mileage && entry.mileage && data.mileage < entry.mileage && !data.forceMileageUpdate) {
      throw new Error('Le kilométrage ne peut pas être inférieur au kilométrage actuel. Si vous souhaitez forcer la mise à jour, ajoutez le paramètre forceMileageUpdate à true.');
    }

    // Mettre à jour l'entrée
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

    // Si le kilométrage a été modifié, mettre à jour celui du véhicule
    if (data.mileage) {
      await prisma.vehicle.update({
        where: { id: entry.vehicleId },
        data: { mileage: data.mileage }
      });
    }

    return updatedEntry;
  }

  async delete(id: string, userId: string) {
    // Vérifier que l'entrée existe et appartient à un véhicule de l'utilisateur
    const entry = await prisma.maintenanceEntry.findFirst({
      where: {
        id,
        vehicle: { userId: userId }
      }
    });

    if (!entry) {
      throw new Error('Entrée de maintenance non trouvée ou non autorisée');
    }

    await prisma.maintenanceEntry.delete({
      where: { id }
    });
  }
}

export default new MaintenanceEntryService(); 