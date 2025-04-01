import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import fuelEntryRoutes from './routes/fuelEntry.routes';
import maintenanceEntryRoutes from './routes/maintenanceEntry.routes';
import statisticsRoutes from './routes/consumptionStatistics.routes';
import { userPreferencesRoutes } from './routes/userPreferences.routes';
import fuelRoutes from './routes/fuel.routes';

// Initialisation de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicles/:vehicleId/fuel-entries', fuelEntryRoutes);
app.use('/api/vehicles/:vehicleId/maintenance', maintenanceEntryRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/user/preferences', userPreferencesRoutes);
app.use('/api/fuels', fuelRoutes);

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
const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 