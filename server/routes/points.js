import express from 'express';
import User from '../models/User.js';
import Fine from '../models/Fine.js';
import NotificationService from '../services/notificationService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get user's points information
router.get('/my-points', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'drivingPoints.history.relatedFine',
        select: 'fineNumber violation amount issuedDate'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pointsStatus = user.getPointsStatus();
    const canRestore = user.canRestorePoints();

    res.json({
      points: user.drivingPoints,
      status: pointsStatus,
      licenseStatus: user.licenseStatus,
      canRestorePoints: canRestore,
      nextEligibleRestoration: user.drivingPoints.nextEligibleRestoration
    });
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ message: 'Failed to fetch points information' });
  }
});

// Get points statistics (admin only)
router.get('/statistics', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'citizen' } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          averagePoints: { $avg: '$drivingPoints.current' },
          suspendedLicenses: {
            $sum: { $cond: [{ $eq: ['$licenseStatus', 'suspended'] }, 1, 0] }
          },
          zeroPoints: {
            $sum: { $cond: [{ $eq: ['$drivingPoints.current', 0] }, 1, 0] }
          },
          lowPoints: {
            $sum: { $cond: [{ $and: [{ $gt: ['$drivingPoints.current', 0] }, { $lte: ['$drivingPoints.current', 20] }] }, 1, 0] }
          },
          goodStanding: {
            $sum: { $cond: [{ $gt: ['$drivingPoints.current', 60] }, 1, 0] }
          }
        }
      }
    ]);

    const pointsDistribution = await User.aggregate([
      { $match: { role: 'citizen' } },
      {
        $bucket: {
          groupBy: '$drivingPoints.current',
          boundaries: [0, 21, 41, 61, 81, 101],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            users: { $push: { id: '$_id', name: { $concat: ['$firstName', ' ', '$lastName'] }, points: '$drivingPoints.current' } }
          }
        }
      }
    ]);

    res.json({
      statistics: stats[0] || {},
      distribution: pointsDistribution
    });
  } catch (error) {
    console.error('Get points statistics error:', error);
    res.status(500).json({ message: 'Failed to fetch points statistics' });
  }
});

// Restore points for good behavior (admin only)
router.post('/restore', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'citizen') {
      return res.status(400).json({ message: 'Points can only be restored for citizens' });
    }

    if (!user.canRestorePoints()) {
      return res.status(400).json({ 
        message: 'User is not eligible for points restoration yet',
        nextEligible: user.drivingPoints.nextEligibleRestoration
      });
    }

    const newPoints = user.restorePoints(points, reason);
    
    // Restore license if it was suspended due to zero points
    if (user.licenseStatus === 'suspended' && newPoints > 0) {
      user.licenseStatus = 'active';
      
      // Mark current suspension as inactive
      const activeSuspension = user.drivingPoints.suspensions.find(s => s.isActive);
      if (activeSuspension) {
        activeSuspension.isActive = false;
        activeSuspension.restoredDate = new Date();
      }
    }

    await user.save();

    // Send notification
    try {
      await NotificationService.sendPointsRestorationNotification(
        user,
        points,
        newPoints,
        reason
      );
    } catch (notificationError) {
      console.error('Failed to send points restoration notification:', notificationError);
    }

    res.json({
      message: 'Points restored successfully',
      previousPoints: newPoints - points,
      pointsRestored: points,
      newPoints,
      licenseStatus: user.licenseStatus
    });
  } catch (error) {
    console.error('Restore points error:', error);
    res.status(500).json({ message: 'Failed to restore points' });
  }
});

// Get users with low points (admin only)
router.get('/low-points', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { threshold = 20 } = req.query;
    
    const users = await User.find({
      role: 'citizen',
      'drivingPoints.current': { $lte: threshold }
    })
    .select('firstName lastName email phone drivingPoints licenseStatus')
    .sort({ 'drivingPoints.current': 1 });

    res.json({ users, threshold });
  } catch (error) {
    console.error('Get low points users error:', error);
    res.status(500).json({ message: 'Failed to fetch users with low points' });
  }
});

// Get suspended licenses (admin only)
router.get('/suspended', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find({
      role: 'citizen',
      licenseStatus: 'suspended'
    })
    .select('firstName lastName email phone drivingPoints licenseStatus')
    .sort({ 'drivingPoints.suspensions.startDate': -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get suspended licenses error:', error);
    res.status(500).json({ message: 'Failed to fetch suspended licenses' });
  }
});

// Manual points adjustment (admin only)
router.post('/adjust', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId, pointsChange, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'citizen') {
      return res.status(400).json({ message: 'Points can only be adjusted for citizens' });
    }

    const previousPoints = user.drivingPoints.current;
    let newPoints;

    if (pointsChange > 0) {
      newPoints = user.restorePoints(pointsChange, reason);
    } else {
      newPoints = user.deductPoints(Math.abs(pointsChange), reason);
    }

    await user.save();

    // Send notification
    try {
      if (pointsChange > 0) {
        await NotificationService.sendPointsRestorationNotification(
          user,
          pointsChange,
          newPoints,
          reason
        );
      } else {
        await NotificationService.sendPointsDeductionNotification(
          user,
          null,
          null,
          Math.abs(pointsChange),
          newPoints,
          reason
        );
      }
    } catch (notificationError) {
      console.error('Failed to send points adjustment notification:', notificationError);
    }

    res.json({
      message: 'Points adjusted successfully',
      previousPoints,
      pointsChange,
      newPoints,
      licenseStatus: user.licenseStatus
    });
  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json({ message: 'Failed to adjust points' });
  }
});

export default router;