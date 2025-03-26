import { PrismaClient, EnergyType, Vehicle, FuelEntry } from '@prisma/client';

const prisma = new PrismaClient();

interface ConsumptionStats {
  averageConsumption: number;  // L/100km or kWh/100km
  costPerKm: number;          // Cost per kilometer
  totalCost: number;          // Total cost for the period
  totalDistance: number;      // Total distance covered
  totalQuantity: number;      // Total quantity (L or kWh)
  numberOfEntries: number;    // Number of entries in the period
  startDate: Date;           // Start of the period
  endDate: Date;            // End of the period
}

interface MonthlyConsumptionHistory {
  month: string;               // Format YYYY-MM
  averageConsumption: number;  // L/100km or kWh/100km
  totalCost: number;          // Total cost for the month
  totalQuantity: number;      // Total quantity used (L or kWh)
  totalDistance: number;      // Total distance for the month
}

interface PeriodComparison {
  currentPeriod: ConsumptionStats;
  previousPeriod: ConsumptionStats;
  percentageChange: {
    averageConsumption: number;
    costPerKm: number;
    totalCost: number;
  };
}

class ConsumptionStatisticsService {
  private calculateConsumptionStats(entries: FuelEntry[], vehicle: Vehicle): ConsumptionStats | null {
    if (entries.length < 2) {
      return null; // Need at least 2 entries to calculate consumption
    }

    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

    let totalQuantity = 0;
    let totalCost = 0;
    const startDate = sortedEntries[0].date;
    const endDate = sortedEntries[sortedEntries.length - 1].date;
    
    // Calculate total distance
    const totalDistance = sortedEntries[sortedEntries.length - 1].mileage - sortedEntries[0].mileage;

    // Sum up quantities and costs
    for (const entry of sortedEntries) {
      totalQuantity += entry.quantity;
      totalCost += entry.totalCost;
    }

    // Calculate averages
    const averageConsumption = (totalQuantity * 100) / totalDistance; // L/100km or kWh/100km
    const costPerKm = totalCost / totalDistance;

    return {
      averageConsumption,
      costPerKm,
      totalCost,
      totalDistance,
      totalQuantity,
      numberOfEntries: entries.length,
      startDate,
      endDate
    };
  }

  async getVehicleStats(vehicleId: string, userId: string, startDate?: Date, endDate?: Date): Promise<ConsumptionStats | null> {
    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId
      }
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or unauthorized');
    }

    // Get fuel entries for the period
    const entries = await prisma.fuelEntry.findMany({
      where: {
        vehicleId,
        date: {
          gte: startDate,
          lte: endDate || new Date()
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return this.calculateConsumptionStats(entries, vehicle);
  }

  async getMonthlyStats(vehicleId: string, userId: string, year: number, month: number): Promise<ConsumptionStats | null> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    return this.getVehicleStats(vehicleId, userId, startDate, endDate);
  }

  async getYearlyStats(vehicleId: string, userId: string, year: number): Promise<ConsumptionStats | null> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    return this.getVehicleStats(vehicleId, userId, startDate, endDate);
  }

  async comparePeriods(
    vehicleId: string, 
    userId: string, 
    currentStartDate: Date, 
    currentEndDate: Date
  ): Promise<PeriodComparison | null> {
    const currentStats = await this.getVehicleStats(vehicleId, userId, currentStartDate, currentEndDate);
    
    // Calculate the same duration for the previous period
    const duration = currentEndDate.getTime() - currentStartDate.getTime();
    const previousStartDate = new Date(currentStartDate.getTime() - duration);
    const previousEndDate = new Date(currentEndDate.getTime() - duration);
    
    const previousStats = await this.getVehicleStats(vehicleId, userId, previousStartDate, previousEndDate);

    if (!currentStats || !previousStats) {
      return null;
    }

    const calculatePercentageChange = (current: number, previous: number): number => {
      return ((current - previous) / previous) * 100;
    };

    return {
      currentPeriod: currentStats,
      previousPeriod: previousStats,
      percentageChange: {
        averageConsumption: calculatePercentageChange(
          currentStats.averageConsumption,
          previousStats.averageConsumption
        ),
        costPerKm: calculatePercentageChange(
          currentStats.costPerKm,
          previousStats.costPerKm
        ),
        totalCost: calculatePercentageChange(
          currentStats.totalCost,
          previousStats.totalCost
        )
      }
    };
  }

  async getConsumptionHistory(
    vehicleId: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyConsumptionHistory[]> {
    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId
      }
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or unauthorized');
    }

    // Get all entries for the period
    const entries = await prisma.fuelEntry.findMany({
      where: {
        vehicleId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Create an array of all months between startDate and endDate
    const months: string[] = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
      months.push(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Group entries by month
    const monthlyEntries = new Map<string, FuelEntry[]>();
    
    entries.forEach(entry => {
      const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyEntries.has(monthKey)) {
        monthlyEntries.set(monthKey, []);
      }
      monthlyEntries.get(monthKey)!.push(entry);
    });

    // Calculate statistics for each month
    const monthlyStats: MonthlyConsumptionHistory[] = months.map(month => {
      const monthEntries = monthlyEntries.get(month) || [];
      
      if (monthEntries.length >= 2) {
        // Sort entries by date
        const sortedEntries = monthEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Calculate total distance for the month
        const totalDistance = sortedEntries[sortedEntries.length - 1].mileage - sortedEntries[0].mileage;
        
        // Calculate totals
        let totalQuantity = 0;
        let totalCost = 0;
        
        for (const entry of sortedEntries) {
          totalQuantity += entry.quantity;
          totalCost += entry.totalCost;
        }
        
        // Calculate average consumption
        const averageConsumption = (totalQuantity * 100) / totalDistance;
        
        return {
          month,
          averageConsumption: Number(averageConsumption.toFixed(2)),
          totalCost: Number(totalCost.toFixed(2)),
          totalQuantity: Number(totalQuantity.toFixed(2)),
          totalDistance: Number(totalDistance.toFixed(2))
        };
      }
      
      // Return empty stats for months without sufficient data
      return {
        month,
        averageConsumption: 0,
        totalCost: 0,
        totalQuantity: 0,
        totalDistance: 0
      };
    });

    return monthlyStats;
  }
}

export default new ConsumptionStatisticsService(); 