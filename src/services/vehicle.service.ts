import { PrismaClient, EnergyType, VehicleStatus, MaintenanceFrequency } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  mileage?: number;
  energyType: EnergyType;
  userId: string;
  chassisNumber?: string;
  productionDate?: Date;
  acquisitionDate?: Date;
  initialMileage?: number;
  currentMileage?: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  lastTechnicalCheck?: Date;
  nextTechnicalCheck?: Date;
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
  chassisNumber?: string;
  productionDate?: Date;
  acquisitionDate?: Date;
  initialMileage?: number;
  currentMileage?: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  lastTechnicalCheck?: Date;
  nextTechnicalCheck?: Date;
  maintenanceFrequency?: MaintenanceFrequency;
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
}

export default new VehicleService(); 