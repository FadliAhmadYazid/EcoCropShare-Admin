import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../../lib/mongodb';
import History from '../../../models/History';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const history = await History.find({})
          .populate({
            path: 'userId',
            select: 'name email',
            options: { strictPopulate: false }
          })
          .populate({
            path: 'partnerId', 
            select: 'name email',
            options: { strictPopulate: false }
          })
          .populate({
            path: 'postId',
            select: 'title',
            options: { strictPopulate: false }
          })
          .populate({
            path: 'requestId',
            select: 'plantName',
            options: { strictPopulate: false }
          })
          .sort({ date: -1 });
        
        // Handle cases where references might be null
        const cleanHistory = history.map(item => ({
          ...item.toObject(),
          userId: item.userId || { name: 'Unknown User', email: '' },
          partnerId: item.partnerId || { name: 'Unknown Partner', email: '' },
          postId: item.postId || null,
          requestId: item.requestId || null,
        }));
        
        res.status(200).json(cleanHistory);
      } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ message: 'Error fetching history' });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}