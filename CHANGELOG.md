# Changelog

## [Non publié]

### Corrections de bugs
- Formulaire de saisie des pleins de carburant :
  - Correction de l'affichage du dernier kilométrage connu dans le placeholder
  - Correction de l'affichage de la case à cocher pour forcer la mise à jour du kilométrage
  - Correction des erreurs de validation Prisma lors de la création d'une entrée :
    - Remplacement de `fuelTypeId` par `fuelType` pour correspondre au schéma de la base de données
    - Suppression des chaînes vides pour les champs enum optionnels (`stationType`, `rechargeType`)
    - Le champ `status` est maintenant géré par la valeur par défaut de Prisma (`ACTIVE`)

### Détails techniques
- Modification du composant `FuelEntriesList` pour récupérer correctement `historicalMaxMileage` via l'API dédiée
- Nettoyage des données avant envoi à l'API dans le composant `FuelEntryForm`
- Aucune modification de la base de données ou des types n'a été nécessaire 