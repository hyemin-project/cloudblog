const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { Op } = require('sequelize');  // Assuming you're using Sequelize

// Route to get paginated recent posts
router.get('/recent', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: { status: 'Published' },
      order: [['id', 'DESC']],
      limit: limit,
      offset: offset
    });

    res.json({
      posts: posts.rows,
      currentPage: page,
      totalPages: Math.ceil(posts.count / limit),
      totalPosts: posts.count
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    res.status(500).json({ error: 'An error occurred while fetching the posts' });
  }
});

// Route to get all posts (with pagination and filtering by category)
router.get('/', async (req, res) => {
  try {
    // Fetch posts with pagination
    const { category } = req.query;

    const whereClause = {  // Fetch only published posts
      ...(category && { category })  // Optionally filter by category
    };

    // Fetch posts with pagination
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']], // Order by most recent posts first
      where: whereClause, 
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to search posts by title
router.get('/search', async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ error: 'searchTerm query parameter is required' });
    }

    // Query posts by title using LIKE operator for case-insensitive search
    const posts = await Post.findAll({
      where: {
        title: {
          [Op.iLike]: `%${searchTerm}%`,  // Search titles that contain the searchTerm
        },
        status: 'Published',  // Only return published posts
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'An error occurred while searching posts' });
  }
});

// Route to get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only increment readCount if the post is published
    if (post.status === 'Published') {
      await Post.update(
        { readCount: (post.readCount || 0) + 1 },
        { where: { id: post.id } }
      );
      post.readCount = (post.readCount || 0) + 1;  // Update the local object as well
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'An error occurred while fetching the post' });
  }
});







module.exports = router;
