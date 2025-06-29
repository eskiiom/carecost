import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001/api';

describe('Vehicle CRUD Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testVehicleId: string;

  // Données de test
  const testUser = {
    email: 'test-vehicle@example.com',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'Vehicle'
  };

  const testVehicle = {
    brand: 'Renault',
    model: 'Clio',
    year: 2020,
    licensePlate: 'AB-123-CD',
    vin: 'VF1RFA00001234567',
    initialMileage: 50000,
    energyType: 'GASOLINE',
    powerHP: 90
  };

  beforeAll(async () => {
    // Nettoyer la base de données en respectant les contraintes de clés étrangères
    try {
      // Supprimer d'abord les entités liées aux véhicules de test
      await prisma.fuelEntry.deleteMany({
        where: {
          vehicle: {
            licensePlate: testVehicle.licensePlate
          }
        }
      });
      
      await prisma.maintenanceEntry.deleteMany({
        where: {
          vehicle: {
            licensePlate: testVehicle.licensePlate
          }
        }
      });

      // Puis supprimer les véhicules de test
      await prisma.vehicle.deleteMany({
        where: { licensePlate: testVehicle.licensePlate }
      });
    } catch (error) {
      // Ignorer les erreurs si les données n'existent pas
      console.log('Nettoyage initial:', error);
    }

    try {
      await prisma.user.deleteMany({
        where: { email: testUser.email }
      });
    } catch (error) {
      console.log('Nettoyage utilisateur initial:', error);
    }

    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        firstName: testUser.firstName,
        lastName: testUser.lastName
      }
    });
    testUserId = user.id;

    // Générer un token JWT
    authToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    // Créer un véhicule de test pour chaque test CRUD
    try {
      const response = await request(BASE_URL)
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testVehicle);

      if (response.status === 201) {
        testVehicleId = response.body.id;
      }
    } catch (error) {
      console.log('Erreur lors de la création du véhicule de test:', error);
    }
  });

  afterEach(async () => {
    // Nettoyer le véhicule de test après chaque test
    if (testVehicleId) {
      try {
        // Supprimer d'abord les entités liées
        await prisma.fuelEntry.deleteMany({
          where: { vehicleId: testVehicleId }
        });
        
        await prisma.maintenanceEntry.deleteMany({
          where: { vehicleId: testVehicleId }
        });

        // Puis supprimer le véhicule
        await prisma.vehicle.deleteMany({
          where: { id: testVehicleId }
        });
      } catch (error) {
        console.log('Erreur lors du nettoyage du véhicule de test:', error);
      }
    }
  });

  afterAll(async () => {
    // Nettoyer après les tests en respectant les contraintes
    try {
      // Supprimer d'abord les entités liées
      await prisma.fuelEntry.deleteMany({
        where: { vehicleId: testVehicleId }
      });
      
      await prisma.maintenanceEntry.deleteMany({
        where: { vehicleId: testVehicleId }
      });

      // Puis supprimer les véhicules
      await prisma.vehicle.deleteMany({
        where: { userId: testUserId }
      });
    } catch (error) {
      console.log('Nettoyage final véhicules:', error);
    }

    try {
      await prisma.user.deleteMany({
        where: { id: testUserId }
      });
    } catch (error) {
      console.log('Nettoyage final utilisateur:', error);
    }

    await prisma.$disconnect();
  });

  describe('POST /api/vehicles - Créer un véhicule', () => {
    it('devrait créer un véhicule avec des données valides', async () => {
      const newVehicle = {
        ...testVehicle,
        licensePlate: 'XY-789-ZW',
        vin: 'VF1RFA00001234568'
      };

      const response = await request(BASE_URL)
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newVehicle)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.brand).toBe(newVehicle.brand);
      expect(response.body.model).toBe(newVehicle.model);
      expect(response.body.licensePlate).toBe(newVehicle.licensePlate);
      expect(response.body.userId).toBe(testUserId);

      // Nettoyer ce véhicule spécifique
      await prisma.vehicle.deleteMany({
        where: { id: response.body.id }
      });
    });

    it('devrait refuser la création avec des données manquantes', async () => {
      const invalidVehicle = {
        brand: 'Renault',
        // model manquant
        year: 2020
      };

      const response = await request(BASE_URL)
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidVehicle)
        .expect(400);

      expect(response.body.message).toContain('modèle');
    });

    it('devrait refuser la création avec un VIN dupliqué', async () => {
      // Vérifier que le véhicule de test existe bien (créé dans beforeEach)
      expect(testVehicleId).toBeDefined();
      
      // Essayer de créer un autre véhicule avec le même VIN
      const duplicateVehicle = {
        ...testVehicle,
        licensePlate: 'XY-789-ZW' // Plaque différente
      };

      const response = await request(BASE_URL)
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateVehicle)
        .expect(400);

      expect(response.body.message).toContain('VIN existe déjà');
    });

    it('devrait refuser la création sans authentification', async () => {
      await request(BASE_URL)
        .post('/vehicles')
        .send(testVehicle)
        .expect(401);
    });
  });

  describe('GET /api/vehicles - Lister les véhicules', () => {
    it('devrait retourner la liste des véhicules de l\'utilisateur', async () => {
      const response = await request(BASE_URL)
        .get('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('brand');
      expect(response.body[0].userId).toBe(testUserId);
    });

    it('devrait refuser l\'accès sans authentification', async () => {
      await request(BASE_URL)
        .get('/vehicles')
        .expect(401);
    });
  });

  describe('GET /api/vehicles/:id - Récupérer un véhicule', () => {
    it('devrait retourner un véhicule spécifique', async () => {
      const response = await request(BASE_URL)
        .get(`/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testVehicleId);
      expect(response.body.brand).toBe(testVehicle.brand);
      expect(response.body.model).toBe(testVehicle.model);
    });

    it('devrait retourner 404 pour un véhicule inexistant', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(BASE_URL)
        .get(`/vehicles/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('devrait refuser l\'accès sans authentification', async () => {
      await request(BASE_URL)
        .get(`/vehicles/${testVehicleId}`)
        .expect(401);
    });
  });

  describe('PUT /api/vehicles/:id - Modifier un véhicule', () => {
    it('devrait modifier un véhicule avec des données valides', async () => {
      const updateData = {
        initialMileage: 55000,
        powerHP: 95
      };

      const response = await request(BASE_URL)
        .put(`/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.initialMileage).toBe(updateData.initialMileage);
      expect(response.body.powerHP).toBe(updateData.powerHP);
      expect(response.body.brand).toBe(testVehicle.brand); // Non modifié
    });

    it('devrait refuser la modification avec des données invalides', async () => {
      const invalidData = {
        year: 1800 // Année invalide
      };

      const response = await request(BASE_URL)
        .put(`/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('année');
    });

    it('devrait refuser la modification sans authentification', async () => {
      await request(BASE_URL)
        .put(`/vehicles/${testVehicleId}`)
        .send({ initialMileage: 60000 })
        .expect(401);
    });
  });

  describe('GET /api/vehicles/:id/historical-max-mileage - Kilométrage max historique', () => {
    it('devrait retourner le kilométrage maximum historique', async () => {
      const response = await request(BASE_URL)
        .get(`/vehicles/${testVehicleId}/historical-max-mileage`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(typeof response.body.historicalMaxMileage).toBe('number');
      expect(response.body.historicalMaxMileage).toBeGreaterThanOrEqual(50000);
    });

    it('devrait refuser l\'accès sans authentification', async () => {
      await request(BASE_URL)
        .get(`/vehicles/${testVehicleId}/historical-max-mileage`)
        .expect(401);
    });
  });

  describe('DELETE /api/vehicles/:id - Supprimer un véhicule', () => {
    it('devrait supprimer un véhicule', async () => {
      await request(BASE_URL)
        .delete(`/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que le véhicule n'existe plus
      await request(BASE_URL)
        .get(`/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('devrait refuser la suppression sans authentification', async () => {
      await request(BASE_URL)
        .delete(`/vehicles/${testVehicleId}`)
        .expect(401);
    });
  });
}); 