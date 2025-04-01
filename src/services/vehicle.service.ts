import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Define the enums locally to match the schema
enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  SOFT_DELETED = 'SOFT_DELETED'
}

enum MaintenanceFrequency {
  ANNUAL = 'ANNUAL',
  BIENNIAL = 'BIENNIAL',
  EVERY_15000KM = 'EVERY_15000KM',
  EVERY_20000KM = 'EVERY_20000KM',
  EVERY_30000KM = 'EVERY_30000KM'
}

enum EnergyType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  GPL = 'GPL',
  HYBRID_GASOLINE = 'HYBRID_GASOLINE',
  HYBRID_DIESEL = 'HYBRID_DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYDROGEN = 'HYDROGEN'
}

interface CreateVehicleDTO {
  userId: string;
  brand: string;
  model: string;
  licensePlate: string;
  energyType: EnergyType;
  year: number;
  initialMileage: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  vin: string;
}

interface UpdateVehicleDTO {
  brand?: string;
  model?: string;
  licensePlate?: string;
  energyType?: EnergyType;
  year?: number;
  initialMileage?: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  vin?: string;
}

interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  mileage: number;
  energyType: EnergyType;
  userId: string;
  productionDate?: Date;
  acquisitionDate?: Date;
  initialMileage: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  lastTechnicalCheck?: Date;
  lastMaintenanceDone?: Date;
  maintenanceFrequency?: MaintenanceFrequency;
  status?: VehicleStatus;
}

interface UpdateVehicleData {
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  mileage?: number;
  energyType?: EnergyType;
  productionDate?: Date;
  acquisitionDate?: Date;
  initialMileage?: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  lastTechnicalCheck?: Date;
  lastMaintenanceDone?: Date;
  maintenanceFrequency?: MaintenanceFrequency;
  status?: VehicleStatus;
}

interface CreateVehicleInput {
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  vin: string;
  mileage: number;
  energyType: EnergyType;
  productionDate?: Date;
  acquisitionDate?: Date;
  initialMileage: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  lastTechnicalCheck?: Date;
  lastMaintenanceDone?: Date;
  maintenanceFrequency?: number;
  status?: VehicleStatus;
}

interface UpdateVehicleInput {
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  mileage?: number;
  energyType?: EnergyType;
  productionDate?: Date;
  acquisitionDate?: Date;
  initialMileage?: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  lastTechnicalCheck?: Date;
  lastMaintenanceDone?: Date;
  maintenanceFrequency?: number;
  status?: VehicleStatus;
}

class VehicleService {
  async create(data: CreateVehicleData) {
    try {
      return prisma.vehicle.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint failed on the fields: (`vin`)')) {
          throw new Error('Un véhicule avec ce numéro VIN existe déjà');
        }
        if (error.message.includes('Unique constraint failed on the fields: (`licensePlate`)')) {
          throw new Error('Un véhicule avec cette immatriculation existe déjà');
        }
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la création du véhicule');
    }
  }

  async findById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  async findByUserId(userId: string) {
    return prisma.vehicle.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  async update(id: string, data: UpdateVehicleData) {
    try {
      console.log('Tentative de mise à jour du véhicule:', { id, data });

      // Vérifier si un autre véhicule avec le même VIN existe déjà
      if (data.vin) {
        console.log('Vérification du VIN:', data.vin);
        const existingVin = await prisma.vehicle.findFirst({
          where: {
            AND: [
              { vin: data.vin },
              { id: { not: id } }
            ]
          }
        });
        console.log('Véhicule existant avec le même VIN:', existingVin);
        if (existingVin) {
          throw new Error('Un véhicule avec ce numéro VIN existe déjà');
        }
      }

      // Vérifier si un autre véhicule avec la même immatriculation existe déjà
      if (data.licensePlate) {
        console.log('Vérification de l\'immatriculation:', data.licensePlate);
        const existingPlate = await prisma.vehicle.findFirst({
          where: {
            AND: [
              { licensePlate: data.licensePlate },
              { id: { not: id } }
            ]
          }
        });
        console.log('Véhicule existant avec la même immatriculation:', existingPlate);
        if (existingPlate) {
          throw new Error('Un véhicule avec cette immatriculation existe déjà');
        }
      }

      const updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      console.log('Véhicule mis à jour avec succès:', updatedVehicle);
      return updatedVehicle;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du véhicule:', error);
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint failed on the fields: (`vin`)')) {
          throw new Error('Un véhicule avec ce numéro VIN existe déjà');
        }
        if (error.message.includes('Unique constraint failed on the fields: (`licensePlate`)')) {
          throw new Error('Un véhicule avec cette immatriculation existe déjà');
        }
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la mise à jour du véhicule');
    }
  }

  async delete(id: string) {
    return prisma.vehicle.delete({
      where: { id }
    });
  }

  async getHistoricalMaxMileage(vehicleId: string): Promise<number> {
    // Récupérer le véhicule
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      throw new Error('Véhicule non trouvé');
    }

    // Récupérer le kilométrage maximum des entrées de carburant
    const maxFuelEntryMileage = await prisma.fuelEntry.findFirst({
      where: { vehicleId },
      orderBy: { mileage: 'desc' },
      select: { mileage: true }
    });

    // Récupérer le kilométrage maximum des entrées de maintenance
    const maxMaintenanceEntryMileage = await prisma.maintenanceEntry.findFirst({
      where: { vehicleId },
      orderBy: { mileage: 'desc' },
      select: { mileage: true }
    });

    // Retourner le maximum entre tous les kilométrages
    return Math.max(
      vehicle.initialMileage || 0,
      maxFuelEntryMileage?.mileage || 0,
      maxMaintenanceEntryMileage?.mileage || 0
    );
  }
}

export default new VehicleService(); 