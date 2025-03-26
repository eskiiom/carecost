import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Routes publiques
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/reset-password', AuthController.resetPassword);
router.post('/update-password', AuthController.updatePassword);

export default router; 