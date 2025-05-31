import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongodb';
import Admin from '../models/Admin';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          
          const admin = await Admin.findOne({ 
            email: credentials.email,
            isActive: true 
          });

          if (!admin) {
            return null;
          }

          const isValidPassword = await admin.comparePassword(credentials.password);

          if (!isValidPassword) {
            return null;
          }

          // Update last login
          admin.lastLogin = new Date();
          await admin.save();

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role,
            profileImage: admin.profileImage,
            isActive: admin.isActive, // Tambahkan property isActive
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.profileImage = user.profileImage;
        token.isActive = user.isActive; // Tambahkan isActive ke JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.profileImage = token.profileImage as string;
        session.user.isActive = token.isActive as boolean; // Tambahkan isActive ke session
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};