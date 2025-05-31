import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

// Helper function to check if error has a code property (for MongoDB errors)
function hasErrorCode(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const session = await getSession({ req });
        if (!session || session.user.role !== 'superadmin') {
          return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find({})
          .select('-password') // Exclude password from response
          .sort({ createdAt: -1 });
        
        res.status(200).json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
      }
      break;

    case 'POST':
      try {
        const session = await getSession({ req });
        if (!session || session.user.role !== 'superadmin') {
          return res.status(403).json({ message: 'Access denied' });
        }

        const { name, email, password, role = 'user', isActive = true } = req.body;

        // Validation
        if (!name || !email || !password) {
          return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already exists' });
        }

        // Role validation - only superadmin can create admin/superadmin
        if ((role === 'admin' || role === 'superadmin') && session.user.role !== 'superadmin') {
          return res.status(403).json({ message: 'Only superadmin can create admin accounts' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role,
          isActive,
        });

        const savedUser = await newUser.save();
        
        // Remove password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        
        res.status(201).json(userResponse);
      } catch (error) {
        console.error('Error creating user:', error);
        if (hasErrorCode(error) && error.code === 11000) {
          res.status(400).json({ message: 'Email already exists' });
        } else {
          res.status(500).json({ message: 'Error creating user' });
        }
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}