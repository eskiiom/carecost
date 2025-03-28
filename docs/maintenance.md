# Gestion des Maintenances

## Vue d'ensemble
Le module de gestion des maintenances permet aux utilisateurs de suivre l'historique des interventions sur leurs véhicules. Il comprend l'ajout, la modification et la suppression des entrées de maintenance, ainsi que la mise à jour automatique du kilométrage du véhicule.

## Interface Utilisateur Unifiée
L'interface utilisateur suit un design cohérent à travers l'application, notamment pour :
- Les formulaires d'ajout/modification affichés dans des modales modernes
- Les dialogues de confirmation pour les actions critiques
- La présentation des données dans des tableaux structurés
- Les interactions utilisateur (boutons, validations, messages d'erreur)

Cette cohérence se retrouve dans :
- La gestion des maintenances
- La gestion des entrées de carburant
- Les autres fonctionnalités de l'application

## Fonctionnalités

### Entrées de Maintenance
- Création d'une nouvelle entrée de maintenance
- Modification d'une entrée existante
- Suppression d'une entrée avec confirmation
- Affichage de la liste des maintenances avec tri par date
- Gestion des notes pour chaque maintenance

### Gestion du Kilométrage
- Affichage du dernier kilométrage connu dans le formulaire
- Validation du kilométrage pour éviter les valeurs inférieures au kilométrage actuel
- Option pour forcer la mise à jour du kilométrage si nécessaire
- Mise à jour automatique du kilométrage du véhicule si la nouvelle valeur est supérieure

### Interface Utilisateur
- Modal pour l'ajout et la modification des maintenances
- Tableau de bord avec toutes les entrées de maintenance
- Confirmation avant suppression
- Rafraîchissement automatique des données du véhicule après modification

## Validation des Données
- Vérification des champs obligatoires
- Validation du kilométrage par rapport au kilométrage actuel du véhicule
- Validation de la date (pas de dates futures)
- Validation du coût (valeurs positives uniquement)

## Gestion des Erreurs
- Messages d'erreur contextuels pour chaque champ
- Gestion des erreurs de l'API
- Feedback visuel pour les actions utilisateur

## Architecture
### Frontend
- `MaintenanceForm.tsx`: Composant de formulaire pour l'ajout/modification
- `MaintenanceList.tsx`: Composant d'affichage et gestion de la liste
- Intégration dans `VehicleDetails.tsx` avec gestion d'état

### Backend
- `maintenanceEntry.controller.ts`: Gestion des requêtes HTTP
- `maintenanceEntry.service.ts`: Logique métier et validation
- `maintenanceEntry.routes.ts`: Définition des routes API

## Améliorations Futures
- Export des données de maintenance
- Filtres avancés dans la liste des maintenances
- Rappels de maintenance programmée
- Statistiques sur les coûts de maintenance

## Sécurité
- Authentification requise pour toutes les opérations
- Validation des données côté serveur
- Protection contre les injections SQL
- Vérification des autorisations utilisateur

## Types de Maintenance
Les types de maintenance supportés sont :
- ROUTINE : Entretien de routine
- REPAIR : Réparation
- TECHNICAL_CHECK : Contrôle technique
- TIRES : Pneumatiques
- OTHER : Autre

## Validation des Données

### Frontend
- **Validation du formulaire** :
  - Date : Obligatoire et ne peut pas être dans le futur
  - Type : Doit correspondre à un type valide
  - Description : Obligatoire, max 200 caractères
  - Kilométrage : Doit être supérieur à 0
  - Coût : Doit être supérieur à 0
  - Notes : Optionnel

### Backend
- **Validation des données** :
  - Vérification de l'authentification
  - Validation des permissions utilisateur
  - Vérification de la cohérence du kilométrage
  - Validation des types de maintenance
  - Vérification des dates

## Gestion des Erreurs
- **Codes d'erreur** :
  - AUTH_REQUIRED : Authentification requise
  - MISSING_FIELDS : Champs obligatoires manquants
  - INVALID_COST : Coût invalide
  - INVALID_MILEAGE : Kilométrage invalide
  - INVALID_DATE : Date invalide
  - NOT_FOUND : Ressource non trouvée
  - VALIDATION_ERROR : Erreur de validation
  - INTERNAL_ERROR : Erreur interne

## Interface Utilisateur
- **Liste des maintenances** :
  - Tableau trié par date décroissante
  - Colonnes : Date, Type, Description, Kilométrage, Coût, Notes, Actions
  - Bouton de suppression avec confirmation
  - Messages de chargement et d'erreur

- **Formulaire de maintenance** :
  - Validation en temps réel
  - Messages d'erreur contextuels
  - Styles visuels pour les champs invalides
  - Boutons Annuler/Enregistrer

## Base de Données
Les entrées de maintenance sont stockées dans la table `MaintenanceEntry` avec les relations suivantes :
- Relation avec la table `Vehicle` (one-to-many)
- Mise à jour automatique du kilométrage du véhicule
- Gestion des dates de contrôle technique

## Améliorations Futures
- Ajout de la modification des entrées
- Filtrage et recherche dans la liste
- Export des données
- Statistiques détaillées
- Notifications pour les maintenances à venir 