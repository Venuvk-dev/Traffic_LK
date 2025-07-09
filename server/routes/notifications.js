import express from 'express';
import NotificationService from '../services/notificationService.js';
import User from '../models/User.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Send test notification (admin only)
router.post('/test', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId, type, subject, message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let result;
    switch (type) {
      case 'email':
        result = await NotificationService.sendEmail(user.email, subject, message);
        break;
      case 'sms':
        result = await NotificationService.sendSMS(user.phone, message);
        break;
      case 'both':
        const emailResult = await NotificationService.sendEmail(user.email, subject, message);
        const smsResult = await NotificationService.sendSMS(user.phone, message);
        result = { email: emailResult, sms: smsResult };
        break;
      default:
        return res.status(400).json({ message: 'Invalid notification type' });
    }

    res.json({
      message: 'Test notification sent successfully',
      result
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ message: 'Failed to send test notification' });
  }
});

// Send bulk notification (admin only)
router.post('/bulk', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userIds, subject, message, type = 'both' } = req.body;

    const users = await User.find({ _id: { $in: userIds } });
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    const results = await NotificationService.sendBulkNotifications(
      users,
      subject,
      message,
      type
    );

    res.json({
      message: 'Bulk notifications sent',
      totalUsers: users.length,
      results: results.map(result => ({
        status: result.status,
        value: result.value || result.reason
      }))
    });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json({ message: 'Failed to send bulk notifications' });
  }
});

// Send system announcement (admin only)
router.post('/announcement', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { subject, message, targetRole = 'all', type = 'both' } = req.body;

    let query = { isActive: true };
    if (targetRole !== 'all') {
      query.role = targetRole;
    }

    const users = await User.find(query);
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found for the specified criteria' });
    }

    const results = await NotificationService.sendBulkNotifications(
      users,
      subject,
      message,
      type
    );

    res.json({
      message: 'System announcement sent',
      targetRole,
      totalUsers: users.length,
      successCount: results.filter(r => r.status === 'fulfilled').length,
      failureCount: results.filter(r => r.status === 'rejected').length
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({ message: 'Failed to send announcement' });
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // In a real implementation, you would track notification statistics in the database
    // For now, we'll return mock statistics
    const stats = {
      totalSent: 15420,
      emailsSent: 8750,
      smsSent: 6670,
      successRate: 98.5,
      lastWeek: {
        fineNotifications: 245,
        paymentConfirmations: 189,
        disputeUpdates: 23,
        expiryReminders: 67,
        welcomeMessages: 34
      },
      byType: {
        fine_issued: 245,
        payment_confirmed: 189,
        dispute_status: 23,
        expiry_reminder: 67,
        welcome: 34,
        system_announcement: 12
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Failed to fetch notification statistics' });
  }
});

export default router;