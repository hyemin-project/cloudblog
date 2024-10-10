const express = require('express');
const router = express.Router();
const { Post, Analytics } = require('../models'); // Assuming Post and Analytics models exist

// Admin middleware to ensure only admins can access the routes
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied' });
  }
};

// Get all posts (for managing)
router.get('/posts', isAdmin, async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Create a new post
router.post('/posts', isAdmin, async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = await Post.create({ title, content, author });
    res.json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Update an existing post
router.put('/posts/:postId', isAdmin, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    const updatedPost = await Post.update({ title, content }, { where: { id: postId } });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Error updating post' });
  }
});

// Fetch analytics data
router.get('/analytics', isAdmin, async (req, res) => {
  try {
    const analytics = await Analytics.findAll(); // Replace with your analytics model
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

module.exports = router;
