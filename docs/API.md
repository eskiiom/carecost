# Documentation API CareCost

## Règles de gestion et contraintes

### Véhicules

#### Ajout d'un véhicule
- Champs obligatoires : marque, modèle, année, immatriculation, type d'énergie
- L'année doit être comprise entre 1900 et l'année en cours + 1
- Les dates suivantes ne peuvent pas être dans le futur :
  - Date de production
  - Date d'acquisition
  - Date de dernière révision technique
  - Date de dernière maintenance
- La date de production ne peut pas être postérieure à la date d'acquisition
- La date de dernière maintenance ne peut pas être antérieure à la date de production
- Le numéro VIN doit être unique
- L'immatriculation doit être unique
- Le type d'énergie doit être l'une des valeurs suivantes :
  - GASOLINE
  - DIESEL
  - GPL
  - HYBRID_GASOLINE
  - HYBRID_DIESEL
  - ELECTRIC
  - HYDROGEN
- Le statut du véhicule doit être ACTIVE ou SOFT_DELETED
- La fréquence de maintenance doit être l'une des valeurs suivantes :
  - ANNUAL
  - BIENNIAL
  - EVERY_15000KM
  - EVERY_20000KM
  - EVERY_30000KM

#### Modification d'un véhicule
- Mêmes validations que pour l'ajout
- L'utilisateur doit être authentifié
- L'utilisateur doit être propriétaire du véhicule
- Les champs sont optionnels lors de la modification

### Entrées de carburant

#### Ajout d'une entrée
- Champs obligatoires : ID du véhicule, date, quantité, prix unitaire, coût total, kilométrage
- La quantité doit être un nombre positif
- Le prix unitaire doit être un nombre positif
- Le coût total doit être un nombre positif
- Le kilométrage doit être un nombre positif
- La date ne peut pas être dans le futur
- Le véhicule doit exister
- Le kilométrage ne peut pas être inférieur au kilométrage actuel du véhicule sauf si forceMileageUpdate=true
- Pour les abonnements :
  - Les dates de début et de fin d'abonnement sont requises
  - La date de début doit être antérieure à la date de fin
- Le coût total doit correspondre au produit de la quantité par le prix unitaire (avec une tolérance de 1 centime)

#### Modification d'une entrée
- Mêmes validations que pour l'ajout
- L'utilisateur doit être authentifié
- L'entrée doit exister
- Les champs sont optionnels lors de la modification
- Le kilométrage ne peut pas être inférieur au kilométrage historique maximum sauf si forceMileageUpdate=true

### Entrées de maintenance

#### Ajout d'une entrée
- Champs obligatoires : ID du véhicule, date, type, description, coût, kilométrage
- Le coût doit être un nombre positif
- Le kilométrage doit être un nombre positif
- La date ne peut pas être dans le futur
- L'utilisateur doit être authentifié
- Le véhicule doit exister
- Le kilométrage ne peut pas être inférieur au kilométrage actuel du véhicule sauf si forceMileageUpdate=true

#### Modification d'une entrée
- Mêmes validations que pour l'ajout
- L'utilisateur doit être authentifié
- L'entrée doit exister
- Les champs sont optionnels lors de la modification
- Le kilométrage ne peut pas être inférieur au kilométrage historique maximum sauf si forceMileageUpdate=true

### Statistiques de consommation

#### Statistiques générales d'un véhicule
- Endpoint : GET /api/consumption-statistics/vehicle/:vehicleId
- Paramètres optionnels : startDate, endDate
- Retourne :
  - Consommation moyenne
  - Coût total
  - Distance totale
  - Nombre d'entrées
  - Période couverte

#### Statistiques annuelles d'un véhicule
- Endpoint : GET /api/consumption-statistics/vehicle/:vehicleId/yearly
- Retourne les statistiques par année

#### Historique de consommation
- Endpoint : GET /api/consumption-statistics/vehicle/:vehicleId/history
- Retourne l'historique détaillé des entrées de carburant

### Kilométrage historique

#### Récupération du kilométrage maximum historique
- Endpoint : GET /api/vehicles/:id/historical-max-mileage
- Retourne le kilométrage maximum enregistré pour le véhicule
- Utilisé pour la validation des nouvelles entrées

## Problèmes de sécurité identifiés
1. La vérification de l'authentification est présente mais pourrait être renforcée au niveau middleware
2. Les validations de propriété (vérification que l'utilisateur est propriétaire du véhicule) sont présentes mais pourraient être centralisées
3. Les validations de kilométrage sont similaires entre les entrées de carburant et de maintenance, ce qui pourrait être factorisé
4. La gestion des erreurs pourrait être standardisée avec des codes d'erreur plus précis

## Recommandations d'amélioration
1. Centraliser les validations de kilométrage dans un service commun
2. Ajouter un middleware d'authentification global
3. Standardiser la gestion des erreurs avec des codes d'erreur cohérents
4. Factoriser les validations de dates communes
5. Ajouter des validations de format pour les champs comme le VIN et l'immatriculation
6. Ajouter des validations de cohérence entre les différents types d'entrées (carburant et maintenance) 