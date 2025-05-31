import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../../lib/mongodb';
import Article from '../../../models/Article';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const article = await Article.findById(id).populate('userId', 'name email');
        if (!article) {
          return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json(article);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching article' });
      }
      break;

    case 'PUT':
      try {
        const { title, content, image, category, tags } = req.body;
        
        const article = await Article.findByIdAndUpdate(
          id,
          {
            title,
            content,
            image,
            category,
            tags,
            updatedAt: new Date(),
          },
          { new: true, runValidators: true }
        ).populate('userId', 'name email');

        if (!article) {
          return res.status(404).json({ message: 'Article not found' });
        }

        res.status(200).json(article);
      } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({ message: 'Error updating article' });
      }
      break;

    case 'DELETE':
      try {
        const article = await Article.findByIdAndDelete(id);
        if (!article) {
          return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json({ message: 'Article deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting article' });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}