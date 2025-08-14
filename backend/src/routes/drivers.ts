import express from 'express';
import Driver from '../models/Driver';
import { authenticateToken, requireManager } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/drivers
// @desc    Get all drivers
// @access  Private (Manager/Admin)
router.get('/', authenticateToken, requireManager, async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ name: 1 });
    
    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers'
    });
  }
});

// @route   GET /api/drivers/:id
// @desc    Get single driver
// @access  Private (Manager/Admin)
router.get('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Get driver error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch driver'
    });
  }
});

// @route   POST /api/drivers
// @desc    Create new driver
// @access  Private (Manager/Admin)
router.post('/', authenticateToken, requireManager, async (req, res) => {
  try {
    const { name, currentShiftHours, pastWeekHours } = req.body;

    // Validate required fields
    if (!name || currentShiftHours === undefined || pastWeekHours === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, current shift hours, and past week hours are required'
      });
    }

    // Validate numeric values
    if (currentShiftHours < 0 || currentShiftHours > 24) {
      return res.status(400).json({
        success: false,
        message: 'Current shift hours must be between 0 and 24'
      });
    }

    if (pastWeekHours < 0 || pastWeekHours > 168) {
      return res.status(400).json({
        success: false,
        message: 'Past week hours must be between 0 and 168'
      });
    }

    const driver = new Driver({
      name,
      currentShiftHours,
      pastWeekHours
    });

    await driver.save();

    return res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create driver'
    });
  }
});

// @route   PUT /api/drivers/:id
// @desc    Update driver
// @access  Private (Manager/Admin)
router.put('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const { name, currentShiftHours, pastWeekHours } = req.body;

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) driver.name = name;
    if (currentShiftHours !== undefined) {
      if (currentShiftHours < 0 || currentShiftHours > 24) {
        return res.status(400).json({
          success: false,
          message: 'Current shift hours must be between 0 and 24'
        });
      }
      driver.currentShiftHours = currentShiftHours;
    }
    if (pastWeekHours !== undefined) {
      if (pastWeekHours < 0 || pastWeekHours > 168) {
        return res.status(400).json({
          success: false,
          message: 'Past week hours must be between 0 and 168'
        });
      }
      driver.pastWeekHours = pastWeekHours;
    }

    await driver.save();

    return res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Update driver error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update driver'
    });
  }
});

// @route   DELETE /api/drivers/:id
// @desc    Delete driver
// @access  Private (Manager/Admin)
router.delete('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    await Driver.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete driver'
    });
  }
});

export default router;
