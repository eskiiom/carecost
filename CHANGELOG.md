# Changelog

## [Non publié]

### Améliorations
- Support des recharges électriques pour les véhicules hybrides :
  - Les véhicules hybrides (essence et diesel) peuvent maintenant utiliser les types de recharge électrique
  - Modification du service de carburant pour inclure les types de recharge électrique dans la liste des carburants disponibles
  - Mise à jour de la validation des types de carburant pour autoriser les recharges électriques pour les véhicules hybrides

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