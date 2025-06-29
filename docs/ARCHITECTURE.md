# Architecture Modulaire CareCost

## Vue d'ensemble

CareCost est une application de gestion de coûts d'entretien de véhicules avec une architecture modulaire basée sur Node.js/Express et React.

## Architecture Backend

### Structure des modules

```
src/
├── modules/
│   ├── auth/                 # Authentification et autorisation
│   ├── vehicles/             # Gestion des véhicules
│   ├── fuel/                 # Gestion carburant
│   ├── maintenance/          # Gestion maintenance
│   ├── costs/                # Gestion des coûts et budgets
│   ├── documents/            # Gestion des documents
│   ├── statistics/           # Statistiques et rapports
│   ├── users/                # Gestion des utilisateurs
│   ├── notifications/        # Système de notifications
│   └── integrations/         # Intégrations externes
├── shared/
│   ├── middleware/           # Middlewares partagés
│   ├── validators/           # Validateurs partagés
│   ├── utils/                # Utilitaires
│   └── types/                # Types TypeScript partagés
└── config/                   # Configuration
```

### Modules principaux

#### 1. Module Auth
- Authentification JWT
- Autorisation par rôles (USER, ADMIN, SUPER_ADMIN)
- 2FA (TouchID/FaceID)
- Gestion des sessions
- Middleware d'authentification

#### 2. Module Vehicles
- CRUD véhicules
- Gestion multi-véhicules
- Partage entre utilisateurs
- Distinction fonctionnel/personnel
- Véhicule favori/archivé
- Informations techniques
- Rappels constructeur

#### 3. Module Fuel
- Entrées carburant multi-énergies
- Saisie flexible (montant/volume/prix)
- Historique stations-service
- Auto-complétion
- Prix en temps réel (API)
- Abonnements

#### 4. Module Maintenance
- Rappels kilométrage/date
- Templates prédéfinis/personnalisables
- Garanties
- Carnet d'entretien exportable
- Lien rappels constructeur

#### 5. Module Costs
- Catégories personnalisables
- TCO (Total Cost of Ownership)
- Budgets
- Indicateur cote
- Export PNG/PDF/CSV

#### 6. Module Documents
- OCR reçus
- Stockage sécurisé
- Export PDF
- Gestion des pièces jointes

#### 7. Module Statistics
- Dépenses
- Consommation
- Kilométrage
- CO2
- Comparaisons
- Graphiques exportables

#### 8. Module Users
- Gestion multi-utilisateurs
- Permissions granulaires
- Profils utilisateur
- Préférences

#### 9. Module Notifications
- Notifications push/SMS/email
- Rappels automatiques
- Alertes maintenance

#### 10. Module Integrations
- API externe
- Synchronisation calendriers
- Intégrations tierces

## Architecture Frontend

### Structure des modules

```
client/src/
├── modules/
│   ├── auth/                 # Authentification
│   ├── vehicles/             # Gestion véhicules
│   ├── fuel/                 # Gestion carburant
│   ├── maintenance/          # Gestion maintenance
│   ├── costs/                # Gestion coûts
│   ├── documents/            # Gestion documents
│   ├── statistics/           # Statistiques
│   ├── users/                # Gestion utilisateurs
│   ├── notifications/        # Notifications
│   └── settings/             # Paramètres
├── shared/
│   ├── components/           # Composants partagés
│   ├── hooks/                # Hooks personnalisés
│   ├── services/             # Services API
│   ├── utils/                # Utilitaires
│   └── types/                # Types TypeScript
└── layouts/                  # Layouts de l'application
```

### Composants principaux

#### 1. Module Auth
- Login/Register
- 2FA
- Gestion des sessions
- Middleware de protection

#### 2. Module Vehicles
- Liste des véhicules
- Formulaire véhicule
- Détails véhicule
- Partage véhicule

#### 3. Module Fuel
- Saisie carburant
- Historique
- Statistiques
- Abonnements

#### 4. Module Maintenance
- Saisie maintenance
- Rappels
- Templates
- Export

#### 5. Module Costs
- Tableau de bord coûts
- Budgets
- Catégories
- Export

#### 6. Module Documents
- Upload documents
- OCR
- Visualisation
- Export

#### 7. Module Statistics
- Graphiques
- Rapports
- Comparaisons
- Export

#### 8. Module Users
- Gestion utilisateurs
- Profils
- Permissions

#### 9. Module Notifications
- Centre notifications
- Paramètres
- Historique

#### 10. Module Settings
- Préférences
- Thèmes
- Paramètres avancés

## Base de données

### Schéma modulaire

```sql
-- Module Auth
users
user_sessions
user_roles
permissions

-- Module Vehicles
vehicles
vehicle_shares
vehicle_technical_info
manufacturer_recalls

-- Module Fuel
fuel_entries
fuel_types
gas_stations
subscriptions

-- Module Maintenance
maintenance_entries
maintenance_templates
maintenance_reminders
warranties

-- Module Costs
cost_categories
budgets
cost_entries
tco_calculations

-- Module Documents
documents
document_ocr
document_attachments

-- Module Statistics
statistics_cache
export_history

-- Module Notifications
notifications
notification_settings
notification_history

-- Module Integrations
api_keys
external_integrations
sync_history
```

## Sécurité

### Authentification
- JWT avec refresh tokens
- 2FA (TOTP, TouchID, FaceID)
- Rate limiting
- Session management

### Autorisation
- RBAC (Role-Based Access Control)
- Permissions granulaires
- Vérification propriété ressources

### Données
- Chiffrement des données sensibles
- Validation stricte des entrées
- Protection contre les injections
- Audit trail

### RGPD
- Consentement utilisateur
- Droit à l'oubli
- Export des données
- Suppression des données

## Performance

### Backend
- Cache Redis
- Pagination
- Indexation base de données
- Compression gzip

### Frontend
- Lazy loading
- Code splitting
- Service workers
- Cache stratégique

## Tests

### Backend
- Tests unitaires (Jest)
- Tests d'intégration
- Tests de performance
- Tests de sécurité

### Frontend
- Tests unitaires (Jest)
- Tests d'intégration (Cypress)
- Tests de régression
- Tests d'accessibilité

## Déploiement

### Environnements
- Development
- Staging
- Production

### CI/CD
- GitHub Actions
- Tests automatiques
- Déploiement automatique
- Rollback automatique

### Monitoring
- Logs centralisés
- Métriques de performance
- Alertes automatiques
- Health checks

## Schéma de l'architecture backend

```mermaid
flowchart TD
  A[config/]
  B[controllers/]
  C[routes/]
  D[services/]
  E[middleware/]
  F[types/]
  G[validators/]
  H[index.ts]

  subgraph Domaines
    B1[auth.controller.ts]
    B2[vehicle.controller.ts]
    B3[userPreferences.controller.ts]
    B4[maintenanceEntry.controller.ts]
    B5[fuelEntry.controller.ts]
    B6[fuel.controller.ts]
    B7[consumptionStatistics.controller.ts]
    C1[auth.routes.ts]
    C2[vehicle.routes.ts]
    C3[userPreferences.routes.ts]
    C4[maintenanceEntry.routes.ts]
    C5[fuelEntry.routes.ts]
    C6[fuel.routes.ts]
    C7[consumptionStatistics.routes.ts]
    D1[auth.service.ts]
    D2[vehicle.service.ts]
    D3[userPreferences.service.ts]
    D4[maintenanceEntry.service.ts]
    D5[fuelEntry.service.ts]
    D6[fuel.service.ts]
    D7[consumptionStatistics.service.ts]
    E1[auth.middleware.ts]
    F1[auth.types.ts]
    F2[preferences.types.ts]
    G1[maintenanceEntry.validator.ts]
    G2[fuelEntry.validator.ts]
    G3[common.validator.ts]
  end

  H --> C
  C --> B
  B --> D
  D --> F
  C --> E
  B --> G
  A --> H
  A --> D
  A --> C
  A --> B
  A --> E
  A --> F
  A --> G

  %% Liaisons par domaine
  C1 --> B1
  B1 --> D1
  D1 --> F1
  E1 --> C1

  C2 --> B2
  B2 --> D2

  C3 --> B3
  B3 --> D3
  D3 --> F2

  C4 --> B4
  B4 --> D4
  G1 --> B4

  C5 --> B5
  B5 --> D5
  G2 --> B5

  C6 --> B6
  B6 --> D6

  C7 --> B7
  B7 --> D7

  G3 --> B4
  G3 --> B5
``` 