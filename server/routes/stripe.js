import express from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Fine from '../models/Fine.js';
import Vehicle from '../models/Vehicle.js';
import EmissionTest from '../models/EmissionTest.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, type, relatedId, description, metadata } = req.body;

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'lkr',
      metadata: {
        userId: req.user.userId,
        type,
        relatedId: relatedId || '',
        ...metadata
      }
    });

    // Create payment record
    const payment = new Payment({
      user: req.user.userId,
      type,
      relatedId,
      relatedModel: getRelatedModel(type),
      amount,
      description,
      metadata,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Confirm payment
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment record
      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          status: 'completed',
          paidAt: new Date(),
          stripeChargeId: paymentIntent.latest_charge
        },
        { new: true }
      );

      // Update related records based on payment type
      await updateRelatedRecord(payment);

      // Send payment confirmation notification
      try {
        const user = await User.findById(payment.user);
        
        if (payment.type === 'fine') {
          const fine = await Fine.findById(payment.relatedId).populate('vehicle');
          await NotificationService.sendPaymentConfirmationNotification(
            user,
            fine,
            fine.vehicle,
            paymentIntent.latest_charge
          );
        }
      } catch (notificationError) {
        console.error('Failed to send payment confirmation notification:', notificationError);
      }

      res.json({
        message: 'Payment confirmed successfully',
        payment
      });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.userId })
      .populate('relatedId')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});

// Helper functions
function getRelatedModel(type) {
  switch (type) {
    case 'fine': return 'Fine';
    case 'emission_test': return 'EmissionTest';
    case 'insurance':
    case 'tax':
    case 'license_renewal': return 'Vehicle';
    default: return null;
  }
}

async function updateRelatedRecord(payment) {
  switch (payment.type) {
    case 'fine':
      await Fine.findByIdAndUpdate(payment.relatedId, {
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: 'card',
        paymentReference: payment.stripeChargeId
      });
      break;
    
    case 'emission_test':
      await EmissionTest.findByIdAndUpdate(payment.relatedId, {
        paymentStatus: 'paid',
        status: 'scheduled'
      });
      break;
    
    case 'insurance':
      // Update vehicle insurance status
      await Vehicle.findByIdAndUpdate(payment.relatedId, {
        'insurance.isActive': true,
        'insurance.expiryDate': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      });
      break;
    
    case 'license_renewal':
      // Update vehicle license status
      await Vehicle.findByIdAndUpdate(payment.relatedId, {
        'license.isValid': true,
        'license.expiryDate': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      });
      break;
  }
}

export default router;