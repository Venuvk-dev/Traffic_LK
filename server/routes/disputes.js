import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Dispute from '../models/Dispute.js';
import Fine from '../models/Fine.js';
import NotificationService from '../services/notificationService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/disputes';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per dispute
  }
});

// Create dispute with file uploads
router.post('/', authenticateToken, upload.array('evidenceFiles', 5), async (req, res) => {
  try {
    const { fineId, reason, description, evidenceDescriptions } = req.body;

    const fine = await Fine.findById(fineId).populate(['vehicle', 'owner']);
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    // Check if user owns this fine
    if (fine.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({ fine: fineId });
    if (existingDispute) {
      return res.status(400).json({ message: 'Dispute already exists for this fine' });
    }

    // Process uploaded files
    const evidence = [];
    
    if (req.files && req.files.length > 0) {
      const descriptions = Array.isArray(evidenceDescriptions) 
        ? evidenceDescriptions 
        : evidenceDescriptions ? [evidenceDescriptions] : [];

      req.files.forEach((file, index) => {
        evidence.push({
          type: 'image',
          url: `/uploads/disputes/${file.filename}`,
          originalName: file.originalname,
          description: descriptions[index] || `Evidence image ${index + 1}`
        });
      });
    }

    const dispute = new Dispute({
      fine: fineId,
      disputant: req.user.userId,
      reason,
      description,
      evidence
    });

    await dispute.save();

    // Update fine status
    fine.status = 'disputed';
    await fine.save();

    await dispute.populate(['fine', 'disputant']);

    // Send notification about dispute creation
    try {
      await NotificationService.sendDisputeStatusNotification(
        fine.owner,
        dispute,
        fine,
        fine.vehicle
      );
    } catch (notificationError) {
      console.error('Failed to send dispute notification:', notificationError);
    }

    res.status(201).json({
      message: 'Dispute created successfully',
      dispute
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    
    // Clean up uploaded files if dispute creation fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to delete file:', err);
        });
      });
    }
    
    res.status(500).json({ message: 'Failed to create dispute' });
  }
});

// Serve uploaded files
router.get('/evidence/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(process.cwd(), 'uploads', 'disputes', filename);
  
  // Check if file exists
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Get user's disputes
router.get('/my-disputes', authenticateToken, async (req, res) => {
  try {
    const disputes = await Dispute.find({ disputant: req.user.userId })
      .populate({
        path: 'fine',
        populate: {
          path: 'vehicle',
          select: 'registrationNumber make model'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ disputes });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({ message: 'Failed to fetch disputes' });
  }
});

// Get all disputes (admin/police)
router.get('/', authenticateToken, requireRole(['admin', 'police']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const disputes = await Dispute.find(query)
      .populate('disputant', 'firstName lastName email')
      .populate({
        path: 'fine',
        populate: {
          path: 'vehicle',
          select: 'registrationNumber make model'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Dispute.countDocuments(query);

    res.json({
      disputes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all disputes error:', error);
    res.status(500).json({ message: 'Failed to fetch disputes' });
  }
});

// Review dispute (admin/police)
router.patch('/:id/review', authenticateToken, requireRole(['admin', 'police']), async (req, res) => {
  try {
    const { status, reviewNotes, resolution } = req.body;

    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewedBy: req.user.userId,
        reviewDate: new Date(),
        reviewNotes,
        resolution
      },
      { new: true }
    ).populate(['fine', 'disputant', 'reviewedBy']);

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Update fine status based on dispute resolution
    const fine = await Fine.findById(dispute.fine._id).populate('vehicle');
    if (status === 'approved') {
      fine.status = 'cancelled';
    } else if (status === 'rejected') {
      fine.status = 'pending';
    }
    await fine.save();

    // Send notification about dispute status update
    try {
      await NotificationService.sendDisputeStatusNotification(
        dispute.disputant,
        dispute,
        fine,
        fine.vehicle
      );
    } catch (notificationError) {
      console.error('Failed to send dispute status notification:', notificationError);
    }

    res.json({
      message: 'Dispute reviewed successfully',
      dispute
    });
  } catch (error) {
    console.error('Review dispute error:', error);
    res.status(500).json({ message: 'Failed to review dispute' });
  }
});

export default router;