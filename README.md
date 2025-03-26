# CareCost

CareCost est une application de gestion de coûts d'entretien de véhicules. Elle permet aux utilisateurs de suivre les dépenses liées à leurs véhicules, notamment les entrées de carburant ou de recharge electriques et les entrées de maintenance ou entretien.

## Fonctionnalités

- Gestion des véhicules (création, modification, suppression)
- Suivi des entrées de carburant
- Suivi des entrées de maintenance
- Validation des dates et des données
- Authentification des utilisateurs

## Technologies utilisées

- Node.js
- Express
- TypeScript
- Prisma (PostgreSQL)
- JWT pour l'authentification

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

5. Démarrer le serveur :
```bash
npm run dev
# ou
pnpm dev
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
├── .env.example      # Exemple de configuration
└── package.json      # Dépendances et scripts
```

## API Endpoints

### Authentification
- POST /api/auth/register - Inscription d'un utilisateur
- POST /api/auth/login - Connexion d'un utilisateur

### Véhicules
- POST /api/vehicles - Création d'un véhicule
- GET /api/vehicles - Liste des véhicules de l'utilisateur
- GET /api/vehicles/:id - Détails d'un véhicule
- PUT /api/vehicles/:id - Modification d'un véhicule
- DELETE /api/vehicles/:id - Suppression d'un véhicule

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

MIT 