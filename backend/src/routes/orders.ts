import express from 'express';
import Order from '../models/Order';
import Route from '../models/Route';
import { authenticateToken, requireManager } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (Manager/Admin)
router.get('/', authenticateToken, requireManager, async (req, res) => {
  try {
    const { status, route } = req.query;
    let filter: any = {};

    // Apply filters
    if (status === 'pending') {
      filter.isDelivered = false;
    } else if (status === 'delivered') {
      filter.isDelivered = true;
    }

    if (route) {
      filter.assignedRoute = route;
    }

    const orders = await Order.find(filter)
      .sort({ deliveryTimestamp: 1 })
      .populate('assignedRoute', 'routeId distance trafficLevel');
    
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private (Manager/Admin)
router.get('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Manager/Admin)
router.post('/', authenticateToken, requireManager, async (req, res) => {
  try {
    const { orderId, value, assignedRoute, deliveryTimestamp } = req.body;

    // Validate required fields
    if (!orderId || value === undefined || !assignedRoute || !deliveryTimestamp) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, value, assigned route, and delivery timestamp are required'
      });
    }

    // Validate order value
    if (value <= 0 || value > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Order value must be between ₹1 and ₹100,000'
      });
    }

    // Validate delivery timestamp
    const deliveryDate = new Date(deliveryTimestamp);
    if (isNaN(deliveryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery timestamp format'
      });
    }

    // Check if route exists
    const route = await Route.findOne({ routeId: assignedRoute.toUpperCase() });
    if (!route) {
      return res.status(400).json({
        success: false,
        message: 'Assigned route does not exist'
      });
    }

    // Check if order ID already exists
    const existingOrder = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Order ID already exists'
      });
    }

    const order = new Order({
      orderId: orderId.toUpperCase(),
      value,
      assignedRoute: assignedRoute.toUpperCase(),
      deliveryTimestamp: deliveryDate
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private (Manager/Admin)
router.put('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const { orderId, value, assignedRoute, deliveryTimestamp, assignedDriver, isDelivered } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update fields if provided
    if (orderId !== undefined) {
      // Check if new order ID already exists
      const existingOrder = await Order.findOne({ 
        orderId: orderId.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message: 'Order ID already exists'
        });
      }
      order.orderId = orderId.toUpperCase();
    }
    
    if (value !== undefined) {
      if (value <= 0 || value > 100000) {
        return res.status(400).json({
          success: false,
          message: 'Order value must be between ₹1 and ₹100,000'
        });
      }
      order.value = value;
    }
    
    if (assignedRoute !== undefined) {
      // Check if route exists
      const route = await Route.findOne({ routeId: assignedRoute.toUpperCase() });
      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Assigned route does not exist'
        });
      }
      order.assignedRoute = assignedRoute.toUpperCase();
    }
    
    if (deliveryTimestamp !== undefined) {
      const deliveryDate = new Date(deliveryTimestamp);
      if (isNaN(deliveryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid delivery timestamp format'
        });
      }
      order.deliveryTimestamp = deliveryDate;
    }
    
    if (assignedDriver !== undefined) {
      order.assignedDriver = assignedDriver;
    }
    
    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered && !order.actualDeliveryTime) {
        order.actualDeliveryTime = new Date();
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private (Manager/Admin)
router.delete('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
});

// @route   PATCH /api/orders/:id/deliver
// @desc    Mark order as delivered
// @access  Private (Manager/Admin)
router.patch('/:id/deliver', authenticateToken, requireManager, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.isDelivered) {
      return res.status(400).json({
        success: false,
        message: 'Order is already delivered'
      });
    }

    order.isDelivered = true;
    order.actualDeliveryTime = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order marked as delivered',
      data: order
    });
  } catch (error) {
    console.error('Mark delivered error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark order as delivered'
    });
  }
});

export default router;
