import express from 'express';
import Fine from '../models/Fine.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all fines (admin/police)
router.get('/', authenticateToken, requireRole(['admin', 'police']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, vehicleId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (vehicleId) query.vehicle = vehicleId;

    const fines = await Fine.find(query)
      .populate('vehicle', 'registrationNumber make model')
      .populate('owner', 'firstName lastName email')
      .populate('issuedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Fine.countDocuments(query);

    res.json({
      fines,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get fines error:', error);
    res.status(500).json({ message: 'Failed to fetch fines' });
  }
});

// Get user's fines
router.get('/my-fines', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { owner: req.user.userId };
    
    if (status) query.status = status;

    const fines = await Fine.find(query)
      .populate('vehicle', 'registrationNumber make model')
      .populate('issuedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Fine.countDocuments(query);

    res.json({
      fines,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user fines error:', error);
    res.status(500).json({ message: 'Failed to fetch your fines' });
  }
});

// Create new fine (police only)
router.post('/', authenticateToken, requireRole(['police', 'admin']), async (req, res) => {
  try {
    const {
      vehicleId,
      violation,
      amount,
      evidence,
      notes,
      dueDate
    } = req.body;

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId).populate('owner');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const fine = new Fine({
      vehicle: vehicleId,
      owner: vehicle.owner._id,
      issuedBy: req.user.userId,
      violation,
      amount,
      evidence,
      notes,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    });

    await fine.save();
    await fine.populate(['vehicle', 'owner', 'issuedBy']);

    // Send notification to vehicle owner
    try {
      await NotificationService.sendFineIssuedNotification(
        vehicle.owner,
        fine,
        vehicle
      );
    } catch (notificationError) {
      console.error('Failed to send fine notification:', notificationError);
      // Don't fail fine creation if notification fails
    }

    res.status(201).json({
      message: 'Fine created successfully',
      fine
    });
  } catch (error) {
    console.error('Create fine error:', error);
    res.status(500).json({ message: 'Failed to create fine' });
  }
});

// Get fine by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id)
      .populate('vehicle', 'registrationNumber make model year color')
      .populate('owner', 'firstName lastName email phone')
      .populate('issuedBy', 'firstName lastName');

    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    // Check if user can access this fine
    if (req.user.role === 'citizen' && fine.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ fine });
  } catch (error) {
    console.error('Get fine error:', error);
    res.status(500).json({ message: 'Failed to fetch fine' });
  }
});

// Update fine status
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'police']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const fine = await Fine.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        notes,
        ...(status === 'paid' && { paidDate: new Date() })
      },
      { new: true }
    ).populate(['vehicle', 'owner', 'issuedBy']);

    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    res.json({
      message: 'Fine status updated successfully',
      fine
    });
  } catch (error) {
    console.error('Update fine status error:', error);
    res.status(500).json({ message: 'Failed to update fine status' });
  }
});

// Delete fine (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const fine = await Fine.findByIdAndDelete(req.params.id);
    
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    res.json({ message: 'Fine deleted successfully' });
  } catch (error) {
    console.error('Delete fine error:', error);
    res.status(500).json({ message: 'Failed to delete fine' });
  }
});

export default router;