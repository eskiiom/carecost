# Gestion de la Maintenance

## Vue d'ensemble
Le module de gestion de la maintenance permet aux utilisateurs de suivre et d'enregistrer les opérations de maintenance effectuées sur leurs véhicules. Il comprend des fonctionnalités pour ajouter, visualiser et supprimer des entrées de maintenance.

## Fonctionnalités

### 1. Ajout d'une entrée de maintenance
- Interface utilisateur intuitive avec formulaire de saisie
- Champs requis :
  - Date de la maintenance
  - Type de maintenance
  - Kilométrage
  - Coût
  - Description (optionnelle)
- Validation du kilométrage :
  - Affichage du dernier kilométrage connu dans le placeholder du champ
  - Option pour forcer la mise à jour du kilométrage si la valeur saisie est inférieure au dernier kilométrage connu
  - L'option de forcement n'apparaît que lorsqu'un kilométrage inférieur est saisi

### 2. Affichage des entrées
- Liste chronologique des maintenances
- Informations affichées :
  - Date
  - Type de maintenance
  - Kilométrage
  - Coût
  - Description (si disponible)

### 3. Suppression d'entrées
- Possibilité de supprimer une entrée de maintenance
- Confirmation requise avant la suppression
- Mise à jour automatique de la liste après suppression

## Architecture

### Frontend (React + TypeScript)
- `MaintenanceForm.tsx` : Composant de formulaire pour l'ajout d'entrées
- `MaintenanceList.tsx` : Composant d'affichage des entrées avec options de suppression
- Validation côté client pour assurer l'intégrité des données

### Backend (Node.js + Express)
- API RESTful pour la gestion des entrées de maintenance
- Endpoints :
  - GET /api/maintenance : Récupération des entrées
  - POST /api/maintenance : Ajout d'une entrée
  - DELETE /api/maintenance/:id : Suppression d'une entrée
- Validation des données côté serveur

## Validation et Gestion des Erreurs
- Validation du kilométrage :
  - Empêche les valeurs négatives
  - Vérifie la cohérence avec le dernier kilométrage connu
  - Permet le forcement de la mise à jour avec confirmation explicite
- Messages d'erreur clairs et informatifs
- Gestion des erreurs réseau et serveur

## Améliorations Futures
- Ajout de catégories de maintenance personnalisables
- Système de rappels pour les maintenances programmées
- Export des données de maintenance
- Statistiques et analyses des coûts de maintenance

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