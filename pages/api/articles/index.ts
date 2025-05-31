import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../../lib/mongodb';
import Article from '../../../models/Article';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const articles = await Article.find({})
          .populate('userId', 'name email')
          .sort({ createdAt: -1 });
        res.status(200).json(articles);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching articles' });
      }
      break;

    case 'POST':
      try {
        const { title, content, image, category, tags, userId } = req.body;
        
        // Validate required fields
        if (!title || !content || !userId) {
          return res.status(400).json({ message: 'Title, content, and userId are required' });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const article = new Article({
          title,
          content,
          image: image || '',
          category: category || '',
          tags: tags || [],
          userId,
        });

        await article.save();
        
        // Populate user data before returning
        await article.populate('userId', 'name email');
        
        res.status(201).json(article);
      } catch (error) {
        console.error('Create article error:', error);
        res.status(500).json({ message: 'Error creating article' });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}