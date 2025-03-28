import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes publiques
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/reset-password', AuthController.resetPassword);
router.post('/update-password', AuthController.updatePassword);
router.get('/verify', authenticate, (req, res) => {
  res.json({ message: 'Token valide' });
});

export default router; 