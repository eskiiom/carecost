import { validateDate, validateMileage, validateVehicleOwnership } from './common.validator';

export const validateMaintenanceEntry = async (data: any, isUpdate = false) => {
  const {
    vehicleId,
    date,
    type,
    description,
    cost,
    mileage,
    providerName,
    forceMileageUpdate,
    userId
  } = data;

  // Validation des champs obligatoires seulement pour la création
  if (!isUpdate) {
    const missingFields = [];
    if (!vehicleId) missingFields.push('ID du véhicule');
    if (!date) missingFields.push('date');
    if (!type) missingFields.push('type');
    if (!description) missingFields.push('description');
    if (!cost) missingFields.push('coût');
    if (!mileage) missingFields.push('kilométrage');

    if (missingFields.length > 0) {
      return `Les champs suivants sont obligatoires : ${missingFields.join(', ')}`;
    }
  }

  // Validation des valeurs numériques si fournies
  if (cost !== undefined) {
    if (isNaN(cost) || cost <= 0) {
      return 'Le coût doit être un nombre positif';
    }
  }

  if (mileage !== undefined) {
    if (isNaN(mileage) || mileage < 0) {
      return 'Le kilométrage doit être un nombre positif';
    }
  }

  // Vérifier la date si fournie
  if (date) {
    const dateValidation = validateDate(date, 'l\'entrée');
    if (!dateValidation.isValid) {
      return dateValidation.message;
    }
  }

  // Vérifier que le véhicule existe et appartient à l'utilisateur
  if (userId && vehicleId) {
    const isOwner = await validateVehicleOwnership(vehicleId, userId);
    if (!isOwner) {
      return 'Véhicule non trouvé ou non autorisé';
    }
  }

  // Vérifier le kilométrage si fourni
  if (mileage !== undefined) {
    const mileageValidation = await validateMileage(vehicleId, mileage, data.id);
    if (!mileageValidation.isValid) {
      if (mileageValidation.requiresForceUpdate && !forceMileageUpdate) {
        return mileageValidation.message;
      }
    }
  }

  return null; // Pas d'erreur
}; 