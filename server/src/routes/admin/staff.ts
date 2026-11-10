import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// All staff management routes require SUPER_ADMIN
router.use(verifyAdminToken);
router.use(requireRole(['SUPER_ADMIN']));

// GET /api/admin/staff
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, role, isActive } = req.query;

    const where: any = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (isActive !== undefined && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { fullName: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
      ];
    }

    const staffList = await prisma.adminUser.findMany({
      where,
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
        updatedAt: true,
        _count: {
          select: {
            activityLogs: true,
            inventoryMovements: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: staffList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch staff members' });
  }
});

// POST /api/admin/staff
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, fullName, phone, role = 'SALES_STAFF', avatar } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A staff member with email "${cleanEmail}" already exists.`,
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const created = await prisma.adminUser.create({
      data: {
        email: cleanEmail,
        passwordHash,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        role,
        avatar: avatar || null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    await logActivity(
      req.admin,
      'CREATE',
      'STAFF',
      `Super Admin added new staff member: ${created.fullName} (${created.role})`,
      { staffId: created.id, email: created.email, role: created.role },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add staff member' });
  }
});

// PUT /api/admin/staff/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phone, role, avatar } = req.body;

    const existing = await prisma.adminUser.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Protect Super Admin from demoting self accidentally
    if (existing.id === req.admin?.id && role && role !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote your own Super Admin account.',
      });
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updated = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await logActivity(
      req.admin,
      'UPDATE',
      'STAFF',
      `Updated staff details for ${updated.fullName}`,
      { staffId: id, role: updated.role },
      req
    );

    res.json({
      success: true,
      message: 'Staff details updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update staff' });
  }
});

// PATCH /api/admin/staff/:id/status (Toggle Active / Deactivate)
router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (id === req.admin?.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active session.',
      });
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: { id: true, email: true, fullName: true, isActive: true },
    });

    await logActivity(
      req.admin,
      'UPDATE',
      'STAFF',
      `${updated.isActive ? 'Activated' : 'Deactivated'} staff account: ${updated.fullName}`,
      { staffId: id, isActive: updated.isActive },
      req
    );

    res.json({
      success: true,
      message: `Staff account ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update staff status' });
  }
});

// POST /api/admin/staff/:id/reset-password
router.post('/:id/reset-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    const staff = await prisma.adminUser.findUnique({ where: { id } });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });

    await logActivity(
      req.admin,
      'UPDATE_PASSWORD',
      'STAFF',
      `Super Admin reset credentials for staff: ${staff.fullName} (${staff.email})`,
      { staffId: id },
      req
    );

    res.json({
      success: true,
      message: `Credentials for ${staff.fullName} have been reset successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

export default router;

