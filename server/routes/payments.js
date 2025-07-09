import express from 'express';
import Fine from '../models/Fine.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Process payment
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { fineId, paymentMethod, amount } = req.body;

    const fine = await Fine.findById(fineId);
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    // Check if user owns this fine
    if (fine.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if fine is already paid
    if (fine.status === 'paid') {
      return res.status(400).json({ message: 'Fine already paid' });
    }

    // Simulate payment processing
    const paymentReference = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Update fine status
    fine.status = 'paid';
    fine.paidDate = new Date();
    fine.paymentMethod = paymentMethod;
    fine.paymentReference = paymentReference;
    await fine.save();

    res.json({
      message: 'Payment processed successfully',
      paymentReference,
      fine
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const payments = await Fine.find({
      owner: req.user.userId,
      status: 'paid'
    })
    .populate('vehicle', 'registrationNumber make model')
    .sort({ paidDate: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});

export default router;