import express, { Request, Response, NextFunction } from 'express';
import { UserPreferencesController } from '../controllers/userPreferences.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, UserPreferencesController.getPreferences);
router.patch('/', authenticate, UserPreferencesController.updatePreferences);

export const userPreferencesRoutes = router; 