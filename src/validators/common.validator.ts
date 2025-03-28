import { getSystemDate } from '../config/systemDate';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DateValidationResult {
  isValid: boolean;
  message?: string;
}

export interface MileageValidationResult {
  isValid: boolean;
  message?: string;
  requiresForceUpdate?: boolean;
}

export const validateDate = (date: Date | string, fieldName: string): DateValidationResult => {
  const entryDate = new Date(date);
  const now = getSystemDate();

  if (entryDate > now) {
    return {
      isValid: false,
      message: `La date de ${fieldName} ne peut pas être dans le futur`
    };
  }

  return { isValid: true };
};

export const validateDateRange = (
  startDate: Date | string,
  endDate: Date | string,
  startFieldName: string,
  endFieldName: string
): DateValidationResult => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return {
      isValid: false,
      message: `La date de ${startFieldName} doit être antérieure à la date de ${endFieldName}`
    };
  }

  return { isValid: true };
};

export const validateMileage = async (
  vehicleId: string,
  mileage: number,
  entryId?: string
): Promise<MileageValidationResult> => {
  // Récupérer le véhicule
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });

  if (!vehicle) {
    return {
      isValid: false,
      message: 'Véhicule non trouvé'
    };
  }

  // Récupérer le dernier kilométrage des entrées de carburant
  const latestFuelEntry = await prisma.fuelEntry.findFirst({
    where: {
      vehicleId,
      NOT: entryId ? { id: entryId } : undefined
    },
    orderBy: [
      { date: 'desc' },
      { mileage: 'desc' }
    ]
  });

  // Récupérer le dernier kilométrage des entrées de maintenance
  const latestMaintenanceEntry = await prisma.maintenanceEntry.findFirst({
    where: {
      vehicleId,
      NOT: entryId ? { id: entryId } : undefined
    },
    orderBy: [
      { date: 'desc' },
      { mileage: 'desc' }
    ]
  });

  // Déterminer le kilométrage maximum
  const maxMileage = Math.max(
    latestFuelEntry?.mileage || 0,
    latestMaintenanceEntry?.mileage || 0,
    vehicle.initialMileage || 0
  );

  if (mileage < maxMileage) {
    return {
      isValid: false,
      message: 'Le kilométrage ne peut pas être inférieur au kilométrage actuel du véhicule. Utilisez forceMileageUpdate=true pour forcer la mise à jour.',
      requiresForceUpdate: true
    };
  }

  return { isValid: true };
};

export const validateVehicleOwnership = async (
  vehicleId: string,
  userId: string
): Promise<boolean> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId
    }
  });

  return !!vehicle;
}; 