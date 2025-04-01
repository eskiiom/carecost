import { PrismaClient, EnergyType, FuelType } from '@prisma/client';

const prisma = new PrismaClient();

export class FuelService {
  /**
   * Récupère tous les carburants disponibles pour un type d'énergie donné
   */
  static async getFuelTypesByEnergyType(energyType: EnergyType): Promise<FuelType[]> {
    return prisma.fuelType.findMany({
      where: {
        energyType
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Vérifie si un carburant est compatible avec un type d'énergie
   */
  static async validateFuelType(fuelTypeId: string, vehicleEnergyType: EnergyType): Promise<boolean> {
    const fuelType = await prisma.fuelType.findUnique({
      where: {
        id: fuelTypeId
      }
    });

    if (!fuelType) {
      return false;
    }

    return fuelType.energyType === vehicleEnergyType;
  }

  /**
   * Récupère un carburant par son ID
   */
  static async getFuelTypeById(id: string): Promise<FuelType | null> {
    return prisma.fuelType.findUnique({
      where: {
        id
      }
    });
  }
} 