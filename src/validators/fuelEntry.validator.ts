import { validateDate, validateDateRange, validateMileage, validateVehicleOwnership } from './common.validator';
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
    forceMileageUpdate,
    userId
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

  // Vérifier la date
  const dateValidation = validateDate(date, 'l\'entrée');
  if (!dateValidation.isValid) {
    return dateValidation.message;
  }

  // Vérifier que le véhicule existe et appartient à l'utilisateur
  if (userId) {
    const isOwner = await validateVehicleOwnership(vehicleId, userId);
    if (!isOwner) {
      return 'Véhicule non trouvé ou non autorisé';
    }
  }

  // Vérifier le kilométrage
  const mileageValidation = await validateMileage(vehicleId, mileage, data.id);
  if (!mileageValidation.isValid) {
    if (mileageValidation.requiresForceUpdate && !forceMileageUpdate) {
      return mileageValidation.message;
    }
  }

  // Validation des dates d'abonnement
  if (isSubscription) {
    if (!subscriptionStartDate || !subscriptionEndDate) {
      return 'Les dates de début et de fin d\'abonnement sont requises pour un abonnement';
    }

    const dateRangeValidation = validateDateRange(
      subscriptionStartDate,
      subscriptionEndDate,
      'début d\'abonnement',
      'fin d\'abonnement'
    );

    if (!dateRangeValidation.isValid) {
      return dateRangeValidation.message;
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