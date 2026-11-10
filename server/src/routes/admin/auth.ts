import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma.js';
import {
  generateToken,
  verifyAdminToken,
  loginRateLimiter,
  resetLoginAttempts,
} from '../../middleware/auth.js';
import { AuthenticatedRequest, AdminRole } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// POST /api/admin/auth/login
router.post('/login', loginRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your staff email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your staff account has been deactivated. Contact the Super Admin.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your staff email and password.',
      });
    }

    // Reset rate limiter on successful authentication
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    resetLoginAttempts(ip);

    // Update lastLoginAt
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as AdminRole,
      fullName: user.fullName,
    };

    const token = generateToken(tokenPayload);

    // Set secure HTTP-only cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log login activity
    await logActivity(
      tokenPayload,
      'LOGIN',
      'AUTH',
      `Staff member ${user.fullName} logged into Admin Console`,
      { role: user.role, ip },
      req
    );

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
});

// POST /api/admin/auth/logout
router.post('/logout', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.admin) {
      await logActivity(
        req.admin,
        'LOGOUT',
        'AUTH',
        `Staff member ${req.admin.fullName} logged out`,
        {},
        req
      );
    }

    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging out.' });
  }
});

// GET /api/admin/auth/me
router.get('/me', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: req.admin!.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

// PUT /api/admin/auth/password
router.put('/password', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: req.admin!.id },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await logActivity(
      req.admin,
      'UPDATE_PASSWORD',
      'AUTH',
      `Staff member ${req.admin!.fullName} updated their password`,
      {},
      req
    );

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

export default router;

