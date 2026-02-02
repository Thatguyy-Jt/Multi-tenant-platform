/**
 * Create or update a Super Admin user (platform admin with no organization).
 * Run once: node scripts/create-super-admin.js
 *
 * Requires in .env (or environment):
 *   SUPER_ADMIN_EMAIL=admin@example.com
 *   SUPER_ADMIN_PASSWORD=your-secure-password
 *
 * If a user with SUPER_ADMIN_EMAIL already exists, their role is set to super_admin
 * and organizationId/tenantId are cleared. Otherwise a new user is created.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';

dotenv.config();

const createSuperAdmin = async () => {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in environment.');
    console.error('Add them to .env and run: node scripts/create-super-admin.js');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('SUPER_ADMIN_PASSWORD must be at least 6 characters.');
    process.exit(1);
  }

  try {
    await connectDB();

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'super_admin';
      user.organizationId = undefined;
      user.tenantId = undefined;
      user.password = password; // re-run script to update password
      await user.save({ validateBeforeSave: true });
      console.log(`Updated existing user to Super Admin: ${email}`);
    } else {
      user = await User.create({
        email,
        password,
        role: 'super_admin',
        organizationId: null,
        tenantId: null,
      });
      console.log(`Created Super Admin user: ${email}`);
    }

    console.log('Super Admin can log in and use /dashboard/admin only (no organization).');
    process.exit(0);
  } catch (error) {
    console.error('Error creating Super Admin:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
