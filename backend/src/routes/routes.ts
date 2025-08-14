import express from 'express';
import Route from '../models/Route';
import { authenticateToken, requireManager } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/routes
// @desc    Get all routes
// @access  Private (Manager/Admin)
router.get('/', authenticateToken, requireManager, async (req, res) => {
  try {
    const routes = await Route.find().sort({ routeId: 1 });
    
    return res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    console.error('Get routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch routes'
    });
  }
});

// @route   GET /api/routes/:id
// @desc    Get single route
// @access  Private (Manager/Admin)
router.get('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Get route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch route'
    });
  }
});

// @route   POST /api/routes
// @desc    Create new route
// @access  Private (Manager/Admin)
router.post('/', authenticateToken, requireManager, async (req, res) => {
  try {
    const { routeId, distance, trafficLevel, baseTime } = req.body;

    // Validate required fields
    if (!routeId || distance === undefined || !trafficLevel || baseTime === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Route ID, distance, traffic level, and base time are required'
      });
    }

    // Validate traffic level
    if (!['Low', 'Medium', 'High'].includes(trafficLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Traffic level must be Low, Medium, or High'
      });
    }

    // Validate numeric values
    if (distance <= 0 || distance > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Distance must be between 0.1 and 1000 km'
      });
    }

    if (baseTime <= 0 || baseTime > 480) {
      return res.status(400).json({
        success: false,
        message: 'Base time must be between 1 and 480 minutes'
      });
    }

    // Check if route ID already exists
    const existingRoute = await Route.findOne({ routeId: routeId.toUpperCase() });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Route ID already exists'
      });
    }

    const route = new Route({
      routeId: routeId.toUpperCase(),
      distance,
      trafficLevel,
      baseTime
    });

    await route.save();

    return res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    console.error('Create route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create route'
    });
  }
});

// @route   PUT /api/routes/:id
// @desc    Update route
// @access  Private (Manager/Admin)
router.put('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const { routeId, distance, trafficLevel, baseTime } = req.body;

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Update fields if provided
    if (routeId !== undefined) {
      // Check if new route ID already exists
      const existingRoute = await Route.findOne({ 
        routeId: routeId.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingRoute) {
        return res.status(400).json({
          success: false,
          message: 'Route ID already exists'
        });
      }
      route.routeId = routeId.toUpperCase();
    }
    
    if (distance !== undefined) {
      if (distance <= 0 || distance > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Distance must be between 0.1 and 1000 km'
        });
      }
      route.distance = distance;
    }
    
    if (trafficLevel !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(trafficLevel)) {
        return res.status(400).json({
          success: false,
          message: 'Traffic level must be Low, Medium, or High'
        });
      }
      route.trafficLevel = trafficLevel;
    }
    
    if (baseTime !== undefined) {
      if (baseTime <= 0 || baseTime > 480) {
        return res.status(400).json({
          success: false,
          message: 'Base time must be between 1 and 480 minutes'
        });
      }
      route.baseTime = baseTime;
    }

    await route.save();

    return res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    console.error('Update route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update route'
    });
  }
});

// @route   DELETE /api/routes/:id
// @desc    Delete route
// @access  Private (Manager/Admin)
router.delete('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if route is being used by any orders
    const Order = require('mongoose').model('Order');
    const ordersUsingRoute = await Order.findOne({ assignedRoute: route.routeId });
    
    if (ordersUsingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete route that is assigned to orders'
      });
    }

    await Route.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Delete route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete route'
    });
  }
});

export default router;
