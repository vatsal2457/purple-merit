import Driver from '../models/Driver';
import Route from '../models/Route';
import Order from '../models/Order';

export interface SimulationInput {
  availableDrivers: number;
  startTime: string;
  maxHoursPerDay: number;
}

export interface SimulationResult {
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  fuelCost: number;
  penalties: number;
  bonuses: number;
  driverAssignments: DriverAssignment[];
  orderResults: OrderResult[];
}

export interface DriverAssignment {
  driverId: string;
  driverName: string;
  assignedOrders: string[];
  totalHours: number;
  totalDistance: number;
  isFatigued: boolean;
}

export interface OrderResult {
  orderId: string;
  assignedDriver: string;
  routeId: string;
  orderValue: number;
  deliveryStatus: 'On Time' | 'Late';
  fuelCost: number;
  penalty: number;
  bonus: number;
  profit: number;
}

export class SimulationService {
  /**
   * Run the delivery simulation with company rules
   */
  static async runSimulation(input: SimulationInput): Promise<SimulationResult> {
    try {
      // Validate input
      this.validateSimulationInput(input);

      // Get all data
      const [drivers, routes, orders] = await Promise.all([
        Driver.find().limit(input.availableDrivers),
        Route.find(),
        Order.find({ isDelivered: false })
      ]);

      if (drivers.length === 0) {
        throw new Error('No drivers available for simulation');
      }

      if (orders.length === 0) {
        throw new Error('No pending orders for simulation');
      }

      // Parse start time
      const [startHour, startMinute] = input.startTime.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(startHour, startMinute, 0, 0);

      // Assign orders to drivers
      const driverAssignments = this.assignOrdersToDrivers(
        drivers,
        orders,
        routes,
        startTime,
        input.maxHoursPerDay
      );

      // Calculate results
      const orderResults = this.calculateOrderResults(
        orders,
        routes,
        driverAssignments,
        startTime
      );

      // Calculate KPIs
      const kpis = this.calculateKPIs(orderResults);

      return {
        ...kpis,
        driverAssignments,
        orderResults
      };

    } catch (error) {
      throw new Error(`Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate simulation input parameters
   */
  private static validateSimulationInput(input: SimulationInput): void {
    if (input.availableDrivers <= 0) {
      throw new Error('Available drivers must be greater than 0');
    }

    if (input.maxHoursPerDay <= 0 || input.maxHoursPerDay > 24) {
      throw new Error('Max hours per day must be between 1 and 24');
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(input.startTime)) {
      throw new Error('Start time must be in HH:MM format');
    }
  }

  /**
   * Assign orders to drivers based on availability and constraints
   */
  private static assignOrdersToDrivers(
    drivers: any[],
    orders: any[],
    routes: any[],
    startTime: Date,
    maxHoursPerDay: number
  ): DriverAssignment[] {
    const assignments: DriverAssignment[] = drivers.map(driver => ({
      driverId: driver._id.toString(),
      driverName: driver.name,
      assignedOrders: [],
      totalHours: 0,
      totalDistance: 0,
      isFatigued: driver.currentShiftHours > 8
    }));

    // Sort orders by delivery timestamp (earliest first)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(a.deliveryTimestamp).getTime() - new Date(b.deliveryTimestamp).getTime()
    );

    // Create route lookup
    const routeMap = new Map(routes.map(route => [route.routeId, route]));

    // Assign orders to drivers
    for (const order of sortedOrders) {
      const route = routeMap.get(order.assignedRoute);
      if (!route) continue;

      // Find best available driver
      let bestDriver = null;
      let bestScore = -1;

      for (const assignment of assignments) {
        // Check if driver can handle this order
        const canHandle = this.canDriverHandleOrder(
          assignment,
          route,
          maxHoursPerDay,
          startTime
        );

        if (canHandle) {
          const score = this.calculateDriverScore(assignment, route);
          if (score > bestScore) {
            bestScore = score;
            bestDriver = assignment;
          }
        }
      }

      if (bestDriver) {
        // Assign order to driver
        bestDriver.assignedOrders.push(order.orderId);
        bestDriver.totalHours += route.adjustedTime / 60; // Convert minutes to hours
        bestDriver.totalDistance += route.distance;
      }
    }

    return assignments;
  }

  /**
   * Check if driver can handle an order
   */
  private static canDriverHandleOrder(
    assignment: DriverAssignment,
    route: any,
    maxHoursPerDay: number,
    startTime: Date
  ): boolean {
    // Check if adding this route would exceed max hours
    const additionalHours = route.adjustedTime / 60;
    if (assignment.totalHours + additionalHours > maxHoursPerDay) {
      return false;
    }

    return true;
  }

  /**
   * Calculate driver score for order assignment
   */
  private static calculateDriverScore(assignment: DriverAssignment, route: any): number {
    let score = 100;

    // Penalize fatigued drivers (30% speed reduction)
    if (assignment.isFatigued) {
      score -= 30;
    }

    // Prefer drivers with fewer current assignments
    score -= assignment.assignedOrders.length * 5;

    // Prefer drivers with less total distance
    score -= assignment.totalDistance * 0.1;

    return Math.max(0, score);
  }

  /**
   * Calculate results for each order
   */
  private static calculateOrderResults(
    orders: any[],
    routes: any[],
    driverAssignments: DriverAssignment[],
    startTime: Date
  ): OrderResult[] {
    const routeMap = new Map(routes.map(route => [route.routeId, route]));
    const driverMap = new Map(driverAssignments.map(d => [d.driverId, d]));

    return orders.map(order => {
      const route = routeMap.get(order.assignedRoute);
      if (!route) {
        throw new Error(`Route ${order.assignedRoute} not found`);
      }

      // Find assigned driver
      const assignedDriver = driverAssignments.find(d => 
        d.assignedOrders.includes(order.orderId)
      );

      // Calculate delivery time
      const deliveryTime = this.calculateDeliveryTime(
        startTime,
        route,
        assignedDriver?.isFatigued || false
      );

      // Check if delivery is on time
      const expectedDelivery = new Date(order.deliveryTimestamp);
      const isOnTime = deliveryTime <= expectedDelivery;

      // Calculate fuel cost
      const fuelCost = route.fuelCost;

      // Calculate penalty (₹50 for late delivery)
      const penalty = isOnTime ? 0 : 50;

      // Calculate bonus (10% for high-value orders delivered on time)
      const bonus = (order.value > 1000 && isOnTime) ? order.value * 0.1 : 0;

      // Calculate profit
      const profit = order.value + bonus - penalty - fuelCost;

      return {
        orderId: order.orderId,
        assignedDriver: assignedDriver?.driverName || 'Unassigned',
        routeId: order.assignedRoute,
        orderValue: order.value,
        deliveryStatus: isOnTime ? 'On Time' : 'Late',
        fuelCost,
        penalty,
        bonus,
        profit
      };
    });
  }

  /**
   * Calculate delivery time considering driver fatigue
   */
  private static calculateDeliveryTime(
    startTime: Date,
    route: any,
    isFatigued: boolean
  ): Date {
    let adjustedTime = route.adjustedTime;
    
    // Apply 30% speed reduction for fatigued drivers
    if (isFatigued) {
      adjustedTime *= 1.3;
    }

    const deliveryTime = new Date(startTime);
    deliveryTime.setMinutes(deliveryTime.getMinutes() + adjustedTime);
    
    return deliveryTime;
  }

  /**
   * Calculate overall KPIs
   */
  private static calculateKPIs(orderResults: OrderResult[]): {
    totalProfit: number;
    efficiencyScore: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    fuelCost: number;
    penalties: number;
    bonuses: number;
  } {
    const totalProfit = orderResults.reduce((sum, order) => sum + order.profit, 0);
    const onTimeDeliveries = orderResults.filter(order => order.deliveryStatus === 'On Time').length;
    const lateDeliveries = orderResults.filter(order => order.deliveryStatus === 'Late').length;
    const totalDeliveries = orderResults.length;
    const efficiencyScore = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;
    const fuelCost = orderResults.reduce((sum, order) => sum + order.fuelCost, 0);
    const penalties = orderResults.reduce((sum, order) => sum + order.penalty, 0);
    const bonuses = orderResults.reduce((sum, order) => sum + order.bonus, 0);

    return {
      totalProfit: Math.round(totalProfit * 100) / 100,
      efficiencyScore: Math.round(efficiencyScore * 100) / 100,
      onTimeDeliveries,
      lateDeliveries,
      fuelCost: Math.round(fuelCost * 100) / 100,
      penalties,
      bonuses: Math.round(bonuses * 100) / 100
    };
  }
}
