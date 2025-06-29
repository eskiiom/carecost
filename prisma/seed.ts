import { PrismaClient, EnergyType, MaintenanceType, MaintenanceFrequency, UserRole, RecallSeverity, VehicleUsageType, ReminderType, BudgetPeriod, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Nettoyer la base de données
  console.log('🧹 Nettoyage de la base de données...');
  await prisma.auditLog.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.costCategory.deleteMany();
  await prisma.vehicleShare.deleteMany();
  await prisma.maintenanceReminder.deleteMany();
  await prisma.maintenanceEntry.deleteMany();
  await prisma.fuelEntry.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.fuelType.deleteMany();
  await prisma.gasStation.deleteMany();
  await prisma.maintenanceTemplate.deleteMany();
  await prisma.manufacturerRecall.deleteMany();

  // Créer les utilisateurs de test
  console.log('👥 Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@carecost.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'CareCost',
      role: UserRole.SUPER_ADMIN,
      preferences: {
        vehicleViewMode: 'grid',
        theme: 'light',
        language: 'fr'
      }
    }
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'user@carecost.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      preferences: {
        vehicleViewMode: 'list',
        theme: 'dark',
        language: 'fr'
      }
    }
  });

  // Créer les types de carburant
  console.log('⛽ Création des types de carburant...');
  const fuelTypes = [
    { name: 'Sans plomb 95 (E5)', energyType: EnergyType.GASOLINE },
    { name: 'Sans plomb 98 (E5)', energyType: EnergyType.GASOLINE },
    { name: 'Diesel (B7)', energyType: EnergyType.DIESEL },
    { name: 'GPL', energyType: EnergyType.GPL },
    { name: 'Électrique', energyType: EnergyType.ELECTRIC },
    { name: 'Hybride essence', energyType: EnergyType.HYBRID_GASOLINE },
    { name: 'Hybride diesel', energyType: EnergyType.HYBRID_DIESEL },
    { name: 'Hydrogène', energyType: EnergyType.HYDROGEN },
    { name: 'E85', energyType: EnergyType.FLEX_FUEL },
    { name: 'B100', energyType: EnergyType.BIOFUEL }
  ];

  for (const fuelType of fuelTypes) {
    await prisma.fuelType.create({
      data: fuelType
    });
  }

  // Créer les stations-service
  console.log('🏪 Création des stations-service...');
  const gasStations = [
    { name: 'Total', address: '123 Avenue de la République, Paris', latitude: 48.8566, longitude: 2.3522, brand: 'Total' },
    { name: 'Shell', address: '456 Boulevard Saint-Germain, Paris', latitude: 48.8534, longitude: 2.3488, brand: 'Shell' },
    { name: 'BP', address: '789 Rue de Rivoli, Paris', latitude: 48.8606, longitude: 2.3376, brand: 'BP' },
    { name: 'Esso', address: '321 Champs-Élysées, Paris', latitude: 48.8698, longitude: 2.3077, brand: 'Esso' }
  ];

  for (const station of gasStations) {
    await prisma.gasStation.create({
      data: station
    });
  }

  // Créer les templates de maintenance
  console.log('🔧 Création des templates de maintenance...');
  const maintenanceTemplates = [
    {
      name: 'Vidange huile moteur',
      description: 'Remplacement de l\'huile moteur et du filtre à huile',
      type: MaintenanceType.OIL_CHANGE,
      frequency: MaintenanceFrequency.EVERY_15000KM,
      estimatedCost: 80.0,
      isDefault: true
    },
    {
      name: 'Révision complète',
      description: 'Révision complète du véhicule',
      type: MaintenanceType.ROUTINE,
      frequency: MaintenanceFrequency.ANNUAL,
      estimatedCost: 300.0,
      isDefault: true
    },
    {
      name: 'Pneus',
      description: 'Remplacement des pneus',
      type: MaintenanceType.TIRES,
      frequency: MaintenanceFrequency.EVERY_30000KM,
      estimatedCost: 400.0,
      isDefault: true
    },
    {
      name: 'Freins',
      description: 'Remplacement des plaquettes et disques de frein',
      type: MaintenanceType.BRAKE_SERVICE,
      frequency: MaintenanceFrequency.EVERY_20000KM,
      estimatedCost: 250.0,
      isDefault: true
    }
  ];

  for (const template of maintenanceTemplates) {
    await prisma.maintenanceTemplate.create({
      data: template
    });
  }

  // Créer les rappels constructeur
  console.log('⚠️ Création des rappels constructeur...');
  const manufacturerRecalls = [
    {
      brand: 'Renault',
      model: 'Clio',
      yearFrom: 2019,
      yearTo: 2021,
      description: 'Rappel pour problème de direction assistée',
      severity: RecallSeverity.HIGH,
      dateIssued: new Date('2023-01-15'),
      isActive: true
    },
    {
      brand: 'Peugeot',
      model: '208',
      yearFrom: 2020,
      yearTo: 2022,
      description: 'Rappel pour problème de système de freinage',
      severity: RecallSeverity.CRITICAL,
      dateIssued: new Date('2023-03-20'),
      isActive: true
    }
  ];

  for (const recall of manufacturerRecalls) {
    await prisma.manufacturerRecall.create({
      data: recall
    });
  }

  // Créer les catégories de coûts
  console.log('💰 Création des catégories de coûts...');
  const costCategories = [
    { name: 'Carburant', description: 'Dépenses en carburant', color: '#FF6B6B', icon: 'local_gas_station', isDefault: true },
    { name: 'Maintenance', description: 'Entretien et réparations', color: '#4ECDC4', icon: 'build', isDefault: true },
    { name: 'Assurance', description: 'Assurance véhicule', color: '#45B7D1', icon: 'security', isDefault: true },
    { name: 'Péages', description: 'Péages autoroute', color: '#96CEB4', icon: 'toll', isDefault: true },
    { name: 'Parking', description: 'Frais de parking', color: '#FFEAA7', icon: 'local_parking', isDefault: true },
    { name: 'Amendes', description: 'Amendes et contraventions', color: '#DDA0DD', icon: 'warning', isDefault: true }
  ];

  for (const category of costCategories) {
    await prisma.costCategory.create({
      data: {
        ...category,
        userId: testUser.id
      }
    });
  }

  // Créer les véhicules de test
  console.log('🚗 Création des véhicules...');
  const vehicles = [
    {
      userId: testUser.id,
      brand: 'Renault',
      model: 'Clio',
      licensePlate: 'AB-123-CD',
      year: 2020,
      vin: 'VF1RFA0L123456789',
      energyType: EnergyType.GASOLINE,
      initialMileage: 15000,
      powerHP: 90,
      isFavorite: true,
      usageType: VehicleUsageType.PERSONAL
    },
    {
      userId: testUser.id,
      brand: 'Peugeot',
      model: '208',
      licensePlate: 'EF-456-GH',
      year: 2021,
      vin: 'VF3RFA0L987654321',
      energyType: EnergyType.DIESEL,
      initialMileage: 8000,
      powerHP: 100,
      isFavorite: false,
      usageType: VehicleUsageType.PROFESSIONAL
    }
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({
      data: vehicle
    });
  }

  // Récupérer les véhicules créés
  const createdVehicles = await prisma.vehicle.findMany({
    where: { userId: testUser.id }
  });

  // Créer des entrées de carburant de test
  console.log('⛽ Création des entrées de carburant...');
  const fuelEntries = [
    {
      vehicleId: createdVehicles[0].id,
      date: new Date('2024-01-15'),
      mileage: 15200,
      quantity: 45.5,
      unitPrice: 1.85,
      totalCost: 84.18,
      fuelType: 'Sans plomb 95 (E5)',
      stationName: 'Total',
      stationAddress: '123 Avenue de la République, Paris'
    },
    {
      vehicleId: createdVehicles[0].id,
      date: new Date('2024-02-01'),
      mileage: 15800,
      quantity: 42.0,
      unitPrice: 1.82,
      totalCost: 76.44,
      fuelType: 'Sans plomb 95 (E5)',
      stationName: 'Shell',
      stationAddress: '456 Boulevard Saint-Germain, Paris'
    },
    {
      vehicleId: createdVehicles[1].id,
      date: new Date('2024-01-20'),
      mileage: 8500,
      quantity: 38.0,
      unitPrice: 1.75,
      totalCost: 66.50,
      fuelType: 'Diesel (B7)',
      stationName: 'BP',
      stationAddress: '789 Rue de Rivoli, Paris'
    }
  ];

  for (const entry of fuelEntries) {
    await prisma.fuelEntry.create({
      data: entry
    });
  }

  // Créer des entrées de maintenance de test
  console.log('🔧 Création des entrées de maintenance...');
  const maintenanceEntries = [
    {
      vehicleId: createdVehicles[0].id,
      date: new Date('2024-01-10'),
      type: MaintenanceType.OIL_CHANGE,
      description: 'Vidange huile moteur + filtre à huile',
      cost: 85.0,
      mileage: 15000,
      providerName: 'Garage Renault'
    },
    {
      vehicleId: createdVehicles[1].id,
      date: new Date('2024-01-25'),
      type: MaintenanceType.ROUTINE,
      description: 'Révision complète',
      cost: 320.0,
      mileage: 8000,
      providerName: 'Garage Peugeot'
    }
  ];

  for (const entry of maintenanceEntries) {
    await prisma.maintenanceEntry.create({
      data: entry
    });
  }

  // Créer des rappels de maintenance
  console.log('⏰ Création des rappels de maintenance...');
  const maintenanceReminders = [
    {
      vehicleId: createdVehicles[0].id,
      type: ReminderType.MILEAGE,
      dueMileage: 30000,
      description: 'Vidange huile moteur',
      isActive: true
    },
    {
      vehicleId: createdVehicles[1].id,
      type: ReminderType.DATE,
      dueDate: new Date('2024-12-31'),
      description: 'Contrôle technique',
      isActive: true
    }
  ];

  for (const reminder of maintenanceReminders) {
    await prisma.maintenanceReminder.create({
      data: reminder
    });
  }

  // Créer des budgets de test
  console.log('💰 Création des budgets...');
  const budgets = [
    {
      userId: testUser.id,
      vehicleId: createdVehicles[0].id,
      name: 'Budget mensuel Clio',
      amount: 300.0,
      period: BudgetPeriod.MONTHLY,
      startDate: new Date('2024-01-01'),
      isActive: true
    },
    {
      userId: testUser.id,
      vehicleId: createdVehicles[1].id,
      name: 'Budget trimestriel 208',
      amount: 800.0,
      period: BudgetPeriod.QUARTERLY,
      startDate: new Date('2024-01-01'),
      isActive: true
    }
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: budget
    });
  }

  // Créer des notifications de test
  console.log('🔔 Création des notifications...');
  const notifications = [
    {
      userId: testUser.id,
      type: NotificationType.MAINTENANCE_REMINDER,
      title: 'Rappel maintenance',
      message: 'La vidange de votre Renault Clio est prévue dans 1000 km',
      data: { vehicleId: createdVehicles[0].id, dueMileage: 30000 }
    },
    {
      userId: testUser.id,
      type: NotificationType.BUDGET_EXCEEDED,
      title: 'Budget dépassé',
      message: 'Vous avez dépassé votre budget mensuel pour la Peugeot 208',
      data: { vehicleId: createdVehicles[1].id, budgetId: 'budget-id' }
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification
    });
  }

  console.log('✅ Seeding terminé avec succès !');
  console.log('\n📋 Comptes de test créés :');
  console.log('   Admin: admin@carecost.com / password123');
  console.log('   User: user@carecost.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 