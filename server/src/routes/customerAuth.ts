import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { generateCustomerToken, requireCustomerAuth, CustomerAuthRequest } from '../middleware/customerAuth.js';
import { sendEmailNotification, emailTemplates } from '../utils/mailer.js';

const router = Router();

// 1. POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, termsAccepted } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required.',
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if customer email already exists
    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const customer = await prisma.customer.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    // Create Cart and Wishlist containers for new customer
    await prisma.cart.create({
      data: { customerId: customer.id },
    });
    await prisma.wishlist.create({
      data: { customerId: customer.id },
    });

    // Send Welcome Email
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const welcome = emailTemplates.welcome(fullName);
    await sendEmailNotification({
      to: customer.email,
      subject: welcome.subject,
      html: welcome.html,
      text: `Welcome to VOLTEDGE Electronics, ${fullName}! Your account is now active.`,
    });

    // Issue Token
    const token = generateCustomerToken({
      customerId: customer.id,
      email: customer.email,
      fullName,
    });

    res.cookie('volt_customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to VOLTEDGE Electronics.',
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      token,
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer account. Please try again.',
    });
  }
});

// 2. POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, guestToken } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!customer || !customer.passwordHash) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    if (customer.isArchived || customer.status === 'BLOCKED') {
      res.status(403).json({
        success: false,
        message: 'Your account is suspended or blocked. Please contact support.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const token = generateCustomerToken({
      customerId: customer.id,
      email: customer.email,
      fullName,
    });

    // Handle guest cart merge if guestToken provided
    if (guestToken) {
      try {
        const guestCart = await prisma.cart.findUnique({
          where: { guestToken },
          include: { items: true },
        });

        if (guestCart && guestCart.items.length > 0) {
          let customerCart = await prisma.cart.findUnique({
            where: { customerId: customer.id },
          });

          if (!customerCart) {
            customerCart = await prisma.cart.create({
              data: { customerId: customer.id },
            });
          }

          for (const item of guestCart.items) {
            const existingItem = await prisma.cartItem.findUnique({
              where: {
                cartId_productId: {
                  cartId: customerCart.id,
                  productId: item.productId,
                },
              },
            });

            if (existingItem) {
              await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + item.quantity },
              });
            } else {
              await prisma.cartItem.create({
                data: {
                  cartId: customerCart.id,
                  productId: item.productId,
                  quantity: item.quantity,
                },
              });
            }
          }

          // Clean up guest cart items
          await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
        }
      } catch (err) {
        console.error('Error merging guest cart on login:', err);
      }
    }

    res.cookie('volt_customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful! Welcome back.',
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  }
});

// 3. POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('volt_customer_token');
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// 4. GET /api/auth/me
router.get('/me', requireCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customer!.customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        totalOrders: true,
        totalSpent: true,
        createdAt: true,
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found.' });
      return;
    }

    res.json({
      success: true,
      customer,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching customer profile.' });
  }
});

// 5. POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success message to prevent user enumeration
    if (!customer) {
      res.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
      });
      return;
    }

    // Invalidate existing tokens
    await prisma.passwordResetToken.deleteMany({
      where: { customerId: customer.id },
    });

    // Generate secure hex token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        customerId: customer.id,
        token,
        expiresAt,
      },
    });

    const clientBaseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${clientBaseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
    const tmpl = emailTemplates.passwordReset(`${customer.firstName} ${customer.lastName}`, resetLink);
    await sendEmailNotification({
      to: customer.email,
      subject: tmpl.subject,
      html: tmpl.html,
      text: `Reset your VOLTEDGE password: ${resetLink}`,
    });

    res.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
      devToken: process.env.NODE_ENV === 'development' ? token : undefined,
    });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
});

// 6. POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: 'Token and new password are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { customer: true },
    });

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link. Please request a new one.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.customer.update({
        where: { id: resetRecord.customerId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

export default router;

