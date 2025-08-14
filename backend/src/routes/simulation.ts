import express from 'express';
import { SimulationService } from '../services/simulationService';
import { simulationSchema } from '../validations/simulation';
import { authenticateToken, requireManager } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/simulation/run
// @desc    Run delivery simulation
// @access  Private (Manager/Admin)
router.post('/run', authenticateToken, requireManager, async (req, res) => {
  try {
    // Validate input
    const { error, value } = simulationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { availableDrivers, startTime, maxHoursPerDay } = value;

    // Run simulation
    const result = await SimulationService.runSimulation({
      availableDrivers,
      startTime,
      maxHoursPerDay
    });

    return res.status(200).json({
      success: true,
      message: 'Simulation completed successfully',
      data: result
    });

  } catch (error) {
    console.error('Simulation error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Simulation failed'
    });
  }
});

// @route   GET /api/simulation/status
// @desc    Get simulation system status
// @access  Private (Manager/Admin)
router.get('/status', authenticateToken, requireManager, async (req, res) => {
  try {
    // Get current system status
    const [driverCount, routeCount, orderCount] = await Promise.all([
      require('mongoose').model('Driver').countDocuments(),
      require('mongoose').model('Route').countDocuments(),
      require('mongoose').model('Order').countDocuments({ isDelivered: false })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        availableDrivers: driverCount,
        totalRoutes: routeCount,
        pendingOrders: orderCount,
        systemStatus: 'Ready',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get system status'
    });
  }
});

export default router;
