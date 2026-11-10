import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// POST /api/enquiries (Public Customer Submission)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : 'Showroom Inquiry',
        message: message.trim(),
        status: 'NEW',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our showroom specialist will contact you shortly.',
      data: { id: enquiry.id },
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to submit enquiry. Please try again later.' });
  }
});

export default router;

