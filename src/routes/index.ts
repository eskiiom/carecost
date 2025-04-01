import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import fuelEntryRoutes from './fuelEntry.routes';
import maintenanceEntryRoutes from './maintenanceEntry.routes';
import consumptionStatisticsRoutes from './consumptionStatistics.routes';
import fuelRoutes from './fuel.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/fuel-entries', fuelEntryRoutes);
router.use('/maintenance-entries', maintenanceEntryRoutes);
router.use('/statistics', consumptionStatisticsRoutes);
router.use('/fuels', fuelRoutes);

export default router; 