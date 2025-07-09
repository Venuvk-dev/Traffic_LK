import express from 'express';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's vehicles
router.get('/my-vehicles', authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ 
      owner: req.user.userId,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({ vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
});

// Register new vehicle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      owner: req.user.userId
    };

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ 
      registrationNumber: vehicleData.registrationNumber.toUpperCase() 
    });

    if (existingVehicle) {
      return res.status(400).json({ 
        message: 'Vehicle with this registration number already exists' 
      });
    }

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    // Get user details for notification
    const user = await User.findById(req.user.userId);

    // Send vehicle registration notification
    try {
      await NotificationService.sendVehicleRegistrationNotification(user, vehicle);
    } catch (notificationError) {
      console.error('Failed to send vehicle registration notification:', notificationError);
    }

    res.status(201).json({
      message: 'Vehicle registered successfully',
      vehicle
    });
  } catch (error) {
    console.error('Register vehicle error:', error);
    res.status(500).json({ message: 'Failed to register vehicle' });
  }
});

// Get vehicle by registration number
router.get('/search/:registrationNumber', authenticateToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ 
      registrationNumber: req.params.registrationNumber.toUpperCase() 
    }).populate('owner', 'firstName lastName email phone');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ vehicle });
  } catch (error) {
    console.error('Search vehicle error:', error);
    res.status(500).json({ message: 'Failed to search vehicle' });
  }
});

// Update vehicle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check ownership
    if (vehicle.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Failed to update vehicle' });
  }
});

// Check for expiring documents and send reminders
router.get('/check-expiries', authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ 
      owner: req.user.userId,
      isActive: true 
    }).populate('owner');

    const user = vehicles[0]?.owner;
    if (!user) {
      return res.json({ message: 'No vehicles found' });
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    for (const vehicle of vehicles) {
      // Check insurance expiry
      if (vehicle.insurance?.expiryDate) {
        const insuranceExpiry = new Date(vehicle.insurance.expiryDate);
        if (insuranceExpiry <= thirtyDaysFromNow && insuranceExpiry >= now) {
          try {
            await NotificationService.sendExpiryReminderNotification(
              user,
              vehicle,
              'Insurance',
              vehicle.insurance.expiryDate
            );
          } catch (notificationError) {
            console.error('Failed to send insurance expiry notification:', notificationError);
          }
        }
      }

      // Check license expiry
      if (vehicle.license?.expiryDate) {
        const licenseExpiry = new Date(vehicle.license.expiryDate);
        if (licenseExpiry <= thirtyDaysFromNow && licenseExpiry >= now) {
          try {
            await NotificationService.sendExpiryReminderNotification(
              user,
              vehicle,
              'License',
              vehicle.license.expiryDate
            );
          } catch (notificationError) {
            console.error('Failed to send license expiry notification:', notificationError);
          }
        }
      }
    }

    res.json({ message: 'Expiry check completed' });
  } catch (error) {
    console.error('Check expiries error:', error);
    res.status(500).json({ message: 'Failed to check expiries' });
  }
});

export default router;