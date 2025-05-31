import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../../lib/mongodb';
import History from '../../../models/History';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case 'DELETE':
      try {
        await History.findByIdAndDelete(id);
        res.status(200).json({ message: 'History deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting history' });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}