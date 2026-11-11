import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { requireCustomerAuth, CustomerAuthRequest } from '../middleware/customerAuth.js';

const router = Router();

// All routes require customer authentication
router.use(requireCustomerAuth);

// 1. GET /api/customer/profile
router.get('/profile', async (req: CustomerAuthRequest, res: Response) => {
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
        updatedAt: true,
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer profile not found.' });
      return;
    }

    res.json({ success: true, customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
});

// 2. PUT /api/customer/profile
router.put('/profile', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    if (!firstName || !lastName) {
      res.status(400).json({ success: false, message: 'First name and last name are required.' });
      return;
    }

    const updated = await prisma.customer.update({
      where: { id: req.customer!.customerId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : null,
        avatar: avatar || null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      customer: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
});

// 3. PUT /api/customer/change-password
router.put('/change-password', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current and new password are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id: req.customer!.customerId },
    });

    if (!customer || !customer.passwordHash) {
      res.status(404).json({ success: false, message: 'Customer account not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, customer.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating password.' });
  }
});

// 4. GET /api/customer/addresses
router.get('/addresses', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: req.customer!.customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching addresses.' });
  }
});

// 5. POST /api/customer/addresses
router.post('/addresses', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = 'India',
      addressType = 'HOME',
      isDefault = false,
    } = req.body;

    if (!addressLine1 || !city || !state || !postalCode) {
      res.status(400).json({
        success: false,
        message: 'Address line 1, city, state, and postal code are required.',
      });
      return;
    }

    // If marked as default, unmark other addresses
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: req.customer!.customerId },
        data: { isDefault: false },
      });
    }

    // If this is the customer's first address, make it default automatically
    const existingCount = await prisma.customerAddress.count({
      where: { customerId: req.customer!.customerId },
    });

    const newAddress = await prisma.customerAddress.create({
      data: {
        customerId: req.customer!.customerId,
        fullName: fullName || req.customer!.fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        addressType,
        isDefault: isDefault || existingCount === 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      address: newAddress,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add address.' });
  }
});

// 6. PUT /api/customer/addresses/:id
router.put('/addresses/:id', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      addressType,
      isDefault,
    } = req.body;

    // Verify ownership
    const existing = await prisma.customerAddress.findFirst({
      where: { id, customerId: req.customer!.customerId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
      return;
    }

    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: req.customer!.customerId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.customerAddress.update({
      where: { id },
      data: {
        fullName: fullName !== undefined ? fullName : existing.fullName,
        phone: phone !== undefined ? phone : existing.phone,
        addressLine1: addressLine1 || existing.addressLine1,
        addressLine2: addressLine2 !== undefined ? addressLine2 : existing.addressLine2,
        city: city || existing.city,
        state: state || existing.state,
        postalCode: postalCode || existing.postalCode,
        country: country || existing.country,
        addressType: addressType || existing.addressType,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      },
    });

    res.json({
      success: true,
      message: 'Address updated successfully.',
      address: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
});

// 7. DELETE /api/customer/addresses/:id
router.delete('/addresses/:id', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.customerAddress.findFirst({
      where: { id, customerId: req.customer!.customerId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
      return;
    }

    await prisma.customerAddress.delete({ where: { id } });

    // If default was deleted, set next address as default
    if (existing.isDefault) {
      const nextAddress = await prisma.customerAddress.findFirst({
        where: { customerId: req.customer!.customerId },
        orderBy: { createdAt: 'desc' },
      });
      if (nextAddress) {
        await prisma.customerAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

export default router;

