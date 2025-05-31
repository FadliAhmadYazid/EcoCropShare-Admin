import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../lib/mongodb';
import User from '../../models/User';
import Article from '../../models/Article';
import Post from '../../models/Post';
import Request from '../../models/Request';
import History from '../../models/History';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();

    // Get counts
    const [users, articles, posts, requests, history] = await Promise.all([
      User.countDocuments(),
      Article.countDocuments(),
      Post.countDocuments(),
      Request.countDocuments(),
      History.countDocuments(),
    ]);

    // Get recent activity
    const recentActivity = await Promise.all([
      Article.find().sort({ createdAt: -1 }).limit(3).populate('userId', 'name'),
      Post.find().sort({ createdAt: -1 }).limit(3).populate('userId', 'name'),
      Request.find().sort({ createdAt: -1 }).limit(3).populate('userId', 'name'),
    ]);

    const combinedActivity = [
      ...recentActivity[0].map(item => ({ ...item.toObject(), type: 'article' })),
      ...recentActivity[1].map(item => ({ ...item.toObject(), type: 'post' })),
      ...recentActivity[2].map(item => ({ ...item.toObject(), type: 'request' })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get monthly data for charts
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlyPosts = await Post.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyRequests = await Request.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format monthly data
    const labels = [];
    const postsData = [];
    const requestsData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      labels.push(date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
      
      const postCount = monthlyPosts.find(p => p._id === monthKey)?.count || 0;
      const requestCount = monthlyRequests.find(r => r._id === monthKey)?.count || 0;
      
      postsData.push(postCount);
      requestsData.push(requestCount);
    }

    const dashboardData = {
      users,
      articles,
      posts,
      requests,
      history,
      recentActivity: combinedActivity,
      monthlyData: {
        labels,
        posts: postsData,
        requests: requestsData,
      },
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}