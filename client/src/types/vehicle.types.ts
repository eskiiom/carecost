export enum EnergyType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  GPL = 'GPL',
  HYBRID_GASOLINE = 'HYBRID_GASOLINE',
  HYBRID_DIESEL = 'HYBRID_DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYDROGEN = 'HYDROGEN'
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  SOFT_DELETED = 'SOFT_DELETED'
}

export enum MaintenanceFrequency {
  ANNUAL = 'ANNUAL',
  BIENNIAL = 'BIENNIAL',
  EVERY_15000KM = 'EVERY_15000KM',
  EVERY_20000KM = 'EVERY_20000KM',
  EVERY_30000KM = 'EVERY_30000KM'
}

export interface FuelEntry {
  id: string;
  date: Date;
  mileage: number;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  fuelType?: string;
  stationType?: string;
  rechargeType?: string;
  isSubscription: boolean;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  vehicleId: string;
}

export interface MaintenanceEntry {
  id: string;
  date: Date;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  providerName?: string;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  vehicleId: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  mileage: number;
  energyType: EnergyType;
  productionDate?: Date;
  acquisitionDate?: Date;
  initialMileage: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  lastTechnicalCheck?: Date;
  lastMaintenanceDone?: Date;
  maintenanceFrequency?: MaintenanceFrequency;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  fuelEntries: FuelEntry[];
  maintenanceEntries: MaintenanceEntry[];
  historicalMaxMileage?: number;
}

export interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  mileage: number;
  energyType: EnergyType;
  productionDate?: Date;
  acquisitionDate?: Date;
  initialMileage: number;
  powerDIN?: number;
  powerHP?: number;
  batterySize?: number;
  lastTechnicalCheck?: Date;
  lastMaintenanceDone?: Date;
  maintenanceFrequency?: MaintenanceFrequency;
  status?: VehicleStatus;
} 