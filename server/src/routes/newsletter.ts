import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// POST subscribe to newsletter
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'You are already subscribed to the VOLTEDGE newsletter!',
      });
    }

    await prisma.newsletterSubscription.create({
      data: { email: normalizedEmail },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to VOLTEDGE Electronics updates!',
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ success: false, message: 'Subscription failed. Please try again.' });
  }
});

export default router;
