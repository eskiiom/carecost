import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { config } from './config/config';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import fuelEntryRoutes from './routes/fuelEntry.routes';
import maintenanceEntryRoutes from './routes/maintenanceEntry.routes';
import statisticsRoutes from './routes/consumptionStatistics.routes';

// Initialisation de l'application Express
const app = express();
const prisma = new PrismaClient();

// Configuration CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://carecost.com'] // À remplacer par votre domaine de production
    : ['http://localhost:3001'], // Frontend sur le port 3001
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization']
};

// Middleware
app.use(helmet()); // Sécurité
app.use(cors(corsOptions)); // Gestion des CORS avec options spécifiques
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL-encoded

// Configuration de l'encodage
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/fuel-entries', fuelEntryRoutes);
app.use('/api/maintenance-entries', maintenanceEntryRoutes);
app.use('/api/statistics', statisticsRoutes);

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API CareCost' });
});

// Lister toutes les routes enregistrées
console.log('Routes enregistrées :');
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    console.log(`Route: ${middleware.route.path}, Method: ${Object.keys(middleware.route.methods)}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods).join(', ');
        console.log(`Route: ${path}, Method: ${methods}`);
      }
    });
  }
});

// Gestion des erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});

// Démarrage du serveur
app.listen(config.app.port, () => {
  console.log(`Serveur démarré sur le port ${config.app.port}`);
  console.log('Configuration CORS:', corsOptions);
});

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
}); 