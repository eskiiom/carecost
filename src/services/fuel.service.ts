import { PrismaClient, EnergyType } from '@prisma/client';

const prisma = new PrismaClient();

export class FuelService {
  /**
   * Récupère tous les carburants disponibles pour un type d'énergie donné
   */
  static async getFuelTypesByEnergyType(energyType: EnergyType) {
    const energyTypes = [energyType];
    
    // Pour les véhicules hybrides, ajouter aussi les types de recharge électrique
    if (energyType === 'HYBRID_GASOLINE' || energyType === 'HYBRID_DIESEL') {
      energyTypes.push('ELECTRIC');
    }

    return prisma.fuelType.findMany({
      where: {
        energyType: {
          in: energyTypes
        }
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

    // Pour les véhicules hybrides, autoriser aussi les types de recharge électrique
    if (vehicleEnergyType === 'HYBRID_GASOLINE' || vehicleEnergyType === 'HYBRID_DIESEL') {
      return fuelType.energyType === vehicleEnergyType || fuelType.energyType === 'ELECTRIC';
    }

    return fuelType.energyType === vehicleEnergyType;
  }

  /**
   * Récupère un carburant par son ID
   */
  static async getFuelTypeById(id: string) {
    return prisma.fuelType.findUnique({
      where: {
        id
      }
    });
  }
} 