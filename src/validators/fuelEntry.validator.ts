import { isDateInFuture } from '../config/systemDate';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const validateFuelEntry = async (data: any) => {
  const {
    vehicleId,
    date,
    mileage,
    quantity,
    unitPrice,
    totalCost,
    fuelType,
    stationType,
    rechargeType,
    isSubscription,
    subscriptionStartDate,
    subscriptionEndDate,
    forceMileageUpdate
  } = data;

  // Vérifier les champs obligatoires
  if (!vehicleId || !date || !quantity || !unitPrice || !totalCost || !mileage) {
    return 'Champs obligatoires manquants';
  }

  // Vérifier que les valeurs numériques sont valides
  if (isNaN(quantity) || quantity <= 0) {
    return 'La quantité doit être un nombre positif';
  }

  if (isNaN(unitPrice) || unitPrice <= 0) {
    return 'Le prix unitaire doit être un nombre positif';
  }

  if (isNaN(totalCost) || totalCost <= 0) {
    return 'Le coût total doit être un nombre positif';
  }

  if (isNaN(mileage) || mileage < 0) {
    return 'Le kilométrage doit être un nombre positif';
  }

  // Vérifier que la date n'est pas dans le futur
  const entryDate = new Date(date);
  if (isDateInFuture(entryDate)) {
    return 'La date ne peut pas être dans le futur';
  }

  // Vérifier que le véhicule existe
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });

  if (!vehicle) {
    return 'Véhicule non trouvé';
  }

  // Vérifier le kilométrage par rapport au kilométrage actuel
  if (vehicle.currentMileage && mileage < vehicle.currentMileage && !forceMileageUpdate) {
    return 'Le kilométrage ne peut pas être inférieur au kilométrage actuel du véhicule. Utilisez forceMileageUpdate=true pour forcer la mise à jour.';
  }

  // Validation des dates d'abonnement
  if (isSubscription) {
    if (!subscriptionStartDate || !subscriptionEndDate) {
      return 'Les dates de début et de fin d\'abonnement sont requises pour un abonnement';
    }

    const startDate = new Date(subscriptionStartDate);
    const endDate = new Date(subscriptionEndDate);

    if (startDate > endDate) {
      return 'La date de début d\'abonnement doit être antérieure à la date de fin';
    }
  }

  // Vérifier la cohérence entre le prix unitaire et le coût total
  const calculatedTotal = quantity * unitPrice;
  const tolerance = 0.01; // Tolérance de 1 centime pour les erreurs d'arrondi
  if (Math.abs(calculatedTotal - totalCost) > tolerance) {
    return 'Le coût total ne correspond pas au produit de la quantité par le prix unitaire';
  }

  return null; // Pas d'erreur
}; 