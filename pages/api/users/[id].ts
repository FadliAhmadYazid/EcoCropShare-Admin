import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

// Helper function to safely handle errors
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Helper function to check if error has a code property (for MongoDB errors)
function hasErrorCode(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const session = await getSession({ req });
        if (!session || session.user.role !== 'superadmin') {
          return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(id).select('-password');
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
      }
      break;

    case 'PUT':
      try {
        const session = await getSession({ req });
        if (!session || session.user.role !== 'superadmin') {
          return res.status(403).json({ message: 'Access denied' });
        }

        const { name, email, password, role, isActive } = req.body;

        // Validation
        if (!name || !email) {
          return res.status(400).json({ message: 'Name and email are required' });
        }

        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Role validation - only superadmin can modify admin/superadmin roles
        if ((role === 'admin' || role === 'superadmin' || user.role === 'admin' || user.role === 'superadmin') 
            && session.user.role !== 'superadmin') {
          return res.status(403).json({ message: 'Only superadmin can modify admin accounts' });
        }

        // Prevent self-modification of role/status
        if (user._id.toString() === session.user.id) {
          if (role !== user.role || isActive !== user.isActive) {
            return res.status(400).json({ message: 'Cannot modify your own role or status' });
          }
        }

        // Check if email is being changed and if it already exists
        if (email !== user.email) {
          const existingUser = await User.findOne({ email, _id: { $ne: id } });
          if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
          }
        }

        // Prepare update data
        const updateData: any = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role,
          isActive,
          updatedAt: new Date(),
        };

        // Hash new password if provided
        if (password && password.length >= 6) {
          updateData.password = await bcrypt.hash(password, 12);
        } else if (password && password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const updatedUser = await User.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        ).select('-password');

        res.status(200).json(updatedUser);
      } catch (error) {
        console.error('Error updating user:', error);
        if (hasErrorCode(error) && error.code === 11000) {
          res.status(400).json({ message: 'Email already exists' });
        } else {
          res.status(500).json({ message: 'Error updating user' });
        }
      }
      break;

    case 'DELETE':
      try {
        const session = await getSession({ req });
        if (!session || session.user.role !== 'superadmin') {
          return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-deletion
        if (user._id.toString() === session.user.id) {
          return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Only superadmin can delete admin/superadmin accounts
        if ((user.role === 'admin' || user.role === 'superadmin') && session.user.role !== 'superadmin') {
          return res.status(403).json({ message: 'Only superadmin can delete admin accounts' });
        }

        await User.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}