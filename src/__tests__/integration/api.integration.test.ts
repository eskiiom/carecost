import request from 'supertest';
import express from 'express';
import { config } from '../../config/config';
import authRoutes from '../../routes/auth.routes';
import vehicleRoutes from '../../routes/vehicle.routes';

// Création d'une app Express minimale pour les tests
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Utilisateur de test (doit exister dans la base ou être seedé)
const testUser = {
  email: 'admin@carecost.com',
  password: 'password123',
};

describe('API Integration', () => {
  let token: string;

  it('should login and return a JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(testUser)
      .expect(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('should get the list of vehicles for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 