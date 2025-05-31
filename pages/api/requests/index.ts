import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../../lib/mongodb';
import Request from '../../../models/Request';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const requests = await Request.find({})
          .populate('userId', 'name email')
          .sort({ createdAt: -1 });
        res.status(200).json(requests);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}