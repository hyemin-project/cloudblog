const express = require('express');
const router = express.Router();
const { Post, User, Comment } = require('../models');
const { isAdmin } = require('../middleware/auth');

// Apply isAdmin middleware to all routes in this file
router.use(isAdmin);

// Route for getting all posts (admin view)
router.get('/posts', async (req, res) => {
  try {
    const { status } = req.query; // Get status from query parameter
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    const posts = await Post.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
});

// Route for updating a post
router.put('/posts/:id', async (req, res) => {
  const { title, content, status, scheduledPublishDate,category } = req.body;
  try {
    const result = await Post.update(
      { 
        title, 
        content, 
        status, 
        scheduledPublishDate: status === 'Scheduled' ? scheduledPublishDate : null ,
        category
      },
      { where: { id: req.params.id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post', details: error.message });
  }
});

// Route for deleting a post
router.delete('/posts/:id', async (req, res) => {
  try {
    const result = await Post.destroy({ where: { id: req.params.id } });
    if (result === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post', details: error.message });
  }
});

// Route for getting all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Route for updating user roles
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    const result = await User.update({ role }, { where: { id: req.params.id } });
    if (result[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role', details: error.message });
  }
});

// Route for deleting a user
router.delete('/users/:id', async (req, res) => {
  try {
    const result = await User.destroy({ where: { id: req.params.id } });
    if (result === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// Route for getting all comments (admin view)
router.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        { model: User, attributes: ['username'] },
        { model: Post, attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
  }
});

// Route for deleting a comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const result = await Comment.destroy({ where: { id: req.params.id } });
    if (result === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment', details: error.message });
  }
});

module.exports = router;