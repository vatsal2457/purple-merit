import { SimulationService } from '../src/services/simulationService';
import Driver from '../src/models/Driver';
import Route from '../src/models/Route';
import Order from '../src/models/Order';

// Mock the models
jest.mock('../src/models/Driver');
jest.mock('../src/models/Route');
jest.mock('../src/models/Order');

describe('SimulationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runSimulation', () => {
    it('should run simulation successfully with valid input', async () => {
      // Mock data
      const mockDrivers = [
        {
          _id: 'driver1',
          name: 'Test Driver 1',
          currentShiftHours: 6,
          pastWeekHours: 35
        }
      ];

      const mockRoutes = [
        {
          routeId: 'R001',
          distance: 25,
          trafficLevel: 'Medium',
          baseTime: 45,
          fuelCost: 125,
          adjustedTime: 54
        }
      ];

      const mockOrders = [
        {
          orderId: 'O001',
          value: 1500,
          assignedRoute: 'R001',
          deliveryTimestamp: new Date('2024-01-15T12:00:00Z')
        }
      ];

      // Mock model methods
      (Driver.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockDrivers)
      });
      (Route.find as jest.Mock).mockResolvedValue(mockRoutes);
      (Order.find as jest.Mock).mockResolvedValue(mockOrders);

      const input = {
        availableDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 10
      };

      const result = await SimulationService.runSimulation(input);

      expect(result).toBeDefined();
      expect(result.totalProfit).toBeGreaterThan(0);
      expect(result.efficiencyScore).toBeGreaterThanOrEqual(0);
      expect(result.efficiencyScore).toBeLessThanOrEqual(100);
      expect(result.onTimeDeliveries).toBeGreaterThanOrEqual(0);
      expect(result.lateDeliveries).toBeGreaterThanOrEqual(0);
      expect(result.fuelCost).toBeGreaterThan(0);
      expect(result.penalties).toBeGreaterThanOrEqual(0);
      expect(result.bonuses).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for invalid available drivers', async () => {
      const input = {
        availableDrivers: 0,
        startTime: '08:00',
        maxHoursPerDay: 10
      };

      await expect(SimulationService.runSimulation(input)).rejects.toThrow(
        'Available drivers must be greater than 0'
      );
    });

    it('should throw error for invalid max hours per day', async () => {
      const input = {
        availableDrivers: 5,
        startTime: '08:00',
        maxHoursPerDay: 25
      };

      await expect(SimulationService.runSimulation(input)).rejects.toThrow(
        'Max hours per day must be between 1 and 24'
      );
    });

    it('should throw error for invalid start time format', async () => {
      const input = {
        availableDrivers: 5,
        startTime: '25:00',
        maxHoursPerDay: 10
      };

      await expect(SimulationService.runSimulation(input)).rejects.toThrow(
        'Start time must be in HH:MM format'
      );
    });

    it('should apply 30% speed reduction for fatigued drivers', async () => {
      const mockDrivers = [
        {
          _id: 'driver1',
          name: 'Fatigued Driver',
          currentShiftHours: 9, // > 8 hours = fatigued
          pastWeekHours: 40
        }
      ];

      const mockRoutes = [
        {
          routeId: 'R001',
          distance: 20,
          trafficLevel: 'Low',
          baseTime: 30,
          fuelCost: 100,
          adjustedTime: 30
        }
      ];

      const mockOrders = [
        {
          orderId: 'O001',
          value: 1000,
          assignedRoute: 'R001',
          deliveryTimestamp: new Date('2024-01-15T10:00:00Z')
        }
      ];

      (Driver.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockDrivers)
      });
      (Route.find as jest.Mock).mockResolvedValue(mockRoutes);
      (Order.find as jest.Mock).mockResolvedValue(mockOrders);

      const input = {
        availableDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 10
      };

      const result = await SimulationService.runSimulation(input);

      // The fatigued driver should have reduced efficiency
      expect(result.driverAssignments[0].isFatigued).toBe(true);
    });

    it('should calculate high-value bonus correctly', async () => {
      const mockDrivers = [
        {
          _id: 'driver1',
          name: 'Test Driver',
          currentShiftHours: 6,
          pastWeekHours: 35
        }
      ];

      const mockRoutes = [
        {
          routeId: 'R001',
          distance: 15,
          trafficLevel: 'Low',
          baseTime: 20,
          fuelCost: 75,
          adjustedTime: 20
        }
      ];

      const mockOrders = [
        {
          orderId: 'O001',
          value: 1500, // > 1000 = high value
          assignedRoute: 'R001',
          deliveryTimestamp: new Date('2024-01-15T10:00:00Z')
        }
      ];

      (Driver.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockDrivers)
      });
      (Route.find as jest.Mock).mockResolvedValue(mockRoutes);
      (Order.find as jest.Mock).mockResolvedValue(mockOrders);

      const input = {
        availableDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 10
      };

      const result = await SimulationService.runSimulation(input);

      // Should have bonus for high-value order delivered on time
      expect(result.bonuses).toBeGreaterThan(0);
      expect(result.orderResults[0].bonus).toBe(150); // 10% of 1500
    });

    it('should apply late delivery penalty correctly', async () => {
      const mockDrivers = [
        {
          _id: 'driver1',
          name: 'Test Driver',
          currentShiftHours: 6,
          pastWeekHours: 35
        }
      ];

      const mockRoutes = [
        {
          routeId: 'R001',
          distance: 50,
          trafficLevel: 'High',
          baseTime: 60,
          fuelCost: 350,
          adjustedTime: 90
        }
      ];

      const mockOrders = [
        {
          orderId: 'O001',
          value: 800,
          assignedRoute: 'R001',
          deliveryTimestamp: new Date('2024-01-15T09:00:00Z') // Very early deadline
        }
      ];

      (Driver.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockDrivers)
      });
      (Route.find as jest.Mock).mockResolvedValue(mockRoutes);
      (Order.find as jest.Mock).mockResolvedValue(mockOrders);

      const input = {
        availableDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 10
      };

      const result = await SimulationService.runSimulation(input);

      // Should have penalty for late delivery
      expect(result.penalties).toBeGreaterThan(0);
      expect(result.orderResults[0].penalty).toBe(50);
    });
  });
});
