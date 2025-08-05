# CareCost

idées : https://github.com/javedh-dev/tracktor

CareCost est une application de gestion de coûts d'entretien de véhicules. Elle permet aux utilisateurs de suivre les dépenses liées à leurs véhicules, notamment les entrées de carburant ou de recharge electriques et les entrées de maintenance ou entretien.

## Fonctionnalités

- Gestion des véhicules (création, modification, suppression)
  - Identification unique par VIN (Vehicle Identification Number)
  - Suivi du kilométrage initial
  - Gestion des types d'énergie (essence, diesel, électrique, etc.)
  - Code couleur pour une identification rapide des types d'énergie
  - Validation des carburants par type de véhicule
- Suivi des entrées de carburant
- Suivi des entrées de maintenance
- Validation des dates et des données
- Authentification des utilisateurs
- Préférences utilisateur personnalisées
  - Mode d'affichage des véhicules (grille/liste)
  - Persistance des préférences entre les sessions

## Documentation

La documentation détaillée des fonctionnalités est disponible dans le dossier `docs/` :

- [API](docs/API.md) - Documentation complète des endpoints de l'API
- [Code Couleur des Types d'Énergie](docs/features/energy-colors.md) - Documentation de l'implémentation du système de couleurs pour les types d'énergie
- [Validation des Carburants](docs/features/fuel-validation.md) - Documentation du système de validation des carburants par type de véhicule
- [Maintenance](docs/maintenance.md) - Documentation des fonctionnalités de maintenance
- [Roadmap](docs/ROADMAP.md) - Plan de développement futur
- [Credentials](CREDENTIALS.md) - Guide de gestion des identifiants et des secrets

Pour le développement frontend, consultez le [README du client](client/README.md).

## Technologies utilisées

- Node.js
- Express
- TypeScript
- Prisma (PostgreSQL)
- JWT pour l'authentification
- React avec hooks personnalisés
- Material-UI pour l'interface utilisateur

## Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL
- npm ou pnpm

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/eskiiom/carecost.git
cd carecost
```

2. Installer les dépendances :
```bash
# Backend
npm install
# ou
pnpm install

# Frontend
cd client
npm install
# ou
pnpm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. Initialiser la base de données :
```bash
npx prisma migrate dev
```

5. Démarrer les serveurs :
```bash
# Backend
npm run dev
# ou
pnpm dev

# Frontend (dans un autre terminal)
cd client
npm start
# ou
pnpm start
```

## Structure du projet

```
carecost/
├── prisma/           # Schéma et migrations de la base de données
├── src/
│   ├── controllers/  # Contrôleurs de l'application
│   ├── services/     # Services métier
│   ├── middleware/   # Middlewares Express
│   └── routes/       # Routes de l'API
├── client/
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── hooks/       # Hooks personnalisés
│   │   ├── pages/      # Pages de l'application
│   │   └── types/      # Types TypeScript
│   └── package.json    # Dépendances frontend
├── .env.example      # Exemple de configuration
└── package.json      # Dépendances backend
```

## API Endpoints

### Authentification
- POST /api/auth/register - Inscription d'un utilisateur
- POST /api/auth/login - Connexion d'un utilisateur

### Véhicules
- POST /api/vehicles - Création d'un véhicule (requiert : brand, model, year, licensePlate, energyType, initialMileage, vin)
- GET /api/vehicles - Liste des véhicules de l'utilisateur
- GET /api/vehicles/:id - Détails d'un véhicule
- PUT /api/vehicles/:id - Modification d'un véhicule
- DELETE /api/vehicles/:id - Suppression d'un véhicule

### Préférences Utilisateur
- GET /api/user/preferences - Récupération des préférences de l'utilisateur
- PATCH /api/user/preferences - Mise à jour des préférences de l'utilisateur

## Hooks Personnalisés

### useUserPreferences
Hook React pour gérer les préférences utilisateur :
```typescript
const { preferences, loading, error, updatePreferences } = useUserPreferences();
```
- `preferences` : Préférences actuelles de l'utilisateur
- `loading` : État de chargement
- `error` : Message d'erreur éventuel
- `updatePreferences` : Fonction pour mettre à jour les préférences

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

MIT 

## Endpoints principaux (synthèse)

| Méthode | URL                                 | Description                                 |
|---------|-------------------------------------|---------------------------------------------|
| POST    | /api/auth/register                  | Inscription utilisateur                     |
| POST    | /api/auth/login                     | Connexion utilisateur                       |
| GET     | /api/vehicles                       | Liste des véhicules de l'utilisateur        |
| POST    | /api/vehicles                       | Création d'un véhicule                      |
| GET     | /api/vehicles/:id                   | Détails d'un véhicule                       |
| PUT     | /api/vehicles/:id                   | Modification d'un véhicule                  |
| DELETE  | /api/vehicles/:id                   | Suppression d'un véhicule                   |
| GET     | /api/user/preferences               | Récupération des préférences utilisateur    |
| PATCH   | /api/user/preferences               | Mise à jour des préférences utilisateur     |
| ...     | ...                                 | Voir docs/API.md pour la liste complète     |

## Scripts d'installation, migration, seed

- `npm install` : installation des dépendances backend
- `cd client && npm install` : installation des dépendances frontend
- `npm run db:migrate` : migration de la base de données (Prisma)
- `npm run db:seed` : seed de la base avec des données de test
- `npm run dev` : démarrage du backend en mode développement
- `cd client && npm start` : démarrage du frontend
- `npm test` : lancer les tests unitaires backend

## Variables d'environnement principales

À définir dans `.env` à la racine du projet :

```
DATABASE_URL=postgresql://user:password@localhost:5432/carecost
JWT_SECRET=une-cle-secrete
EMAIL_HOST=smtp.example.com
EMAIL_USER=adresse@email.com
EMAIL_PASSWORD=motdepasse
PORT=3001
NODE_ENV=development
```

## Conventions de code & bonnes pratiques

- Linting : ESLint (`npm run lint`), formatage Prettier (`npm run format`)
- Typage strict TypeScript
- Organisation modulaire (controllers, services, routes, middleware, types)
- Gestion des erreurs centralisée
- Variables sensibles dans `.env` (jamais en dur)
- Logs détaillés uniquement en développement

## Tests

- Tests unitaires avec Jest (`npm test`)
- Exemples : hash mot de passe, validation email, service d'authentification
- Les tests sont dans `src/__tests__/`

---

Pour plus de détails, voir le dossier `docs/` (architecture, API, features, roadmap, etc.) 
