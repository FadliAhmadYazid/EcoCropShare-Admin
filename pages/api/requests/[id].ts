import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../../lib/mongodb';
import Request from '../../../models/Request';

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
        await Request.findByIdAndDelete(id);
        res.status(200).json({ message: 'Request deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting request' });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}