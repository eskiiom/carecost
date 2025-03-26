import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class FuelEntryService {
  async create(data: {
    vehicleId: string;
    date: Date;
    liters: number;
    cost: number;
    mileage: number;
    userId: string;
    fuelType?: string;
    stationType?: string;
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
    if (vehicle.mileage && data.mileage < vehicle.mileage) {
      throw new Error('Le kilométrage ne peut pas être inférieur au kilométrage actuel du véhicule');
    }

    // Créer l'entrée de carburant
    const fuelEntry = await prisma.fuelEntry.create({
      data: {
        vehicleId: data.vehicleId,
        date: data.date,
        quantity: data.liters,
        unitPrice: data.cost / data.liters,
        totalCost: data.cost,
        mileage: data.mileage,
        fuelType: data.fuelType,
        stationType: data.stationType
      }
    });

    // Mettre à jour le kilométrage du véhicule
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { mileage: data.mileage }
    });

    return fuelEntry;
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

    return prisma.fuelEntry.findMany({
      where: { vehicleId },
      orderBy: { date: 'desc' }
    });
  }

  async update(id: string, data: {
    date?: Date;
    liters?: number;
    cost?: number;
    mileage?: number;
    userId: string;
    fuelType?: string;
    stationType?: string;
  }) {
    // Vérifier que l'entrée existe et appartient à un véhicule de l'utilisateur
    const entry = await prisma.fuelEntry.findFirst({
      where: {
        id,
        vehicle: { userId: data.userId }
      }
    });

    if (!entry) {
      throw new Error('Entrée de carburant non trouvée ou non autorisée');
    }

    // Si le kilométrage est modifié, vérifier qu'il est cohérent
    if (data.mileage && entry.mileage && data.mileage < entry.mileage) {
      throw new Error('Le kilométrage ne peut pas être inférieur au kilométrage actuel');
    }

    // Calculer le prix unitaire si les litres et le coût sont fournis
    let unitPrice = entry.unitPrice;
    if (data.liters && data.cost) {
      unitPrice = data.cost / data.liters;
    }

    // Mettre à jour l'entrée
    const updatedEntry = await prisma.fuelEntry.update({
      where: { id },
      data: {
        date: data.date,
        quantity: data.liters,
        unitPrice,
        totalCost: data.cost,
        mileage: data.mileage,
        fuelType: data.fuelType,
        stationType: data.stationType
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
    const entry = await prisma.fuelEntry.findFirst({
      where: {
        id,
        vehicle: { userId: userId }
      }
    });

    if (!entry) {
      throw new Error('Entrée de carburant non trouvée ou non autorisée');
    }

    await prisma.fuelEntry.delete({
      where: { id }
    });
  }
}

export default new FuelEntryService(); 