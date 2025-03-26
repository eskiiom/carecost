import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { config } from './config/config';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';

// Initialisation de l'application Express
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet()); // Sécurité
app.use(cors()); // Gestion des CORS
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL-encoded

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API CareCost' });
});

// Gestion des erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});

// Démarrage du serveur
app.listen(config.app.port, () => {
  console.log(`Serveur démarré sur le port ${config.app.port}`);
});

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
}); 