import express from 'express';
import EmissionTest from '../models/EmissionTest.js';
import Vehicle from '../models/Vehicle.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's emission tests
router.get('/my-tests', authenticateToken, async (req, res) => {
  try {
    const tests = await EmissionTest.find({ owner: req.user.userId })
      .populate('vehicle', 'registrationNumber make model')
      .sort({ createdAt: -1 });

    res.json({ tests });
  } catch (error) {
    console.error('Get emission tests error:', error);
    res.status(500).json({ message: 'Failed to fetch emission tests' });
  }
});

// Schedule emission test
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const { vehicleId, testDate, testCenter } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const emissionTest = new EmissionTest({
      vehicle: vehicleId,
      owner: req.user.userId,
      testDate: new Date(testDate),
      expiryDate: new Date(new Date(testDate).getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
      testCenter,
      status: 'pending_payment'
    });

    await emissionTest.save();
    await emissionTest.populate('vehicle', 'registrationNumber make model');

    res.status(201).json({
      message: 'Emission test scheduled successfully',
      test: emissionTest
    });
  } catch (error) {
    console.error('Schedule emission test error:', error);
    res.status(500).json({ message: 'Failed to schedule emission test' });
  }
});

// Get vehicles needing emission tests
router.get('/vehicles-needing-tests', authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.userId });
    const vehiclesNeedingTests = [];

    for (const vehicle of vehicles) {
      // Check if vehicle has a valid emission test
      const latestTest = await EmissionTest.findOne({
        vehicle: vehicle._id,
        status: 'completed'
      }).sort({ expiryDate: -1 });

      const needsTest = !latestTest || new Date(latestTest.expiryDate) < new Date();
      
      if (needsTest) {
        vehiclesNeedingTests.push({
          ...vehicle.toObject(),
          lastTestDate: latestTest?.testDate,
          lastExpiryDate: latestTest?.expiryDate
        });
      }
    }

    res.json({ vehicles: vehiclesNeedingTests });
  } catch (error) {
    console.error('Get vehicles needing tests error:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles needing tests' });
  }
});

export default router;