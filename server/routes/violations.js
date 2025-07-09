import express from 'express';
import Fine from '../models/Fine.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate unique fine numbers
function generateFineNumber() {
  return `FINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Sri Lankan traffic violations with points
const SRI_LANKAN_VIOLATIONS = [
  { code: 'SPD001', type: 'speeding', description: 'Exceeding speed limit in urban areas (50 km/h)', baseAmount: 5000, points: 5, category: 'speed' },
  { code: 'SPD002', type: 'speeding', description: 'Exceeding speed limit on highways (100 km/h)', baseAmount: 7500, points: 8, category: 'speed' },
  { code: 'SPD003', type: 'speeding', description: 'Excessive speeding (50+ km/h over limit)', baseAmount: 15000, points: 15, category: 'speed' },
  { code: 'SIG001', type: 'signal_violation', description: 'Running red traffic light', baseAmount: 3000, points: 10, category: 'signal' },
  { code: 'SIG002', type: 'signal_violation', description: 'Ignoring traffic police signals', baseAmount: 2500, points: 8, category: 'signal' },
  { code: 'PAR001', type: 'parking', description: 'Illegal parking in no-parking zone', baseAmount: 1500, points: 2, category: 'parking' },
  { code: 'PAR002', type: 'parking', description: 'Parking in disabled space without permit', baseAmount: 5000, points: 5, category: 'parking' },
  { code: 'PAR003', type: 'parking', description: 'Blocking emergency vehicle access', baseAmount: 10000, points: 12, category: 'parking' },
  { code: 'LIC001', type: 'no_license', description: 'Driving without valid license', baseAmount: 25000, points: 25, category: 'license' },
  { code: 'LIC002', type: 'no_license', description: 'Driving with expired license', baseAmount: 15000, points: 15, category: 'license' },
  { code: 'INS001', type: 'no_insurance', description: 'Driving without valid insurance', baseAmount: 20000, points: 20, category: 'insurance' },
  { code: 'DRK001', type: 'drunk_driving', description: 'Driving under influence of alcohol', baseAmount: 50000, points: 30, category: 'safety' },
  { code: 'MOB001', type: 'mobile_phone', description: 'Using mobile phone while driving', baseAmount: 2500, points: 3, category: 'safety' },
  { code: 'SFT001', type: 'seat_belt', description: 'Not wearing seat belt', baseAmount: 2000, points: 3, category: 'safety' },
  { code: 'HLM001', type: 'helmet', description: 'Motorcycle rider not wearing helmet', baseAmount: 3000, points: 5, category: 'safety' },
  { code: 'HLM002', type: 'helmet', description: 'Motorcycle passenger not wearing helmet', baseAmount: 2000, points: 3, category: 'safety' },
  { code: 'OVL001', type: 'overloading', description: 'Vehicle overloading (passengers)', baseAmount: 5000, points: 8, category: 'safety' },
  { code: 'OVL002', type: 'overloading', description: 'Vehicle overloading (cargo)', baseAmount: 7500, points: 10, category: 'safety' },
  { code: 'LAN001', type: 'lane_violation', description: 'Improper lane changing', baseAmount: 2000, points: 4, category: 'traffic' },
  { code: 'LAN002', type: 'lane_violation', description: 'Driving in wrong direction', baseAmount: 5000, points: 12, category: 'traffic' },
  { code: 'RCK001', type: 'reckless_driving', description: 'Reckless or dangerous driving', baseAmount: 15000, points: 20, category: 'safety' },
  { code: 'EMI001', type: 'emission', description: 'Driving without valid emission certificate', baseAmount: 3000, points: 2, category: 'environment' },
  { code: 'DOC001', type: 'documentation', description: 'Failure to produce vehicle registration', baseAmount: 1000, points: 1, category: 'documentation' },
  { code: 'DOC002', type: 'documentation', description: 'Driving with fake/forged documents', baseAmount: 100000, points: 50, category: 'documentation' }
];

// GET all violations
router.get('/types', (req, res) => {
  try {
    const categories = [...new Set(SRI_LANKAN_VIOLATIONS.map(v => v.category))];
    res.json({ violations: SRI_LANKAN_VIOLATIONS, categories, total: SRI_LANKAN_VIOLATIONS.length });
  } catch (error) {
    console.error('Get violation types error:', error);
    res.status(500).json({ message: 'Failed to fetch violation types' });
  }
});

// Citizen self-report
router.post('/self-report', authenticateToken, async (req, res) => {
  try {
    const { vehicleId, violationCode, location } = req.body;

    const vehicle = await Vehicle.findById(vehicleId).populate('owner');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only report violations for your own vehicles' });
    }

    const violation = SRI_LANKAN_VIOLATIONS.find(v => v.code === violationCode);
    if (!violation) return res.status(400).json({ message: 'Invalid violation code' });

    const fine = new Fine({
      fineNumber: generateFineNumber(),
      vehicle: vehicle._id,
      owner: vehicle.owner._id,
      issuedBy: req.user.userId,
      violation: {
        type: violation.type,
        description: violation.description,
        location
      },
      amount: violation.baseAmount,
      pointsDeducted: violation.points,
      notes: 'Self-reported violation',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await fine.save();
    await fine.populate(['vehicle', 'owner']);

    const user = await User.findById(vehicle.owner._id);
    const newPoints = user.deductPoints(violation.points, `Self-reported: ${violation.description}`, fine._id);
    await user.save();

    fine.pointsProcessed = true;
    fine.pointsProcessedDate = new Date();
    await fine.save();

    try {
      await NotificationService.sendPointsDeductionNotification(user, fine, vehicle, violation.points, newPoints);
    } catch (err) {
      console.error('Failed to send points notification:', err);
    }

    res.status(201).json({
      message: 'Violation reported successfully',
      fine,
      violation,
      pointsDeducted: violation.points,
      newPoints
    });
  } catch (error) {
    console.error('Self-report violation error:', error);
    res.status(500).json({ message: 'Failed to report violation' });
  }
});

// Police/admin create fine
router.post('/create-fine', authenticateToken, requireRole(['police', 'admin']), async (req, res) => {
  try {
    const {
      vehicleRegistration,
      violationCode,
      location,
      coordinates,
      evidence,
      notes,
      customAmount,
      customPoints
    } = req.body;

    const vehicle = await Vehicle.findOne({
      registrationNumber: vehicleRegistration.toUpperCase()
    }).populate('owner');

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const violation = SRI_LANKAN_VIOLATIONS.find(v => v.code === violationCode);
    if (!violation) return res.status(400).json({ message: 'Invalid violation code' });

    const fine = new Fine({
      fineNumber: generateFineNumber(),
      vehicle: vehicle._id,
      owner: vehicle.owner._id,
      issuedBy: req.user.userId,
      violation: {
        type: violation.type,
        description: violation.description,
        location,
        coordinates
      },
      amount: customAmount || violation.baseAmount,
      pointsDeducted: customPoints || violation.points,
      evidence,
      notes,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await fine.save();
    await fine.populate(['vehicle', 'owner', 'issuedBy']);

    const user = await User.findById(vehicle.owner._id);
    const newPoints = user.deductPoints(
      customPoints || violation.points,
      `Violation: ${violation.description}`,
      fine._id
    );
    await user.save();

    fine.pointsProcessed = true;
    fine.pointsProcessedDate = new Date();
    await fine.save();

    try {
      await NotificationService.sendFineIssuedNotification(vehicle.owner, fine, vehicle);
      await NotificationService.sendPointsDeductionNotification(
        user,
        fine,
        vehicle,
        customPoints || violation.points,
        newPoints
      );
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError);
    }

    res.status(201).json({
      message: 'Fine created successfully',
      fine,
      violation,
      pointsDeducted: customPoints || violation.points,
      newPoints
    });
  } catch (error) {
    console.error('Create fine error:', error);
    res.status(500).json({ message: 'Failed to create fine' });
  }
});

export default router;
